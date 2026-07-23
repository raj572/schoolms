<?php

namespace App\Http\Controllers;

use App\Models\StudentAttendanceRecord;
use App\Models\TeacherAttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\AttendanceStreak;
use App\Models\Student;
use App\Models\StudentDetails;
use App\Models\Teacher;
use App\Models\SchoolClass;
use App\Repositories\TeacherAttendanceRecordRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class AttendanceController extends Controller
{
    /**
     * Mark student attendance (Quick, Period-wise, or Class-wise)
     * POST /api/teacher/attendance/students
     */
    public function markStudentAttendance(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $validated = $request->validate([
                'attendance_date' => 'required|date',
                'class_id' => 'nullable|exists:school_class,id',
                'subject_id' => 'nullable|exists:school_subjects,id',
                'period_number' => 'nullable|integer|min:1|max:10',
                'attendance_type' => 'required|in:quick,period,class',
                'students' => 'required|array',
                'students.*.student_id' => 'required|exists:student_details,id',
                'students.*.status' => 'required|in:present,absent,late,half_day',
                'students.*.remarks' => 'nullable|string',
            ]);

            $teacherId = $authUser['id'];
            $schoolId = $authUser['school_id'];
            $attendanceDate = Carbon::parse($validated['attendance_date']);
            $classId = $validated['class_id'] ?? null;
            $attendanceType = $validated['attendance_type'];
            $markedCount = 0;
            $deletedCount = 0;

            // Check restrictions based on attendance type
            if ($classId && $attendanceType === 'period') {
                // If marking period attendance, check if quick attendance exists
                if ($this->checkQuickAttendanceExists($schoolId, $classId, $attendanceDate)) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Quick attendance already marked for this class and date. Cannot mark period attendance.',
                    ], 409); // 409 Conflict
                }
            } elseif ($classId && $attendanceType === 'quick') {
                // If marking quick attendance, check if period attendance exists
                $periodAttendanceInfo = $this->checkPeriodAttendanceExists($schoolId, $classId, $attendanceDate);
                if ($periodAttendanceInfo['exists']) {
                    // Delete all period records before marking quick attendance
                    $deletedCount = StudentAttendanceRecord::where('school_id', $schoolId)
                        ->where('class_id', $classId)
                        ->where('attendance_date', $attendanceDate)
                        ->whereNotNull('period_number')
                        ->delete();
                    
                    Log::info("Deleted {$deletedCount} period attendance records before marking quick attendance for class {$classId} on {$attendanceDate->toDateString()}");
                }
            }

            DB::beginTransaction();

            foreach ($validated['students'] as $studentData) {
                // Create or update attendance record
                // Unique key in database: student_id + date + period_number
                // This allows:
                // - Multiple periods for same student on same date (different period_number)
                // - Updates to existing period attendance (same period_number will update)
                // - One quick attendance per student per date (period_number = NULL)
                $attendance = StudentAttendanceRecord::updateOrCreate(
                    [
                        'student_details_id' => $studentData['student_id'],
                        'attendance_date' => $attendanceDate,
                        'period_number' => $validated['period_number'] ?? null,
                    ],
                    [
                        'school_id' => $schoolId,
                        'class_id' => $validated['class_id'] ?? null,
                        'subject_id' => $validated['subject_id'] ?? null,
                        'status' => $studentData['status'],
                        'check_in_method' => 'manual',
                        'marked_by' => $teacherId,
                        'check_in_time' => now(),
                        'remarks' => $studentData['remarks'] ?? null,
                    ]
                );

                // Update streak
                $this->updateStudentStreak(
                    $studentData['student_id'],
                    $schoolId,
                    $attendanceDate,
                    $studentData['status'] === 'present'
                );

                $markedCount++;
            }

            DB::commit();

            $message = "Attendance marked successfully for {$markedCount} students";
            if ($attendanceType === 'quick' && $deletedCount > 0) {
                $message .= ". Deleted {$deletedCount} period attendance record(s) for this class and date.";
            }

            return response()->json([
                'status' => true,
                'message' => $message,
                'data' => [
                    'marked_count' => $markedCount,
                    'date' => $attendanceDate->toDateString(),
                    'deleted_period_records' => $deletedCount,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Mark student attendance failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to mark attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk mark all students (Mark All Present/Absent)
     * POST /api/attendance/bulk-mark
     */
    public function bulkMarkAttendance(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $validated = $request->validate([
                'attendance_date' => 'required|date',
                'class_id' => 'required|exists:school_class,id',
                'status' => 'required|in:present,absent',
                'period_number' => 'nullable|integer',
                'subject_id' => 'nullable|exists:school_subjects,id',
            ]);

            $teacherId = $authUser['id'];
            $schoolId = $authUser['school_id'];

            // Get class information
            $classInfo = SchoolClass::findOrFail($validated['class_id']);

            // Get all students in the class by matching class and section
            $students = StudentDetails::where('class', $classInfo->class)
                ->where('section', $classInfo->section)
                ->where('school_id', $schoolId)
                ->get();

            $markedCount = 0;

            DB::beginTransaction();

            foreach ($students as $student) {
                StudentAttendanceRecord::updateOrCreate(
                    [
                        'student_details_id' => $student->id,
                        'attendance_date' => $validated['attendance_date'],
                        'class_id' => $validated['class_id'],
                        'period_number' => $validated['period_number'] ?? null,
                    ],
                    [
                        'school_id' => $schoolId,
                        'subject_id' => $validated['subject_id'] ?? null,
                        'status' => $validated['status'],
                        'check_in_method' => 'manual',
                        'marked_by' => $teacherId,
                        'check_in_time' => now(),
                    ]
                );

                $this->updateStudentStreak(
                    $student->id,
                    $schoolId,
                    Carbon::parse($validated['attendance_date']),
                    $validated['status'] === 'present'
                );

                $markedCount++;
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => "Bulk attendance marked for {$markedCount} students",
                'data' => ['marked_count' => $markedCount],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Bulk mark attendance failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to bulk mark attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create QR attendance session
     * POST /api/attendance/qr-session/create
     */
    public function createQRSession(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $validated = $request->validate([
                'class_id' => 'required|exists:school_class,id',
                'subject_id' => 'nullable|exists:school_subjects,id',
                'period_number' => 'nullable|integer',
                'session_date' => 'required|date',
                'duration_minutes' => 'nullable|integer|min:5|max:120',
            ]);

            $teacherId = $authUser['id'];
            $schoolId = $authUser['school_id'];
            $durationMinutes = $validated['duration_minutes'] ?? 30;

            // Get class information
            $classInfo = SchoolClass::findOrFail($validated['class_id']);

            // Count total students in class by matching class and section
            $totalStudents = StudentDetails::where('class', $classInfo->class)
                ->where('section', $classInfo->section)
                ->where('school_id', $schoolId)
                ->count();

            $session = AttendanceSession::create([
                'school_id' => $schoolId,
                'class_id' => $validated['class_id'],
                'teacher_id' => $teacherId,
                'session_date' => $validated['session_date'],
                'period_number' => $validated['period_number'] ?? null,
                'subject_id' => $validated['subject_id'] ?? null,
                'session_type' => 'qr',
                'status' => 'active',
                'expires_at' => Carbon::now()->addMinutes($durationMinutes),
                'total_students' => $totalStudents,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'QR session created successfully',
                'data' => [
                    'session' => $session,
                    'qr_code' => $session->session_code,
                    'expires_at' => $session->expires_at->toDateTimeString(),
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Create QR session failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create QR session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Student QR check-in
     * POST /api/attendance/qr-checkin
     */
    public function qrCheckIn(Request $request)
    {
        try {
            $validated = $request->validate([
                'session_code' => 'required|string',
                'student_id' => 'required|exists:student_details,id',
            ]);

            $session = AttendanceSession::where('session_code', $validated['session_code'])
                ->where('status', 'active')
                ->first();

            if (!$session) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid or expired session code',
                ], 404);
            }

            if ($session->isExpired()) {
                $session->expire();
                return response()->json([
                    'status' => false,
                    'message' => 'Session has expired',
                ], 400);
            }

            // Mark attendance
            $attendance = StudentAttendanceRecord::updateOrCreate(
                [
                    'student_details_id' => $validated['student_id'],
                    'attendance_date' => $session->session_date,
                    'class_id' => $session->class_id,
                    'period_number' => $session->period_number,
                ],
                [
                    'school_id' => $session->school_id,
                    'subject_id' => $session->subject_id,
                    'status' => 'present',
                    'check_in_method' => 'qr',
                    'marked_by' => $session->teacher_id,
                    'check_in_time' => now(),
                    'session_id' => $session->id,
                ]
            );

            // Increment session check-in count
            $session->incrementCheckIn();

            // Update streak
            $this->updateStudentStreak(
                $validated['student_id'],
                $session->school_id,
                Carbon::parse($session->session_date),
                true
            );

            return response()->json([
                'status' => true,
                'message' => 'Check-in successful',
                'data' => [
                    'attendance' => $attendance,
                    'check_in_time' => $attendance->check_in_time,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('QR check-in failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to check-in',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get QR session status (for live updates)
     * GET /api/attendance/qr-session/:id/status
     */
    public function getQRSessionStatus($sessionId)
    {
        try {
            $session = AttendanceSession::with(['attendanceRecords.student'])->findOrFail($sessionId);

            return response()->json([
                'status' => true,
                'data' => [
                    'session' => $session,
                    'completion_percentage' => $session->getCompletionPercentage(),
                    'is_expired' => $session->isExpired(),
                    'checked_in_students' => $session->attendanceRecords,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get QR session status failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch session status',
            ], 500);
        }
    }

    /**
     * Mark teacher attendance (by Principal)
     * POST /api/principal/attendance/teachers
     */
    public function markTeacherAttendance(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $validated = $request->validate([
                'attendance_date' => 'required|date',
                'teachers' => 'required|array',
                'teachers.*.teacher_id' => 'required|exists:teachers,id',
                'teachers.*.status' => 'required|in:present,absent,late,half_day,leave',
                'teachers.*.remarks' => 'nullable|string',
                'teachers.*.check_in_time' => 'nullable|date_format:H:i',
                'teachers.*.check_out_time' => 'nullable|date_format:H:i',
            ]);

            $principalId = $authUser['id'];
            $schoolId = $authUser['school_id'];
            $attendanceDate = Carbon::parse($validated['attendance_date']);
            $markedCount = 0;

            $repository = new TeacherAttendanceRecordRepository();

            DB::beginTransaction();

            foreach ($validated['teachers'] as $teacherData) {
                try {
                    // Prepare check-in/check-out times
                    $checkInTime = null;
                    $checkOutTime = null;
                    
                    if (isset($teacherData['check_in_time']) && !empty($teacherData['check_in_time'])) {
                        $checkInTime = Carbon::parse($attendanceDate->toDateString() . ' ' . $teacherData['check_in_time']);
                    }
                    
                    if (isset($teacherData['check_out_time']) && !empty($teacherData['check_out_time'])) {
                        $checkOutTime = Carbon::parse($attendanceDate->toDateString() . ' ' . $teacherData['check_out_time']);
                    }
                    
                    $record = $repository->updateOrCreate(
                        [
                            'teacher_id' => $teacherData['teacher_id'],
                            'school_id' => $schoolId,
                            'attendance_date' => $attendanceDate,
                        ],
                        [
                            'status' => $teacherData['status'],
                            'marked_by' => $principalId,
                            'check_in_time' => $checkInTime,
                            'check_out_time' => $checkOutTime,
                            'remarks' => $teacherData['remarks'] ?? null,
                        ]
                    );

                    if (!$record) {
                        Log::error('Repository returned null for teacher attendance record', [
                            'teacher_id' => $teacherData['teacher_id'],
                            'school_id' => $schoolId,
                            'attendance_date' => $attendanceDate,
                        ]);
                        throw new Exception('Failed to create/update teacher attendance record - repository returned null');
                    }
                } catch (\Exception $e) {
                    Log::error('Exception in markTeacherAttendance loop', [
                        'teacher_id' => $teacherData['teacher_id'],
                        'school_id' => $schoolId,
                        'attendance_date' => $attendanceDate,
                        'error' => $e->getMessage(),
                        'error_class' => get_class($e),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    throw $e;
                }

                // Update streak
                $this->updateTeacherStreak(
                    $teacherData['teacher_id'],
                    $schoolId,
                    $attendanceDate,
                    $teacherData['status'] === 'present'
                );

                $markedCount++;
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => "Teacher attendance marked for {$markedCount} teachers",
                'data' => ['marked_count' => $markedCount],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Mark teacher attendance failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to mark teacher attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get today's teacher attendance records
     * GET /api/principal/attendance/teachers/today
     */
    public function getTodayTeacherAttendance(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $schoolId = $authUser['school_id'];

            // Get date parameter or default to today
            $requestDate = $request->input('date');
            if ($requestDate) {
                $attendanceDate = Carbon::parse($requestDate)->setTimezone('Asia/Kolkata');
            } else {
                $attendanceDate = Carbon::now('Asia/Kolkata');
            }
            $dateString = $attendanceDate->toDateString();

            // Get all teachers for this school
            $teachers = Teacher::where('school_id', $schoolId)->get();

            // Get today's attendance records using repository
            $repository = new TeacherAttendanceRecordRepository();
            $attendanceRecords = $repository->getTodayRecords($schoolId, $dateString)
                ->keyBy('teacher_id');

            // Format response
            $teachersData = $teachers->map(function ($teacher) use ($attendanceRecords) {
                $record = $attendanceRecords->get($teacher->id);
                
                // Get teacher name from name field or first_name/last_name
                $name = $teacher->name ?? trim(($teacher->first_name ?? '') . ' ' . ($teacher->last_name ?? ''));
                
                return [
                    'teacher_id' => $teacher->id,
                    'id' => $teacher->id,
                    'name' => $name ?: 'Unknown Teacher',
                    'email' => $teacher->email ?? '',
                    'phone' => $teacher->phone ?? '',
                    'profile_picture' => $teacher->profile_picture ?? null,
                    'avatar' => $teacher->profile_picture ?? null,
                    'designation' => 'Teacher',
                    'subject' => 'Not Assigned',
                    'status' => $record ? $record->status : null,
                    'check_in_time' => $record && $record->check_in_time 
                        ? Carbon::parse($record->check_in_time)->format('H:i') 
                        : null,
                    'check_out_time' => $record && $record->check_out_time 
                        ? Carbon::parse($record->check_out_time)->format('H:i') 
                        : null,
                    'remarks' => $record ? $record->remarks : null,
                    'attendance_taken' => $record !== null,
                ];
            })->toArray();

            // Calculate statistics
            $totalTeachers = $teachers->count();
            $markedCount = $attendanceRecords->count();
            $presentCount = $attendanceRecords->where('status', 'present')->count();
            $absentCount = $attendanceRecords->where('status', 'absent')->count();
            $lateCount = $attendanceRecords->where('status', 'late')->count();
            $leaveCount = $attendanceRecords->where('status', 'leave')->count();

            return response()->json([
                'status' => true,
                'message' => "Today's teacher attendance records fetched successfully",
                'data' => [
                    'date' => $dateString,
                    'total_teachers' => $totalTeachers,
                    'marked_count' => $markedCount,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'late_count' => $lateCount,
                    'leave_count' => $leaveCount,
                    'attendance_taken' => $markedCount > 0,
                    'teachers' => $teachersData,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get today teacher attendance failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch today\'s teacher attendance records',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attendance analytics
     * GET /api/attendance/analytics
     */
    public function getAttendanceAnalytics(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $schoolId = $authUser['school_id'];
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now());
            $type = $request->input('type', 'all'); // 'all', 'teacher', 'student'
            $classId = $request->input('class_id'); // Optional class filter
            
            // Validate class belongs to school if class_id is provided
            $classInfo = null;
            if ($classId) {
                $classInfo = SchoolClass::where('id', $classId)
                    ->where('school_id', $schoolId)
                    ->first();
                if (!$classInfo) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Class not found or does not belong to your school',
                    ], 404);
                }
            }

            $responseData = [
                'date_range' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
            ];

            // Teacher attendance stats
            if ($type === 'all' || $type === 'teacher') {
                $teacherStats = TeacherAttendanceRecord::where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->select(
                        DB::raw('COUNT(*) as total_records'),
                        DB::raw('SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_count'),
                        DB::raw('SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent_count'),
                        DB::raw('SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late_count'),
                        DB::raw('SUM(CASE WHEN status = "leave" THEN 1 ELSE 0 END) as leave_count')
                    )
                    ->first();

                // Teacher-wise attendance stats
                $teacherWiseStats = TeacherAttendanceRecord::where('teacher_attendance_records.school_id', $schoolId)
                    ->whereBetween('teacher_attendance_records.attendance_date', [$startDate, $endDate])
                    ->join('teachers', 'teacher_attendance_records.teacher_id', '=', 'teachers.id')
                    ->select(
                        'teachers.id',
                        'teachers.name',
                        'teachers.email',
                        'teachers.phone',
                        DB::raw('COUNT(*) as total_records'),
                        DB::raw('SUM(CASE WHEN teacher_attendance_records.status = "present" THEN 1 ELSE 0 END) as present_count'),
                        DB::raw('SUM(CASE WHEN teacher_attendance_records.status = "absent" THEN 1 ELSE 0 END) as absent_count'),
                        DB::raw('SUM(CASE WHEN teacher_attendance_records.status = "late" THEN 1 ELSE 0 END) as late_count'),
                        DB::raw('SUM(CASE WHEN teacher_attendance_records.status = "leave" THEN 1 ELSE 0 END) as leave_count'),
                        DB::raw('ROUND((SUM(CASE WHEN teacher_attendance_records.status = "present" THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage')
                    )
                    ->groupBy('teachers.id', 'teachers.name', 'teachers.email', 'teachers.phone')
                    ->get();

                // Teachers at risk (< 75% attendance)
                $teachersAtRisk = TeacherAttendanceRecord::where('teacher_attendance_records.school_id', $schoolId)
                    ->whereBetween('teacher_attendance_records.attendance_date', [$startDate, $endDate])
                    ->join('teachers', 'teacher_attendance_records.teacher_id', '=', 'teachers.id')
                    ->select(
                        'teachers.id',
                        'teachers.name',
                        'teachers.email',
                        'teachers.phone',
                        DB::raw('COUNT(*) as total_records'),
                        DB::raw('SUM(CASE WHEN teacher_attendance_records.status = "present" THEN 1 ELSE 0 END) as present_count')
                    )
                    ->groupBy('teachers.id', 'teachers.name', 'teachers.email', 'teachers.phone')
                    ->havingRaw('(SUM(CASE WHEN teacher_attendance_records.status = "present" THEN 1 ELSE 0 END) / COUNT(*)) * 100 < 75')
                    ->get()
                    ->map(function ($teacher) {
                        return [
                            'id' => $teacher->id,
                            'name' => $teacher->name,
                            'email' => $teacher->email,
                            'phone' => $teacher->phone,
                            'attendance_percentage' => round(($teacher->present_count / $teacher->total_records) * 100, 2),
                        ];
                    });

                $responseData['teacher_stats'] = $teacherStats;
                $responseData['teacher_wise_stats'] = $teacherWiseStats;
                $responseData['teachers_at_risk'] = $teachersAtRisk;
            }

            // Student attendance stats (only if type is 'all' or 'student')
            if ($type === 'all' || $type === 'student') {
                // Build base query for student stats
                $studentStatsQuery = StudentAttendanceRecord::where('student_attendance_records.school_id', $schoolId)
                    ->whereBetween('student_attendance_records.attendance_date', [$startDate, $endDate]);

                // Apply class filter if provided
                if ($classInfo) {
                    $studentStatsQuery->join('student_details', 'student_attendance_records.student_details_id', '=', 'student_details.id')
                        ->where('student_details.class', $classInfo->class)
                        ->where('student_details.section', $classInfo->section);
                }

                $studentStatsResult = $studentStatsQuery->select(
                        DB::raw('COUNT(*) as total_records'),
                        DB::raw('COALESCE(SUM(CASE WHEN student_attendance_records.status = "present" THEN 1 ELSE 0 END), 0) as present_count'),
                        DB::raw('COALESCE(SUM(CASE WHEN student_attendance_records.status = "absent" THEN 1 ELSE 0 END), 0) as absent_count'),
                        DB::raw('COALESCE(SUM(CASE WHEN student_attendance_records.status = "late" THEN 1 ELSE 0 END), 0) as late_count')
                    )
                    ->first();
                
                // Ensure we always return an object with defaults, even if no records found
                $studentStats = $studentStatsResult ?: (object)[
                    'total_records' => 0,
                    'present_count' => 0,
                    'absent_count' => 0,
                    'late_count' => 0,
                ];

                // Class-wise attendance (filter by class if provided)
                $classWiseStatsQuery = StudentAttendanceRecord::where('student_attendance_records.school_id', $schoolId)
                    ->whereBetween('student_attendance_records.attendance_date', [$startDate, $endDate])
                    ->join('school_class', 'student_attendance_records.class_id', '=', 'school_class.id');

                if ($classId) {
                    $classWiseStatsQuery->where('school_class.id', $classId);
                }

                $classWiseStats = $classWiseStatsQuery->select(
                        'school_class.class',
                        'school_class.section',
                        DB::raw('COUNT(*) as total_records'),
                        DB::raw('COALESCE(SUM(CASE WHEN student_attendance_records.status = "present" THEN 1 ELSE 0 END), 0) as present_count'),
                        DB::raw('COALESCE(SUM(CASE WHEN student_attendance_records.status = "absent" THEN 1 ELSE 0 END), 0) as absent_count'),
                        DB::raw('CASE WHEN COUNT(*) > 0 THEN ROUND((COALESCE(SUM(CASE WHEN student_attendance_records.status = "present" THEN 1 ELSE 0 END), 0) / COUNT(*)) * 100, 2) ELSE 0 END as attendance_percentage')
                    )
                    ->groupBy('school_class.id', 'school_class.class', 'school_class.section')
                    ->get();

                // Students at risk (< 75% attendance)
                $studentsAtRiskQuery = StudentDetails::select('student_details.id', 'student_details.candidate_name as name', 'student_details.roll_no')
                    ->leftJoin('student_attendance_records', 'student_details.id', '=', 'student_attendance_records.student_details_id')
                    ->where('student_details.school_id', $schoolId)
                    ->whereBetween('student_attendance_records.attendance_date', [$startDate, $endDate]);

                if ($classInfo) {
                    $studentsAtRiskQuery->where('student_details.class', $classInfo->class)
                        ->where('student_details.section', $classInfo->section);
                }

                $studentsAtRisk = $studentsAtRiskQuery->groupBy('student_details.id', 'student_details.candidate_name', 'student_details.roll_no')
                    ->havingRaw('(SUM(CASE WHEN student_attendance_records.status = "present" THEN 1 ELSE 0 END) / COUNT(*)) * 100 < 75')
                    ->get();

                $responseData['student_stats'] = $studentStats;
                $responseData['class_wise_stats'] = $classWiseStats;
                $responseData['students_at_risk'] = $studentsAtRisk;
            }

            return response()->json([
                'status' => true,
                'data' => $responseData,
            ]);

        } catch (Exception $e) {
            Log::error('Get attendance analytics failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attendance records with filtering
     * GET /api/teacher/attendance/records
     */
    public function getAttendanceRecords(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'class_id' => 'nullable|exists:school_class,id',
                'subject_id' => 'nullable|exists:school_subjects,id',
                'status' => 'nullable|in:present,absent,late,half_day',
                'search' => 'nullable|string',
            ]);

            $schoolId = $authUser['school_id'];
            $startDate = $validated['start_date'];
            $endDate = $validated['end_date'];

            // Build query
            $query = StudentAttendanceRecord::where('student_attendance_records.school_id', $schoolId)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->join('student_details', 'student_attendance_records.student_details_id', '=', 'student_details.id')
                ->leftJoin('school_subjects', 'student_attendance_records.subject_id', '=', 'school_subjects.id')
                ->select(
                    'student_attendance_records.id',
                    'student_details.candidate_name as student_name',
                    'student_details.roll_no',
                    'student_details.class',
                    'student_details.section',
                    'school_subjects.subject_name as subject',
                    'student_attendance_records.period_number',
                    'student_attendance_records.attendance_date',
                    'student_attendance_records.status',
                    'student_attendance_records.check_in_time',
                    'student_attendance_records.remarks'
                );

            // Apply filters
            if (isset($validated['class_id'])) {
                $classInfo = SchoolClass::find($validated['class_id']);
                if ($classInfo) {
                    $query->where('student_details.class', $classInfo->class)
                          ->where('student_details.section', $classInfo->section);
                }
            }

            if (isset($validated['subject_id'])) {
                $query->where('student_attendance_records.subject_id', $validated['subject_id']);
            }

            if (isset($validated['status'])) {
                $query->where('student_attendance_records.status', $validated['status']);
            }

            if (isset($validated['search']) && !empty($validated['search'])) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('student_details.candidate_name', 'LIKE', "%{$search}%")
                      ->orWhere('student_details.roll_no', 'LIKE', "%{$search}%");
                });
            }

            // Get records with pagination
            $records = $query->orderBy('student_attendance_records.attendance_date', 'desc')
                ->orderBy('student_details.roll_no', 'asc')
                ->paginate(50);

            // Calculate statistics
            $stats = [
                'total' => $records->total(),
                'present' => StudentAttendanceRecord::where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->where('status', 'present')
                    ->count(),
                'absent' => StudentAttendanceRecord::where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->where('status', 'absent')
                    ->count(),
                'late' => StudentAttendanceRecord::where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->where('status', 'late')
                    ->count(),
            ];

            return response()->json([
                'status' => true,
                'data' => [
                    'records' => $records->items(),
                    'pagination' => [
                        'current_page' => $records->currentPage(),
                        'last_page' => $records->lastPage(),
                        'per_page' => $records->perPage(),
                        'total' => $records->total(),
                    ],
                    'stats' => $stats,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get attendance records failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch attendance records',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper: Check if quick attendance exists for a class on a date
     */
    private function checkQuickAttendanceExists($schoolId, $classId, $date)
    {
        return StudentAttendanceRecord::where('school_id', $schoolId)
            ->where('class_id', $classId)
            ->where('attendance_date', $date->toDateString())
            ->whereNull('period_number')
            ->exists();
    }

    /**
     * Helper: Check if period attendance exists for a class on a date
     */
    private function checkPeriodAttendanceExists($schoolId, $classId, $date)
    {
        $count = StudentAttendanceRecord::where('school_id', $schoolId)
            ->where('class_id', $classId)
            ->where('attendance_date', $date->toDateString())
            ->whereNotNull('period_number')
            ->count();

        return [
            'exists' => $count > 0,
            'count' => $count,
        ];
    }

    /**
     * Get today's attendance records grouped by class
     * GET /api/teacher/attendance/today-by-class
     */
    public function getTodayAttendanceByClass(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $schoolId = $authUser['school_id'];
            $teacherId = $authUser['id'];

            // Get date parameter or default to today
            $requestDate = $request->input('date');
            if ($requestDate) {
                $attendanceDate = Carbon::parse($requestDate)->setTimezone('Asia/Kolkata');
            } else {
                $attendanceDate = Carbon::now('Asia/Kolkata');
            }
            $dateString = $attendanceDate->toDateString();

            // Get all classes for this school
            $classes = SchoolClass::where('school_id', $schoolId)->get();

            $attendanceByClass = [];

            foreach ($classes as $class) {
                // Get total students in this class
                $totalStudents = StudentDetails::where('school_id', $schoolId)
                    ->where('class', $class->class)
                    ->where('section', $class->section)
                    ->count();

                // Get today's attendance records for this class
                $attendanceRecords = StudentAttendanceRecord::where('student_attendance_records.school_id', $schoolId)
                    ->where('student_attendance_records.attendance_date', $dateString)
                    ->where('student_attendance_records.class_id', $class->id)
                    ->join('student_details', 'student_attendance_records.student_details_id', '=', 'student_details.id')
                    ->where('student_details.class', $class->class)
                    ->where('student_details.section', $class->section)
                    ->select(
                        'student_attendance_records.id',
                        'student_attendance_records.student_details_id as student_id',
                        'student_details.candidate_name as student_name',
                        'student_details.roll_no',
                        'student_attendance_records.status',
                        'student_attendance_records.check_in_time',
                        'student_attendance_records.period_number',
                        'student_attendance_records.subject_id'
                    )
                    ->get();

                // Calculate statistics
                $markedCount = $attendanceRecords->count();
                $presentCount = $attendanceRecords->where('status', 'present')->count();
                $absentCount = $attendanceRecords->where('status', 'absent')->count();
                $lateCount = $attendanceRecords->where('status', 'late')->count();

                // Check for quick and period attendance
                $hasQuickAttendance = $this->checkQuickAttendanceExists($schoolId, $class->id, $attendanceDate);
                $periodAttendanceInfo = $this->checkPeriodAttendanceExists($schoolId, $class->id, $attendanceDate);
                $hasPeriodAttendance = $periodAttendanceInfo['exists'];
                $periodCount = $periodAttendanceInfo['count'];

                // Format records for response
                $records = $attendanceRecords->map(function ($record) {
                    return [
                        'student_id' => $record->student_id,
                        'student_name' => $record->student_name,
                        'roll_no' => $record->roll_no,
                        'status' => $record->status,
                        'check_in_time' => $record->check_in_time ? Carbon::parse($record->check_in_time)->format('H:i:s') : null,
                        'period_number' => $record->period_number,
                        'subject_id' => $record->subject_id,
                    ];
                })->toArray();

                $attendanceByClass[] = [
                    'class_id' => $class->id,
                    'class' => $class->class,
                    'section' => $class->section,
                    'total_students' => $totalStudents,
                    'marked_count' => $markedCount,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'late_count' => $lateCount,
                    'attendance_taken' => $markedCount > 0,
                    'has_quick_attendance' => $hasQuickAttendance,
                    'has_period_attendance' => $hasPeriodAttendance,
                    'period_count' => $periodCount,
                    'records' => $records,
                ];
            }

            return response()->json([
                'status' => true,
                'message' => "Today's attendance records fetched successfully",
                'data' => [
                    'date' => $dateString,
                    'attendance_by_class' => $attendanceByClass,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get today attendance by class failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch today\'s attendance records',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get teacher attendance records with filtering (for Principal)
     * GET /api/principal/attendance/teachers/records
     */
    public function getTeacherAttendanceRecords(Request $request)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'teacher_id' => 'nullable|exists:teachers,id',
                'status' => 'nullable|in:present,absent,late,half_day,leave',
                'search' => 'nullable|string',
            ]);

            $schoolId = $authUser['school_id'];
            $startDate = $validated['start_date'];
            $endDate = $validated['end_date'];

            $repository = new TeacherAttendanceRecordRepository();

            // Build query using repository
            $query = TeacherAttendanceRecord::where('teacher_attendance_records.school_id', $schoolId)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->join('teachers', 'teacher_attendance_records.teacher_id', '=', 'teachers.id')
                ->leftJoin('users', 'teacher_attendance_records.marked_by', '=', 'users.id')
                ->select(
                    'teacher_attendance_records.id',
                    'teacher_attendance_records.teacher_id',
                    'teachers.name as teacher_name',
                    'teachers.email as teacher_email',
                    'teachers.phone as teacher_phone',
                    'teacher_attendance_records.attendance_date',
                    'teacher_attendance_records.status',
                    'teacher_attendance_records.check_in_time',
                    'teacher_attendance_records.check_out_time',
                    'teacher_attendance_records.remarks',
                    'users.full_name as marked_by_name'
                );

            // Apply filters
            if (isset($validated['teacher_id'])) {
                $query->where('teacher_attendance_records.teacher_id', $validated['teacher_id']);
            }

            if (isset($validated['status'])) {
                $query->where('teacher_attendance_records.status', $validated['status']);
            }

            if (isset($validated['search']) && !empty($validated['search'])) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('teachers.name', 'LIKE', "%{$search}%")
                      ->orWhere('teachers.email', 'LIKE', "%{$search}%")
                      ->orWhere('teachers.phone', 'LIKE', "%{$search}%");
                });
            }

            // Get records with pagination
            $records = $query->orderBy('teacher_attendance_records.attendance_date', 'desc')
                ->orderBy('teachers.name', 'asc')
                ->paginate(50);

            // Calculate statistics
            $statsQuery = TeacherAttendanceRecord::where('school_id', $schoolId)
                ->whereBetween('attendance_date', [$startDate, $endDate]);

            if (isset($validated['teacher_id'])) {
                $statsQuery->where('teacher_id', $validated['teacher_id']);
            }

            $stats = [
                'total' => $records->total(),
                'present' => (clone $statsQuery)->where('status', 'present')->count(),
                'absent' => (clone $statsQuery)->where('status', 'absent')->count(),
                'late' => (clone $statsQuery)->where('status', 'late')->count(),
                'leave' => (clone $statsQuery)->where('status', 'leave')->count(),
            ];

            // Format records
            $formattedRecords = $records->getCollection()->map(function ($record) {
                return [
                    'id' => $record->id,
                    'teacher_id' => $record->teacher_id,
                    'teacher_name' => $record->teacher_name,
                    'teacher_email' => $record->teacher_email,
                    'teacher_phone' => $record->teacher_phone,
                    'profile_picture' => null, // Teachers table doesn't have profile_picture column
                    'attendance_date' => Carbon::parse($record->attendance_date)->format('Y-m-d'),
                    'status' => $record->status,
                    'check_in_time' => $record->check_in_time ? Carbon::parse($record->check_in_time)->format('H:i') : null,
                    'check_out_time' => $record->check_out_time ? Carbon::parse($record->check_out_time)->format('H:i') : null,
                    'remarks' => $record->remarks,
                    'marked_by_name' => $record->marked_by_name,
                ];
            });

            return response()->json([
                'status' => true,
                'message' => 'Teacher attendance records fetched successfully',
                'data' => [
                    'records' => $formattedRecords,
                    'pagination' => [
                        'current_page' => $records->currentPage(),
                        'per_page' => $records->perPage(),
                        'total' => $records->total(),
                        'last_page' => $records->lastPage(),
                    ],
                    'stats' => $stats,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get teacher attendance records failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch teacher attendance records',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get class-wise student attendance analysis
     * GET /api/principal/attendance/students/class/{class_id}
     */
    public function getClassWiseStudentAttendance(Request $request, $classId)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $schoolId = $authUser['school_id'];
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now());

            // Get class info
            $classInfo = SchoolClass::where('id', $classId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$classInfo) {
                return response()->json([
                    'status' => false,
                    'message' => 'Class not found',
                ], 404);
            }

            // Get all students in this class
            $students = StudentDetails::where('school_id', $schoolId)
                ->where('class', $classInfo->class)
                ->where('section', $classInfo->section)
                ->get();

            // Get attendance records for these students
            $studentIds = $students->pluck('id');
            $attendanceRecords = StudentAttendanceRecord::whereIn('student_details_id', $studentIds)
                ->where('school_id', $schoolId)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->get()
                ->groupBy('student_details_id');

            // Calculate stats per student
            $studentsWithStats = $students->map(function ($student) use ($attendanceRecords) {
                $records = $attendanceRecords->get($student->id, collect());
                $totalRecords = $records->count();
                $presentCount = $records->where('status', 'present')->count();
                $absentCount = $records->where('status', 'absent')->count();
                $lateCount = $records->where('status', 'late')->count();
                $halfDayCount = $records->where('status', 'half_day')->count();

                return [
                    'student_id' => $student->id,
                    'student_name' => $student->candidate_name,
                    'roll_no' => $student->roll_no,
                    'class' => $student->class,
                    'section' => $student->section,
                    'total_records' => $totalRecords,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'late_count' => $lateCount,
                    'half_day_count' => $halfDayCount,
                    'attendance_percentage' => $totalRecords > 0 
                        ? round(($presentCount / $totalRecords) * 100, 2) 
                        : 0,
                ];
            });

            // Class overall stats
            $classStats = [
                'total_students' => $students->count(),
                'total_records' => StudentAttendanceRecord::whereIn('student_details_id', $studentIds)
                    ->where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->count(),
                'present_count' => StudentAttendanceRecord::whereIn('student_details_id', $studentIds)
                    ->where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->where('status', 'present')
                    ->count(),
                'absent_count' => StudentAttendanceRecord::whereIn('student_details_id', $studentIds)
                    ->where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->where('status', 'absent')
                    ->count(),
                'late_count' => StudentAttendanceRecord::whereIn('student_details_id', $studentIds)
                    ->where('school_id', $schoolId)
                    ->whereBetween('attendance_date', [$startDate, $endDate])
                    ->where('status', 'late')
                    ->count(),
            ];

            $classStats['attendance_percentage'] = $classStats['total_records'] > 0
                ? round(($classStats['present_count'] / $classStats['total_records']) * 100, 2)
                : 0;

            return response()->json([
                'status' => true,
                'message' => 'Class-wise student attendance fetched successfully',
                'data' => [
                    'class' => [
                        'id' => $classInfo->id,
                        'class' => $classInfo->class,
                        'section' => $classInfo->section,
                    ],
                    'class_stats' => $classStats,
                    'students' => $studentsWithStats,
                    'date_range' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get class-wise student attendance failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch class-wise student attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get individual student attendance analysis
     * GET /api/principal/attendance/students/{student_details_id}
     */
    public function getStudentIndividualAttendance(Request $request, $studentDetailsId)
    {
        try {
            // Get authenticated user from JWT middleware
            $authUser = $request->get('auth_user');
            if (!$authUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Authentication required',
                ], 401);
            }

            $schoolId = $authUser['school_id'];
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now());

            // Get student info
            $student = StudentDetails::where('id', $studentDetailsId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$student) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found',
                ], 404);
            }

            // Get all attendance records for this student
            $records = StudentAttendanceRecord::where('student_details_id', $studentDetailsId)
                ->where('school_id', $schoolId)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->with('subject')
                ->orderBy('attendance_date', 'desc')
                ->get();

            // Calculate stats
            $totalRecords = $records->count();
            $presentCount = $records->where('status', 'present')->count();
            $absentCount = $records->where('status', 'absent')->count();
            $lateCount = $records->where('status', 'late')->count();
            $halfDayCount = $records->where('status', 'half_day')->count();

            $attendancePercentage = $totalRecords > 0
                ? round(($presentCount / $totalRecords) * 100, 2)
                : 0;

            // Format records
            $formattedRecords = $records->map(function ($record) {
                return [
                    'id' => $record->id,
                    'attendance_date' => Carbon::parse($record->attendance_date)->format('Y-m-d'),
                    'status' => $record->status,
                    'check_in_time' => $record->check_in_time ? Carbon::parse($record->check_in_time)->format('H:i') : null,
                    'check_out_time' => $record->check_out_time ? Carbon::parse($record->check_out_time)->format('H:i') : null,
                    'subject' => $record->subject_id ? $record->subject?->subject_name : null,
                    'period_number' => $record->period_number,
                    'remarks' => $record->remarks,
                ];
            });

            // Monthly breakdown
            $monthlyStats = $records->groupBy(function ($record) {
                return Carbon::parse($record->attendance_date)->format('Y-m');
            })->map(function ($monthRecords, $month) {
                $total = $monthRecords->count();
                $present = $monthRecords->where('status', 'present')->count();
                return [
                    'month' => $month,
                    'total_records' => $total,
                    'present_count' => $present,
                    'absent_count' => $monthRecords->where('status', 'absent')->count(),
                    'late_count' => $monthRecords->where('status', 'late')->count(),
                    'attendance_percentage' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
                ];
            })->values();

            return response()->json([
                'status' => true,
                'message' => 'Student attendance analysis fetched successfully',
                'data' => [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->candidate_name,
                        'roll_no' => $student->roll_no,
                        'class' => $student->class,
                        'section' => $student->section,
                    ],
                    'stats' => [
                        'total_records' => $totalRecords,
                        'present_count' => $presentCount,
                        'absent_count' => $absentCount,
                        'late_count' => $lateCount,
                        'half_day_count' => $halfDayCount,
                        'attendance_percentage' => $attendancePercentage,
                    ],
                    'records' => $formattedRecords,
                    'monthly_stats' => $monthlyStats,
                    'date_range' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                ],
            ]);

        } catch (Exception $e) {
            Log::error('Get student individual attendance failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch student attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get student/teacher streaks
     * GET /api/attendance/streaks/:userId/:userType
     */
    public function getStreaks($userId, $userType)
    {
        try {
            $streak = AttendanceStreak::where('user_id', $userId)
                ->where('user_type', $userType)
                ->first();

            if (!$streak) {
                return response()->json([
                    'status' => true,
                    'data' => [
                        'current_streak' => 0,
                        'best_streak' => 0,
                        'badges_earned' => [],
                    ],
                ]);
            }

            return response()->json([
                'status' => true,
                'data' => $streak,
            ]);

        } catch (Exception $e) {
            Log::error('Get streaks failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch streaks',
            ], 500);
        }
    }

    /**
     * Helper: Update student streak
     */
    private function updateStudentStreak($studentId, $schoolId, $attendanceDate, $wasPresent)
    {
        $streak = AttendanceStreak::firstOrCreate([
            'user_id' => $studentId,
            'user_type' => 'student',
            'school_id' => $schoolId,
        ]);

        $streak->updateStreak($attendanceDate, $wasPresent);

        // Check and award badges
        $this->checkAndAwardBadges($streak);
    }

    /**
     * Helper: Update teacher streak
     */
    private function updateTeacherStreak($teacherId, $schoolId, $attendanceDate, $wasPresent)
    {
        $streak = AttendanceStreak::firstOrCreate([
            'user_id' => $teacherId,
            'user_type' => 'teacher',
            'school_id' => $schoolId,
        ]);

        $streak->updateStreak($attendanceDate, $wasPresent);
        $this->checkAndAwardBadges($streak);
    }

    /**
     * Helper: Check and award badges
     */
    private function checkAndAwardBadges(AttendanceStreak $streak)
    {
        // Perfect Week (7 days)
        if ($streak->current_streak >= 7 && !$streak->hasBadge('perfect_week')) {
            $streak->awardBadge('perfect_week');
            $streak->perfect_weeks++;
            $streak->save();
        }

        // Monthly Star (30 days)
        if ($streak->current_streak >= 30 && !$streak->hasBadge('monthly_star')) {
            $streak->awardBadge('monthly_star');
            $streak->perfect_months++;
            $streak->save();
        }

        // Streak Master (30 consecutive days)
        if ($streak->current_streak >= 30 && !$streak->hasBadge('streak_master')) {
            $streak->awardBadge('streak_master');
        }

        // Early Bird (14 consecutive days on time - simplified check)
        if ($streak->current_streak >= 14 && !$streak->hasBadge('early_bird')) {
            $streak->awardBadge('early_bird');
        }
    }
}

