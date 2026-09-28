<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    /**
     * Get real-time leaderboard for a session (both individual and group rankings).
     */
    public function getLeaderboard(Request $request, $code)
    {
        $code = strtoupper(trim($code));

        $data = Cache::remember("leaderboard_{$code}", 2, function () use ($code) {
            $session = QuizSession::with(['quiz', 'groups'])->where('session_code', $code)->first();

            if (!$session) {
                return null;
            }

            // Individual ranking
            $individual = Participant::with('group:id,name,color')
                ->where('quiz_session_id', $session->id)
                ->orderBy('score', 'desc')
                ->orderBy('correct_answers', 'desc')
                ->take(50)
                ->get(['id', 'username', 'group_id', 'score', 'correct_answers', 'incorrect_answers'])
                ->map(function ($p, $idx) {
                    return [
                        'rank' => $idx + 1,
                        'id' => $p->id,
                        'username' => $p->username,
                        'group' => $p->group ? [
                            'id' => $p->group->id,
                            'name' => $p->group->name,
                            'color' => $p->group->color,
                        ] : null,
                        'score' => $p->score,
                        'correct_answers' => $p->correct_answers,
                        'incorrect_answers' => $p->incorrect_answers,
                    ];
                });

            // Group ranking
            $groups = Group::withCount('participants')
                ->where('quiz_session_id', $session->id)
                ->orderBy('score', 'desc')
                ->get(['id', 'name', 'color', 'score'])
                ->map(function ($g, $idx) {
                    return [
                        'rank' => $idx + 1,
                        'id' => $g->id,
                        'name' => $g->name,
                        'color' => $g->color,
                        'score' => $g->score,
                        'participants_count' => $g->participants_count,
                    ];
                });

            return [
                'session_code' => $session->session_code,
                'status' => $session->status,
                'individual' => $individual,
                'groups' => $groups,
                'groups_enabled' => !empty($session->settings['groups_enabled']),
            ];
        });

        if (!$data) {
            return response()->json(['message' => 'Quiz session not found.'], 404);
        }

        return response()->json($data);
    }
}
