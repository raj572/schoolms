<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentDetails;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class StudentProfileController extends Controller
{
    /**
     * Get student profile with full details
     */
    public function getProfile(int $studentId): JsonResponse
    {
        try {
            $student = Student::with('detail')->find($studentId);

            if (!$student) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found',
                ], 404);
            }

            $detail = $student->detail;

            $profileData = [
                'id' => $student->id,
                'username' => $student->username,
                'email' => $student->email,
                'school_id' => $student->school_id,
                'status' => $student->status,
                'role' => $student->role,
                'created_at' => $student->created_at,
                
                // Student details
                'candidate_name' => $detail ? $detail->candidate_name : null,
                'class' => $detail ? $detail->class : $student->class,
                'section' => $detail ? $detail->section : null,
                'roll_no' => $detail ? $detail->roll_no : null,
                'gender' => $detail ? $detail->gender : null,
                'dob' => $detail ? $detail->dob : null,
                'phone' => $detail ? $detail->phone : null,
                'address' => $detail ? $detail->address : null,
                'father_name' => $detail ? $detail->father_name : null,
                'mother_name' => $detail ? $detail->mother_name : null,
                'admission_date' => $detail ? $detail->admission_date : null,
                'addhar' => $detail ? $detail->addhar : null,
            ];

            return response()->json([
                'status' => true,
                'message' => 'Profile fetched successfully',
                'data' => $profileData,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching student profile: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update student password
     */
    public function updatePassword(int $studentId, Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6',
                'confirm_password' => 'required|string|same:new_password',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $student = Student::find($studentId);

            if (!$student) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found',
                ], 404);
            }

            // Verify current password
            if (!Hash::check($request->current_password, $student->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current password is incorrect',
                ], 401);
            }

            // Update password
            $student->password = Hash::make($request->new_password);
            $student->save();

            return response()->json([
                'status' => true,
                'message' => 'Password updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating student password: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error updating password',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update student profile (basic info only - details managed by principal)
     */
    public function updateProfile(int $studentId, Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'sometimes|email|unique:students,email,' . $studentId,
                'phone' => 'sometimes|string|max:15',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $student = Student::with('detail')->find($studentId);

            if (!$student) {
                return response()->json([
                    'status' => false,
                    'message' => 'Student not found',
                ], 404);
            }

            // Update student email if provided
            if ($request->has('email')) {
                $student->email = $request->email;
                $student->save();
            }

            // Update student details phone if provided
            if ($request->has('phone') && $student->detail) {
                $student->detail->phone = $request->phone;
                $student->detail->save();
            }

            return response()->json([
                'status' => true,
                'message' => 'Profile updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating student profile: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error updating profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

