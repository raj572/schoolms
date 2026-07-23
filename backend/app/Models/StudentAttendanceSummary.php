<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAttendanceSummary extends Model
{
  use HasFactory;

  protected $fillable = [
    'student_details_id',
    'school_id',
    'year',
    'month',
    'total_days',
    'present_days',
    'absent_days',
    'late_days',
    'half_days',
  ];

  public function student()
  {
    return $this->belongsTo(StudentDetails::class, 'student_details_id');
  }

  public function school()
  {
    return $this->belongsTo(School::class);
  }
}
