<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * HostelAllocation Model
 *
 * Represents a student's hostel room allocation
 *
 * @property int $id
 * @property int $hostel_room_id
 * @property int $student_id
 * @property int $student_details_id
 * @property int $school_id
 * @property string $allocation_date
 * @property string|null $vacate_date
 * @property float $monthly_fee
 * @property string $status
 * @property string|null $remarks
 */
class HostelAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_room_id',
        'student_id',
        'student_details_id',
        'school_id',
        'allocation_date',
        'vacate_date',
        'monthly_fee',
        'status',
        'remarks',
    ];

    protected $casts = [
        'allocation_date' => 'date',
        'vacate_date' => 'date',
        'monthly_fee' => 'decimal:2',
    ];

    /**
     * Get the hostel room
     */
    public function hostelRoom(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class);
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
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}


