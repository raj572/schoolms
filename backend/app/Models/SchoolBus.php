<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolBus extends Model
{
  use HasFactory;

  protected $table = 'school_buses';

  protected $casts = [
    'capacity' => 'integer',
  ];

  protected $fillable = [
    'school_id',
    'bus_number',
    'driver_name',
    'driver_contact',
    'route_name',
    'status',
    'capacity',
    'registration_number',
  ];

  /**
   * Get the school that owns the bus.
   */
  public function school()
  {
    return $this->belongsTo(School::class);
  }

  /**
   * Get the transport assignments for this bus.
   */
  public function transportAssignments()
  {
    return $this->hasMany(TransportAssignment::class, 'bus_id');
  }

  /**
   * Get active transport assignments for this bus.
   */
  public function activeTransportAssignments()
  {
    return $this->hasMany(TransportAssignment::class, 'bus_id')
      ->where('status', 'active');
  }

  /**
   * Get available capacity
   */
  public function getAvailableCapacity(): int
  {
    $assignedStudents = $this->activeTransportAssignments()->count();
    return ($this->capacity ?? 0) - $assignedStudents;
  }
}
