<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * StudentExamMark Model
 *
 * Represents marks obtained by a student in a specific exam
 *
 * @property int $id
 * @property int $exam_schedule_id
 * @property int $student_id
 * @property int $student_details_id
 * @property float|null $marks_obtained
 * @property float $marks_total
 * @property string|null $grade
 * @property string|null $remarks
 * @property string $status
 * @property int|null $entered_by
 * @property string|null $entered_at
 */
class StudentExamMark extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_schedule_id',
        'student_id',
        'student_details_id',
        'marks_obtained',
        'marks_total',
        'grade',
        'remarks',
        'status',
        'entered_by',
        'entered_at',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'marks_total' => 'decimal:2',
        'entered_at' => 'datetime',
    ];

    /**
     * Get the exam schedule
     */
    public function examSchedule(): BelongsTo
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the student details
     */
    public function studentDetails(): BelongsTo
    {
        return $this->belongsTo(StudentDetails::class);
    }

    /**
     * Get the teacher who entered the marks
     */
    public function enteredByTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'entered_by');
    }

    /**
     * Calculate percentage
     */
    public function getPercentageAttribute(): float
    {
        if ($this->marks_total > 0 && $this->marks_obtained !== null) {
            return round(($this->marks_obtained / $this->marks_total) * 100, 2);
        }
        return 0.0;
    }
}


