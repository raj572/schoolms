<?php

namespace App\Repositories;

use App\Models\TeacherAttendanceRecord;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class TeacherAttendanceRecordRepository
{
  /**
   * Fetch all records (optionally filtered by school, date, or teacher).
   */
  public function getAll(array $filters = [])
  {
    try {
      $query = TeacherAttendanceRecord::query();

      if (!empty($filters['school_id'])) {
        $query->where('school_id', $filters['school_id']);
      }

      if (!empty($filters['teacher_id'])) {
        $query->where('teacher_id', $filters['teacher_id']);
      }

      if (!empty($filters['attendance_date'])) {
        $query->whereDate('attendance_date', $filters['attendance_date']);
      }

      return $query->orderBy('attendance_date', 'desc')->get();
    } catch (QueryException $e) {
      Log::error('DB error fetching teacher attendance records: ' . $e->getMessage());
      return collect();
    }
  }

  /**
   * Find a single attendance record by ID.
   */
  public function findById(int $id): ?TeacherAttendanceRecord
  {
    return TeacherAttendanceRecord::find($id);
  }

  /**
   * Create a new attendance record.
   */
  public function create(array $data): ?TeacherAttendanceRecord
  {
    try {
      return TeacherAttendanceRecord::create($data);
    } catch (QueryException $e) {
      Log::error('Error creating teacher attendance record: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Update an existing attendance record.
   */
  public function update(int $id, array $data): bool
  {
    try {
      $record = TeacherAttendanceRecord::findOrFail($id);
      return $record->update($data);
    } catch (QueryException $e) {
      Log::error('Error updating teacher attendance record: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Delete a record by ID.
   */
  public function delete(int $id): bool
  {
    try {
      $record = TeacherAttendanceRecord::findOrFail($id);
      return $record->delete();
    } catch (QueryException $e) {
      Log::error('Error deleting teacher attendance record: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Get attendance record by unique combination (teacher_id, school_id, date).
   */
  public function findByUniqueKeys($teacherId, $schoolId, $date): ?TeacherAttendanceRecord
  {
    return TeacherAttendanceRecord::where('teacher_id', $teacherId)
      ->where('school_id', $schoolId)
      ->whereDate('attendance_date', $date)
      ->first();
  }

  /**
   * Update or create an attendance record.
   * Uses unique keys: teacher_id, school_id, attendance_date
   */
  public function updateOrCreate(array $attributes, array $values): ?TeacherAttendanceRecord
  {
    try {
      // Check if required columns exist
      $tableName = (new TeacherAttendanceRecord())->getTable();
      $requiredColumns = ['marked_by', 'check_in_time', 'check_out_time'];
      $missingColumns = [];
      
      foreach ($requiredColumns as $column) {
        if (!Schema::hasColumn($tableName, $column)) {
          $missingColumns[] = $column;
        }
      }
      
      if (!empty($missingColumns)) {
        $errorMsg = "Missing columns in {$tableName} table: " . implode(', ', $missingColumns) . 
                    ". Please run migration: php artisan migrate";
        Log::error($errorMsg, [
          'table' => $tableName,
          'missing_columns' => $missingColumns,
          'attributes' => $attributes,
          'values_keys' => array_keys($values),
        ]);
        throw new \Exception($errorMsg);
      }
      
      Log::info('Attempting to updateOrCreate teacher attendance', [
        'attributes' => $attributes,
        'values_keys' => array_keys($values),
      ]);
      
      $record = TeacherAttendanceRecord::updateOrCreate($attributes, $values);
      
      Log::info('Successfully created/updated teacher attendance record', [
        'record_id' => $record->id,
      ]);
      
      return $record;
    } catch (QueryException $e) {
      Log::error('QueryException updating or creating teacher attendance record', [
        'error' => $e->getMessage(),
        'error_code' => $e->getCode(),
        'sql_state' => $e->errorInfo[0] ?? 'N/A',
        'driver_code' => $e->errorInfo[1] ?? 'N/A',
        'driver_message' => $e->errorInfo[2] ?? 'N/A',
        'attributes' => $attributes,
        'values' => $values,
        'trace' => $e->getTraceAsString(),
      ]);
      // Re-throw to get more details in controller
      throw $e;
    } catch (\Exception $e) {
      Log::error('Unexpected error updating or creating teacher attendance record', [
        'error' => $e->getMessage(),
        'error_class' => get_class($e),
        'attributes' => $attributes,
        'values' => $values,
        'trace' => $e->getTraceAsString(),
      ]);
      // Re-throw to get more details in controller
      throw $e;
    }
  }

  /**
   * Get today's teacher attendance records for a school.
   */
  public function getTodayRecords($schoolId, $date)
  {
    try {
      return TeacherAttendanceRecord::where('school_id', $schoolId)
        ->whereDate('attendance_date', $date)
        ->with('teacher')
        ->get();
    } catch (QueryException $e) {
      Log::error('Error fetching today\'s teacher attendance: ' . $e->getMessage());
      return collect();
    }
  }
}
