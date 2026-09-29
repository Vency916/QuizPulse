<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuizSessionController;
use App\Http\Controllers\Api\ParticipantController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\AnalyticsController;

/*
|--------------------------------------------------------------------------
| Public Routes (Guest Participants & Landing Page)
|--------------------------------------------------------------------------
*/

// Admin Authentication
Route::post('/auth/login', [AuthController::class, 'login']);

// Landing Page: Live Quizzes
Route::get('/quizzes/live', [QuizController::class, 'liveQuizzes']);

// Participant Gameplay & Public Session Access
Route::prefix('sessions')->group(function () {
    Route::get('/code/{code}', [QuizSessionController::class, 'getByCode']);
    Route::get('/{code}/stream', [QuizSessionController::class, 'stream']);
    Route::post('/{code}/join', [ParticipantController::class, 'join']);
    Route::get('/{code}/me', [ParticipantController::class, 'me']);
    Route::post('/{code}/answer', [AnswerController::class, 'submit']);
    Route::get('/{code}/leaderboard', [LeaderboardController::class, 'getLeaderboard']);
    Route::post('/{code}/quick-start', [QuizSessionController::class, 'quickStart']);
    Route::post('/{code}/quick-next', [QuizSessionController::class, 'quickNext']);
    Route::post('/{code}/finish', [QuizSessionController::class, 'finishParticipant']);
});




/*
|--------------------------------------------------------------------------
| Protected Super Admin Routes (Laravel Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Current Admin User & Logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin Dashboard & Analytics
    Route::get('/admin/stats', [AnalyticsController::class, 'dashboardStats']);
    Route::get('/admin/sessions/{id}/analytics', [AnalyticsController::class, 'sessionAnalytics']);

    // Quiz Management CRUD
    Route::get('/admin/quizzes', [QuizController::class, 'index']);
    Route::post('/admin/quizzes', [QuizController::class, 'store']);
    Route::get('/admin/quizzes/{id}', [QuizController::class, 'show']);
    Route::put('/admin/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/admin/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::post('/admin/quizzes/{id}/duplicate', [QuizController::class, 'duplicate']);

    // Question Management CRUD & Reordering
    Route::get('/admin/questions', [QuestionController::class, 'index']);
    Route::post('/admin/quizzes/{quizId}/questions', [QuestionController::class, 'store']);
    Route::post('/admin/questions/parse-document', [QuestionController::class, 'parseDocument']);
    Route::post('/admin/quizzes/{quizId}/import-questions', [QuestionController::class, 'importToQuiz']);
    Route::post('/admin/quizzes/create-with-questions', [QuestionController::class, 'createWithQuestions']);

    Route::put('/admin/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/admin/questions/{id}', [QuestionController::class, 'destroy']);
    Route::post('/admin/questions/{id}/duplicate', [QuestionController::class, 'duplicate']);
    Route::post('/admin/quizzes/{quizId}/questions/reorder', [QuestionController::class, 'reorder']);

    // Live Game Control Engine
    Route::post('/admin/quizzes/{quizId}/launch', [QuizSessionController::class, 'launch']);
    Route::post('/admin/sessions/{id}/start', [QuizSessionController::class, 'start']);
    Route::post('/admin/sessions/{id}/next-question', [QuizSessionController::class, 'nextQuestion']);
    Route::post('/admin/sessions/{id}/show-answer', [QuizSessionController::class, 'showAnswer']);
    Route::post('/admin/sessions/{id}/show-leaderboard', [QuizSessionController::class, 'showLeaderboard']);
    Route::post('/admin/sessions/{id}/pause', [QuizSessionController::class, 'pause']);
    Route::post('/admin/sessions/{id}/resume', [QuizSessionController::class, 'resume']);
    Route::post('/admin/sessions/{id}/toggle-lobby', [QuizSessionController::class, 'toggleLobby']);
    Route::post('/admin/sessions/{id}/end', [QuizSessionController::class, 'endQuiz']);
});

