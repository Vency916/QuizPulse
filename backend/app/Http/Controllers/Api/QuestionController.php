<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\AnswerOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    /**
     * Admin: List all questions across quizzes or filtered by quiz_id.
     */
    public function index(Request $request)
    {
        $query = Question::with(['quiz:id,title,category', 'options'])
            ->orderBy('quiz_id')
            ->orderBy('order', 'asc');

        if ($request->filled('quiz_id')) {
            $query->where('quiz_id', $request->quiz_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'like', "%{$search}%")
                  ->orWhere('explanation', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'questions' => $query->get(),
        ]);
    }

    /**
     * Admin: Store question for a quiz.
     */
    public function store(Request $request, $quizId)
    {
        $quiz = Quiz::findOrFail($quizId);

        $validated = $request->validate([
            'type' => 'required|in:multiple_choice,true_false,multiple_select,short_answer',
            'question_text' => 'required|string',
            'image' => 'nullable|string',
            'audio' => 'nullable|string',
            'explanation' => 'nullable|string',
            'time_limit' => 'required|integer|min:5|max:300',
            'points' => 'required|integer|min:0',
            'negative_points' => 'nullable|integer|min:0',
            'options' => 'required|array|min:1',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        return DB::transaction(function () use ($quiz, $validated) {
            $nextOrder = $quiz->questions()->max('order') + 1;

            $question = Question::create([
                'quiz_id' => $quiz->id,
                'type' => $validated['type'],
                'question_text' => $validated['question_text'],
                'image' => $validated['image'] ?? null,
                'audio' => $validated['audio'] ?? null,
                'explanation' => $validated['explanation'] ?? null,
                'time_limit' => $validated['time_limit'],
                'points' => $validated['points'],
                'negative_points' => $validated['negative_points'] ?? 0,
                'order' => $nextOrder,
            ]);

            foreach ($validated['options'] as $idx => $opt) {
                AnswerOption::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct'],
                    'order' => $idx + 1,
                ]);
            }

            return response()->json([
                'message' => 'Question created successfully',
                'question' => $question->load('options'),
            ], 201);
        });
    }

    /**
     * Admin: Update question and options.
     */
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|required|in:multiple_choice,true_false,multiple_select,short_answer',
            'question_text' => 'sometimes|required|string',
            'image' => 'nullable|string',
            'audio' => 'nullable|string',
            'explanation' => 'nullable|string',
            'time_limit' => 'sometimes|required|integer|min:5|max:300',
            'points' => 'sometimes|required|integer|min:0',
            'negative_points' => 'nullable|integer|min:0',
            'options' => 'nullable|array',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        return DB::transaction(function () use ($question, $validated) {
            $question->update([
                'type' => $validated['type'] ?? $question->type,
                'question_text' => $validated['question_text'] ?? $question->question_text,
                'image' => array_key_exists('image', $validated) ? $validated['image'] : $question->image,
                'audio' => array_key_exists('audio', $validated) ? $validated['audio'] : $question->audio,
                'explanation' => array_key_exists('explanation', $validated) ? $validated['explanation'] : $question->explanation,
                'time_limit' => $validated['time_limit'] ?? $question->time_limit,
                'points' => $validated['points'] ?? $question->points,
                'negative_points' => $validated['negative_points'] ?? $question->negative_points,
            ]);

            if (isset($validated['options'])) {
                $question->options()->delete();
                foreach ($validated['options'] as $idx => $opt) {
                    AnswerOption::create([
                        'question_id' => $question->id,
                        'option_text' => $opt['option_text'],
                        'is_correct' => $opt['is_correct'],
                        'order' => $idx + 1,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Question updated successfully',
                'question' => $question->load('options'),
            ]);
        });
    }

    /**
     * Admin: Delete question.
     */
    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $quizId = $question->quiz_id;
        $question->delete();

        // Reorder remaining questions
        $remaining = Question::where('quiz_id', $quizId)->orderBy('order', 'asc')->get();
        foreach ($remaining as $idx => $q) {
            $q->update(['order' => $idx + 1]);
        }

        return response()->json([
            'message' => 'Question deleted successfully',
        ]);
    }

    /**
     * Admin: Reorder questions.
     */
    public function reorder(Request $request, $quizId)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:questions,id',
        ]);

        $orderedIds = $request->input('order');
        foreach ($orderedIds as $index => $id) {
            Question::where('id', $id)->where('quiz_id', $quizId)->update(['order' => $index + 1]);
        }

        return response()->json([
            'message' => 'Questions reordered successfully',
        ]);
    }

    /**
     * Admin: Duplicate question.
     */
    public function duplicate($id)
    {
        $original = Question::with('options')->findOrFail($id);

        $newQuestion = $original->replicate();
        $newQuestion->question_text = $original->question_text . ' (Copy)';
        $newQuestion->order = Question::where('quiz_id', $original->quiz_id)->max('order') + 1;
        $newQuestion->save();

        foreach ($original->options as $option) {
            $newOption = $option->replicate();
            $newOption->question_id = $newQuestion->id;
            $newOption->save();
        }

        return response()->json([
            'message' => 'Question duplicated successfully',
            'question' => $newQuestion->load('options'),
        ]);
    }
}
