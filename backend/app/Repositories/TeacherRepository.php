<?php

namespace App\Repositories;

use App\Models\StudentDetails;
use App\Models\Teacher;
use App\Models\ClassTimeTable;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TeacherRepository
{

  public function getAll($schoolId)
  {
    return Teacher::select('id', 'name', 'email', 'phone', 'dob', 'gender', 'status', 'employee_code')->where('school_id', $schoolId)->get();
  }

  public function getDetails($id): array
  {
    try {
      $teacher = Teacher::select('id', 'school_id', 'name', 'email', 'phone', 'dob', 'gender', 'qualification', 'employee_code', 'address', 'city', 'state', 'status', 'created_at')
        ->find($id);

      if (!$teacher) {
        return [
          'status' => false,
          'message' => 'Teacher not found.',
          'data' => null
        ];
      }

      // Fetch subjects from timetable with unique class-subject combinations
      $subjects = DB::table('class_time_table')
        ->where('class_time_table.teacher_id', $id)
        ->where('class_time_table.school_id', $teacher->school_id)
        ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
        ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
        ->select(
          DB::raw('MIN(class_time_table.id) as id'),
          'class_time_table.teacher_id',
          'class_time_table.class_id',
          'class_time_table.subject_id',
          'school_class.class',
          'school_class.section',
          'school_subjects.subject_name',
          'school_subjects.description',
          'school_subjects.school_id as subject_school_id'
        )
        ->groupBy(
          'class_time_table.teacher_id',
          'class_time_table.class_id',
          'class_time_table.subject_id',
          'school_class.class',
          'school_class.section',
          'school_subjects.subject_name',
          'school_subjects.description',
          'school_subjects.school_id'
        )
        ->get()
        ->map(function ($item) {
          return [
            'id' => $item->id,
            'teacher_id' => $item->teacher_id,
            'class_id' => $item->class_id,
            'subject_id' => $item->subject_id,
            'class' => [
              'id' => $item->class_id,
              'class' => $item->class,
              'section' => $item->section
            ],
            'subject' => [
              'id' => $item->subject_id,
              'subject_name' => $item->subject_name,
              'description' => $item->description,
              'school_id' => $item->subject_school_id
            ]
          ];
        });

      $teacher->subjects = $subjects;

      return [
        'status' => true,
        'message' => 'Teacher details fetched successfully.',
        'data' => $teacher
      ];
    } catch (\Exception $e) {
      Log::error('Error fetching teacher details: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Something went wrong while fetching details.',
        'error' => $e->getMessage(),
        'data' => null
      ];
    }
  }

  public function getTeacherAssignedClasses($id, $school_id)
  {
    return DB::table('class_time_table')
      ->where('teacher_id', $id)
      ->where('school_id', $school_id)
      ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
      ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
      ->select(
        'class_time_table.id',
        'class_time_table.class_id',
        'school_class.class',
        'school_class.section',
        'school_subjects.id as subject_id',
        'school_subjects.subject_name'
      )
      ->distinct()
      ->get();
  }

  public function getTeacherClassDetails($id, $school_id, $class_id)
  {
    return DB::table('class_time_table')
      ->where('teacher_id', $id)
      ->where('school_id', $school_id)
      ->where('class_id', $class_id)
      ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
      ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
      ->select(
        'class_time_table.id',
        'class_time_table.teacher_id',
        'class_time_table.class_id',
        'class_time_table.subject_id',
        'school_class.id as class_detail_id',
        'school_class.class',
        'school_class.section',
        'school_class.room_no',
        'school_class.teacher_in_charge',
        'school_subjects.id as subject_detail_id',
        'school_subjects.subject_name',
        'school_subjects.description'
      )
      ->distinct()
      ->get();
  }

  public function getByEmail($email, $school_id)
  {
    return Teacher::where('school_id', $school_id)
      ->where('email', $email)->get();
  }

  public function findById($id, $school_id)
  {
    return Teacher::where('school_id', $school_id)
      ->where('id', $id)->get();
  }
  public function findByEmail($email)
  {
    return Teacher::where('email', $email)->where('status', 'active')->get();
  }
  public function create(array $data)
  {
    return Teacher::create($data);
  }

  public function update($id, $schoolId, array $data)
  {
    $teacher = $this->findById($id, $schoolId)->first();
    $teacher->update($data);
    return $teacher;
  }

  public function delete($id, $schoolId)
  {
    $teacher = $this->findById($id, $schoolId);
    return $teacher->delete();
  }

  /**
   * Return paginated students for a school with optional class/section filters.
   *
   * $filters must include 'school_id', can include 'class', 'section', 'per_page'
   *
   * @param array $filters
   * @return LengthAwarePaginator
   */
  public function getBySchoolWithFilters(array $filters): LengthAwarePaginator
  {
    $query = StudentDetails::select('id', 'candidate_name', 'class', 'section', 'school_id')
      ->where('school_id', $filters['school_id']);

    if (!empty($filters['class'])) {
      $query->where('class', $filters['class']);
    }

    if (!empty($filters['section'])) {
      $query->where('section', $filters['section']);
    }

    $perPage = $filters['per_page'] ?? 25;

    // adjust sorting to your preference
    $query->orderBy('class')->orderBy('section')->orderBy('name');

    return $query->paginate($perPage);
  }
}
