<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use ZipArchive;
use Exception;

class QuestionImportService
{
    /**
     * Extract text and parse questions from an uploaded document (PDF, DOCX, TXT).
     *
     * @param UploadedFile $file
     * @return array
     */
    public function parseFile(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $filePath = $file->getRealPath();

        $rawText = '';

        switch ($extension) {
            case 'pdf':
                $rawText = $this->extractFromPdf($filePath);
                break;

            case 'docx':
            case 'doc':
                $rawText = $this->extractFromDocx($filePath);
                break;

            case 'txt':
            case 'md':
            case 'text':
                $rawText = file_get_contents($filePath) ?: '';
                break;

            default:
                throw new Exception("Unsupported file type: .{$extension}. Please upload a .pdf, .docx, or .txt file.");
        }

        if (empty(trim($rawText))) {
            throw new Exception("No readable text could be extracted from the uploaded document.");
        }

        $questions = $this->parseQuestionsFromText($rawText);

        return [
            'raw_text_preview' => mb_substr($rawText, 0, 1000) . (mb_strlen($rawText) > 1000 ? '...' : ''),
            'questions' => $questions,
            'total_parsed' => count($questions),
        ];
    }

    /**
     * Extract text from PDF using Smalot\PdfParser with fallback.
     */
    protected function extractFromPdf(string $filePath): string
    {
        try {
            if (class_exists(\Smalot\PdfParser\Parser::class)) {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($filePath);
                $text = $pdf->getText();
                if (!empty(trim($text))) {
                    return $text;
                }
            }
        } catch (\Throwable $e) {
            // Fall through to fallback extractor
        }

        // Fallback: Basic stream extraction
        return $this->fallbackPdfExtract($filePath);
    }

    /**
     * Simple fallback text extraction from PDF stream objects.
     */
    protected function fallbackPdfExtract(string $filePath): string
    {
        $content = file_get_contents($filePath);
        if (!$content) return '';

        $text = '';
        // Extract text inside BT ... ET blocks
        if (preg_match_all('/BT[\s\S]*?ET/s', $content, $matches)) {
            foreach ($matches[0] as $block) {
                if (preg_match_all('/\((.*?)\)\s*T[jJ]/s', $block, $tMatches)) {
                    $text .= implode(' ', $tMatches[1]) . "\n";
                }
            }
        }

        return $text ?: strip_tags($content);
    }

    /**
     * Extract text from DOCX (Office Open XML ZIP container).
     */
    protected function extractFromDocx(string $filePath): string
    {
        if (!class_exists('ZipArchive')) {
            throw new Exception('PHP ZipArchive extension is required to extract DOCX files.');
        }

        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new Exception('Could not open the DOCX file. It may be corrupted.');
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if (!$xml) {
            throw new Exception('Failed to read word/document.xml inside DOCX archive.');
        }

        // Convert paragraph ends and breaks into newlines
        $xml = preg_replace('/<\/w:p>/', "\n", $xml);
        $xml = preg_replace('/<w:br[^>]*\/>/', "\n", $xml);
        $xml = preg_replace('/<\/w:tr>/', "\n", $xml);

        // Strip XML tags and decode HTML/XML entities
        $text = strip_tags($xml);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');

        return $text;
    }

