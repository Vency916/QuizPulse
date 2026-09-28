<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParticipantAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'quiz_session_id',
        'question_id',
        'answer',
        'is_correct',
        'points_earned',
        'response_time_ms',
        'answered_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'integer',
        'response_time_ms' => 'integer',
        'answered_at' => 'datetime',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function session()
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
