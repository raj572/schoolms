<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherAttendanceRecord extends Model
{
  protected $fillable = [
    'teacher_id',
    'school_id',
    'attendance_date',
    'status',
    'session_id',
    'remarks',
    'marked_by',
    'check_in_time',
    'check_out_time',
  ];

  protected $casts = [
    'attendance_date' => 'date',
    'check_in_time' => 'datetime',
    'check_out_time' => 'datetime',
  ];

  /**
   * Get the teacher
   */
  public function teacher(): BelongsTo
  {
    return $this->belongsTo(Teacher::class, 'teacher_id');
  }

  /**
   * Get the school
   */
  public function school(): BelongsTo
  {
    return $this->belongsTo(School::class, 'school_id');
  }

  /**
   * Get who marked the attendance (principal)
   */
  public function markedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'marked_by');
  }

  /**
   * Get the attendance session
   */
  public function session(): BelongsTo
  {
    return $this->belongsTo(AttendanceSession::class, 'session_id');
  }

  /**
   * Check if teacher was present
   */
  public function isPresent(): bool
  {
    return $this->status === 'present';
  }

  /**
   * Check if teacher was absent
   */
  public function isAbsent(): bool
  {
    return $this->status === 'absent';
  }

  /**
   * Check if teacher was late
   */
  public function isLate(): bool
  {
    return $this->status === 'late';
  }
}