    /**
     * Parse structured questions, options, answers, and explanations from raw text.
     */
    public function parseQuestionsFromText(string $rawText): array
    {
        // Normalize line breaks
        $text = str_replace(["\r\n", "\r"], "\n", $rawText);
        $lines = explode("\n", $text);

        // Trim each line and clean non-printable characters
        $cleanLines = [];
        foreach ($lines as $line) {
            $trimmed = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $line));
            $cleanLines[] = $trimmed;
        }

        $blocks = $this->splitIntoQuestionBlocks($cleanLines);
        $parsedQuestions = [];

        foreach ($blocks as $index => $blockLines) {
            $question = $this->parseSingleBlock($blockLines, $index + 1);
            if ($question) {
                $parsedQuestions[] = $question;
            }
        }

        return $parsedQuestions;
    }

    /**
     * Split lines of text into individual question blocks based on common question prefixes.
     */
    protected function splitIntoQuestionBlocks(array $lines): array
    {
        $blocks = [];
        $currentBlock = [];

        // Question starters: e.g. "1.", "1)", "1 -", "Q1:", "Q.1", "Question 1:", "Question 1."
        $questionPattern = '/^(?:(?:Q|Question)\s*[\.:#]?\s*\d+[\.:\)\-]?|\d+[\.:\)\-]\s+|[#\*\-]\s+(?:Question|Q)\s*\d+)/i';

        foreach ($lines as $line) {
            if (empty($line)) {
                // If we encounter a blank line and the block already has a question and options, it might be a separator
                if (!empty($currentBlock)) {
                    $currentBlock[] = '';
                }
                continue;
            }

            if (preg_match($questionPattern, $line)) {
                if (!empty($currentBlock)) {
                    $blocks[] = $currentBlock;
                    $currentBlock = [];
                }
                $currentBlock[] = $line;
            } else {
                if (!empty($currentBlock)) {
                    $currentBlock[] = $line;
                } elseif (preg_match('/^(?:What|Which|Who|Where|When|Why|How|Is|Are|Can|Do|Does|True|False)\b/i', $line)) {
                    // Implicit question starter without number
                    $currentBlock[] = $line;
                }
            }
        }

        if (!empty($currentBlock)) {
            $blocks[] = $currentBlock;
        }

        // If no blocks were split by regex pattern, try splitting by blank lines
        if (empty($blocks) && count($lines) > 3) {
            $blocks = [];
            $currentBlock = [];
            foreach ($lines as $line) {
                if ($line === '') {
                    if (!empty($currentBlock)) {
                        $blocks[] = $currentBlock;
                        $currentBlock = [];
                    }
                } else {
                    $currentBlock[] = $line;
                }
            }
            if (!empty($currentBlock)) {
                $blocks[] = $currentBlock;
            }
        }

        return $blocks;
    }

    /**
     * Parse a single block of lines into a Question structure.
     */
    protected function parseSingleBlock(array $blockLines, int $order): ?array
    {
        // Filter empty lines
        $lines = array_values(array_filter($blockLines, fn($l) => $l !== ''));
        if (empty($lines)) return null;

        $questionText = '';
        $options = [];
        $explicitAnswerKey = null;
        $explanation = '';
        $timeLimit = 20;
        $points = 100;

        $collectingQuestion = true;

        // Option prefix regex: A) B. C- (A) [A] or *A) (must be letter [A-Za-z], NOT digits to avoid matching 1. question)
        $optionPattern = '/^(?:[\(\[]?([A-Za-z])[\)\]\.\:\-]\s*|\*\s*[\(\[]?([A-Za-z])[\)\]\.\:\-]\s*)(.*)$/u';
        $answerPattern = '/^(?:Answer|Ans|Correct\s*Answer|Key|Correct)[\s\:\-\=]+(.*)$/i';
        $explanationPattern = '/^(?:Explanation|Rationale|Note|Why)[\s\:\-\=]+(.*)$/i';
        $timePattern = '/^(?:Time|Timer|Time\s*Limit)[\s\:\-\=]+(\d+)\s*(?:s|sec|seconds)?/i';
        $pointsPattern = '/^(?:Points|Score|Marks)[\s\:\-\=]+(\d+)/i';

        foreach ($lines as $index => $line) {
            // First line of block is always part of the question
            if ($index === 0) {
                $questionText = $line;
                continue;
            }

            // Check for metadata
            if (preg_match($timePattern, $line, $tMatch)) {
                $timeLimit = (int) $tMatch[1];
                continue;
            }
            if (preg_match($pointsPattern, $line, $pMatch)) {
                $points = (int) $pMatch[1];
                continue;
            }
            if (preg_match($explanationPattern, $line, $eMatch)) {
                $explanation = trim($eMatch[1]);
                $collectingQuestion = false;
                continue;
            }
            if (preg_match($answerPattern, $line, $aMatch)) {
                $explicitAnswerKey = trim($aMatch[1]);
                $collectingQuestion = false;
                continue;
            }

            // Check if this line is an option
            if (preg_match($optionPattern, $line, $optMatch)) {
                $collectingQuestion = false;
                $letter = strtoupper($optMatch[1] ?: $optMatch[2]);
                $optText = trim($optMatch[3]);

                // Check for inline correct marker e.g. "*B) Paris" or "B) Paris (Correct)" or "[x]"
                $isCorrect = false;
                if (str_starts_with($line, '*') || str_contains($line, '[x]') || str_contains($line, '[X]')) {
                    $isCorrect = true;
                }

                if (preg_match('/\((?:correct|key|answer)\)|\[(?:correct|key|answer)\]/i', $optText)) {
                    $isCorrect = true;
                    $optText = trim(preg_replace('/\((?:correct|key|answer)\)|\[(?:correct|key|answer)\]/i', '', $optText));
                }

                $options[] = [
                    'key' => $letter,
                    'text' => $optText,
                    'is_correct' => $isCorrect,
                ];
            } else {
                if ($collectingQuestion) {
                    $questionText .= ' ' . $line;
                } else {
                    // Line after options could be continued explanation or note
                    if (!empty($options)) {
                        $explanation .= ($explanation === '' ? '' : ' ') . $line;
                    }
                }
            }
        }

        // Clean question text: strip leading "1.", "Q1:", etc.
        $questionText = preg_replace('/^(?:(?:Q|Question)\s*[\.:#]?\s*\d+[\.:\)\-]?|\d+[\.:\)\-]\s+|[#\*\-]\s+(?:Question|Q)\s*\d+)\s*/i', '', $questionText);
        $questionText = trim($questionText);

        if (empty($questionText)) {
            return null;
        }

        // True/False auto-detection if no options were found
        $isTrueFalseQuestion = preg_match('/\b(?:True\s*or\s*False|True\/False)\b/i', $questionText);
        if (empty($options) && $isTrueFalseQuestion) {
            $options = [
                ['key' => 'A', 'text' => 'True', 'is_correct' => false],
                ['key' => 'B', 'text' => 'False', 'is_correct' => false],
            ];
        }

        // Apply explicit answer key if present (e.g. "Answer: B" or "Answer: True")
        if ($explicitAnswerKey !== null && !empty($options)) {
            $cleanAnsKey = strtoupper(trim($explicitAnswerKey));
            // Check if matches key 'A', 'B', etc.
            $keyMatched = false;
            foreach ($options as &$opt) {
                if ($opt['key'] === $cleanAnsKey || strtoupper($opt['text']) === $cleanAnsKey) {
                    $opt['is_correct'] = true;
                    $keyMatched = true;
                } else {
                    // Reset if explicit key provided
                    if ($keyMatched) {
                        $opt['is_correct'] = false;
                    }
                }
            }
            unset($opt);
        }

        // Check if any option is marked correct; if none, default the first option as fallback
        $hasCorrect = false;
        foreach ($options as $opt) {
            if ($opt['is_correct']) {
                $hasCorrect = true;
                break;
            }
        }

        if (!$hasCorrect && !empty($options)) {
            // Default first option, but flag for review
            $options[0]['is_correct'] = true;
            $needsReview = true;
        } else {
            $needsReview = false;
        }

        // Determine question type
        $correctCount = count(array_filter($options, fn($o) => $o['is_correct']));
        if (count($options) === 2 && strcasecmp($options[0]['text'], 'True') === 0 && strcasecmp($options[1]['text'], 'False') === 0) {
            $type = 'true_false';
        } elseif ($correctCount > 1) {
            $type = 'multiple_select';
        } else {
            $type = 'multiple_choice';
        }

        // Convert options to standard API payload structure
        $finalOptions = [];
        foreach ($options as $i => $opt) {
            $finalOptions[] = [
                'option_text' => $opt['text'] ?: "Option " . chr(65 + $i),
                'is_correct' => (bool) $opt['is_correct'],
                'order' => $i + 1,
            ];
        }

        return [
            'order' => $order,
            'type' => $type,
            'question_text' => $questionText,
            'time_limit' => max(5, min(300, $timeLimit)),
            'points' => max(10, min(1000, $points)),
            'explanation' => $explanation,
            'options' => $finalOptions,
            'needs_review' => $needsReview,
        ];
    }
}
