<?php

namespace App\Http\Controllers;

use App\Models\StudentDetails;
use App\Models\MonthlyPayment;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\StudentExamMark;
use App\Models\School;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;

class SchoolDocumentController extends Controller
{
    /**
     * Resolve school or fallback to default.
     */
    private function resolveSchool(?int $schoolId = null): School
    {
        if ($schoolId) {
            $school = School::find($schoolId);
            if ($school) return $school;
        }

        $defaultSchool = School::first();
        if ($defaultSchool) return $defaultSchool;

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
     * Resolve student or fallback to sample.
     */
    private function resolveStudent(?int $studentId = null): StudentDetails
    {
        if ($studentId) {
            $student = StudentDetails::with('school')->find($studentId);
            if ($student) return $student;
        }

        $defaultStudent = StudentDetails::with('school')->first();
        if ($defaultStudent) return $defaultStudent;

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
     * Render or download Fee Receipt.
     * GET /documents/fee-receipt/{id?}
     */
    public function feeReceipt(Request $request, $id = null)
    {
        $payment = null;
        if ($id) {
            $payment = MonthlyPayment::with(['student.school', 'items'])->find($id);
        }

        if ($payment && $payment->student) {
            $student = $payment->student;
            $school = $student->school ?? $this->resolveSchool($payment->school_id);
            $receiptNumber = 'REC-' . ($payment->created_at ? $payment->created_at->format('Y') : date('Y')) . '-' . str_pad($payment->id, 5, '0', STR_PAD_LEFT);
            $paymentDate = $payment->payment_date ? Carbon::parse($payment->payment_date)->format('d M, Y') : date('d M, Y');
            $paymentMode = $payment->mode ?? 'Online UPI';
            $monthName = $payment->month ?? date('F Y');

            $feeItems = [];
            if ($payment->items && $payment->items->count() > 0) {
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
                    ['name' => 'Monthly Composite Tuition Fee', 'due' => floatval($payment->total_amount), 'concession' => 0, 'paid' => floatval($payment->total_amount)]
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

        $isPdf = $request->query('download') === 'pdf';
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
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.fee-receipt', $data)->setPaper('a4', 'portrait');
            return $pdf->download("Fee-Receipt-{$receiptNumber}.pdf");
        }

        return view('documents.fee-receipt', $data);
    }

    /**
     * Render or download Admission Receipt.
     * GET /documents/admission-receipt/{studentId?}
     */
    public function admissionReceipt(Request $request, $studentId = null)
    {
        $student = $this->resolveStudent($studentId);
        $school = $this->resolveSchool($student->school_id);
        $admissionNumber = $student->roll_no ? 'ADM-2026-' . $student->roll_no : 'ADM-2026-104';

        $isPdf = $request->query('download') === 'pdf';
        $data = [
            'school' => $school,
            'student' => $student,
            'admissionNumber' => $admissionNumber,
            'session' => '2026-2027',
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.admission-receipt', $data)->setPaper('a4', 'portrait');
            return $pdf->download("Admission-Receipt-{$admissionNumber}.pdf");
        }

        return view('documents.admission-receipt', $data);
    }

    /**
     * Render or download Student Marksheet.
     * GET /documents/marksheet/{studentId?}
     */
    public function marksheet(Request $request, $studentId = null)
    {
        $student = $this->resolveStudent($studentId);
        $school = $this->resolveSchool($student->school_id);

        $examName = $request->query('exam') ?? 'Annual Examination - 2026';

        // Check if real exam marks exist
        $marksQuery = StudentExamMark::with('examSchedule.exam')
            ->where('student_details_id', $student->id)
            ->get();

        $marksList = null;
        if ($marksQuery->count() > 0) {
            $marksList = [];
            foreach ($marksQuery as $m) {
                $marksList[] = [
                    'subject' => $m->examSchedule->subject_name ?? 'Subject',
                    'max' => floatval($m->marks_total ?? 100),
                    'min' => 33,
                    'obtained' => floatval($m->marks_obtained ?? 0),
                    'grade' => $m->grade ?? ($m->marks_obtained >= 90 ? 'A1' : ($m->marks_obtained >= 80 ? 'A2' : 'B1')),
                ];
            }
        }

        $isPdf = $request->query('download') === 'pdf';
        $data = [
            'school' => $school,
            'student' => $student,
            'examName' => $examName,
            'session' => '2026-2027',
            'marksList' => $marksList,
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.marksheet', $data)->setPaper('a4', 'portrait');
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $pdf->download("Marksheet-{$safeName}.pdf");
        }

        return view('documents.marksheet', $data);
    }

    /**
     * Render or download Exam Admit Card.
     * GET /documents/admit-card/{studentId?}
     */
    public function admitCard(Request $request, $studentId = null)
    {
        $student = $this->resolveStudent($studentId);
        $school = $this->resolveSchool($student->school_id);

        $examName = $request->query('exam') ?? 'Annual Board Examination - 2026';

        // Check if schedules exist for this class
        $schedules = null;
        $dbSchedules = ExamSchedule::where('class_name', $student->class)->get();
        if ($dbSchedules->count() > 0) {
            $schedules = [];
            foreach ($dbSchedules as $sch) {
                $dateObj = Carbon::parse($sch->exam_date);
                $schedules[] = [
                    'date' => $dateObj->format('d M Y'),
                    'day' => $dateObj->format('l'),
                    'time' => $sch->start_time && $sch->end_time ? "{$sch->start_time} - {$sch->end_time}" : '09:00 AM - 12:00 PM',
                    'subject' => $sch->subject_name ?? 'Subject Paper',
                    'room' => $sch->room_number ?? 'Hall 101',
                ];
            }
        }

        $isPdf = $request->query('download') === 'pdf';
        $data = [
            'school' => $school,
            'student' => $student,
            'examName' => $examName,
            'examSchedules' => $schedules,
            'centerName' => 'Main Academic Block (Wing-A)',
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.admit-card', $data)->setPaper('a4', 'portrait');
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $pdf->download("AdmitCard-{$safeName}.pdf");
        }

        return view('documents.admit-card', $data);
    }

    /**
     * Render or download School Transfer Certificate.
     * GET /documents/transfer-certificate/{studentId?}
     */
    public function transferCertificate(Request $request, $studentId = null)
    {
        $student = $this->resolveStudent($studentId);
        $school = $this->resolveSchool($student->school_id);
        $tcNumber = 'TC/' . date('Y') . '/' . str_pad($student->id ?? 1, 4, '0', STR_PAD_LEFT);

        $isPdf = $request->query('download') === 'pdf';
        $data = [
            'school' => $school,
            'student' => $student,
            'tcNumber' => $tcNumber,
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.transfer-certificate', $data)->setPaper('a4', 'portrait');
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $pdf->download("TransferCertificate-{$safeName}.pdf");
        }

        return view('documents.transfer-certificate', $data);
    }

    /**
     * Render or download Student ID Card.
     * GET /documents/id-card/{studentId?}
     */
    public function idCard(Request $request, $studentId = null)
    {
        $student = $this->resolveStudent($studentId);
        $school = $this->resolveSchool($student->school_id);

        $isPdf = $request->query('download') === 'pdf';
        $data = [
            'school' => $school,
            'student' => $student,
            'session' => '2026-2027',
            'bloodGroup' => 'B+',
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.id-card', $data)->setPaper('a4', 'portrait');
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $pdf->download("IDCard-{$safeName}.pdf");
        }

        return view('documents.id-card', $data);
    }

    /**
     * Render or download Bonafide Certificate.
     * GET /documents/bonafide-certificate/{studentId?}
     */
    public function bonafideCertificate(Request $request, $studentId = null)
    {
        $student = $this->resolveStudent($studentId);
        $school = $this->resolveSchool($student->school_id);
        $refNumber = 'CERT/BONA/' . date('Y') . '/' . str_pad($student->id ?? 1, 4, '0', STR_PAD_LEFT);
        $purpose = $request->query('purpose') ?? 'Official Documentation / Passport / Academic Verification';

        $isPdf = $request->query('download') === 'pdf';
        $data = [
            'school' => $school,
            'student' => $student,
            'refNumber' => $refNumber,
            'purpose' => $purpose,
            'session' => '2026-2027',
            'isPdf' => $isPdf,
        ];

        if ($isPdf) {
            $pdf = Pdf::loadView('documents.bonafide-certificate', $data)->setPaper('a4', 'portrait');
            $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', $student->candidate_name ?? 'Student');
            return $pdf->download("BonafideCertificate-{$safeName}.pdf");
        }

        return view('documents.bonafide-certificate', $data);
    }
}
