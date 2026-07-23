<?php

namespace App\Repositories;

use App\Models\TeacherAttendanceSummary;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class TeacherAttendanceSummaryRepository
{
  /**
   * Fetch all summaries (optionally filtered by school, teacher, or month).
   */
  public function getAll(array $filters = [])
  {
    try {
      $query = TeacherAttendanceSummary::query();

      if (!empty($filters['school_id'])) {
        $query->where('school_id', $filters['school_id']);
      }

      if (!empty($filters['teacher_id'])) {
        $query->where('teacher_id', $filters['teacher_id']);
      }

      if (!empty($filters['year'])) {
        $query->where('year', $filters['year']);
      }

      if (!empty($filters['month'])) {
        $query->where('month', $filters['month']);
      }

      return $query->orderBy('year', 'desc')->orderBy('month', 'desc')->get();
    } catch (QueryException $e) {
      Log::error('DB error fetching teacher attendance summary: ' . $e->getMessage());
      return collect();
    }
  }

  /**
   * Find summary by ID.
   */
  public function findById(int $id): ?TeacherAttendanceSummary
  {
    return TeacherAttendanceSummary::find($id);
  }

  /**
   * Create a new summary record.
   */
  public function create(array $data): ?TeacherAttendanceSummary
  {
    try {
      return TeacherAttendanceSummary::create($data);
    } catch (QueryException $e) {
      Log::error('Error creating teacher attendance summary: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Update an existing summary.
   */
  public function update(int $id, array $data): bool
  {
    try {
      $summary = TeacherAttendanceSummary::findOrFail($id);
      return $summary->update($data);
    } catch (QueryException $e) {
      Log::error('Error updating teacher attendance summary: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Delete a summary by ID.
   */
  public function delete(int $id): bool
  {
    try {
      $summary = TeacherAttendanceSummary::findOrFail($id);
      return $summary->delete();
    } catch (QueryException $e) {
      Log::error('Error deleting teacher attendance summary: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Find summary by unique combination (teacher_id, year, month).
   */
  public function findByUniqueKeys($teacherId, $year, $month): ?TeacherAttendanceSummary
  {
    return TeacherAttendanceSummary::where('teacher_id', $teacherId)
      ->where('year', $year)
      ->where('month', $month)
      ->first();
  }
}
