<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_session_id',
        'participant_id',
        'group_id',
        'final_score',
        'final_rank',
        'correct_count',
        'incorrect_count',
        'accuracy_percent',
    ];

    protected $casts = [
        'final_score' => 'integer',
        'final_rank' => 'integer',
        'correct_count' => 'integer',
        'incorrect_count' => 'integer',
        'accuracy_percent' => 'float',
    ];

    public function session()
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}
