<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
  use HasFactory;

  protected $table = 'school_class';

  protected $fillable = [
    'class',
    'section',
    'room_no',
    'teacher_in_charge',
    'capacity',
    'status',
    'notes',
    'school_id',
  ];

  /**
   * Automatically append these accessors to JSON
   */
  protected $appends = ['class_name'];

  /**
   * Relationship: A class belongs to a school
   */
  public function school()
  {
    return $this->belongsTo(School::class, 'school_id');
  }

  /**
   * Accessor: Get formatted class name
   * e.g., "Class 10-A"
   */
  public function getClassNameAttribute(): string
  {
    if ($this->section) {
      return "Class {$this->class}-{$this->section}";
    }
    return "Class {$this->class}";
  }
}
