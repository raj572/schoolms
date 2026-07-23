<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * HostelRoom Model
 *
 * Represents a room in a hostel building
 *
 * @property int $id
 * @property int $hostel_building_id
 * @property int $school_id
 * @property string $room_number
 * @property string|null $room_type
 * @property int $capacity
 * @property int $occupied_beds
 * @property float $monthly_fee
 * @property string|null $facilities
 * @property string $status
 */
class HostelRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_building_id',
        'school_id',
        'room_number',
        'floor',
        'block_wing',
        'room_type',
        'capacity',
        'occupied_beds',
        'monthly_fee',
        'facilities',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'occupied_beds' => 'integer',
        'monthly_fee' => 'decimal:2',
    ];

    /**
     * Get the hostel building
     */
    public function hostelBuilding(): BelongsTo
    {
        return $this->belongsTo(HostelBuilding::class);
    }

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get all allocations for this room
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(HostelAllocation::class);
    }

    /**
     * Get active allocations
     */
    public function activeAllocations(): HasMany
    {
        return $this->hasMany(HostelAllocation::class)
            ->where('status', 'active');
    }

    /**
     * Check if room has available beds
     */
    public function hasAvailableBeds(): bool
    {
        return $this->occupied_beds < $this->capacity && $this->status === 'available';
    }

    /**
     * Get available beds count
     */
    public function getAvailableBedsAttribute(): int
    {
        return max(0, $this->capacity - $this->occupied_beds);
    }
}


