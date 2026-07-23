<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyllabusCompletionHistory extends Model
{
    use HasFactory;

    protected $table = 'syllabus_completion_history';

    protected $fillable = [
        'syllabus_completion_id',
        'completed_chapters',
        'completion_percentage',
        'recorded_date',
    ];

    protected $casts = [
        'recorded_date' => 'date',
        'completion_percentage' => 'decimal:2',
    ];

    /**
     * Relationship: belongs to syllabus completion
     */
    public function syllabusCompletion()
    {
        return $this->belongsTo(SyllabusCompletion::class, 'syllabus_completion_id');
    }
}

