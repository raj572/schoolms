<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolAchievement extends Model
{
    use HasFactory;

    protected $table = 'school_achievements';

    protected $fillable = [
        'school_id',
        'title',
        'description',
        'year',
        'category',
        'certificate_path',
    ];

    /**
     * Get the school that owns the achievement
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

