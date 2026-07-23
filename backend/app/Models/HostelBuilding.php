<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * HostelBuilding Model
 *
 * Represents a hostel building in the school
 *
 * @property int $id
 * @property int $school_id
 * @property string $building_name
 * @property string|null $building_type
 * @property string|null $address
 * @property string|null $warden_name
 * @property string|null $warden_contact
 * @property int $total_rooms
 * @property string|null $description
 * @property string $status
 */
class HostelBuilding extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'warden_id',
        'building_name',
        'building_type',
        'address',
        'warden_name',
        'warden_contact',
        'total_rooms',
        'description',
        'status',
    ];

    protected $casts = [
        'total_rooms' => 'integer',
    ];

    /**
     * Get the school that owns the hostel
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get all rooms in this building
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(HostelRoom::class);
    }

    /**
     * Get available rooms
     */
    public function availableRooms(): HasMany
    {
        return $this->hasMany(HostelRoom::class)
            ->where('status', 'available');
    }

    /**
     * Get the warden assigned to this building
     */
    public function warden(): BelongsTo
    {
        return $this->belongsTo(User::class, 'warden_id');
    }
}


