<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    /**
     * Admin: List all quizzes with search and filter.
     */
    public function index(Request $request)
    {
        $query = Quiz::withCount('questions', 'sessions')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $quizzes = $query->get();

        return response()->json([
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Admin: Show single quiz with its ordered questions and options.
     */
    public function show($id)
    {
        $quiz = Quiz::with(['questions.options', 'sessions' => function ($q) {
            $q->orderBy('created_at', 'desc')->take(5);
        }])->findOrFail($id);

        return response()->json([
            'quiz' => $quiz,
        ]);
    }

    /**
     * Admin: Create a new quiz.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'difficulty' => 'required|in:easy,medium,hard',
            'cover_image' => 'nullable|string|url',
            'status' => 'nullable|in:draft,published,archived',
            'settings' => 'nullable|array',
        ]);

        $defaultSettings = [
            'speed_bonus' => true,
            'base_points' => 100,
            'max_speed_bonus' => 400,
            'negative_points' => false,
            'groups_enabled' => false,
        ];

        $quiz = Quiz::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'difficulty' => $validated['difficulty'],
            'cover_image' => $validated['cover_image'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'settings' => array_merge($defaultSettings, $request->input('settings', [])),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Quiz created successfully',
            'quiz' => $quiz->load('questions.options'),
        ], 201);
    }

    /**
     * Admin: Update quiz.
     */
    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|required|string|max:100',
            'difficulty' => 'sometimes|required|in:easy,medium,hard',
            'cover_image' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,published,archived',
            'settings' => 'nullable|array',
        ]);

        if (isset($validated['settings'])) {
            $validated['settings'] = array_merge($quiz->settings ?? [], $validated['settings']);
        }

        $quiz->update($validated);

        return response()->json([
            'message' => 'Quiz updated successfully',
            'quiz' => $quiz->load('questions.options'),
        ]);
    }

    /**
     * Admin: Delete quiz.
     */
    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return response()->json([
            'message' => 'Quiz deleted successfully',
        ]);
    }

    /**
     * Admin: Duplicate quiz with all questions and answer options.
     */
    public function duplicate($id)
    {
        $original = Quiz::with('questions.options')->findOrFail($id);

        $newQuiz = $original->replicate(['slug']);
        $newQuiz->title = $original->title . ' (Copy)';
        $newQuiz->slug = Str::slug($newQuiz->title) . '-' . Str::lower(Str::random(5));
        $newQuiz->status = 'draft';
        $newQuiz->save();

        foreach ($original->questions as $question) {
            $newQuestion = $question->replicate();
            $newQuestion->quiz_id = $newQuiz->id;
            $newQuestion->save();

            foreach ($question->options as $option) {
                $newOption = $option->replicate();
                $newOption->question_id = $newQuestion->id;
                $newOption->save();
            }
        }

        return response()->json([
            'message' => 'Quiz duplicated successfully',
            'quiz' => $newQuiz->load('questions.options'),
        ]);
    }

    /**
     * Public: Get currently live or joinable quizzes for Landing Page.
     */
    public function liveQuizzes()
    {
        // Active sessions that are in waiting or live_question state
        $sessions = QuizSession::with(['quiz.questions', 'participants', 'groups'])
            ->whereIn('status', ['waiting', 'live_question', 'showing_answer', 'leaderboard'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($session) {
                $quiz = $session->quiz;
                $qCount = $quiz ? $quiz->questions->count() : 0;
                $pCount = $session->participants->count();

                return [
                    'id' => $session->id,
                    'session_code' => $session->session_code,
                    'status' => $session->status,
                    'title' => $quiz ? $quiz->title : 'Live Quiz',
                    'description' => $quiz ? $quiz->description : null,
                    'category' => $quiz ? $quiz->category : 'General',
                    'difficulty' => $quiz ? $quiz->difficulty : 'medium',
                    'cover_image' => $quiz ? $quiz->cover_image : null,
                    'questions_count' => $qCount,
                    'participants_count' => $pCount,
                    'groups_enabled' => !empty($session->settings['groups_enabled']),
                    'started_at' => $session->started_at,
                    'quiz' => $quiz ? [
                        'id' => $quiz->id,
                        'title' => $quiz->title,
                        'description' => $quiz->description,
                        'category' => $quiz->category,
                        'difficulty' => $quiz->difficulty,
                        'cover_image' => $quiz->cover_image,
                        'total_questions' => $qCount,
                        'questions_count' => $qCount,
                    ] : null,
                ];
            });

        return response()->json([
            'live_sessions' => $sessions,
        ]);
    }
}
