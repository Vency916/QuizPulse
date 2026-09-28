<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QuizSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'session_code',
        'status',
        'current_question_id',
        'current_question_started_at',
        'started_at',
        'ended_at',
        'settings',
    ];

    protected $casts = [
        'current_question_started_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'settings' => 'array',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function currentQuestion()
    {
        return $this->belongsTo(Question::class, 'current_question_id');
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    public function participantAnswers()
    {
        return $this->hasMany(ParticipantAnswer::class);
    }

    public function results()
    {
        return $this->hasMany(QuizResult::class);
    }

    public static function generateUniqueCode(): string
    {
        do {
            // Short 6-character uppercase alphanumeric code e.g. QP7392
            $code = strtoupper(Str::random(6));
        } while (self::where('session_code', $code)->exists());

        return $code;
    }
}
