<?php

namespace App\Services;

use App\Events\GroupMessageSent;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSummary;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\ChatRoomParticipant;
use App\Models\StudentAttendanceRecord;
use App\Models\StudentAttendanceSummary;
use App\Repositories\StudentDetailsRepository;
use App\Repositories\TeacherRepository;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpParser\Node\Stmt\TryCatch;
use Pusher\Pusher;

class TeacherService
{

  protected StudentDetailsRepository $studentDetailsRepository;
  protected TeacherRepository $teacherRepository;

  public function __construct(StudentDetailsRepository $studentDetailsRepository, TeacherRepository $teacherRepository)
  {
    $this->studentDetailsRepository = $studentDetailsRepository;
    $this->teacherRepository = $teacherRepository;
  }

  public function getTeacherAssignedClasses($id, $school_id)
  {
    try {
      // Get all class-subject assignments for the teacher from timetable
      $assignments = DB::table('class_time_table')
        ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
        ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
        ->where('class_time_table.teacher_id', $id)
        ->where('class_time_table.school_id', $school_id)
        ->select(
          'class_time_table.id',
          'class_time_table.class_id',
          'school_class.class',
          'school_class.section',
          'school_class.room_no',
          'school_subjects.id as subject_id',
          'school_subjects.subject_name'
        )
        ->distinct()
        ->get();

      // Group by class and add student counts and schedules
      $classesData = [];

      foreach ($assignments as $assignment) {
        $classKey = $assignment->class_id;

        if (!isset($classesData[$classKey])) {
          // Get student count for this class
          $studentCount = DB::table('student_details')
            ->where('school_id', $school_id)
            ->where('class', $assignment->class)
            ->where('section', $assignment->section)
            ->count();

          // Get schedule from timetable
          $schedule = DB::table('class_time_table')
            ->where('teacher_id', $id)
            ->where('school_id', $school_id)
            ->where('class_id', $assignment->class_id)
            ->select('day_of_week', 'start_time', 'end_time')
            ->get();

          // Find next class
          $today = Carbon::now()->format('l');
          $currentTime = Carbon::now()->format('H:i:s');

          $nextClass = DB::table('class_time_table')
            ->where('teacher_id', $id)
            ->where('school_id', $school_id)
            ->where('class_id', $assignment->class_id)
            ->where(function($query) use ($today, $currentTime) {
              $query->where('day_of_week', $today)
                    ->where('start_time', '>', $currentTime);
            })
            ->select('day_of_week', 'start_time')
            ->orderBy('start_time')
            ->first();

          $classesData[$classKey] = [
            'class_id' => $assignment->class_id,
            'class_name' => $assignment->class,
            'section' => $assignment->section,
            'room_no' => $assignment->room_no,
            'student_count' => $studentCount,
            'subjects' => [],
            'schedule' => $schedule,
            'next_class' => $nextClass
          ];
        }

        // Add subject to this class
        $classesData[$classKey]['subjects'][] = [
          'subject_id' => $assignment->subject_id,
          'subject_name' => $assignment->subject_name
        ];
      }

      return [
        'status' => true,
        'data' => array_values($classesData)
      ];
    } catch (Exception $e) {
      Log::error('Error fetching teacher assigned classes: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching teacher details: ' . $e->getMessage()
      ];
    }
  }
  public function getTeacherClassDetails($id, $school_id, $class_id)
  {
    try {
      // Get teacher's subjects for this class
      $subjects = $this->teacherRepository->getTeacherClassDetails($id, $school_id, $class_id);

      if ($subjects->isEmpty()) {
        return [
          'status' => false,
          'message' => 'Class not found or you do not have access to this class'
        ];
      }

      // Get class information
      $classInfo = DB::table('school_class')
        ->where('id', $class_id)
        ->where('school_id', $school_id)
        ->first();

      if (!$classInfo) {
        return [
          'status' => false,
          'message' => 'Class not found'
        ];
      }

      // Get students in this class
      $students = DB::table('student_details')
        ->where('school_id', $school_id)
        ->where('class', $classInfo->class)
        ->where('section', $classInfo->section)
        ->select('id', 'candidate_name as name', 'roll_no', 'email', 'phone')
        ->orderBy('roll_no')
        ->get();

      // Get timetable for this teacher and class
      $timetable = DB::table('class_time_table')
        ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
        ->where('class_time_table.teacher_id', $id)
        ->where('class_time_table.school_id', $school_id)
        ->where('class_time_table.class_id', $class_id)
        ->select(
          'class_time_table.id',
          'class_time_table.day_of_week',
          'class_time_table.start_time',
          'class_time_table.end_time',
          'school_subjects.id as subject_id',
          'school_subjects.subject_name'
        )
        ->orderBy('class_time_table.day_of_week')
        ->orderBy('class_time_table.start_time')
        ->get()
        ->map(function($item) {
          return [
            'id' => $item->id,
            'day_of_week' => $item->day_of_week,
            'start_time' => $item->start_time,
            'end_time' => $item->end_time,
            'subject' => [
              'subject_id' => $item->subject_id,
              'subject_name' => $item->subject_name
            ]
          ];
        });

      return [
        'status' => true,
        'data' => [
          'class' => $classInfo,
          'subjects' => $subjects,
          'students' => $students,
          'timetable' => $timetable
        ]
      ];
    } catch (Exception $e) {
      Log::error('Error fetching class details: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching class details: ' . $e->getMessage()
      ];
    }
  }

