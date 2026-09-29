<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\ParticipantAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsController extends Controller
{
    /**
     * Admin: Overview dashboard stats.
     */
    public function dashboardStats()
    {
        $totalQuizzes = Quiz::count();
        $publishedQuizzes = Quiz::where('status', 'published')->count();
        $liveSessions = QuizSession::whereIn('status', ['waiting', 'live_question', 'showing_answer', 'leaderboard', 'paused'])->count();
        $totalParticipants = Participant::count();
        $totalAnswers = ParticipantAnswer::count();

        $recentSessions = QuizSession::with(['quiz', 'participants'])
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'session_code' => $s->session_code,
                    'title' => $s->quiz->title,
                    'status' => $s->status,
                    'participants_count' => $s->participants->count(),
                    'created_at' => $s->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'total_quizzes' => $totalQuizzes,
            'published_quizzes' => $publishedQuizzes,
            'live_sessions' => $liveSessions,
            'total_participants' => $totalParticipants,
            'total_answers' => $totalAnswers,
            'recent_sessions' => $recentSessions,
        ]);
    }

    /**
     * Admin: Deep analytics for a single session.
     */
    public function sessionAnalytics($id)
    {
        $session = QuizSession::with(['quiz.questions', 'groups', 'results.participant', 'results.group'])
            ->findOrFail($id);

        $participants = $session->participants;
        $totalParticipants = $participants->count();
        $avgScore = $totalParticipants > 0 ? round($participants->avg('score'), 1) : 0;
        $maxScore = $participants->max('score') ?? 0;
        $minScore = $participants->min('score') ?? 0;

        // Question performance
        $questionStats = [];
        foreach ($session->quiz->questions as $q) {
            $answers = ParticipantAnswer::where('quiz_session_id', $session->id)
                ->where('question_id', $q->id)
                ->get();

            $ansCount = $answers->count();
            $correctCount = $answers->where('is_correct', true)->count();
            $accuracy = $ansCount > 0 ? round(($correctCount / $ansCount) * 100, 1) : 0;
            $avgTimeMs = $ansCount > 0 ? round($answers->avg('response_time_ms')) : 0;

            $questionStats[] = [
                'question_id' => $q->id,
                'question_text' => $q->question_text,
                'type' => $q->type,
                'total_answers' => $ansCount,
                'correct_answers' => $correctCount,
                'accuracy_percent' => $accuracy,
                'avg_time_ms' => $avgTimeMs,
            ];
        }

        // Sort question stats by accuracy to find hardest and easiest
        $sortedByAccuracy = collect($questionStats)->sortBy('accuracy_percent')->values();
        $hardest = $sortedByAccuracy->first();
        $easiest = $sortedByAccuracy->last();

        return response()->json([
            'session' => [
                'id' => $session->id,
                'session_code' => $session->session_code,
                'title' => $session->quiz->title,
                'status' => $session->status,
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
            ],
            'summary' => [
                'total_participants' => $totalParticipants,
                'average_score' => $avgScore,
                'max_score' => $maxScore,
                'min_score' => $minScore,
                'hardest_question' => $hardest,
                'easiest_question' => $easiest,
            ],
            'questions' => $questionStats,
            'groups' => $session->groups,
            'results' => $session->results()->with(['participant', 'group'])->orderBy('final_rank', 'asc')->get(),
        ]);
    }

    /**
     * Admin: Download CSV analytics report for a session.
     */
    public function exportSessionCsv($id)
    {
        $session = QuizSession::with(['quiz.questions', 'groups', 'results.participant', 'results.group', 'participants'])
            ->findOrFail($id);

        $cleanTitle = Str::slug($session->quiz->title ?? 'quiz');
        $filename = "analytics_{$cleanTitle}_{$session->session_code}_" . date('Ymd_His') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($session) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM so Excel opens it with proper character encoding
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Overview Section
            fputcsv($handle, ['QUIZ PULSE - SESSION ANALYTICS REPORT']);
            fputcsv($handle, ['Quiz Title', $session->quiz->title ?? 'Untitled']);
            fputcsv($handle, ['Session PIN', $session->session_code]);
            fputcsv($handle, ['Status', strtoupper(str_replace('_', ' ', $session->status))]);
            fputcsv($handle, ['Started At', $session->started_at ?? ($session->created_at ? $session->created_at->toIso8601String() : 'N/A')]);
            fputcsv($handle, ['Ended At', $session->ended_at ?? 'N/A']);
            fputcsv($handle, ['Total Players', $session->participants->count()]);
            fputcsv($handle, ['Average Score', $session->participants->count() > 0 ? round($session->participants->avg('score'), 1) : 0]);
            fputcsv($handle, ['Top Score', $session->participants->max('score') ?? 0]);
            fputcsv($handle, []);

            // 1. Leaderboard / Player Results
            fputcsv($handle, ['=== FINAL PLAYER RANKINGS ===']);
            fputcsv($handle, ['Rank', 'Player Name', 'Team / Group', 'Final Score', 'Correct Answers', 'Incorrect Answers', 'Accuracy (%)']);
            
            $results = $session->results()->with(['participant', 'group'])->orderBy('final_rank', 'asc')->get();
            if ($results->count() > 0) {
                foreach ($results as $r) {
                    fputcsv($handle, [
                        $r->final_rank,
                        $r->participant->username ?? 'Unknown',
                        $r->group->name ?? 'None',
                        $r->final_score,
                        $r->correct_count,
                        $r->incorrect_count,
                        $r->accuracy_percent . '%',
                    ]);
                }
            } else {
                $rankedParticipants = $session->participants()->orderBy('score', 'desc')->get();
                foreach ($rankedParticipants as $idx => $p) {
                    fputcsv($handle, [
                        $idx + 1,
                        $p->username,
                        $p->group->name ?? 'None',
                        $p->score,
                        'N/A',
                        'N/A',
                        'N/A',
                    ]);
                }
            }
            fputcsv($handle, []);

            // 2. Question Breakdown
            fputcsv($handle, ['=== QUESTION PERFORMANCE BREAKDOWN ===']);
            fputcsv($handle, ['#', 'Question Text', 'Type', 'Total Answers', 'Correct Answers', 'Accuracy (%)', 'Average Response Time (s)']);
            
            foreach ($session->quiz->questions as $idx => $q) {
                $answers = ParticipantAnswer::where('quiz_session_id', $session->id)
                    ->where('question_id', $q->id)
                    ->get();
                $ansCount = $answers->count();
                $correctCount = $answers->where('is_correct', true)->count();
                $accuracy = $ansCount > 0 ? round(($correctCount / $ansCount) * 100, 1) : 0;
                $avgTimeSec = $ansCount > 0 ? round($answers->avg('response_time_ms') / 1000, 2) : 0;

                fputcsv($handle, [
                    $idx + 1,
                    $q->question_text,
                    strtoupper(str_replace('_', ' ', $q->type)),
                    $ansCount,
                    $correctCount,
                    $accuracy . '%',
                    $avgTimeSec,
                ]);
            }
            fputcsv($handle, []);

            // 3. Individual Responses
            fputcsv($handle, ['=== INDIVIDUAL PLAYER RESPONSES ===']);
            fputcsv($handle, ['Player', 'Question #', 'Question Text', 'Submitted Answer', 'Result', 'Points Earned', 'Time Taken (s)']);
            $allAnswers = ParticipantAnswer::with(['participant', 'question'])
                ->where('quiz_session_id', $session->id)
                ->orderBy('created_at', 'asc')
                ->get();
            foreach ($allAnswers as $ans) {
                fputcsv($handle, [
                    $ans->participant->username ?? 'Unknown',
                    $ans->question->order ?? 'N/A',
                    $ans->question->question_text ?? 'N/A',
                    is_array($ans->answer) ? implode(', ', $ans->answer) : $ans->answer,
                    $ans->is_correct ? 'CORRECT' : 'INCORRECT',
                    $ans->points_earned,
                    round(($ans->response_time_ms ?? 0) / 1000, 2),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Admin: Download CSV analytics report for a quiz (aggregating all sessions or latest session).
     */
    public function exportQuizCsv($id)
    {
        $quiz = Quiz::with(['questions', 'sessions.participants'])->findOrFail($id);
        $latestSession = $quiz->sessions()->orderBy('created_at', 'desc')->first();

        if ($latestSession) {
            return $this->exportSessionCsv($latestSession->id);
        }

        // If no sessions yet, provide question outline CSV
        $filename = 'quiz_' . Str::slug($quiz->title) . '_questions_' . date('Ymd') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($quiz) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, ['QUIZ PULSE - QUIZ REPORT']);
            fputcsv($handle, ['Quiz Title', $quiz->title]);
            fputcsv($handle, ['Category', $quiz->category]);
            fputcsv($handle, ['Difficulty', ucfirst($quiz->difficulty)]);
            fputcsv($handle, ['Total Questions', $quiz->questions->count()]);
            fputcsv($handle, ['Notice', 'No live sessions have been hosted for this quiz yet.']);
            fputcsv($handle, []);
            fputcsv($handle, ['#', 'Question Text', 'Type', 'Time Limit (s)', 'Points']);
            foreach ($quiz->questions as $idx => $q) {
                fputcsv($handle, [$idx + 1, $q->question_text, $q->type, $q->time_limit, $q->points]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}
