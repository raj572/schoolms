<?php

namespace App\Http\Controllers;

use App\Services\TeacherService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TeacherController extends Controller
{
  private TeacherService $teacherService;

  public function __construct(TeacherService $teacherService)
  {
    $this->teacherService = $teacherService;
  }

  protected function httpCodeFromServiceResult(array $res, bool $isCreate = false): int
  {
    if (!empty($res['status'])) {
      return $isCreate ? 201 : 200;
    }

    $msg = strtolower($res['message'] ?? '');
    if (str_contains($msg, 'not found')) {
      return 404;
    }

    return 400;
  }

  public function getTeacherAssignedClasses($id, $school_id)
  {
    try {
      $res = $this->teacherService->getTeacherAssignedClasses($id, $school_id);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch teacher details',
        'error' => $e->getMessage(),
      ], 500);
    }
  }
  public function getTeacherClassDetails($id, $school_id, $class_id)
  {
    try {
      $res = $this->teacherService->getTeacherClassDetails($id, $school_id, $class_id);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch class details',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  public function getStudentDetailsList(Request $request)
  {
    try {
      // validated data — FormRequest already validated or returned 422
      $validated = $request->validate([
        'school_id' => 'required|integer|exists:schools,id',
        'class' => 'required|string|max:30',
        'section' => 'required|string|max:30',
      ]);

      $res = $this->teacherService->getStudentDetailsList($validated);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      // keep error message safe in production (avoid leaking SQL)
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch student details',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  public function updateAttendance(Request $request)
  {
    // ✅ Validate incoming request
    $validator = Validator::make($request->all(), [
      'school_id' => 'required|integer|exists:schools,id',

      // 🔹 class selection is mandatory
      'class' => 'required|array',
      'class.id' => 'required|integer|exists:school_class,id',
      'class.class' => 'required|string|max:30',
      'class.section' => 'nullable|string|max:30',

      'section' => 'required|string|max:50',
      'date' => 'required|date',
      'attendance' => 'required|array|min:1',
      'attendance.*.student_id' => 'required|integer|exists:students,id',
      'attendance.*.status' => 'required|in:present,absent,leave,late',
      'attendance.*.remarks' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'status' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $result = $this->teacherService->updateAttendance($validator->validated());
      return response()->json($result);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to update attendance: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get teacher's full week timetable
   */
  public function getWeeklyTimetable($teacherId, $schoolId)
  {
    try {
      $res = $this->teacherService->getTeacherWeeklyTimetable($teacherId, $schoolId);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch weekly timetable',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get today's classes for a teacher
   */
  public function getTodayClasses($teacherId, $schoolId)
  {
    try {
      $res = $this->teacherService->getTodayClasses($teacherId, $schoolId);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch today\'s classes',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get teacher dashboard statistics
   */
  public function getDashboardStats($teacherId, $schoolId)
  {
    try {
      $res = $this->teacherService->getTeacherDashboardStats($teacherId, $schoolId);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch dashboard stats',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get teacher profile details
   */
  public function getTeacherProfile($id)
  {
    try {
      $res = $this->teacherService->getTeacherProfile($id);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to fetch teacher profile',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update teacher profile
   */
  public function updateTeacherProfile(Request $request, $id)
  {
    try {
      $validated = $request->validate([
        'name' => 'sometimes|string|max:100',
        'phone' => 'sometimes|string|max:15',
        'dob' => 'sometimes|date',
        'gender' => 'sometimes|string|in:Male,Female,Other',
        'address' => 'sometimes|string|max:255',
        'city' => 'sometimes|string|max:100',
        'state' => 'sometimes|string|max:100',
        'qualification' => 'sometimes|string|max:100',
      ]);

      $res = $this->teacherService->updateTeacherProfile($id, $validated);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to update profile',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update teacher password
   */
  public function updateTeacherPassword(Request $request, $id)
  {
    try {
      $validated = $request->validate([
        'current_password' => 'required|string',
        'new_password' => 'required|string|min:8|confirmed',
      ]);

      $res = $this->teacherService->updateTeacherPassword($id, $validated);
      $code = $this->httpCodeFromServiceResult($res, false);
      return response()->json($res, $code);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Failed to update password',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

}
