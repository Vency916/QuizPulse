<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\Question;
use App\Models\Group;
use App\Models\Participant;
use App\Models\QuizResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuizSessionController extends Controller
{
    /**
     * Clear cached session and leaderboard data for a session code.
     */
    public static function clearSessionCache(string $sessionCode): void
    {
        $code = strtoupper(trim($sessionCode));
        Cache::forget("session_payload_{$code}");
        Cache::forget("leaderboard_{$code}");
    }

    /**
     * Launch a live session for a quiz.
     */
    public function launch(Request $request, $quizId)
    {
        $quiz = Quiz::with('questions.options')->findOrFail($quizId);

        if ($quiz->questions->isEmpty()) {
            return response()->json([
                'message' => 'Cannot launch a quiz with no questions. Please add questions first.',
            ], 422);
        }

        $validated = $request->validate([
            'groups_enabled' => 'nullable|boolean',
            'group_names' => 'nullable|array',
            'group_names.*' => 'string',
            'auto_assign_groups' => 'nullable|boolean',
            'lobby_enabled' => 'nullable|boolean',
            'pace_mode' => 'nullable|in:self_paced,host_controlled',
            'timer_enabled' => 'nullable|boolean',
        ]);

        $lobbyEnabled = $validated['lobby_enabled'] ?? ($request->input('pace_mode') === 'host_controlled');
        $paceMode = $lobbyEnabled ? 'host_controlled' : 'self_paced';
        $timerEnabled = $validated['timer_enabled'] ?? ($quiz->settings['timer_enabled'] ?? true);

        return DB::transaction(function () use ($quiz, $validated, $lobbyEnabled, $paceMode, $timerEnabled) {
            $session = QuizSession::create([
                'quiz_id' => $quiz->id,
                'session_code' => QuizSession::generateUniqueCode(),
                'status' => $lobbyEnabled ? 'waiting' : 'live_question',
                'current_question_id' => $quiz->questions()->orderBy('order', 'asc')->first()?->id,
                'current_question_started_at' => now(),
                'started_at' => now(),
                'settings' => [
                    'lobby_enabled' => $lobbyEnabled,
                    'pace_mode' => $paceMode,
                    'timer_enabled' => $timerEnabled,
                    'groups_enabled' => $validated['groups_enabled'] ?? ($quiz->settings['groups_enabled'] ?? false),
                    'auto_assign_groups' => $validated['auto_assign_groups'] ?? false,
                    'speed_bonus' => $quiz->settings['speed_bonus'] ?? true,
                    'base_points' => $quiz->settings['base_points'] ?? 100,
                    'max_speed_bonus' => $quiz->settings['max_speed_bonus'] ?? 400,
                ],
            ]);


            // Create Groups if enabled
            if (!empty($session->settings['groups_enabled'])) {
                $defaultGroupNames = !empty($validated['group_names']) ? $validated['group_names'] : ['Team Blue', 'Team Red', 'Team Green', 'Team Yellow'];
                $colors = ['#0984E3', '#FF7675', '#00B894', '#FDCB6E', '#A29BFE', '#E84393'];

                foreach ($defaultGroupNames as $idx => $name) {
                    Group::create([
                        'quiz_session_id' => $session->id,
                        'name' => trim($name),
                        'color' => $colors[$idx % count($colors)],
                        'score' => 0,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Live session launched successfully',
                'session' => $session->load(['quiz.questions', 'groups', 'participants']),
            ], 201);
        });
    }

    /**
     * Start session by session code (allows instant game launch from waiting room).
     */
    public function quickStart(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::with('quiz.questions')->where('session_code', $code)->firstOrFail();

        $firstQuestion = $session->quiz->questions()->orderBy('order', 'asc')->first();
        if (!$firstQuestion) {
            return response()->json(['message' => 'No questions found in this quiz.'], 422);
        }

        $session->update([
            'status' => 'live_question',
            'current_question_id' => $firstQuestion->id,
            'current_question_started_at' => now(),
            'started_at' => $session->started_at ?? now(),
        ]);

        return response()->json([
            'message' => 'Quiz started',
            'session' => $this->formatSessionPayload($session->fresh(), false),
        ]);
    }

    /**
     * Advance session by session code.
     */
    public function quickNext(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::with('quiz.questions')->where('session_code', $code)->firstOrFail();
        $questions = $session->quiz->questions()->orderBy('order', 'asc')->get();

        $currentIndex = $questions->search(function ($q) use ($session) {
            return $q->id == $session->current_question_id;
        });

        if ($session->status === 'live_question') {
            $session->update(['status' => 'showing_answer']);
        } elseif ($session->status === 'showing_answer') {
            $session->update(['status' => 'leaderboard']);
        } else {
            if ($currentIndex !== false && $currentIndex + 1 < $questions->count()) {
                $nextQuestion = $questions[$currentIndex + 1];
                $session->update([
                    'status' => 'live_question',
                    'current_question_id' => $nextQuestion->id,
                    'current_question_started_at' => now(),
                ]);
            } else {
                $this->finalizeQuizResults($session);
            }
        }

        return response()->json([
            'message' => 'Advanced session state',
            'session' => $this->formatSessionPayload($session->fresh(), false),
        ]);
    }


    /**
     * Admin: Start Quiz (begins first question).
     */
    public function start(Request $request, $id)
    {
        $session = QuizSession::with('quiz.questions')->findOrFail($id);

        $firstQuestion = $session->quiz->questions()->orderBy('order', 'asc')->first();

        if (!$firstQuestion) {
            return response()->json(['message' => 'No questions found in this quiz.'], 422);
        }

        $session->update([
            'status' => 'live_question',
            'current_question_id' => $firstQuestion->id,
            'current_question_started_at' => now(),
            'started_at' => $session->started_at ?? now(),
        ]);

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => 'Quiz started',
            'session' => $this->formatSessionPayload($session, true),
        ]);
    }

    /**
     * Admin: Reveal correct answer & explanation.
     */
    public function showAnswer(Request $request, $id)
    {
        $session = QuizSession::with(['quiz.questions.options', 'currentQuestion.options'])->findOrFail($id);

        $session->update([
            'status' => 'showing_answer',
        ]);

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => 'Answer revealed',
            'session' => $this->formatSessionPayload($session, true),
        ]);
    }

    /**
     * Admin: Show Leaderboard.
     */
    public function showLeaderboard(Request $request, $id)
    {
        $session = QuizSession::with(['quiz.questions', 'currentQuestion'])->findOrFail($id);

        $session->update([
            'status' => 'leaderboard',
        ]);

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => 'Leaderboard active',
            'session' => $this->formatSessionPayload($session, true),
        ]);
    }

    /**
     * Admin: Move to next question or finish quiz.
     */
    public function nextQuestion(Request $request, $id)
    {
        $session = QuizSession::with('quiz.questions')->findOrFail($id);
        $questions = $session->quiz->questions()->orderBy('order', 'asc')->get();

        $currentIndex = $questions->search(function ($q) use ($session) {
            return $q->id == $session->current_question_id;
        });

        if ($currentIndex !== false && $currentIndex + 1 < $questions->count()) {
            $nextQuestion = $questions[$currentIndex + 1];
            $session->update([
                'status' => 'live_question',
                'current_question_id' => $nextQuestion->id,
                'current_question_started_at' => now(),
            ]);
        } else {
            // End of quiz -> finish
            $this->finalizeQuizResults($session);
        }

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => $session->status === 'finished' ? 'Quiz completed' : 'Next question started',
            'session' => $this->formatSessionPayload($session->fresh(), true),
        ]);
    }

    /**
     * Admin: Pause session.
     */
    public function pause(Request $request, $id)
    {
        $session = QuizSession::findOrFail($id);
        $session->update(['status' => 'paused']);

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => 'Quiz paused',
            'session' => $this->formatSessionPayload($session, true),
        ]);
    }

    /**
     * Admin: Resume session.
     */
    public function resume(Request $request, $id)
    {
        $session = QuizSession::findOrFail($id);
        $session->update(['status' => 'live_question']);

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => 'Quiz resumed',
            'session' => $this->formatSessionPayload($session, true),
        ]);
    }

    /**
     * Admin: End session manually.
     */
    public function endQuiz(Request $request, $id)
    {
        $session = QuizSession::findOrFail($id);
        $this->finalizeQuizResults($session);

        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => 'Quiz ended',
            'session' => $this->formatSessionPayload($session->fresh(), true),
        ]);
    }

    /**
     * Public / Participant: Get current session details by 6-char session code.
     */
    public function getByCode(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $isAdmin = (bool)($request->user() && $request->user()->is_super_admin);

        if ($isAdmin) {
            $session = QuizSession::with(['quiz', 'groups'])
                ->where('session_code', $code)
                ->first();

            if (!$session) {
                return response()->json(['message' => 'Session not found. Please check your quiz code.'], 404);
            }

            return response()->json([
                'session' => $this->formatSessionPayload($session, true),
            ]);
        }

        // Cache participant payload in memory for 2s — lightning fast for 50-100+ concurrent players!
        $payload = Cache::remember("session_payload_{$code}", 2, function () use ($code) {
            $session = QuizSession::with(['quiz', 'groups'])
                ->where('session_code', $code)
                ->first();

            if (!$session) return null;

            return $this->formatSessionPayload($session, false);
        });

        if (!$payload) {
            return response()->json(['message' => 'Session not found. Please check your quiz code.'], 404);
        }

        return response()->json([
            'session' => $payload,
        ]);
    }

    /**
     * Public / Real-time: SSE (Server-Sent Events) live stream for instant zero-lag updates!
     */
    public function stream($code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::where('session_code', $code)->first();

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        $response = new StreamedResponse(function () use ($session) {
            // Send initial connection event
            echo "data: " . json_encode($this->formatSessionPayload($session->fresh(), false)) . "\n\n";
            @ob_flush();
            @flush();

            $lastStatus = $session->status;
            $lastQuestionId = $session->current_question_id;
            $lastCount = $session->participants()->count();
            $lastUpdatedAt = $session->updated_at;

            // Stream heartbeat & state changes for up to 30 seconds per request (auto-reconnected by EventSource)
            $startTime = time();
            while (time() - $startTime < 25) {
                // Check if connection aborted
                if (connection_aborted()) {
                    break;
                }

                $fresh = $session->fresh();
                $currentCount = $fresh->participants()->count();

                if ($fresh->status !== $lastStatus 
                    || $fresh->current_question_id !== $lastQuestionId 
                    || $currentCount !== $lastCount 
                    || $fresh->updated_at > $lastUpdatedAt) {
                    
                    $lastStatus = $fresh->status;
                    $lastQuestionId = $fresh->current_question_id;
                    $lastCount = $currentCount;
                    $lastUpdatedAt = $fresh->updated_at;

                    echo "event: session_updated\n";
                    echo "data: " . json_encode($this->formatSessionPayload($fresh, false)) . "\n\n";
                    @ob_flush();
                    @flush();
                } else {
                    // Send lightweight ping every 3 seconds to keep connection alive
                    echo ": ping\n\n";
                    @ob_flush();
                    @flush();
                }

                usleep(500000); // Check every 500ms for smooth real-time response
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }

    /**
     * Finalize quiz and write to quiz_results.
     */
    private function finalizeQuizResults(QuizSession $session): void
    {
        $session->update([
            'status' => 'finished',
            'ended_at' => now(),
        ]);

        // Rank participants by score desc
        $participants = $session->participants()->orderBy('score', 'desc')->get();
        $totalQuestions = $session->quiz->questions()->count();

        foreach ($participants as $rank => $participant) {
            $accuracy = $totalQuestions > 0 
                ? round(($participant->correct_answers / $totalQuestions) * 100, 2) 
                : 0;

            QuizResult::updateOrCreate(
                [
                    'quiz_session_id' => $session->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'group_id' => $participant->group_id,
                    'final_score' => $participant->score,
                    'final_rank' => $rank + 1,
                    'correct_count' => $participant->correct_answers,
                    'incorrect_count' => $participant->incorrect_answers,
                    'accuracy_percent' => $accuracy,
                ]
            );
        }
    }

    /**
     * Format session payload with anti-cheat protections.
     */
    private function formatSessionPayload(QuizSession $session, bool $isAdmin): array
    {
        $currentQuestion = null;

        if ($session->current_question_id) {
            $q = Question::with('options')->find($session->current_question_id);
            if ($q) {
                // If question is live and user is NOT admin, strip `is_correct` and `explanation`
                $revealAnswer = $isAdmin || in_array($session->status, ['showing_answer', 'leaderboard', 'finished']);

                $options = $q->options->map(function ($opt) use ($revealAnswer) {
                    $item = [
                        'id' => $opt->id,
                        'option_text' => $opt->option_text,
                        'image' => $opt->image,
                        'order' => $opt->order,
                    ];
                    if ($revealAnswer) {
                        $item['is_correct'] = (bool)$opt->is_correct;
                    }
                    return $item;
                });

                $currentQuestion = [
                    'id' => $q->id,
                    'type' => $q->type,
                    'question_text' => $q->question_text,
                    'image' => $q->image,
                    'audio' => $q->audio,
                    'time_limit' => $q->time_limit,
                    'points' => $q->points,
                    'order' => $q->order,
                    'total_questions' => $session->quiz->questions()->count(),
                    'options' => $options,
                ];

                if ($revealAnswer) {
                    $currentQuestion['explanation'] = $q->explanation;
                }
            }
        }

        // Calculate answer stats for host & players
        $answeredCount = 0;
        $correctCount = 0;
        $incorrectCount = 0;
        $optionCounts = [];

        if ($session->current_question_id) {
            $answers = $session->participantAnswers()
                ->where('question_id', $session->current_question_id)
                ->select(['id', 'is_correct', 'answer'])
                ->get();
            $answeredCount = $answers->count();
            $correctCount = $answers->where('is_correct', true)->count();
            $incorrectCount = $answers->where('is_correct', false)->count();

            foreach ($answers as $ans) {
                $val = $ans->answer;
                if (is_numeric($val)) {
                    $optId = (int)$val;
                    $optionCounts[$optId] = ($optionCounts[$optId] ?? 0) + 1;
                }
            }
        }

        if ($currentQuestion && ($isAdmin || in_array($session->status, ['showing_answer', 'leaderboard', 'finished']))) {
            $currentQuestion['stats'] = [
                'answered_count' => $answeredCount,
                'correct_count' => $correctCount,
                'incorrect_count' => $incorrectCount,
                'option_counts' => $optionCounts,
            ];
            // Also enrich options with response counts
            $currentQuestion['options'] = array_map(function ($opt) use ($optionCounts) {
                $opt['responses_count'] = $optionCounts[$opt['id']] ?? 0;
                return $opt;
            }, $currentQuestion['options']->toArray());
        }

        return [
            'id' => $session->id,
            'session_code' => $session->session_code,
            'status' => $session->status,
            'quiz' => [
                'id' => $session->quiz->id,
                'title' => $session->quiz->title,
                'description' => $session->quiz->description,
                'category' => $session->quiz->category,
                'difficulty' => $session->quiz->difficulty,
                'cover_image' => $session->quiz->cover_image,
                'total_questions' => $session->quiz->questions()->count(),
            ],
            'current_question' => $currentQuestion,
            'current_question_started_at' => $session->current_question_started_at,
            'started_at' => $session->started_at,
            'ended_at' => $session->ended_at,
            'settings' => $session->settings,
            'lobby_enabled' => (bool)($session->settings['lobby_enabled'] ?? false),
            'pace_mode' => $session->settings['pace_mode'] ?? (($session->settings['lobby_enabled'] ?? false) ? 'host_controlled' : 'self_paced'),
            'all_questions' => ($session->settings['pace_mode'] ?? '') === 'self_paced' || !($session->settings['lobby_enabled'] ?? false)
                ? $session->quiz->questions()->orderBy('order', 'asc')->with('options')->get()->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'type' => $q->type,
                        'question_text' => $q->question_text,
                        'image' => $q->image,
                        'audio' => $q->audio,
                        'time_limit' => $q->time_limit,
                        'points' => $q->points,
                        'order' => $q->order,
                        'options' => $q->options->map(function ($opt) {
                            return [
                                'id' => $opt->id,
                                'option_text' => $opt->option_text,
                                'image' => $opt->image,
                                'order' => $opt->order,
                            ];
                        }),
                    ];
                })
                : [],
            'participants_count' => $session->participants()->count(),
            'answered_count' => $answeredCount,
            'correct_count' => $correctCount,
            'incorrect_count' => $incorrectCount,
            'option_counts' => $optionCounts,
            'groups' => $session->groups()->get(['id', 'name', 'color', 'score']),
            'participants' => $session->participants()
                ->with('group:id,name,color')
                ->orderBy('score', 'desc')
                ->take(30)
                ->get(['id', 'username', 'group_id', 'score', 'status']),
        ];
    }

    /**
     * Admin: Toggle holding in lobby vs fast to questions.
     */
    public function toggleLobby(Request $request, $id)
    {
        $session = QuizSession::findOrFail($id);
        $settings = $session->settings ?? [];
        $currentLobby = (bool)($settings['lobby_enabled'] ?? false);
        $settings['lobby_enabled'] = !$currentLobby;
        $settings['pace_mode'] = $settings['lobby_enabled'] ? 'host_controlled' : 'self_paced';

        $updates = ['settings' => $settings];
        if (!$settings['lobby_enabled'] && $session->status === 'waiting') {
            $updates['status'] = 'live_question';
            if (!$session->current_question_id) {
                $updates['current_question_id'] = $session->quiz->questions()->orderBy('order', 'asc')->first()?->id;
                $updates['current_question_started_at'] = now();
            }
        }
        $session->update($updates);

        return response()->json([
            'message' => 'Lobby mode updated',
            'session' => $this->formatSessionPayload($session->fresh(), true),
        ]);
    }

    /**
     * Admin: Toggle question timer on/off during live session.
     */
    public function toggleTimer(Request $request, $id)
    {
        $session = QuizSession::findOrFail($id);
        $settings = $session->settings ?? [];
        $currentTimer = (bool)($settings['timer_enabled'] ?? true);
        $settings['timer_enabled'] = !$currentTimer;

        $session->update(['settings' => $settings]);
        self::clearSessionCache($session->session_code);

        return response()->json([
            'message' => $settings['timer_enabled'] ? 'Timer enabled' : 'Timer disabled (untimed mode)',
            'timer_enabled' => $settings['timer_enabled'],
            'session' => $this->formatSessionPayload($session->fresh(), true),
        ]);
    }

    /**
     * Participant: Finish self-paced quiz.
     */
    public function finishParticipant(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::where('session_code', $code)->firstOrFail();
        $token = $request->header('X-Session-Token');
        $participant = Participant::where('quiz_session_id', $session->id)->where('session_token', $token)->firstOrFail();

        $participant->update([
            'status' => 'finished',
            'finished_at' => now(),
        ]);

        $totalQuestions = $session->quiz->questions()->count();
        $accuracy = $totalQuestions > 0 ? round(($participant->correct_answers / $totalQuestions) * 100, 2) : 0;

        $currentRank = Participant::where('quiz_session_id', $session->id)
            ->where('score', '>', $participant->score)
            ->count() + 1;

        QuizResult::updateOrCreate(
            ['quiz_session_id' => $session->id, 'participant_id' => $participant->id],
            [
                'group_id' => $participant->group_id,
                'final_score' => $participant->score,
                'final_rank' => $currentRank,
                'correct_count' => $participant->correct_answers,
                'incorrect_count' => $participant->incorrect_answers,
                'accuracy_percent' => $accuracy,
            ]
        );

        return response()->json([
            'message' => 'Participant finished quiz',
            'final_score' => $participant->score,
            'correct_count' => $participant->correct_answers,
            'incorrect_count' => $participant->incorrect_answers,
            'accuracy' => $accuracy,
            'final_rank' => $currentRank,
            'total_questions' => $totalQuestions,
        ]);
    }
}

