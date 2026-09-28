<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\Participant;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ParticipantController extends Controller
{
    /**
     * Join quiz session with username and optional group.
     */
    public function join(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::with(['quiz', 'groups'])->where('session_code', $code)->first();

        if (!$session) {
            return response()->json(['message' => 'Quiz session not found.'], 404);
        }

        if ($session->status === 'finished') {
            return response()->json(['message' => 'This quiz session has already finished.'], 400);
        }

        $request->validate([
            'username' => 'required|string|min:2|max:25|regex:/^[a-zA-Z0-9_\-\s]+$/',
            'group_id' => 'nullable|exists:groups,id',
        ], [
            'username.regex' => 'Username can only contain letters, numbers, hyphens, and spaces.',
        ]);

        $username = trim(strip_tags($request->username));

        // Check if username already exists in this session
        $existing = Participant::where('quiz_session_id', $session->id)
            ->where('username', $username)
            ->first();

        if ($existing) {
            // If participant is reconnecting with same session token
            $providedToken = $request->header('X-Session-Token');
            if ($providedToken && $existing->session_token === $providedToken) {
                $existing->update([
                    'status' => 'active',
                    'last_seen_at' => now(),
                ]);

                return response()->json([
                    'message' => 'Reconnected to session',
                    'participant' => $existing->load('group'),
                    'session_token' => $existing->session_token,
                ]);
            }

            return response()->json([
                'message' => 'That username is already playing in this quiz. Please choose another username.',
            ], 422);
        }

        // Determine group assignment
        $groupId = $request->group_id;
        if (empty($groupId) && !empty($session->settings['groups_enabled']) && !empty($session->settings['auto_assign_groups'])) {
            // Auto-assign to group with fewest members
            $groups = $session->groups()->withCount('participants')->get();
            $smallest = $groups->sortBy('participants_count')->first();
            if ($smallest) {
                $groupId = $smallest->id;
            }
        }

        $sessionToken = Str::random(40);

        $participant = Participant::create([
            'quiz_session_id' => $session->id,
            'group_id' => $groupId,
            'username' => $username,
            'session_token' => $sessionToken,
            'score' => 0,
            'correct_answers' => 0,
            'incorrect_answers' => 0,
            'status' => 'waiting',
            'joined_at' => now(),
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'message' => 'Joined quiz successfully',
            'participant' => $participant->load('group'),
            'session_token' => $sessionToken,
        ], 201);
    }

    /**
     * Heartbeat / Check participant state and reconnection.
     */
    public function me(Request $request, $code)
    {
        $code = strtoupper(trim($code));
        $session = QuizSession::where('session_code', $code)->first();

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        $token = $request->header('X-Session-Token');
        if (!$token) {
            return response()->json(['message' => 'Session token missing'], 401);
        }

        $participant = Participant::where('quiz_session_id', $session->id)
            ->where('session_token', $token)
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Participant not found in this session'], 404);
        }

        $participant->update(['last_seen_at' => now()]);

        return response()->json([
            'participant' => $participant->load('group'),
        ]);
    }
}
