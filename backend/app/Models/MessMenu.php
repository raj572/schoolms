<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * MessMenu Model
 *
 * Represents a meal menu for a specific date and meal type
 *
 * @property int $id
 * @property int $school_id
 * @property date $date
 * @property string $meal_type
 * @property array $items
 * @property int $created_by
 * @property string|null $description
 */
class MessMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'date',
        'meal_type',
        'items',
        'created_by',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'items' => 'array',
    ];

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the creator (warden)
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all bookings for this menu
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(MessBooking::class);
    }
}

