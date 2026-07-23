<?php

namespace App\Repositories;

use App\Models\StudentAttendanceSummary;
use Illuminate\Support\Collection;

class StudentAttendanceSummaryRepository
{
  public function create(array $data): StudentAttendanceSummary
  {
    return StudentAttendanceSummary::create($data);
  }

  public function update(int $id, array $data): ?StudentAttendanceSummary
  {
    $summary = StudentAttendanceSummary::find($id);
    if ($summary) {
      $summary->update($data);
    }
    return $summary;
  }

  public function delete(int $id): bool
  {
    return StudentAttendanceSummary::where('id', $id)->delete() > 0;
  }

  public function findById(int $id): ?StudentAttendanceSummary
  {
    return StudentAttendanceSummary::find($id);
  }

  public function findByStudentAndMonth(int $studentId, int $year, int $month): ?StudentAttendanceSummary
  {
    return StudentAttendanceSummary::where('student_id', $studentId)
      ->where('year', $year)
      ->where('month', $month)
      ->first();
  }

  public function getBySchoolAndMonth(int $schoolId, int $year, int $month): Collection
  {
    return StudentAttendanceSummary::where('school_id', $schoolId)
      ->where('year', $year)
      ->where('month', $month)
      ->get();
  }

  public function getByStudent(int $studentId): Collection
  {
    return StudentAttendanceSummary::where('student_id', $studentId)->get();
  }
}
