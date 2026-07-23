<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherAttendanceSummary extends Model
{
  protected $table = 'attendance_summary';

  protected $fillable = [
    'teacher_id',
    'school_id',
    'year',
    'month',
    'total_days',
    'present_days',
    'absent_days',
    'late_days',
    'half_days',
  ];

  public function teacher()
  {
    return $this->belongsTo(Teacher::class, 'teacher_id');
  }

  public function school()
  {
    return $this->belongsTo(School::class, 'school_id');
  }
}
