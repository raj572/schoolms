<?php

namespace App\Http\Controllers;

use App\Services\StudentService;
use Illuminate\Http\JsonResponse;

class StudentController extends Controller
{

  private StudentService $studentService;
  
  public function __construct(StudentService $studentService)
  {
    $this->studentService = $studentService;
  }

  public function getStudentDetails($id): JsonResponse
  {
    $studentDetails = $this->studentService->getStudentDetails($id);
    if (!$studentDetails) {
      return response()->json([
        'success' => false,
        'message' => 'Student not found'
      ], 404);
    }
    return response()->json([
      'success' => true,
      'data' => $studentDetails
    ], 200);
  }

  public function getMonthlyPaymentsOfIndividual($studentId): JsonResponse
  {
    $payments = $this->studentService->getMonthlyPaymentsOfIndividual($studentId);
    if (!$payments) {
      return response()->json([
        'success' => false,
        'message' => 'No payments found for this student'
      ], 404);
    }
    return response()->json([
      'success' => true,
      'data' => $payments
    ], 200);
  }



}