<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * MessBooking Model
 *
 * Represents a student meal booking
 *
 * @property int $id
 * @property int $school_id
 * @property int $student_id
 * @property int $menu_id
 * @property date $booking_date
 * @property string $meal_type
 * @property string $status
 * @property string|null $remarks
 */
class MessBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'menu_id',
        'booking_date',
        'meal_type',
        'status',
        'remarks',
    ];

    protected $casts = [
        'booking_date' => 'date',
    ];

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the menu
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(MessMenu::class);
    }
}

