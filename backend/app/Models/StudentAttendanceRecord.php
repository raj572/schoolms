<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAttendanceRecord extends Model
{
  use HasFactory;

  protected $fillable = [
    'student_details_id',
    'school_id',
    'class_id',
    'subject_id',
    'period_number',
    'attendance_date',
    'status',
    'check_in_method',
    'marked_by',
    'check_in_time',
    'check_out_time',
    'session_id',
    'remarks',
  ];

  protected $casts = [
    'attendance_date' => 'date',
    'check_in_time' => 'datetime',
    'check_out_time' => 'datetime',
    'period_number' => 'integer',
  ];

  /**
   * Get the student details
   */
  public function student(): BelongsTo
  {
    return $this->belongsTo(StudentDetails::class, 'student_details_id');
  }

  /**
   * Get the school
   */
  public function school(): BelongsTo
  {
    return $this->belongsTo(School::class);
  }

  /**
   * Get the class
   */
  public function schoolClass(): BelongsTo
  {
    return $this->belongsTo(SchoolClass::class, 'class_id');
  }

  /**
   * Get the subject (for period-wise attendance)
   */
  public function subject(): BelongsTo
  {
    return $this->belongsTo(SchoolSubject::class, 'subject_id');
  }

  /**
   * Get the teacher who marked attendance
   */
  public function markedBy(): BelongsTo
  {
    return $this->belongsTo(Teacher::class, 'marked_by');
  }

  /**
   * Get the attendance session
   */
  public function session(): BelongsTo
  {
    return $this->belongsTo(AttendanceSession::class, 'session_id');
  }

  /**
   * Check if student was present
   */
  public function isPresent(): bool
  {
    return $this->status === 'present';
  }

  /**
   * Check if student was absent
   */
  public function isAbsent(): bool
  {
    return $this->status === 'absent';
  }

  /**
   * Check if student was late
   */
  public function isLate(): bool
  {
    return $this->status === 'late';
  }
}
