<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyllabusCompletion extends Model
{
    use HasFactory;

    protected $table = 'syllabus_completion';

    protected $fillable = [
        'school_id',
        'teacher_id',
        'class_id',
        'subject_id',
        'total_chapters',
        'completed_chapters',
        'last_updated',
        'remarks',
    ];

    protected $casts = [
        'last_updated' => 'date',
    ];

    protected $appends = ['completion_percentage'];

    /**
     * Get completion percentage
     */
    public function getCompletionPercentageAttribute()
    {
        if ($this->total_chapters == 0) {
            return 0;
        }
        return round(($this->completed_chapters / $this->total_chapters) * 100, 2);
    }

    /**
     * Relationship: belongs to teacher
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    /**
     * Relationship: belongs to class
     */
    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Relationship: belongs to subject
     */
    public function subject()
    {
        return $this->belongsTo(SchoolSubject::class, 'subject_id');
    }

    /**
     * Relationship: belongs to school
     */
    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    /**
     * Relationship: has many history records
     */
    public function history()
    {
        return $this->hasMany(SyllabusCompletionHistory::class, 'syllabus_completion_id');
    }
}

