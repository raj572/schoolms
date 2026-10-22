<?php

namespace App\Repositories;

use App\Models\StudentAttendanceRecord;
use Illuminate\Support\Collection;

class StudentAttendanceRecordRepository
{
  public function create(array $data): StudentAttendanceRecord
  {
    return StudentAttendanceRecord::create($data);
  }

  public function update(int $id, array $data): ?StudentAttendanceRecord
  {
    $record = StudentAttendanceRecord::find($id);
    if ($record) {
      $record->update($data);
    }
    return $record;
  }

  public function delete(int $id): bool
  {
    return StudentAttendanceRecord::where('id', $id)->delete() > 0;
  }

  public function findById(int $id): ?StudentAttendanceRecord
  {
    return StudentAttendanceRecord::find($id);
  }

  public function findByStudentAndDate(int $studentId, string $date): ?StudentAttendanceRecord
  {
    $studentDetailsId = \Illuminate\Support\Facades\DB::table('student_details')
      ->where('id', $studentId)
      ->orWhere('student_id', $studentId)
      ->value('id') ?? $studentId;

    return StudentAttendanceRecord::where('student_details_id', $studentDetailsId)
      ->where('attendance_date', $date)
      ->first();
  }

  public function getBySchoolAndDate(int $schoolId, string $date): Collection
  {
    return StudentAttendanceRecord::where('school_id', $schoolId)
      ->where('attendance_date', $date)
      ->get();
  }

  public function getByStudent(int $studentId): Collection
  {
    $studentDetailsId = \Illuminate\Support\Facades\DB::table('student_details')
      ->where('id', $studentId)
      ->orWhere('student_id', $studentId)
      ->value('id') ?? $studentId;

    return StudentAttendanceRecord::where('student_details_id', $studentDetailsId)->get();
  }
}
