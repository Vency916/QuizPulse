<?php

namespace App\Services;

use App\Models\Question;
use App\Models\AnswerOption;
use App\Models\QuizSession;
use Carbon\Carbon;

class ScoringService
{
    /**
     * Evaluate a participant's submitted answer and calculate points.
     *
     * @param Question $question
     * @param QuizSession $session
     * @param mixed $submittedAnswer
     * @param int|null $clientResponseTimeMs
     * @return array [is_correct, points_earned, response_time_ms, correct_answer_display, explanation]
     */
    public function evaluateAnswer(Question $question, QuizSession $session, mixed $submittedAnswer, ?int $clientResponseTimeMs = null): array
    {
        $isSelfPaced = !($session->settings['lobby_enabled'] ?? false) || ($session->settings['pace_mode'] ?? '') === 'self_paced';
        $totalAllowedMs = ($question->time_limit ?: 20) * 1000;
        $now = now();

        if ($isSelfPaced) {
            // Self-paced mode: Participant controls their own time per question
            $responseTimeMs = $clientResponseTimeMs !== null ? max(0, $clientResponseTimeMs) : 0;
            // Only timed out if client reported timeout or exceeded allowed time + grace period
            $isTimedOut = ($submittedAnswer === '__TIMED_OUT__') || 
                ($clientResponseTimeMs !== null && $totalAllowedMs > 0 && $clientResponseTimeMs > ($totalAllowedMs + 5000));
        } else {
            // Host-controlled mode: Authoritative elapsed time since host launched the question
            $startedAt = $session->current_question_started_at ? Carbon::parse($session->current_question_started_at) : $now;
            $serverElapsedMs = (int) ($now->diffInMilliseconds($startedAt));
            $responseTimeMs = $clientResponseTimeMs !== null 
                ? max(0, $clientResponseTimeMs)
                : $serverElapsedMs;
            // Allow generous grace period (8 seconds) for polling latency & network transit
            $isTimedOut = ($submittedAnswer === '__TIMED_OUT__') || 
                ($serverElapsedMs > ($totalAllowedMs + 8000) && ($clientResponseTimeMs === null || $clientResponseTimeMs > ($totalAllowedMs + 5000)));
        }

        $correctOptions = $question->options()->where('is_correct', true)->get();
        $correctOptionIds = $correctOptions->pluck('id')->all();

        if ($isTimedOut) {
            return [
                'is_correct' => false,
                'points_earned' => 0,
                'response_time_ms' => $responseTimeMs,
                'timed_out' => true,
                'correct_answer_display' => $this->getCorrectAnswerDisplay($question),
                'correct_option_ids' => $correctOptionIds,
                'explanation' => $question->explanation,
            ];
        }

        // 2. Validate correctness according to question type
        $isCorrect = false;

        switch ($question->type) {
            case 'multiple_choice':
            case 'true_false':
                // Check if submittedAnswer matches option id or option text
                $isCorrect = $correctOptions->contains(function ($opt) use ($submittedAnswer) {
                    if (is_numeric($submittedAnswer) && (int)$opt->id === (int)$submittedAnswer) {
                        return true;
                    }
                    if ((string)$opt->id === (string)$submittedAnswer) {
                        return true;
                    }
                    return trim(strtolower($opt->option_text)) === trim(strtolower((string)$submittedAnswer));
                });
                break;

            case 'multiple_select':
                // submittedAnswer is an array of selected option IDs or texts
                $selected = is_array($submittedAnswer) ? $submittedAnswer : json_decode((string)$submittedAnswer, true) ?? [];
                $correctIds = $correctOptions->pluck('id')->all();
                
                // Convert selected to ints if IDs
                $selectedIds = array_map('intval', array_filter($selected, 'is_numeric'));
                sort($selectedIds);
                sort($correctIds);
                
                $isCorrect = ($selectedIds === $correctIds);
                break;

            case 'short_answer':
                $cleanInput = trim(strtolower((string)$submittedAnswer));
                $isCorrect = $correctOptions->contains(function ($opt) use ($cleanInput) {
                    return trim(strtolower($opt->option_text)) === $cleanInput;
                });
                break;
        }

        // 3. Calculate Points
        $pointsEarned = 0;
        $quizSettings = $session->quiz->settings ?? [];
        $basePoints = $question->points ?: ($quizSettings['base_points'] ?? 100);
        $speedBonusEnabled = $quizSettings['speed_bonus'] ?? true;
        $maxSpeedBonus = $quizSettings['max_speed_bonus'] ?? 400;
        $negativePoints = $question->negative_points ?: ($quizSettings['negative_points'] ?? 0);

        if ($isCorrect) {
            $pointsEarned = $basePoints;

            if ($speedBonusEnabled && $totalAllowedMs > 0) {
                $remainingMs = max(0, $totalAllowedMs - $responseTimeMs);
                $speedRatio = $remainingMs / $totalAllowedMs;
                $bonus = (int) round($maxSpeedBonus * $speedRatio);
                $pointsEarned += max(0, $bonus);
            }
        } else {
            if ($negativePoints > 0) {
                $pointsEarned = -$negativePoints;
            }
        }

        return [
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'response_time_ms' => $responseTimeMs,
            'timed_out' => false,
            'correct_answer_display' => $this->getCorrectAnswerDisplay($question),
            'correct_option_ids' => $correctOptionIds,
            'explanation' => $question->explanation,
        ];
    }

    /**
     * Get a human-readable display of the correct answer for post-answer feedback.
     */
    public function getCorrectAnswerDisplay(Question $question): string
    {
        $correct = $question->options()->where('is_correct', true)->get();
        if ($correct->isEmpty()) {
            return 'N/A';
        }

        return $correct->pluck('option_text')->implode(' / ');
    }
}
