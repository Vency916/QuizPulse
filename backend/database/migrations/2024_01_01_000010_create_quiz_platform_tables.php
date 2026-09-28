<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add is_super_admin to users if not exists
        if (!Schema::hasColumn('users', 'is_super_admin')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_super_admin')->default(true)->after('password');
            });
        }

        // Quizzes table
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category')->default('General');
            $table->string('difficulty')->default('medium'); // easy, medium, hard
            $table->string('cover_image')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->json('settings')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Questions table
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->string('type')->default('multiple_choice'); // multiple_choice, true_false, multiple_select, short_answer
            $table->text('question_text');
            $table->string('image')->nullable();
            $table->string('audio')->nullable();
            $table->text('explanation')->nullable();
            $table->integer('time_limit')->default(20); // in seconds
            $table->integer('points')->default(100);
            $table->integer('negative_points')->default(0);
            $table->integer('order')->default(1);
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Answer options table
        Schema::create('answer_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->text('option_text');
            $table->string('image')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->integer('order')->default(1);
            $table->timestamps();
        });

        // Quiz sessions table
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->string('session_code', 10)->unique()->index();
            $table->enum('status', ['waiting', 'live_question', 'showing_answer', 'leaderboard', 'paused', 'finished'])->default('waiting');
            $table->foreignId('current_question_id')->nullable()->constrained('questions')->nullOnDelete();
            $table->timestamp('current_question_started_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Groups table
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained('quiz_sessions')->onDelete('cascade');
            $table->string('name');
            $table->string('color', 20)->default('#6C5CE7');
            $table->integer('score')->default(0);
            $table->timestamps();
        });

        // Participants table
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained('quiz_sessions')->onDelete('cascade');
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete();
            $table->string('username');
            $table->string('session_token', 64)->index();
            $table->integer('score')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('incorrect_answers')->default(0);
            $table->enum('status', ['waiting', 'active', 'disconnected', 'finished'])->default('waiting');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            // Unique username within the same session
            $table->unique(['quiz_session_id', 'username']);
        });

        // Participant answers table
        Schema::create('participant_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained('participants')->onDelete('cascade');
            $table->foreignId('quiz_session_id')->constrained('quiz_sessions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->text('answer')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->integer('points_earned')->default(0);
            $table->integer('response_time_ms')->default(0);
            $table->timestamp('answered_at')->useCurrent();
            $table->timestamps();

            // Prevent duplicate answers by the same participant for the same question
            $table->unique(['participant_id', 'question_id']);
        });

        // Quiz results table
        Schema::create('quiz_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained('quiz_sessions')->onDelete('cascade');
            $table->foreignId('participant_id')->constrained('participants')->onDelete('cascade');
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete();
            $table->integer('final_score')->default(0);
            $table->integer('final_rank')->default(1);
            $table->integer('correct_count')->default(0);
            $table->integer('incorrect_count')->default(0);
            $table->decimal('accuracy_percent', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_results');
        Schema::dropIfExists('participant_answers');
        Schema::dropIfExists('participants');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('quiz_sessions');
        Schema::dropIfExists('answer_options');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('quizzes');
        
        if (Schema::hasColumn('users', 'is_super_admin')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_super_admin');
            });
        }
    }
};
