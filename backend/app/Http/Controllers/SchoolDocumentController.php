<?php

namespace App\Http\Controllers;

use App\Models\StudentDetails;
use App\Models\MonthlyPayment;
use App\Models\ExamSchedule;
use App\Models\StudentExamMark;
use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Throwable;

class SchoolDocumentController extends Controller
{
    /**
     * Resolve school or fallback safely to default.
     */
    private function resolveSchool(?int $schoolId = null): School
    {
        try {
            if ($schoolId) {
                $school = School::find($schoolId);
                if ($school) return $school;
            }

            $defaultSchool = School::first();
            if ($defaultSchool) return $defaultSchool;
        } catch (Throwable $e) {
            Log::warning("resolveSchool query failed: " . $e->getMessage());
        }

        return new School([
            'id' => 1,
            'name' => 'Demo International School',
            'school_code' => 'SCH-0102',
            'affiliation_number' => 'AFF-2026-9812',
            'board' => 'CBSE Board',
            'email' => 'info@school.edu',
            'phone' => '+91 9876543210',
            'address' => 'Station Road, Campus Area',
            'city' => 'Central District',
            'state' => 'State',
            'pincode' => '110001',
        ]);
    }

    /**
     * Resolve student or fallback safely to sample.
     */
    private function resolveStudent(?int $studentId = null): StudentDetails
    {
        try {
            if ($studentId) {
                $student = StudentDetails::with('school')->find($studentId);
                if ($student) return $student;
            }

            $defaultStudent = StudentDetails::with('school')->first();
            if ($defaultStudent) return $defaultStudent;
        } catch (Throwable $e) {
            Log::warning("resolveStudent query failed: " . $e->getMessage());
        }

        return new StudentDetails([
            'id' => 1,
            'school_id' => 1,
            'candidate_name' => 'Aarav Sharma',
            'gender' => 'Male',
            'dob' => '2011-08-14',
            'class' => '10',
            'section' => 'A',
            'roll_no' => '18',
            'addhar' => '7845-2145-8965',
            'father_name' => 'Rajesh Sharma',
            'mother_name' => 'Sunita Sharma',
            'phone' => '+91 9876543210',
            'email' => 'aarav.parent@example.com',
            'address' => '42, Garden View Enclave, Campus Road, Central District',
            'admission_date' => '2022-04-10',
        ]);
    }

    /**
     * Helper to render view or return PDF download safely.
     */
    private function renderOrPdf(string $viewName, array $data, string $filename, Request $request)
    {
        $isPdf = $request->query('download') === 'pdf';
        $data['isPdf'] = $isPdf;

        if ($isPdf) {
            // Check if DomPDF is available on live server
            if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
                try {
                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($viewName, $data)->setPaper('a4', 'portrait');
                    return $pdf->download("{$filename}.pdf");
                } catch (Throwable $e) {
                    Log::error("DomPDF error rendering {$filename}: " . $e->getMessage());
                }
            } else {
                Log::warning("Barryvdh\\DomPDF\\Facade\\Pdf class is not installed on this server. Falling back to HTML view.");
            }
            // If DomPDF failed or not installed, render view with auto-print
            $data['isPdf'] = false;
            $data['autoPrint'] = true;
        }

