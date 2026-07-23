<?php

namespace App\Repositories;

use App\Models\ClassTimeTable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class ClassTimeTableRepository
{
  /**
   * Fetch all timetable records with optional filters.
   */
  public function getAll(array $filters = [])
  {
    try {
      $query = ClassTimeTable::query()->with(['school', 'class', 'subject', 'teacher']);

      if (!empty($filters['school_id'])) {
        $query->where('school_id', $filters['school_id']);
      }

      if (!empty($filters['class_id'])) {
        $query->where('class_id', $filters['class_id']);
      }

      if (!empty($filters['teacher_id'])) {
        $query->where('teacher_id', $filters['teacher_id']);
      }

      if (!empty($filters['day_of_week'])) {
        $query->where('day_of_week', $filters['day_of_week']);
      }

      return $query->orderBy('day_of_week')->orderBy('start_time')->get();
    } catch (QueryException $e) {
      Log::error('DB error fetching class timetable: ' . $e->getMessage());
      return collect();
    }
  }

  /**
   * Find a timetable entry by ID.
   */
  public function findById(int $id): ?ClassTimeTable
  {
    return ClassTimeTable::with(['school', 'class', 'subject', 'teacher'])->find($id);
  }

  /**
   * Create a new timetable record.
   */
  public function create(array $data): ?ClassTimeTable
  {
    try {
      return ClassTimeTable::create($data);
    } catch (QueryException $e) {
      Log::error('Error creating class timetable entry: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Update a timetable record by ID.
   */
  public function update(int $id, array $data): bool
  {
    try {
      $entry = ClassTimeTable::findOrFail($id);
      return $entry->update($data);
    } catch (QueryException $e) {
      Log::error('Error updating class timetable entry: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Delete a timetable entry.
   */
  public function delete(int $id): bool
  {
    try {
      $entry = ClassTimeTable::findOrFail($id);
      return $entry->delete();
    } catch (QueryException $e) {
      Log::error('Error deleting class timetable entry: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Get timetable for a specific class and day.
   */
  public function getByClassAndDay(int $classId, string $day)
  {
    return ClassTimeTable::with(['subject', 'teacher'])
      ->where('class_id', $classId)
      ->where('day_of_week', $day)
      ->orderBy('start_time')
      ->get();
  }

  /**
   * Get all day class timetable for a specific school and teacher.
   */
  public function getAllDayTimeTable(int $schoolId, int $teacherId)
  {
    return ClassTimeTable::with(['subject', 'teacher'])
      ->where('school_id', $schoolId)
      ->where('teacher_id', $teacherId)
      ->orderBy('day_of_week')
      ->get();
  }

  public function getAllDayTimeTableByClass(int $schoolId, int $classId)
  {
    return ClassTimeTable::with(['subject', 'teacher'])
      ->where('school_id', $schoolId)
      ->where('class_id', $classId)
      ->orderBy('day_of_week')
      ->orderBy('start_time')
      ->get();
  }
  /**
   * Check if a teacher is already assigned in overlapping time.
   */
  public function checkTeacherConflict(int $teacherId, string $day, string $start, string $end, ?int $excludeId = null): bool
  {
    $query = ClassTimeTable::where('teacher_id', $teacherId)
      ->where('day_of_week', $day)
      ->where(function ($q) use ($start, $end) {
        $q->whereBetween('start_time', [$start, $end])
          ->orWhereBetween('end_time', [$start, $end]);
      });

    if ($excludeId !== null) {
        $query->where('id', '!=', $excludeId);
    }

    return $query->exists();
  }
}
