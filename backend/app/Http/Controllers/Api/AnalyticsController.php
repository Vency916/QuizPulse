<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\ParticipantAnswer;
use App\Models\Question;
use Illuminate\Http\Request;

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
}
