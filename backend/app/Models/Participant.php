<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_session_id',
        'group_id',
        'username',
        'session_token',
        'score',
        'correct_answers',
        'incorrect_answers',
        'status',
        'joined_at',
        'last_seen_at',
        'finished_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'correct_answers' => 'integer',
        'incorrect_answers' => 'integer',
        'joined_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function answers()
    {
        return $this->hasMany(ParticipantAnswer::class);
    }

    public function result()
    {
        return $this->hasOne(QuizResult::class);
    }
}