  public function getStudentDetailsList(array $data)
  {
    try {
      // ✅ Validation
      if (
        empty($data['school_id']) ||
        empty($data['class']) ||
        empty($data['section'])
      ) {
        throw new Exception("school_id, class, and section are required.");
      }

      $schoolId = $data['school_id'];
      $class = $data['class'];
      $section = $data['section'];

      // ✅ Repository call (with ->get())
      $list = $this->studentDetailsRepository
        ->getclassstudentsList($schoolId, $class, $section);

      if (empty($list)) {
        return [
          'status' => false,
          'message' => "no students found"
        ];
      }

      return [
        'status' => true,
        'data' => $list
      ];
    } catch (Exception $e) {
      return [
        'status' => false,
        'message' => 'Error fetching student details: ' . $e->getMessage()
      ];
    }
  }

  /**
   * Update student attendance for a date.
   */
  public function updateAttendance(array $data): array
  {
    DB::beginTransaction();

    try {
      $schoolId = $data['school_id'];
      $attendanceDate = Carbon::parse($data['date']);
      $month = $attendanceDate->month;
      $year = $attendanceDate->year;

      foreach ($data['attendance'] as $record) {
        $studentId = $record['student_details_id'];
        $status = $record['status'];
        $remarks = $record['remarks'] ?? null;

        // ✅ Update or create the daily record
        StudentAttendanceRecord::updateOrCreate(
          [
            'student_details_id' => $studentId,
            'school_id' => $schoolId,
            'attendance_date' => $attendanceDate->toDateString(),
          ],
          [
            'status' => $status,
            'remarks' => $remarks,
          ]
        );

        // ✅ Update the monthly summary
        $summary = StudentAttendanceSummary::firstOrCreate(
          [
            'student_details_id' => $studentId,
            'school_id' => $schoolId,
            'year' => $year,
            'month' => $month,
          ]
        );

        // Recalculate summary based on all days in that month
        $stats = StudentAttendanceRecord::selectRaw("
                        COUNT(*) as total_days,
                        SUM(status = 'present') as present_days,
                        SUM(status = 'absent') as absent_days,
                        SUM(status = 'late') as late_days,
                        SUM(status = 'half_day') as half_days
                    ")
          ->where('student_details_id', $studentId)
          ->where('school_id', $schoolId)
          ->whereYear('attendance_date', $year)
          ->whereMonth('attendance_date', $month)
          ->first();

        $summary->update([
          'total_days'   => $stats->total_days ?? 0,
          'present_days' => $stats->present_days ?? 0,
          'absent_days'  => $stats->absent_days ?? 0,
          'late_days'    => $stats->late_days ?? 0,
          'half_days'    => $stats->half_days ?? 0,
        ]);
      }

      DB::commit();

      return [
        'status' => true,
        'message' => 'Student attendance updated successfully.',
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error('Failed to update student attendance: ' . $e->getMessage());

      return [
        'status' => false,
        'message' => 'Error updating attendance: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * 🟠 Recalculate and update the monthly summary for a student.
   */
  public function updateMonthlySummary(int $studentId, int $schoolId, int $year, int $month): void
  {
    $stats = StudentAttendanceRecord::selectRaw("
            COUNT(*) as total_days,
            SUM(status = 'present') as present_days,
            SUM(status = 'absent') as absent_days,
            SUM(status = 'late') as late_days,
            SUM(status = 'half_day') as half_days
        ")
      ->where('student_details_id', $studentId)
      ->where('school_id', $schoolId)
      ->whereYear('attendance_date', $year)
      ->whereMonth('attendance_date', $month)
      ->first();

    $summary = StudentAttendanceSummary::firstOrCreate(
      [
        'student_details_id' => $studentId,
        'school_id' => $schoolId,
        'year' => $year,
        'month' => $month,
      ]
    );

    $summary->update([
      'total_days'   => $stats->total_days ?? 0,
      'present_days' => $stats->present_days ?? 0,
      'absent_days'  => $stats->absent_days ?? 0,
      'late_days'    => $stats->late_days ?? 0,
      'half_days'    => $stats->half_days ?? 0,
    ]);
  }

  /**
   * 🟣 Get attendance for a specific date.
   */
  public function getDailyAttendance(int $schoolId, string $date): array
  {
    try {
      $records = StudentAttendanceRecord::with('student')
        ->where('school_id', $schoolId)
        ->whereDate('attendance_date', $date)
        ->get();

      return [
        'status' => true,
        'message' => 'Daily attendance fetched successfully.',
        'data' => $records,
      ];
    } catch (Exception $e) {
      return [
        'status' => false,
        'message' => 'Failed to fetch attendance: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * 🔵 Get monthly attendance summary for all students.
   */
  public function getMonthlySummary(int $schoolId, int $year, int $month): array
  {
    try {
      $summaries = StudentAttendanceSummary::with('student')
        ->where('school_id', $schoolId)
        ->where('year', $year)
        ->where('month', $month)
        ->get();

      return [
        'status' => true,
        'message' => 'Monthly summary fetched successfully.',
        'data' => $summaries,
      ];
    } catch (Exception $e) {
      return [
        'status' => false,
        'message' => 'Failed to fetch monthly summary: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * 🔴 Delete a student’s attendance record for a date.
   */
  public function deleteAttendanceRecord(int $studentId, string $date): array
  {
    DB::beginTransaction();
    try {
      $record = StudentAttendanceRecord::where('student_details_id', $studentId)
        ->whereDate('attendance_date', $date)
        ->first();

      if (!$record) {
        return [
          'status' => false,
          'message' => 'Record not found for the given date.',
        ];
      }

      $schoolId = $record->school_id;
      $month = Carbon::parse($record->attendance_date)->month;
      $year = Carbon::parse($record->attendance_date)->year;

      $record->delete();

      // Recalculate monthly summary
      $this->updateMonthlySummary($studentId, $schoolId, $year, $month);

      DB::commit();

      return [
        'status' => true,
        'message' => 'Attendance record deleted successfully.',
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error('Failed to delete attendance record: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error deleting record: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * 🟢 Get attendance percentage for a student for a month.
   */
  public function getMonthlyAttendancePercentage(int $studentId, int $year, int $month): array
  {
    try {
      $summary = StudentAttendanceSummary::where('student_details_id', $studentId)
        ->where('year', $year)
        ->where('month', $month)
        ->first();

      if (!$summary || $summary->total_days == 0) {
        return [
          'status' => true,
          'percentage' => 0,
          'message' => 'No attendance records available for this month.',
        ];
      }

      $percentage = ($summary->present_days / $summary->total_days) * 100;

      return [
        'status' => true,
        'percentage' => round($percentage, 2),
        'message' => 'Attendance percentage calculated successfully.',
      ];
    } catch (Exception $e) {
      return [
        'status' => false,
        'message' => 'Error calculating attendance percentage: ' . $e->getMessage(),
      ];
    }
  }

  public function sendGroupMessage($teacher, array $data)
  {
    if ($teacher->role !== 'teacher') {
      throw new Exception("Only teachers can send messages in groups");
    }

    // Save in DB
    $message = ChatMessage::create([
      'group_id' => $data['group_id'],
      'sender_id' => $teacher->id,
      'sender_type' => get_class($teacher),
      'message' => $data['message'],
    ]);

    // Fire WebSocket event (Pusher/Ably)
    broadcast(new ChatMessageSent($message))->toOthers();

    return $message;
  }

  /**
   * Get teacher's full week timetable
   */
  public function getTeacherWeeklyTimetable(int $teacherId, int $schoolId): array
  {
    try {
      // Days of the week in order
      $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      // Get all timetable entries for the teacher
      $timetableEntries = DB::table('class_time_table')
        ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
        ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
        ->where('class_time_table.teacher_id', $teacherId)
        ->where('class_time_table.school_id', $schoolId)
        ->select(
          'class_time_table.id',
          'class_time_table.day_of_week',
          'class_time_table.start_time',
          'class_time_table.end_time',
          'school_subjects.subject_name',
          'school_class.class',
          'school_class.section',
          'school_class.room_no'
        )
        ->orderBy(DB::raw("FIELD(class_time_table.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')"))
        ->orderBy('class_time_table.start_time')
        ->get();

      // Group by day
      $weeklyTimetable = [];
      foreach ($daysOfWeek as $day) {
        $weeklyTimetable[$day] = $timetableEntries->filter(function ($entry) use ($day) {
          return $entry->day_of_week === $day;
        })->values();
      }

      return [
        'status' => true,
        'message' => 'Weekly timetable fetched successfully',
        'data' => $weeklyTimetable,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching weekly timetable: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching weekly timetable: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Get today's classes for a teacher
   */
  public function getTodayClasses(int $teacherId, int $schoolId): array
  {
    try {
      // Use Asia/Kolkata timezone for Indian schools
      $today = Carbon::now('Asia/Kolkata')->format('l'); // Get current day name (Monday, Tuesday, etc.)
      $currentTime = Carbon::now('Asia/Kolkata')->format('H:i:s');

      // Get all classes for today
      $todayClasses = DB::table('class_time_table')
        ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
        ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
        ->join('teachers', 'class_time_table.teacher_id', '=', 'teachers.id')
        ->where('class_time_table.teacher_id', $teacherId)
        ->where('class_time_table.school_id', $schoolId)
        ->where('class_time_table.day_of_week', $today)
        ->select(
          'class_time_table.id',
          'class_time_table.start_time',
          'class_time_table.end_time',
          'school_subjects.subject_name',
          'school_class.class',
          'school_class.section',
          'school_class.room_no',
          DB::raw("CASE
            WHEN class_time_table.start_time > '$currentTime' THEN 'upcoming'
            WHEN class_time_table.start_time <= '$currentTime' AND class_time_table.end_time > '$currentTime' THEN 'ongoing'
            ELSE 'completed'
          END as status")
        )
        ->orderBy('class_time_table.start_time', 'asc')
        ->get();

      return [
        'status' => true,
        'message' => "Today's classes fetched successfully",
        'data' => $todayClasses,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching today classes: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching today classes: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Get teacher dashboard statistics
   */
  public function getTeacherDashboardStats(int $teacherId, int $schoolId): array
  {
    try {
      // Use Asia/Kolkata timezone for Indian schools
      $today = Carbon::now('Asia/Kolkata')->format('l');
      $currentMonth = Carbon::now('Asia/Kolkata')->month;
      $currentYear = Carbon::now('Asia/Kolkata')->year;

      // Total classes today
      $classesToday = DB::table('class_time_table')
        ->where('teacher_id', $teacherId)
        ->where('school_id', $schoolId)
        ->where('day_of_week', $today)
        ->count();

      // Get unique students across all assigned classes
      $totalStudents = DB::table('student_details')
        ->join('school_class', function ($join) {
          $join->on('student_details.class', '=', 'school_class.class')
            ->on('student_details.section', '=', 'school_class.section');
        })
        ->whereIn('school_class.id', function ($query) use ($teacherId, $schoolId) {
          $query->select('class_id')
            ->from('class_time_table')
            ->where('teacher_id', $teacherId)
            ->where('school_id', $schoolId);
        })
        ->where('student_details.school_id', $schoolId)
        ->distinct('student_details.id')
        ->count('student_details.id');

      // Get teacher's attendance for current month
      $attendanceStats = DB::table('teacher_attendance_records')
        ->where('teacher_id', $teacherId)
        ->where('school_id', $schoolId)
        ->whereYear('attendance_date', $currentYear)
        ->whereMonth('attendance_date', $currentMonth)
        ->selectRaw("
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
        ")
        ->first();

      // Count assigned classes (unique)
      $assignedClasses = DB::table('class_time_table')
        ->where('teacher_id', $teacherId)
        ->where('school_id', $schoolId)
        ->distinct('class_id')
        ->count('class_id');

      return [
        'status' => true,
        'message' => 'Dashboard stats fetched successfully',
        'data' => [
          'classes_today' => $classesToday,
          'total_students' => $totalStudents,
          'assigned_classes' => $assignedClasses,
          'attendance' => [
            'total_days' => $attendanceStats->total_days ?? 0,
            'present_days' => $attendanceStats->present_days ?? 0,
            'absent_days' => $attendanceStats->absent_days ?? 0,
            'attendance_percentage' => $attendanceStats->total_days > 0
              ? round(($attendanceStats->present_days / $attendanceStats->total_days) * 100, 1)
              : 0,
          ],
        ],
      ];
    } catch (Exception $e) {
      Log::error('Error fetching teacher dashboard stats: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching dashboard stats: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Get teacher profile details
   */
  public function getTeacherProfile(int $teacherId): array
  {
    try {
      return $this->teacherRepository->getDetails($teacherId);
    } catch (Exception $e) {
      Log::error('Error fetching teacher profile: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching teacher profile: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Update teacher personal information
   */
  public function updateTeacherProfile(int $teacherId, array $data): array
  {
    try {
      $teacher = DB::table('teachers')->where('id', $teacherId)->first();

      if (!$teacher) {
        return [
          'status' => false,
          'message' => 'Teacher not found',
        ];
      }

      // Only allow updating specific fields
      $allowedFields = ['name', 'phone', 'dob', 'gender', 'address', 'city', 'state', 'qualification'];
      $updateData = [];

      foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
          $updateData[$field] = $data[$field];
        }
      }

      if (empty($updateData)) {
        return [
          'status' => false,
          'message' => 'No valid fields to update',
        ];
      }

      DB::table('teachers')->where('id', $teacherId)->update($updateData);

      return [
        'status' => true,
        'message' => 'Profile updated successfully',
        'data' => $updateData,
      ];
    } catch (Exception $e) {
      Log::error('Error updating teacher profile: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error updating profile: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Update teacher password
   */
  public function updateTeacherPassword(int $teacherId, array $data): array
  {
    try {
      $teacher = DB::table('teachers')->where('id', $teacherId)->first();

      if (!$teacher) {
        return [
          'status' => false,
          'message' => 'Teacher not found',
        ];
      }

      // Verify current password
      if (!password_verify($data['current_password'], $teacher->password)) {
        return [
          'status' => false,
          'message' => 'Current password is incorrect',
        ];
      }

      // Hash and update new password
      $hashedPassword = password_hash($data['new_password'], PASSWORD_BCRYPT);
      DB::table('teachers')->where('id', $teacherId)->update(['password' => $hashedPassword]);

      return [
        'status' => true,
        'message' => 'Password updated successfully',
      ];
    } catch (Exception $e) {
      Log::error('Error updating teacher password: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error updating password: ' . $e->getMessage(),
      ];
    }
  }

}
