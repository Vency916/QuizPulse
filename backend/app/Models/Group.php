<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_session_id',
        'name',
        'color',
        'score',
    ];

    protected $casts = [
        'score' => 'integer',
    ];

    public function session()
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }
}
