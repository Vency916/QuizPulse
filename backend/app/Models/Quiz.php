<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'difficulty',
        'cover_image',
        'status',
        'settings',
        'created_by',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order', 'asc');
    }

    public function sessions()
    {
        return $this->hasMany(QuizSession::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quiz) {
            if (empty($quiz->slug)) {
                $quiz->slug = Str::slug($quiz->title) . '-' . Str::lower(Str::random(5));
            }
        });
    }
}