        return view($viewName, $data);
    }

    /**
     * Render or download Fee Receipt.
     * GET /documents/fee-receipt/{id?}
     */
    public function feeReceipt(Request $request, $id = null)
    {
        try {
            $payment = null;
            if ($id) {
                try {
                    $payment = MonthlyPayment::with(['student.school', 'items'])->find($id);
                } catch (Throwable $pe) {
                    Log::warning("MonthlyPayment query error: " . $pe->getMessage());
                }
            }

            if ($payment && $payment->student) {
                $student = $payment->student;
                $school = $student->school ?? $this->resolveSchool($payment->school_id);
                $receiptNumber = 'REC-' . ($payment->created_at ? $payment->created_at->format('Y') : date('Y')) . '-' . str_pad($payment->id, 5, '0', STR_PAD_LEFT);
                $paymentDate = $payment->payment_date ? Carbon::parse($payment->payment_date)->format('d M, Y') : date('d M, Y');
                $paymentMode = $payment->mode ?? 'Online UPI';
                $monthName = $payment->month ?? date('F Y');

                $feeItems = [];
                if (!empty($payment->items) && $payment->items->count() > 0) {
                    foreach ($payment->items as $item) {
                        $feeItems[] = [
                            'name' => $item->fee_type ?? $item->description ?? 'Fee Particulars',
                            'due' => floatval($item->amount ?? 0),
                            'concession' => 0,
                            'paid' => floatval($item->amount ?? 0),
                        ];
                    }
                } else {
                    $feeItems = [
                        ['name' => 'Monthly Composite Tuition Fee', 'due' => floatval($payment->total_amount ?? 3500), 'concession' => 0, 'paid' => floatval($payment->total_amount ?? 3500)]
                    ];
                }
            } else {
                $student = $this->resolveStudent();
                $school = $this->resolveSchool($student->school_id);
                $receiptNumber = 'REC-2026-0042';
                $paymentDate = date('d M, Y');
                $paymentMode = 'Online UPI / NetBanking';
                $monthName = date('F Y');
                $feeItems = null;
            }

            $data = [
                'school' => $school,
                'student' => $student,
                'payment' => $payment,
                'receiptNumber' => $receiptNumber,
                'paymentDate' => $paymentDate,
                'paymentMode' => $paymentMode,
                'monthName' => $monthName,
                'feeItems' => $feeItems,
                'session' => '2026-2027',
            ];

            return $this->renderOrPdf('documents.fee-receipt', $data, "Fee-Receipt-{$receiptNumber}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::feeReceipt error: " . $e->getMessage());
            return response()->view('documents.fee-receipt', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'receiptNumber' => 'REC-2026-0001',
                'paymentDate' => date('d M, Y'),
                'paymentMode' => 'Online',
                'monthName' => date('F Y'),
                'feeItems' => null,
                'session' => '2026-2027',
                'isPdf' => false,
            ]);
        }
    }

    /**
     * Render or download Admission Receipt.
     * GET /documents/admission-receipt/{studentId?}
     */
    public function admissionReceipt(Request $request, $studentId = null)
    {
        try {
            $student = $this->resolveStudent($studentId);
            $school = $this->resolveSchool($student->school_id);
            $admissionNumber = $student->roll_no ? 'ADM-2026-' . $student->roll_no : 'ADM-2026-104';

            $data = [
                'school' => $school,
                'student' => $student,
                'admissionNumber' => $admissionNumber,
                'session' => '2026-2027',
            ];

            return $this->renderOrPdf('documents.admission-receipt', $data, "Admission-Receipt-{$admissionNumber}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::admissionReceipt error: " . $e->getMessage());
            return response()->view('documents.admission-receipt', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'admissionNumber' => 'ADM-2026-001',
                'session' => '2026-2027',
                'isPdf' => false,
            ]);
        }
    }

    /**
     * Render or download Student Marksheet.
     * GET /documents/marksheet/{studentId?}
     */
    public function marksheet(Request $request, $studentId = null)
    {
        try {
            $student = $this->resolveStudent($studentId);
            $school = $this->resolveSchool($student->school_id);
            $examName = $request->query('exam') ?? 'Annual Examination - 2026';

            $marksList = null;
            try {
                $marksQuery = StudentExamMark::with(['examSchedule.subject', 'examSchedule.exam'])
                    ->where('student_details_id', $student->id)
                    ->get();

                if ($marksQuery && $marksQuery->count() > 0) {
                    $marksList = [];
                    foreach ($marksQuery as $m) {
                        $subjectName = $m->examSchedule->subject->name ?? $m->examSchedule->subject->subject_name ?? 'Subject Paper';
                        $marksList[] = [
                            'subject' => $subjectName,
                            'max' => floatval($m->marks_total ?? 100),
                            'min' => 33,
                            'obtained' => floatval($m->marks_obtained ?? 0),
                            'grade' => $m->grade ?? ($m->marks_obtained >= 90 ? 'A1' : ($m->marks_obtained >= 80 ? 'A2' : 'B1')),
                        ];
                    }
                }
            } catch (Throwable $me) {
                Log::warning("StudentExamMark query fallback: " . $me->getMessage());
            }

            $data = [
                'school' => $school,
                'student' => $student,
                'examName' => $examName,
                'session' => '2026-2027',
                'marksList' => $marksList,
            ];

            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $this->renderOrPdf('documents.marksheet', $data, "Marksheet-{$safeName}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::marksheet error: " . $e->getMessage());
            return response()->view('documents.marksheet', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'examName' => 'Annual Examination - 2026',
                'session' => '2026-2027',
                'marksList' => null,
                'isPdf' => false,
            ]);
        }
    }

    /**
     * Render or download Exam Admit Card.
     * GET /documents/admit-card/{studentId?}
     */
    public function admitCard(Request $request, $studentId = null)
    {
        try {
            $student = $this->resolveStudent($studentId);
            $school = $this->resolveSchool($student->school_id);
            $examName = $request->query('exam') ?? 'Annual Board Examination - 2026';

            $schedules = null;
            try {
                // Find class id safely without querying invalid column names
                $classId = null;
                if (!empty($student->class)) {
                    $schoolClass = SchoolClass::where('name', $student->class)
                        ->orWhere('id', is_numeric($student->class) ? (int)$student->class : 0)
                        ->first();
                    $classId = $schoolClass ? $schoolClass->id : (is_numeric($student->class) ? (int)$student->class : null);
                }

                $query = ExamSchedule::with(['subject', 'exam']);
                if ($classId) {
                    $query->where('class_id', $classId);
                }
                $dbSchedules = $query->get();

                if ($dbSchedules && $dbSchedules->count() > 0) {
                    $schedules = [];
                    foreach ($dbSchedules as $sch) {
                        $dateObj = $sch->exam_date ? Carbon::parse($sch->exam_date) : Carbon::now();
                        $subjectName = $sch->subject->name ?? $sch->subject->subject_name ?? 'Subject Paper';
                        $schedules[] = [
                            'date' => $dateObj->format('d M Y'),
                            'day' => $dateObj->format('l'),
                            'time' => ($sch->start_time && $sch->end_time) ? "{$sch->start_time} - {$sch->end_time}" : '09:00 AM - 12:00 PM',
                            'subject' => $subjectName,
                            'room' => $sch->room_number ?? 'Hall 101',
                        ];
                    }
                }
            } catch (Throwable $se) {
                Log::warning("ExamSchedule query fallback: " . $se->getMessage());
            }

            $data = [
                'school' => $school,
                'student' => $student,
                'examName' => $examName,
                'examSchedules' => $schedules,
                'centerName' => 'Main Academic Block (Wing-A)',
            ];

            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $this->renderOrPdf('documents.admit-card', $data, "AdmitCard-{$safeName}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::admitCard error: " . $e->getMessage());
            return response()->view('documents.admit-card', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'examName' => 'Annual Board Examination - 2026',
                'examSchedules' => null,
                'centerName' => 'Main Academic Block (Wing-A)',
                'isPdf' => false,
            ]);
        }
    }

    /**
     * Render or download School Transfer Certificate.
     * GET /documents/transfer-certificate/{studentId?}
     */
    public function transferCertificate(Request $request, $studentId = null)
    {
        try {
            $student = $this->resolveStudent($studentId);
            $school = $this->resolveSchool($student->school_id);
            $tcNumber = 'TC/' . date('Y') . '/' . str_pad($student->id ?? 1, 4, '0', STR_PAD_LEFT);

            $data = [
                'school' => $school,
                'student' => $student,
                'tcNumber' => $tcNumber,
            ];

            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $this->renderOrPdf('documents.transfer-certificate', $data, "TransferCertificate-{$safeName}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::transferCertificate error: " . $e->getMessage());
            return response()->view('documents.transfer-certificate', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'tcNumber' => 'TC/' . date('Y') . '/0001',
                'isPdf' => false,
            ]);
        }
    }

    /**
     * Render or download Student ID Card.
     * GET /documents/id-card/{studentId?}
     */
    public function idCard(Request $request, $studentId = null)
    {
        try {
            $student = $this->resolveStudent($studentId);
            $school = $this->resolveSchool($student->school_id);

            $data = [
                'school' => $school,
                'student' => $student,
                'session' => '2026-2027',
                'bloodGroup' => 'B+',
            ];

            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $this->renderOrPdf('documents.id-card', $data, "IDCard-{$safeName}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::idCard error: " . $e->getMessage());
            return response()->view('documents.id-card', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'session' => '2026-2027',
                'bloodGroup' => 'B+',
                'isPdf' => false,
            ]);
        }
    }

    /**
     * Render or download Bonafide Certificate.
     * GET /documents/bonafide-certificate/{studentId?}
     */
    public function bonafideCertificate(Request $request, $studentId = null)
    {
        try {
            $student = $this->resolveStudent($studentId);
            $school = $this->resolveSchool($student->school_id);
            $refNumber = 'CERT/BONA/' . date('Y') . '/' . str_pad($student->id ?? 1, 4, '0', STR_PAD_LEFT);
            $purpose = $request->query('purpose') ?? 'Official Documentation / Passport / Academic Verification';

            $data = [
                'school' => $school,
                'student' => $student,
                'refNumber' => $refNumber,
                'purpose' => $purpose,
                'session' => '2026-2027',
            ];

            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $this->renderOrPdf('documents.bonafide-certificate', $data, "BonafideCertificate-{$safeName}", $request);
        } catch (Throwable $e) {
            Log::error("SchoolDocumentController::bonafideCertificate error: " . $e->getMessage());
            return response()->view('documents.bonafide-certificate', [
                'school' => $this->resolveSchool(),
                'student' => $this->resolveStudent(),
                'refNumber' => 'CERT/BONA/' . date('Y') . '/0001',
                'purpose' => 'Official Verification',
                'session' => '2026-2027',
                'isPdf' => false,
            ]);
        }
    }
}
