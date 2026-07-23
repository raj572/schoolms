<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TransportAssignment Model
 * 
 * Represents a student's transportation assignment to a school bus
 *
 * @property int $id
 * @property int $school_id
 * @property int $student_details_id
 * @property int $bus_id
 * @property string $pickup_point
 * @property string $pickup_time
 * @property string $drop_time
 * @property float $monthly_fee
 * @property string $status
 * @property string $start_date
 * @property string|null $end_date
 * @property string|null $remarks
 */
class TransportAssignment extends Model
{
    use HasFactory;

    protected $table = 'transport_assignments';

    protected $fillable = [
        'school_id',
        'student_details_id',
        'bus_id',
        'pickup_point',
        'pickup_time',
        'drop_time',
        'monthly_fee',
        'status',
        'start_date',
        'end_date',
        'remarks',
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
        'drop_time' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'monthly_fee' => 'decimal:2',
    ];

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the student details
     */
    public function studentDetails(): BelongsTo
    {
        return $this->belongsTo(StudentDetails::class, 'student_details_id');
    }

    /**
     * Get student_details (alias for snake_case)
     */
    public function student_details(): BelongsTo
    {
        return $this->studentDetails();
    }

    /**
     * Get the bus
     */
    public function bus(): BelongsTo
    {
        return $this->belongsTo(SchoolBus::class, 'bus_id');
    }

    /**
     * Check if assignment is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Calculate monthly fee
     */
    public function calculateMonthlyFee(): float
    {
        return $this->monthly_fee;
    }
}

