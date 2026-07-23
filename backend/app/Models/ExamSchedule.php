<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ExamSchedule Model
 *
 * Represents a specific exam for a subject, class, and date
 *
 * @property int $id
 * @property int $exam_id
 * @property int $school_id
 * @property int $class_id
 * @property int $subject_id
 * @property string $exam_date
 * @property string $start_time
 * @property string $end_time
 * @property int $total_marks
 * @property int $passing_marks
 * @property string|null $room_number
 * @property string|null $instructions
 */
class ExamSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'school_id',
        'class_id',
        'subject_id',
        'exam_date',
        'start_time',
        'end_time',
        'total_marks',
        'passing_marks',
        'room_number',
        'instructions',
    ];

    protected $casts = [
        'exam_date' => 'date',
    ];

    /**
     * Get the exam that owns this schedule
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the class
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the subject
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(SchoolSubject::class, 'subject_id');
    }

    /**
     * Get student marks for this exam schedule
     */
    public function marks(): HasMany
    {
        return $this->hasMany(StudentExamMark::class);
    }
}


