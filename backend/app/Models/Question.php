<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'type',
        'question_text',
        'image',
        'audio',
        'explanation',
        'time_limit',
        'points',
        'negative_points',
        'order',
        'settings',
    ];

    protected $casts = [
        'time_limit' => 'integer',
        'points' => 'integer',
        'negative_points' => 'integer',
        'order' => 'integer',
        'settings' => 'array',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options()
    {
        return $this->hasMany(AnswerOption::class)->orderBy('order', 'asc');
    }

    public function participantAnswers()
    {
        return $this->hasMany(ParticipantAnswer::class);
    }
}
