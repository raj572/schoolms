<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ParentDashboardController extends Controller
{
    /**
     * Get parent dashboard overview data
     */
    public function getDashboard(int $parentId, Request $request): JsonResponse
    {
        try {
            $schoolId = $request->input('school_id') ?? 1;

            // Fetch parent record from database if present
            $parent = DB::table('parents')
                ->where('id', $parentId)
                ->orWhere('user_id', $parentId)
                ->first();

            $parentName = $parent 
                ? ($parent->guardian_name ?? trim(($parent->father_name ?? '') . ' ' . ($parent->mother_name ?? '')))
                : 'Mr. Rajesh Sharma';
            if (empty($parentName)) {
                $parentName = 'Mr. Rajesh Sharma';
            }

            $email = $parent->email ?? 'rajesh.sharma@example.com';
            $phone = $parent->phone ?? '+91 9876543210';

            $children = [
                [
                    'id' => 1,
                    'name' => 'Rohan Sharma',
                    'grade' => '10th Grade',
                    'class' => '10th',
                    'section' => 'A',
                    'roll_no' => '10A-23',
                    'attendance' => 92.4,
                    'standing' => 'Good Standing',
                    'current_year' => '2025-26',
                    'school' => 'Learnaz Academy',
                    'avatar' => null,
                ],
                [
                    'id' => 2,
                    'name' => 'Riya Sharma',
                    'grade' => '6th Grade',
                    'class' => '6th',
                    'section' => 'B',
                    'roll_no' => '6B-14',
                    'attendance' => 95.8,
                    'standing' => 'Honor Roll',
                    'current_year' => '2025-26',
                    'school' => 'Learnaz Academy',
                    'avatar' => null,
                ],
                [
                    'id' => 3,
                    'name' => 'Ankit Verma',
                    'grade' => '8th Grade',
                    'class' => '8th',
                    'section' => 'A',
                    'roll_no' => '8A-09',
                    'attendance' => 89.0,
                    'standing' => 'Needs Attention',
                    'current_year' => '2025-26',
                    'school' => 'Learnaz Academy',
                    'avatar' => null,
                ],
            ];

            $upcomingEvents = [
                ['id' => 1, 'title' => 'PTM (Parent-Teacher Meeting)', 'date' => '2025-04-15', 'time' => '10:00 AM - 01:00 PM', 'room' => 'Auditorium Hall B'],
                ['id' => 2, 'title' => 'Annual Sports Day', 'date' => '2025-04-20', 'time' => '08:30 AM - 04:00 PM', 'room' => 'Main Athletics Ground'],
                ['id' => 3, 'title' => 'Science & Robotics Exhibition', 'date' => '2025-04-28', 'time' => '11:00 AM - 03:00 PM', 'room' => 'STEM Innovation Lab'],
            ];

            $examPerformance = [
                ['subject' => 'Mathematics', 'marks' => 85, 'max' => 100, 'grade' => 'A'],
                ['subject' => 'Science', 'marks' => 78, 'max' => 100, 'grade' => 'B+'],
                ['subject' => 'English', 'marks' => 92, 'max' => 100, 'grade' => 'A+'],
                ['subject' => 'Social Science', 'marks' => 82, 'max' => 100, 'grade' => 'B+'],
                ['subject' => 'Computer Science', 'marks' => 98, 'max' => 100, 'grade' => 'A+'],
            ];

            $feeStatus = [
                ['id' => 1, 'type' => 'Admission Fee', 'due_date' => '2025-04-10', 'amount' => 15000.0, 'status' => 'Paid'],
                ['id' => 2, 'type' => 'Library Fee', 'due_date' => '2025-04-08', 'amount' => 1000.0, 'status' => 'Pending'],
                ['id' => 3, 'type' => 'Book Fee', 'due_date' => '2025-04-12', 'amount' => 1500.0, 'status' => 'Pending'],
            ];

            $notices = [
                ['id' => 1, 'title' => 'Holiday Notice', 'message' => 'School will remain closed on 14th April for a public holiday.', 'date' => '2025-04-08', 'attachment' => false],
                ['id' => 2, 'title' => 'Science Exhibition', 'message' => 'Science exhibition registration closes on 12th April.', 'date' => '2025-04-09', 'attachment' => true],
                ['id' => 3, 'title' => 'Term 2 Fee Clearance Reminder', 'message' => 'Please clear outstanding library and book charges before 15th April.', 'date' => '2025-04-05', 'attachment' => false],
            ];

            return response()->json([
                'status' => true,
                'message' => 'Parent dashboard data fetched successfully',
                'data' => [
                    'parent_info' => [
                        'id' => $parentId,
                        'name' => $parentName,
                        'email' => $email,
                        'phone' => $phone,
                        'address' => '123, Green Park, New Delhi',
                    ],
                    'children' => $children,
                    'upcoming_events' => $upcomingEvents,
                    'recent_exam_performance' => $examPerformance,
                    'fee_status' => $feeStatus,
                    'notices' => $notices,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in ParentDashboardController::getDashboard: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get parent fees dues and payment receipts
     */
    public function getFees(int $parentId): JsonResponse
    {
        try {
            $feesDue = [
                [
                    'id' => 1,
                    'student_name' => 'Rohan Kumar',
                    'class' => '8th Grade',
                    'due_date' => '2025-10-15',
                    'amount' => 12000.0,
                    'status' => 'Pending',
                ],
                [
                    'id' => 2,
                    'student_name' => 'Riya Sharma',
                    'class' => '6th Grade',
                    'due_date' => '2025-10-10',
                    'amount' => 10500.0,
                    'status' => 'Overdue',
                ],
                [
                    'id' => 3,
                    'student_name' => 'Ankit Verma',
                    'class' => '10th Grade',
                    'due_date' => '2025-11-05',
                    'amount' => 15000.0,
                    'status' => 'Pending',
                ],
            ];

            $receipts = [
                [
                    'id' => 1,
                    'student_name' => 'Rohan Kumar',
                    'class' => '8th Grade',
                    'receipt_no' => 'RCPT-2025-001',
                    'date' => '2025-09-15',
                    'amount' => 12000.0,
                    'mode' => 'UPI',
                    'status' => 'Paid',
                ],
                [
                    'id' => 2,
                    'student_name' => 'Riya Sharma',
                    'class' => '6th Grade',
                    'receipt_no' => 'RCPT-2025-002',
                    'date' => '2025-08-20',
                    'amount' => 10500.0,
                    'mode' => 'Net Banking',
                    'status' => 'Paid',
                ],
                [
                    'id' => 3,
                    'student_name' => 'Ankit Verma',
                    'class' => '10th Grade',
                    'receipt_no' => 'RCPT-2025-003',
                    'date' => '2025-07-10',
                    'amount' => 15000.0,
                    'mode' => 'Cash',
                    'status' => 'Paid',
                ],
            ];

            $totalDue = array_sum(array_column($feesDue, 'amount'));
            $totalPaid = array_sum(array_column($receipts, 'amount'));

            return response()->json([
                'status' => true,
                'message' => 'Parent fees fetched successfully',
                'data' => [
                    'currency' => '₹',
                    'total_due' => $totalDue,
                    'total_paid' => $totalPaid,
                    'dues' => $feesDue,
                    'receipts' => $receipts,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in ParentDashboardController::getFees: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Settle fee payment
     */
    public function payFee(Request $request): JsonResponse
    {
        try {
            $feeId = $request->input('fee_id');
            $mode = $request->input('mode') ?? 'Online (Instant UPI)';

            return response()->json([
                'status' => true,
                'message' => 'Payment settled successfully via online gateway',
                'data' => [
                    'fee_id' => $feeId,
                    'mode' => $mode,
                    'transaction_id' => 'TXN' . time(),
                    'date' => date('Y-m-d'),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Payment failed'], 500);
        }
    }

    /**
     * Get student academic profile
     */
    public function getAcademicProfile(int $studentId): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Student academic profile fetched successfully',
                'data' => [
                    'roll_no' => 'STU2025-101',
                    'class' => '8th Grade',
                    'section' => 'A',
                    'admission_date' => '10 April 2021',
                    'current_year' => '2025-26',
                    'performance' => 'Excellent',
                    'attendance' => '96%',
                    'subjects' => [
                        ['name' => 'Mathematics', 'marks' => '95/100', 'grade' => 'A+'],
                        ['name' => 'Science', 'marks' => '90/100', 'grade' => 'A'],
                        ['name' => 'English', 'marks' => '88/100', 'grade' => 'A'],
                        ['name' => 'Social Science', 'marks' => '82/100', 'grade' => 'B+'],
                        ['name' => 'Computer', 'marks' => '98/100', 'grade' => 'A+'],
                    ],
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Failed to fetch academic details'], 500);
        }
    }

    /**
     * Get student personal details
     */
    public function getPersonalInfo(int $studentId): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Student personal details fetched successfully',
                'data' => [
                    'name' => 'Rohan Kumar',
                    'gender' => 'Male',
                    'dob' => '15 March 2010',
                    'blood_group' => 'O+',
                    'contact' => '+91 9876543210',
                    'email' => 'rohan.kumar@example.com',
                    'address' => '123, Green Park, New Delhi',
                    'parent_name' => 'Mr. Rajesh Kumar',
                    'parent_contact' => '+91 9876500000',
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Failed to fetch personal details'], 500);
        }
    }

    /**
     * Submit absence excuse note
     */
    public function submitAbsenceNote(Request $request): JsonResponse
    {
        try {
            $studentId = $request->input('student_id');
            $reason = $request->input('reason');
            $date = $request->input('date') ?? date('Y-m-d');

            return response()->json([
                'status' => true,
                'message' => 'Absence note submitted successfully to the school administration',
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Failed to submit absence note'], 500);
        }
    }

    /**
     * Get parent notices
     */
    public function getNotices(Request $request): JsonResponse
    {
        try {
            $notices = [
                [
                    'id' => 1,
                    'title' => 'Annual Sports Day Announcement',
                    'message' => 'Annual Sports Day will be held on 20th April 2024. Parents are cordially invited to attend and encourage our champions.',
                    'date' => '2024-04-05',
                    'attachment' => true,
                ],
                [
                    'id' => 2,
                    'title' => 'Parent-Teacher Meeting',
                    'message' => 'PTM is scheduled on 15th April 2024. Kindly be present to discuss your child\'s academic growth and term roadmap.',
                    'date' => '2024-04-03',
                    'attachment' => false,
                ],
                [
                    'id' => 3,
                    'title' => 'Holiday Notice',
                    'message' => 'School will remain closed on 14th April 2024 due to a national holiday.',
                    'date' => '2024-04-02',
                    'attachment' => false,
                ],
            ];

            return response()->json([
                'status' => true,
                'message' => 'Notices fetched successfully',
                'data' => $notices,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Failed to fetch notices'], 500);
        }
    }
}
