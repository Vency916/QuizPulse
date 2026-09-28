<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\Question;
use App\Models\Participant;
use App\Models\ParticipantAnswer;
use App\Services\ScoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnswerController extends Controller
{
    protected ScoringService $scoringService;

    public function __construct(ScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
    }

    /**
     * Submit an answer for the current active question.
     */
    public function submit(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::with(['quiz', 'currentQuestion'])->where('session_code', $code)->first();

        if (!$session) {
            return response()->json(['message' => 'Quiz session not found.'], 404);
        }

        $isSelfPaced = !($session->settings['lobby_enabled'] ?? false) || ($session->settings['pace_mode'] ?? '') === 'self_paced';

        if ($session->status !== 'live_question' && !$isSelfPaced) {
            return response()->json(['message' => 'Answers are not currently accepted for this question.'], 400);
        }

        $sessionToken = $request->header('X-Session-Token');
        if (!$sessionToken) {
            return response()->json(['message' => 'Participant identity token missing.'], 401);
        }

        $participant = Participant::where('quiz_session_id', $session->id)
            ->where('session_token', $sessionToken)
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Participant not found in this session.'], 404);
        }

        $questionId = $request->input('question_id', $session->current_question_id);
        $question = Question::where('quiz_id', $session->quiz_id)->where('id', $questionId)->first() ?: $session->currentQuestion;
        if (!$question) {
            return response()->json(['message' => 'Question not found.'], 400);
        }

        // Check if already answered
        $alreadyAnswered = ParticipantAnswer::where('participant_id', $participant->id)
            ->where('question_id', $question->id)
            ->exists();

        if ($alreadyAnswered) {
            return response()->json(['message' => 'You have already answered this question.'], 422);
        }


        $request->validate([
            'answer' => 'required',
            'client_response_time_ms' => 'nullable|integer',
        ]);

        $submittedAnswer = $request->input('answer');
        $clientResponseTime = $request->input('client_response_time_ms');

        // Evaluate answer Authoritatively via ScoringService
        $result = $this->scoringService->evaluateAnswer($question, $session, $submittedAnswer, $clientResponseTime);

        return DB::transaction(function () use ($session, $participant, $question, $submittedAnswer, $result) {
            // Save answer
            ParticipantAnswer::create([
                'participant_id' => $participant->id,
                'quiz_session_id' => $session->id,
                'question_id' => $question->id,
                'answer' => is_array($submittedAnswer) ? json_encode($submittedAnswer) : (string)$submittedAnswer,
                'is_correct' => $result['is_correct'],
                'points_earned' => $result['points_earned'],
                'response_time_ms' => $result['response_time_ms'],
                'answered_at' => now(),
            ]);

            // Update participant stats in single atomic operation
            $newScore = $participant->score + $result['points_earned'];
            $newCorrect = $participant->correct_answers + ($result['is_correct'] ? 1 : 0);
            $newIncorrect = $participant->incorrect_answers + ($result['is_correct'] ? 0 : 1);

            $participant->update([
                'score' => $newScore,
                'correct_answers' => $newCorrect,
                'incorrect_answers' => $newIncorrect,
            ]);

            // Update group score if participant belongs to a group
            if ($participant->group_id && $result['points_earned'] > 0) {
                $participant->group()->increment('score', $result['points_earned']);
            }

            // Calculate current rank
            $currentRank = Participant::where('quiz_session_id', $session->id)
                ->where('score', '>', $newScore)
                ->count() + 1;

            return response()->json([
                'message' => 'Answer submitted successfully',
                'question_id' => $question->id,
                'user_answer' => $submittedAnswer,
                'is_correct' => $result['is_correct'],
                'timed_out' => $result['timed_out'] ?? false,
                'points_earned' => $result['points_earned'],
                'response_time_ms' => $result['response_time_ms'] ?? 0,
                'total_score' => $newScore,
                'current_rank' => $currentRank,
                'correct_answer_display' => $result['correct_answer_display'],
                'correct_option_ids' => $result['correct_option_ids'] ?? [],
                'explanation' => $result['explanation'],
            ]);
        });
    }
}
