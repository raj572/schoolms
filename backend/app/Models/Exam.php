<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Exam Model
 *
 * Represents an exam period (e.g., Mid-Term, Final Exam)
 *
 * @property int $id
 * @property int $school_id
 * @property string $exam_name
 * @property string|null $exam_type
 * @property string $start_date
 * @property string $end_date
 * @property string|null $description
 * @property string $status
 */
class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'exam_name',
        'exam_type',
        'start_date',
        'end_date',
        'description',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the school that owns the exam
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get exam schedules for this exam
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(ExamSchedule::class);
    }
}


