<?php

namespace App\Services;

use App\Models\ExtraService;
use App\Models\FeeStructure;
use App\Models\MonthlyPayment;
use App\Models\MonthlyPayments;
use App\Models\ParentModel;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\SchoolSubject;
use App\Models\Student;
use App\Models\StudentDetails;
use App\Models\StudentService;
use App\Models\Teacher;
use App\Models\TeacherAttendanceRecord;
use App\Models\TeacherAttendanceSummary;
use App\Models\User;
use App\Repositories\ClassTimeTableRepository;
use App\Repositories\ExtraServiceRepository;
use App\Repositories\FeeStructureRepository;
use App\Repositories\MonthlyPaymentRepository;
use App\Repositories\SchoolBusRepository;
use App\Repositories\SchoolRepository;
use App\Repositories\SchoolFacilityRepository;
use App\Repositories\SchoolAchievementRepository;
use App\Repositories\SchoolTimingRepository;
use App\Repositories\SchoolSubjectRepository;
use App\Repositories\StudentServiceRepository;
use App\Repositories\StudentDetailsRepository;
use App\Repositories\StudentRepository;
use App\Repositories\TeacherRepository;
use App\Repositories\UserRepository;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Throwable;

use function PHPUnit\Framework\isEmpty;

class UserService
{
  protected StudentRepository $studentRepository;
  protected StudentDetailsRepository $studentDetailsRepository;
  protected UserRepository $userRepository;
  protected TeacherRepository $teacherRepository;
  protected FeeStructureRepository $feeStructureRepository;
  protected StudentServiceRepository $studentServiceRepository;
  protected MonthlyPaymentRepository $monthlyPaymentRepository;
  protected ExtraServiceRepository $extraServiceRepository;
  protected SchoolSubjectRepository $schoolSubjectRepository;
  protected ClassTimeTableRepository $classTimeTableRepository;
  protected SchoolBusRepository $schoolBusRepository;
  protected AuthService $authService;
  protected SchoolRepository $schoolRepository;
  protected SchoolFacilityRepository $schoolFacilityRepository;
  protected SchoolAchievementRepository $schoolAchievementRepository;
  protected SchoolTimingRepository $schoolTimingRepository;

  public function __construct(
    StudentRepository $studentRepository,
    StudentDetailsRepository $studentDetailsRepository,
    UserRepository $userRepository,
    TeacherRepository $teacherRepository,
    FeeStructureRepository $feeStructureRepository,
    StudentServiceRepository $studentServiceRepository,
    MonthlyPaymentRepository $monthlyPaymentRepository,
    ExtraServiceRepository $extraServiceRepository,
    SchoolSubjectRepository $schoolSubjectRepository,
    ClassTimeTableRepository $classTimeTableRepository,
    SchoolBusRepository $schoolBusRepository,
    SchoolRepository $schoolRepository,
    SchoolFacilityRepository $schoolFacilityRepository,
    SchoolAchievementRepository $schoolAchievementRepository,
    SchoolTimingRepository $schoolTimingRepository,
    AuthService $authService
  ) {
    $this->studentRepository = $studentRepository;
    $this->studentDetailsRepository = $studentDetailsRepository;
    $this->userRepository = $userRepository;
    $this->teacherRepository = $teacherRepository;
    $this->feeStructureRepository = $feeStructureRepository;
    $this->monthlyPaymentRepository = $monthlyPaymentRepository;
    $this->studentServiceRepository = $studentServiceRepository;
    $this->extraServiceRepository = $extraServiceRepository;
    $this->schoolSubjectRepository = $schoolSubjectRepository;
    $this->classTimeTableRepository = $classTimeTableRepository;
    $this->schoolBusRepository = $schoolBusRepository;
    $this->schoolRepository = $schoolRepository;
    $this->schoolFacilityRepository = $schoolFacilityRepository;
    $this->schoolAchievementRepository = $schoolAchievementRepository;
    $this->schoolTimingRepository = $schoolTimingRepository;

    $this->authService = $authService;
  }

  public function test(): array
  {
    return [
      'status' => true,
      'message' => 'Testing Success',
      'data' => null,
      'error' => null,
    ];
  }

  // ============================================================
  // ===============  STATISTICS  ===============================
  // ============================================================

  public function getStats($school_id): array
  {
    try {
      // Fetch stats
      $totalStudents = Student::where('school_id', $school_id)->count();
      $totalUsers    = User::where('school_id', $school_id)->count();
      $classCount    = SchoolClass::where('school_id', $school_id)
        ->where('status', 'active')
        ->count();
      $pendingDues   = MonthlyPayment::where('school_id', $school_id)
        ->where('status', 'due')
        ->sum('total_amount');

      return [
        'status' => true,
        'message' => ($totalStudents === 0 && $totalUsers === 0 && $classCount === 0 && $pendingDues === 0)
          ? 'No records found for this school.'
          : 'Statistics fetched successfully.',
        'data' => [
          'totalStudents' => $totalStudents ?? 0,
          'totalUsers'    => $totalUsers ?? 0,
          'pendingDues'   => $pendingDues ?? 0,
          'classCount'    => $classCount ?? 0,
        ],
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching stats for school_id {$school_id}: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching statistics.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching stats for school_id {$school_id}: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch statistics.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getPrincipalDashboardStats($school_id): array
  {
    try {
      // Comprehensive stats
      $totalStudents = Student::where('school_id', $school_id)->count();
      $totalUsers = User::where('school_id', $school_id)->count();
      $totalTeachers = Teacher::where('school_id', $school_id)->count();
      $totalParents = ParentModel::where('school_id', $school_id)->count();

      $classCount = SchoolClass::where('school_id', $school_id)
        ->where('status', 'active')
        ->count();

      $totalSubjects = SchoolSubject::where('school_id', $school_id)->count();

      $pendingDues = MonthlyPayment::where('school_id', $school_id)
        ->where('status', 'due')
        ->sum('total_amount');

      $paidAmount = MonthlyPayment::where('school_id', $school_id)
        ->where('status', 'paid')
        ->sum('total_amount');

      $totalRevenue = $paidAmount;

      // Get school info
      $school = School::find($school_id);

      return [
        'totalUsers' => $totalUsers ?? 0,
        'totalStudents' => $totalStudents ?? 0,
        'totalTeachers' => $totalTeachers ?? 0,
        'totalParents' => $totalParents ?? 0,
        'classCount' => $classCount ?? 0,
        'totalSubjects' => $totalSubjects ?? 0,
        'pendingDues' => round($pendingDues ?? 0, 2),
        'paidAmount' => round($paidAmount ?? 0, 2),
        'totalRevenue' => round($totalRevenue ?? 0, 2),
        'school' => $school,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching dashboard stats for school_id {$school_id}: " . $e->getMessage());
      return [];
    }
  }

  public function getRecentActivities($school_id): array
  {
    try {
      $activities = [];

      // Recent student registrations
      $recentStudents = Student::where('school_id', $school_id)
        ->orderBy('created_at', 'desc')
        ->limit(3)
        ->get()
        ->map(function ($student) {
          return [
            'type' => 'student_registration',
            'title' => "New student registered: {$student->candidate_name}",
            'time' => $student->created_at->diffForHumans(),
            'color' => 'bg-blue-600',
          ];
        });
      $activities = array_merge($activities, $recentStudents->toArray());

      // Recent fee payments
      $recentPayments = MonthlyPayment::where('school_id', $school_id)
        ->where('status', 'paid')
        ->orderBy('paid_date', 'desc')
        ->limit(3)
        ->get()
        ->map(function ($payment) {
          return [
            'type' => 'fee_payment',
            'title' => "Fee payment received: ₹{$payment->total_amount}",
            'time' => $payment->paid_date ? Carbon::parse($payment->paid_date)->diffForHumans() : 'Recently',
            'color' => 'bg-green-600',
          ];
        });
      $activities = array_merge($activities, $recentPayments->toArray());

      // Recent notices (you may need to add Notice model)
      // This is a placeholder - implement when you have the Notice model
      $activities[] = [
        'type' => 'notice',
        'title' => 'New notice published',
        'time' => '6 hours ago',
        'color' => 'bg-orange-600',
      ];

      // Sort by time
      usort($activities, function ($a, $b) {
        return strcmp($b['time'], $a['time']);
      });

      return array_slice($activities, 0, 5);
    } catch (Exception $e) {
      Log::error("Error fetching recent activities for school_id {$school_id}: " . $e->getMessage());
      return [];
    }
  }

  // ============================================================
  // ===============  STUDENT MANAGEMENT  =======================
  // ============================================================

  public function createStudentLoginCredential(array $data, $school_id): array
  {
    try {
      // Defensive: ensure required fields present
      if (empty($data['email']) || empty($data['candidate_name']) || empty($data['class'])) {
        return [
          'status' => false,
          'message' => 'Missing required data: email, candidate_name and class are required.',
          'data' => null,
          'error' => null,
        ];
      }

      // Accept class as object or array; normalize to (int) id and (string) class value
      $classId = null;
      $classValue = null;
      if (is_object($data['class'])) {
        $classId = $data['class']->id ?? null;
        $classValue = $data['class']->class ?? null;
      } elseif (is_array($data['class'])) {
        $classId = $data['class']['id'] ?? null;
        $classValue = $data['class']['class'] ?? null;
      } elseif (is_numeric($data['class'])) {
        $classId = (int) $data['class']; // fallback: if client only sent class id
      }

      if (empty($classId) && empty($classValue)) {
        return [
          'status' => false,
          'message' => 'Invalid class payload. Provide class as object with id and class fields or at least id.',
          'data' => null,
          'error' => null,
        ];
      }

      // Load class record (ModelNotFoundException if not found)
      $class = SchoolClass::where('school_id', $school_id)
        ->when($classId, fn($q) => $q->where('id', $classId))
        ->when(!$classId && $classValue, fn($q) => $q->where('class', $classValue))
        ->first();

      if (!$class) {
        throw new ModelNotFoundException("Class not found in school ID {$school_id}.");
      }

      // Check for existing student by school + email + class (defensive check before attempt to create)
      $existingStudent = Student::where('school_id', $school_id)
        ->where('email', $data['email'])
        ->where(function ($q) use ($class) {
          // Many of your models stored `class` as class string; adapt accordingly
          $q->where('class', $class->class)
            ->orWhere('id', $class->id);
        })
        ->first();

      if ($existingStudent) {
        return [
          'status' => false,
          'message' => 'Student with this email already exists in the specified class.',
          'data' => $existingStudent,
          'error' => null,
        ];
      }

      // Start DB transaction for the create operation
      DB::beginTransaction();

      try {
        $plainPassword = $data['candidate_name'] . '2026';
        Log::info("Generated default password for student creation (email={$data['email']}).");

        $studentPayload = [
          'school_id' => $school_id,
          'username' => trim($data['candidate_name']),
          'password' => bcrypt($plainPassword),
          // store both class (string) and class_id if your schema supports it
          'class' => $class->class,
          'email' => $data['email'],
          'created_at' => now(),
          'updated_at' => now(),
        ];

        $student = $this->studentRepository->create($studentPayload);

        if (!$student) {
          // rollback and give a helpful message
          DB::rollBack();
          return [
            'status' => false,
            'message' => 'Failed to create student login credentials. No record persisted.',
            'data' => null,
            'error' => null,
          ];
        }

        // Commit DB changes now that creation succeeded
        DB::commit();
      } catch (QueryException $qe) {
        DB::rollBack();

        // Detect duplicate (unique constraint) errors from MySQL (error code 1062)
        $driverErrNo = $qe->errorInfo[1] ?? null;
        $driverMessage = $qe->getMessage();

        if ($driverErrNo === 1062) {
          // Duplicate entry — try to parse index name for clarity
          if (preg_match("/for key '(.+?)'/", $driverMessage, $m)) {
            $indexName = $m[1];
            $friendly = "Duplicate entry detected (index: {$indexName}).";
          } else {
            $friendly = "Duplicate entry detected (unique constraint).";
          }

          Log::warning("Duplicate error creating student: {$driverMessage}");
          return [
            'status' => false,
            'message' => $friendly,
            'data' => null,
            'error' => $driverMessage, // keep raw message in error for debugging; you may null this in prod
          ];
        }

        // Other DB errors
        Log::error("DB error creating student login credential: {$driverMessage}");
        return [
          'status' => false,
          'message' => 'Database error while creating student.',
          'data' => null,
          'error' => $driverMessage,
        ];
      } catch (Exception $e) {
        DB::rollBack();
        Log::error("Unexpected error during student creation: " . $e->getMessage());
        return [
          'status' => false,
          'message' => 'Failed to create student login credentials due to an internal error.',
          'data' => null,
          'error' => $e->getMessage(),
        ];
      }

      // Success: attach plain password for immediate response (only if you want)
      $student->plain_password = $plainPassword;

      return [
        'status' => true,
        'message' => 'Student login credentials created successfully.',
        'data' => $student,
        'error' => null,
      ];
    } catch (ModelNotFoundException $mnfe) {
      Log::warning("Model not found: " . $mnfe->getMessage());
      return [
        'status' => false,
        'message' => $mnfe->getMessage(),
        'data' => null,
        'error' => null,
      ];
    } catch (Exception $e) {
      // catch-all (should be rare due to inner try/catches)
      Log::error("Unhandled error creating student credential: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while creating the student.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function registerStudentDetails(array $data, $id, $school_id): array
  {
    try {
      // ✅ Step 1: Validate class existence
      $class = SchoolClass::where('school_id', $school_id)
        ->where('id', $data['class']['id'] ?? null)
        ->first();

      if (!$class) {
        Log::warning("Class not found", [
          'school_id' => $school_id,
          'class_id' => $data['class']['id'] ?? null,
        ]);

        return [
          'status' => false,
          'message' => "Class not found for the given school.",
          'data' => null,
          'error' => "Class ID {$data['class']['id']} not found in school {$school_id}.",
        ];
      }

      // ✅ Step 2: Check duplicate student email or aadhar (extra safety)
      $duplicate = StudentDetails::where('school_id', $school_id)
        ->where(function ($q) use ($data) {
          $q->where('email', $data['email'])
            ->orWhere('addhar', $data['addhar']);
        })
        ->exists();

      if ($duplicate) {
        Log::info("Duplicate student found", [
          'email' => $data['email'],
          'addhar' => $data['addhar'],
          'school_id' => $school_id,
        ]);

        return [
          'status' => false,
          'message' => 'Duplicate entry: Student with same email or Aadhar already exists.',
          'data' => null,
          'error' => 'Duplicate entry detected.',
        ];
      }

      // ✅ Step 3: Create record safely within transaction
      $studentDetails = DB::transaction(function () use ($data, $id, $school_id, $class) {
        return $this->studentDetailsRepository->create([
          'school_id' => $school_id,
          'student_id' => $id,
          'candidate_name' => $data['candidate_name'],
          'gender' => $data['gender'],
          'addhar' => $data['addhar'] ?? null,
          'dob' => $data['dob'],
          'class' => $class->class,
          'section' => $class->section,
          'roll_no' => $data['roll_no'] ?? null,
          'email' => $data['email'],
          'father_name' => $data['father_name'],
          'mother_name' => $data['mother_name'],
          'phone' => $data['phone'],
          'address' => $data['address'],
          'created_at' => now(),
          'updated_at' => now(),
        ]);
      });

      // ✅ Step 4: Handle unexpected transaction failure
      if (!$studentDetails) {
        Log::error("Transaction failed: studentDetails returned null", [
          'student_id' => $id,
          'school_id' => $school_id,
        ]);

        return [
          'status' => false,
          'message' => 'Failed to register student details due to transaction error.',
          'data' => null,
          'error' => 'Transaction returned null result.',
        ];
      }

      // ✅ Step 5: Success response
      return [
        'status' => true,
        'message' => 'Student details registered successfully.',
        'data' => $studentDetails,
        'error' => null,
      ];
    } catch (QueryException $e) {
      // Database-level failure
      Log::error("DB error registering student details", [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return [
        'status' => false,
        'message' => 'Database error while registering student details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (ModelNotFoundException $e) {
      // Invalid model reference (class, etc.)
      Log::warning("Model not found exception", [
        'error' => $e->getMessage(),
      ]);

      return [
        'status' => false,
        'message' => 'Related model not found.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      // Any other error
      Log::error("Unexpected error registering student details", [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return [
        'status' => false,
        'message' => 'Failed to register student details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getParentDetails($data): array
  {
    try {
      $query = ParentModel::query();

      // school_id is mandatory as per your logic
      if (!isset($data['school_id'])) {
        return [
          'status' => false,
          'message' => 'School ID is required.',
          'data' => null,
          'error' => 'Missing school_id in request.',
        ];
      }

      $query->where('school_id', $data['school_id']);

      // Apply filters if available
      if (!empty($data['email'])) {
        $query->where('email', $data['email']);
      }

      if (!empty($data['phone'])) {
        $query->where('phone', $data['phone']);
      }

      // Get all matches or just the first (based on your need)
      $parents = $query->get();

      if ($parents->isEmpty()) {
        return [
          'status' => false,
          'message' => 'No parent records found.',
          'data' => [],
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Parent details fetched successfully.',
        'data' => $parents,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching parent details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching parent details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching parent details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch parent details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function registerParentDetails(array $data, int $schoolId): array
  {
    try {
      $parent = null;
      $school = School::find($schoolId);
      $parentRegistered = ParentModel::where('school_id', $schoolId)
        ->where('father_name', $data['father_name'])
        ->where('mother_name', $data['mother_name'])
        ->first();

      if (isEmpty($parentRegistered)) {
        $plainPassword = $data['father_name'] . '2026';
        $HashedPassword = Hash::make($plainPassword);

        $parent = ParentModel::create([
          'school_id' => $schoolId,
          'father_name' => $data['father_name'],
          'mother_name' => $data['mother_name'],
          'phone' => $data['phone'],
          'email' => $data['parent_email'] ?? null,
          'password' => $HashedPassword,
          'address' => $data['address'] ?? null,
        ]);

        if (!empty($parent)) {

          StudentDetails::where('school_id', $schoolId)
            ->where('father_name', $data['father_name'])
            ->where('mother_name', $data['mother_name'])
            ->update(['parent_id' => $parent->id]);

          $message = <<<EOT
Dear {$data['candidate_name']},

🎉 Welcome to {$school->school_name}!

Your registration has been successfully completed.

Here are your login credentials:

📧 Email: {$parent->email}
🔑 Password: {$plainPassword}  (Please change after first login)

Best Regards,
Eklavya School
EOT;

          try {
            Mail::raw($message, function ($mail) use ($parent) {
              $mail->to($parent->email)
                ->subject('Welcome to Eklavya School – Login Credentials');
            });
          } catch (TransportExceptionInterface $e) {
            Log::error("Email sending failed for parent: " . $e->getMessage());
            return [
              'status' => false,
              'message' => 'Parent created but failed to send email.',
              'data' => $parent,
              'error' => $e->getMessage(),
            ];
          }
        }
      } else if (!isEmpty($parentRegistered)) {

        StudentDetails::where('school_id', $schoolId)
          ->where('father_name', $data['father_name'])
          ->where('mother_name', $data['mother_name'])
          ->update(['parent_id' => $parentRegistered->id]);
      }

      return [
        'status' => true,
        'message' => 'Parent registered successfully',
        'data' => $parent,
        'error' => null,
      ];
    } catch (Exception $e) {
      return [
        'status' => false,
        'message' => 'Parent registration failed',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateStudentDetails(int $studentId, array $data, $school_id): array
  {
    try {
      $student = $this->studentDetailsRepository->findById($studentId);

      if (!$student) {
        return [
          'status' => false,
          'message' => 'Student not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $updatableFields = [
        'candidate_name',
        'gender',
        'addhar',
        'dob',
        'class',
        'section',
        'roll_no',
        'email',
        'father_name',
        'mother_name',
        'phone',
        'address',
        'admission_date',
      ];

      $updateData = array_intersect_key($data, array_flip($updatableFields));

      if (empty($updateData)) {
        return [
          'status' => true,
          'message' => 'No fields updated.',
          'data' => $student,
          'error' => null,
        ];
      }

      $updateData['updated_at'] = now();

      $updated = $this->studentDetailsRepository->update($studentId, $updateData);

      return [
        'status' => true,
        'message' => 'Student details updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating student details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating student details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating student details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update student details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getAllStudentDetails($school_id): array
  {
    try {
      $studentDetails = StudentDetails::where('school_id', $school_id)->get();
      return [
        'status' => true,
        'message' => 'Student details fetched successfully.',
        'data' => $studentDetails,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching student details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching student details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching student details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch student details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getStudentMoreDetails($student_details_id): array
  {
    try {
      // Removed 'attendanceSummary' as the table doesn't exist
      // Use attendanceRecords() relationship if attendance data is needed
      $studentDetails = StudentDetails::with(['monthlyPayments', 'onlineTransactions', 'extraServices'])
        ->where('id', $student_details_id)
        ->first();

      if (!$studentDetails) {
        return [
          'status' => false,
          'message' => 'Student details not found.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Student more details fetched successfully.',
        'data' => $studentDetails,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching student more details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching student more details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching student more details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch student more details.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  USER MANAGEMENT  ==========================
  // ============================================================

  public function registerUser(array $data, $school_id): array
  {
    try {
      $user = DB::transaction(function () use ($data, $school_id) {
        $school = School::find($school_id);
        $plainPassword = $data['password'] ?? ($data['full_name'] . '2026');

        $user = $this->userRepository->create([
          'school_id' => $school ? $school->id : null,
          'full_name' => $data['full_name'],
          'username' => $data['username'],
          'email' => $data['email'],
          'password' => Hash::make($plainPassword),
          'phone' => $data['phone'] ?? null,
          'status' => 'active',
          'role' => $data['role'],
          'created_at' => now(),
          'updated_at' => now(),
        ]);

        // send email
        $message = "Hello {$user->username},\n\n" .
          "Welcome to {$school->name}. Your account has been created successfully.\n\n" .
          "Here are your login details:\n" .
          "Email: {$user->email}\n" .
          "Password: {$plainPassword}\n\n" .
          "You can login here: " . url('/login') . "\n\n" .
          "Thanks,\n" . config('app.name');

        try {
          Mail::raw($message, function ($mail) use ($user) {
            $mail->to($user->email)
              ->subject('Welcome to Our Platform');
          });
        } catch (Exception $e) {
          Log::warning("Failed to send welcome email to {$user->email}: " . $e->getMessage());
        }

        // Convert to array for response (not persisted)
        $userArray = $user->toArray();
        unset($userArray['password']);
        unset($userArray['otp']);
        unset($userArray['verification_token']);
        $userArray['plain_password'] = $plainPassword;

        return $userArray;
      });

      return [
        'status' => true,
        'message' => 'User registered successfully.',
        'data' => $user,
        'error' => null,
      ];
    } catch (TransportExceptionInterface $e) {
      Log::error("Mail error registering user: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'User created but failed to send email.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (QueryException $e) {
      Log::error("DB error registering user: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while registering user.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error registering user: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to register user.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateUser(array $data, $allowSelfUpdate = false): array
  {
    try {
      $user = User::find($data['id']);

      if (!$user) {
        return [
          'status' => false,
          'message' => 'User not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Prevent updating administrator accounts (unless it's a self-update)
      if ($user->role === 'administrator' && !$allowSelfUpdate) {
        return [
          'status' => false,
          'message' => 'Cannot update administrator details. Administrators can only be managed by super admin.',
          'data' => null,
          'error' => null,
        ];
      }

      $updatableFields = ['full_name', 'username', 'email', 'phone'];
      // Only allow role update if it's not a self-update
      if (!$allowSelfUpdate) {
        $updatableFields[] = 'role';
      }
      $updateData = array_intersect_key($data, array_flip($updatableFields));

      if (empty($updateData)) {
        return [
          'status' => true,
          'message' => 'No fields updated.',
          'data' => $user,
          'error' => null,
        ];
      }

      $updateData['updated_at'] = now();
      $updated = $this->userRepository->update($user->id, $updateData);

      // Prepare response data (exclude sensitive fields)
      $responseData = [
        'id' => $updated->id,
        'full_name' => $updated->full_name,
        'username' => $updated->username,
        'email' => $updated->email,
        'phone' => $updated->phone,
        'role' => $updated->role,
        'status' => $updated->status,
        'school_id' => $updated->school_id,
        'updated_at' => $updated->updated_at,
      ];

      return [
        'status' => true,
        'message' => 'User updated successfully.',
        'data' => $responseData,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating user: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating user.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating user: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update user.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function toggleUserStatus(int $userId): array
  {
    try {
      $user = User::find($userId);

      if (!$user) {
        return [
          'status' => false,
          'message' => 'User not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Prevent toggling administrator account status
      if ($user->role === 'administrator') {
        return [
          'status' => false,
          'message' => 'Cannot modify administrator status. Administrators can only be managed by super admin.',
          'data' => null,
          'error' => null,
        ];
      }

      $newStatus = $user->status === 'active' ? 'inactive' : 'active';
      $this->userRepository->update($userId, ['status' => $newStatus, 'updated_at' => now()]);

      Log::info("User ID {$userId} status changed to {$newStatus}");

      return [
        'status' => true,
        'message' => 'User status updated successfully.',
        'data' => ['status' => $newStatus],
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error toggling user status: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while toggling user status.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error toggling user status: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to toggle user status.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getAllUsers($school_id): array
  {
    try {
      // Get all users with their related data
      $users = User::where('school_id', $school_id)
        ->select([
          'id',
          'username',
          'email',
          'phone',
          'role',
          'status',
          'assignment_status',
          'registration_status',
          'email_verified',
          'school_setup_completed',
          'subscription_active',
          'created_at',
          'updated_at',
        ])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($user) {
          /** @var \App\Models\User $user */
          $userArray = $user->toArray();
          return $userArray;
        });

      return [
        'status' => true,
        'message' => 'Users fetched successfully.',
        'data' => $users,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching users: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching users.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching users: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch users.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }


  // ============================================================
  // ===============  SCHOOL MANAGEMENT  ========================
  // ============================================================

  public function registerSchool(array $data): array
  {
    try {
      // Handle logo upload if provided
      if (isset($data['logo_file']) && $data['logo_file']) {
        $logoPath = $this->uploadSchoolFile($data['logo_file'], 'school_logos');
        $data['logo_path'] = $logoPath;
      }

      // Handle principal signature upload if provided
      if (isset($data['principal_sign_file']) && $data['principal_sign_file']) {
        $signPath = $this->uploadSchoolFile($data['principal_sign_file'], 'principal_signatures');
        $data['principal_sign_path'] = $signPath;
      }

      // Generate unique school code if not provided
      if (empty($data['school_code'])) {
        $data['school_code'] = $this->generateSchoolCode($data['name']);
      }

      // Validate administrator_id is provided
      if (empty($data['administrator_id'])) {
        return [
          'status' => false,
          'message' => 'Administrator ID is required to create a school.',
          'data' => null,
          'error' => 'Missing administrator_id',
        ];
      }

      // Verify administrator exists and is active
      $administrator = User::where('id', $data['administrator_id'])
        ->where('role', 'administrator')
        ->where('status', 'active')
        ->first();

      if (!$administrator) {
        return [
          'status' => false,
          'message' => 'Invalid or inactive administrator.',
          'data' => null,
          'error' => 'Administrator not found or inactive',
        ];
      }

      $school = $this->schoolRepository->create([
        'user_id' => $data['user_id'] ?? null,
        'administrator_id' => $data['administrator_id'], // Required field
        'name' => $data['name'],
        'email' => $data['email'] ?? null,
        'phone' => $data['phone'] ?? null,
        'address' => $data['address'] ?? null,
        'city' => $data['city'] ?? null,
        'state' => $data['state'] ?? null,
        'country' => $data['country'] ?? null,
        'pincode' => $data['pincode'] ?? null,
        'logo_path' => $data['logo_path'] ?? null,
        'principal_sign_path' => $data['principal_sign_path'] ?? null,
        'principal_name' => $data['principal_name'] ?? null,
        'principal_phone' => $data['principal_phone'] ?? null,
        'principal_email' => $data['principal_email'] ?? null,
        'affiliation_number' => $data['affiliation_number'] ?? null,
        'board' => $data['board'] ?? null,
        'website' => $data['website'] ?? null,
        'description' => $data['description'] ?? null,
        'established_date' => $data['established_date'] ?? null,
        'school_code' => $data['school_code'],
        'status' => $data['status'] ?? 'active',
      ]);

      return [
        'status' => true,
        'message' => 'School registered successfully.',
        'data' => $school,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error registering school: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while registering school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error registering school: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to register school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchool(int $id, array $data, ?int $administratorId = null): array
  {
    try {
      $school = $this->schoolRepository->findById($id);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Verify ownership for administrators
      if ($administratorId && $school->administrator_id != $administratorId) {
        return [
          'status' => false,
          'message' => 'Unauthorized. You can only manage your own schools.',
          'data' => null,
          'error' => null,
        ];
      }

      // Handle logo upload if provided
      if (isset($data['logo_file']) && $data['logo_file']) {
        $logoPath = $this->uploadSchoolFile($data['logo_file'], 'school_logos');
        $data['logo_path'] = $logoPath;

        // Delete old logo if exists
        if ($school->logo_path && file_exists(public_path($school->logo_path))) {
          unlink(public_path($school->logo_path));
        }
      }

      // Handle principal signature upload if provided
      if (isset($data['principal_sign_file']) && $data['principal_sign_file']) {
        $signPath = $this->uploadSchoolFile($data['principal_sign_file'], 'principal_signatures');
        $data['principal_sign_path'] = $signPath;

        // Delete old signature if exists
        if ($school->principal_sign_path && file_exists(public_path($school->principal_sign_path))) {
          unlink(public_path($school->principal_sign_path));
        }
      }

      // Validate school code uniqueness if being updated
      if (isset($data['school_code']) && $data['school_code'] !== $school->school_code) {
        if ($this->schoolRepository->schoolCodeExists($data['school_code'], $id)) {
          return [
            'status' => false,
            'message' => 'School code already exists.',
            'data' => null,
            'error' => null,
          ];
        }
      }

      $updatedSchool = $this->schoolRepository->update($id, $data);

      return [
        'status' => true,
        'message' => 'School updated successfully.',
        'data' => $updatedSchool,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating school: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating school: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getSchoolById(int $id, ?int $administratorId = null): array
  {
    try {
      $school = $this->schoolRepository->findById($id);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Verify ownership for administrators
      if ($administratorId && $school->administrator_id != $administratorId) {
        return [
          'status' => false,
          'message' => 'Unauthorized. You can only access your own schools.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'School fetched successfully.',
        'data' => $school,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching school: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getSchoolByCode(string $schoolCode): array
  {
    try {
      $school = $this->schoolRepository->findBySchoolCode($schoolCode);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'School fetched successfully.',
        'data' => $school,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching school by code: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getAllSchools(array $filters = [], ?int $administratorId = null): array
  {
    try {
      // For administrators, filter by their ID
      if ($administratorId) {
        $filters['administrator_id'] = $administratorId;
      }

      $schools = $this->schoolRepository->getAll($filters);

      return [
        'status' => true,
        'message' => 'Schools fetched successfully.',
        'data' => $schools,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching schools: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch schools.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getPaginatedSchools(int $perPage = 15, array $filters = [], ?int $administratorId = null): array
  {
    try {
      // For administrators, filter by their ID
      if ($administratorId) {
        $filters['administrator_id'] = $administratorId;
      }

      $schools = $this->schoolRepository->getPaginated($perPage, $filters);

      return [
        'status' => true,
        'message' => 'Schools fetched successfully.',
        'data' => $schools,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching paginated schools: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch schools.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteSchool(int $id, ?int $administratorId = null): array
  {
    try {
      $school = $this->schoolRepository->findById($id);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Verify ownership for administrators
      if ($administratorId && $school->administrator_id != $administratorId) {
        return [
          'status' => false,
          'message' => 'Unauthorized. You can only delete your own schools.',
          'data' => null,
          'error' => null,
        ];
      }

      // Delete associated files
      if ($school->logo_path && file_exists(public_path($school->logo_path))) {
        unlink(public_path($school->logo_path));
      }
      if ($school->principal_sign_path && file_exists(public_path($school->principal_sign_path))) {
        unlink(public_path($school->principal_sign_path));
      }

      $deleted = $this->schoolRepository->delete($id);

      if (!$deleted) {
        return [
          'status' => false,
          'message' => 'Failed to delete school.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'School deleted successfully.',
        'data' => null,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error deleting school: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete school.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchoolLogo(int $id, $logoFile, ?int $administratorId = null): array
  {
    try {
      $school = $this->schoolRepository->findById($id);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Verify ownership for administrators
      if ($administratorId && $school->administrator_id != $administratorId) {
        return [
          'status' => false,
          'message' => 'Unauthorized. You can only update your own schools.',
          'data' => null,
          'error' => null,
        ];
      }

      $logoPath = $this->uploadSchoolFile($logoFile, 'school_logos');

      // Delete old logo if exists
      if ($school->logo_path && file_exists(public_path($school->logo_path))) {
        unlink(public_path($school->logo_path));
      }

      $updatedSchool = $this->schoolRepository->updateLogo($id, $logoPath);

      return [
        'status' => true,
        'message' => 'School logo updated successfully.',
        'data' => $updatedSchool,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error updating school logo: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update school logo.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updatePrincipalSignature(int $id, $signatureFile, ?int $administratorId = null): array
  {
    try {
      $school = $this->schoolRepository->findById($id);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Verify ownership for administrators
      if ($administratorId && $school->administrator_id != $administratorId) {
        return [
          'status' => false,
          'message' => 'Unauthorized. You can only update your own schools.',
          'data' => null,
          'error' => null,
        ];
      }

      $signaturePath = $this->uploadSchoolFile($signatureFile, 'principal_signatures');

      // Delete old signature if exists
      if ($school->principal_sign_path && file_exists(public_path($school->principal_sign_path))) {
        unlink(public_path($school->principal_sign_path));
      }

      $updatedSchool = $this->schoolRepository->updatePrincipalSignature($id, $signaturePath);

      return [
        'status' => true,
        'message' => 'Principal signature updated successfully.',
        'data' => $updatedSchool,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error updating principal signature: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update principal signature.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getActiveSchools(?int $administratorId = null): array
  {
    try {
      // For administrators, filter by their ID
      $filters = ['status' => 'active'];
      if ($administratorId) {
        $filters['administrator_id'] = $administratorId;
      }

      $schools = $this->schoolRepository->getAll($filters);

      return [
        'status' => true,
        'message' => 'Active schools fetched successfully.',
        'data' => $schools,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching active schools: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch active schools.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Helper method to upload school-related files
   */
  private function uploadSchoolFile($file, string $folder): string
  {
    $date = now()->format('Ymd_His');
    $extension = $file->getClientOriginalExtension();
    $filename = $folder . '_' . $date . '_' . uniqid() . '.' . $extension;

    // Store in storage/app/public/{folder}
    $path = $file->storeAs($folder, $filename, 'public');

    if (!$path) {
      throw new Exception('File upload failed.');
    }

    return 'storage/' . $path; // public path
  }

  /**
   * Helper method to generate unique school code
   */
  private function generateSchoolCode(string $schoolName): string
  {
    // Generate code from school name
    $words = explode(' ', strtoupper($schoolName));
    $code = '';

    foreach ($words as $word) {
      if (strlen($word) > 0) {
        $code .= substr($word, 0, 1);
      }
      if (strlen($code) >= 3) {
        break;
      }
    }

    // Pad if needed
    $code = str_pad($code, 3, 'X');

    // Add random numbers
    $code .= rand(1000, 9999);

    // Check if exists, regenerate if needed
    $counter = 0;
    while ($this->schoolRepository->schoolCodeExists($code) && $counter < 10) {
      $code = substr($code, 0, 3) . rand(1000, 9999);
      $counter++;
    }

    return $code;
  }
  // ============================================================
  // ===============  FEE STRUCTURE MANAGEMENT  =================
  // ============================================================

  public function createFeeStructure(array $data): array
  {
    try {
      $class = SchoolClass::where('school_id', $data['school_id'])
        ->where('class', $data['class'])
        ->exists();

      if (!$class) {
        return [
          'status' => false,
          'message' => 'Please Create Class ' . $data['class'] . '.',
          'data' => null,
          'error' => null,
        ];
      }
      $fee = $this->feeStructureRepository->create(
        [
          'school_id' => $data['school_id'],
          'class' => $data['class'],
          'monthly_fee' => $data['monthly_fee'] ?? 0,
          'other_fee' => $data['other_fee'] ?? 0,
          'registration_fee' => $data['registration_fee'] ?? 0,
          'admission_fee' => $data['admission_fee'] ?? 0,
          'created_at' => now(),
          'updated_at' => now(),
        ]
      );
      return [
        'status' => true,
        'message' => 'Fee structure created successfully.',
        'data' => $fee,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error creating fee structure: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while creating fee structure.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error creating fee structure: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create fee structure.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getAllFeeStructure($school_id): array
  {
    try {
      $list = FeeStructure::where('school_id', $school_id)->get();
      return [
        'status' => true,
        'message' => 'Fee structures fetched successfully.',
        'data' => $list,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching fee structures: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching fee structures.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching fee structures: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch fee structures.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteFeeStructure(int $id): array
  {
    try {
      $feeStructure = $this->feeStructureRepository->findById($id);

      if (!$feeStructure) {
        return [
          'status' => false,
          'message' => 'Fee structure not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $this->feeStructureRepository->delete($id);

      return [
        'status' => true,
        'message' => 'Fee structure deleted successfully.',
        'data' => $feeStructure,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error deleting fee structure: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while deleting fee structure.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error deleting fee structure: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete fee structure.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateFeeStructure(array $data, $school_id): array
  {
    try {
      $class = SchoolClass::where('school_id', $data['school_id'])
        ->where('class', $data['class'])
        ->exists();

      if (!$class) {
        return [
          'status' => false,
          'message' => 'Please Create Class ' . $data['class'] . '.',
          'data' => null,
          'error' => null,
        ];
      }
      $feeStructure = $this->feeStructureRepository->findById($data['id']);


      if (!$feeStructure || $feeStructure->school_id != $school_id) {
        return [
          'status' => false,
          'message' => 'Fee structure not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $updatableFields = ['class', 'monthly_fee', 'other_fee', 'registration_fee', 'admission_fee'];
      $updateData = array_intersect_key($data, array_flip($updatableFields));

      if (empty($updateData)) {
        return [
          'status' => true,
          'message' => 'No fields updated.',
          'data' => $feeStructure,
          'error' => null,
        ];
      }

      $updateData['updated_at'] = now();
      $updated = $this->feeStructureRepository->update($feeStructure->id, $updateData);
      return [
        'status' => true,
        'message' => 'Fee structure updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating fee structure: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating fee structure.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating fee structure: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update fee structure.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  SERVICE CHARGE MANAGEMENT =================
  // ============================================================

  public function createServiceCharge(array $data, $school_id): array
  {
    $serviceExists = StudentService::where('school_id', $school_id)
      ->where('service_name', $data['service_name'])
      ->exists();

    if ($serviceExists) {
      return [
        'status' => false,
        'message' => 'Service with this name already exists.',
        'data' => null,
        'error' => null,
      ];
    }

    try {
      $service = $this->studentServiceRepository->create([
        'school_id' => $school_id,
        'service_type' => $data['service_type'],
        'service_name' => $data['service_name'],
        'charge' => $data['charge'],
        'description' => $data['description'] ?? null,
        'stopage' => $data['stopage'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
      ]);

      return [
        'status' => true,
        'message' => 'Service created successfully.',
        'data' => $service,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error creating service: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while creating service.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error creating service: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create transport fee.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateServiceCharge(array $data): array
  {
    try {
      $record = $this->studentServiceRepository->findById($data['id']);

      if (!$record) {
        return [
          'status' => false,
          'message' => 'Transport fee record not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $updatableFields = ['service_name', 'charge', 'description', 'stopage'];
      $updateData = array_intersect_key($data, array_flip($updatableFields));

      if (empty($updateData)) {
        return [
          'status' => true,
          'message' => 'No fields updated.',
          'data' => $record,
          'error' => null,
        ];
      }

      $updateData['updated_at'] = now();
      $updated = $this->studentServiceRepository->update($record->id, $updateData);

      return [
        'status' => true,
        'message' => 'Transport fee updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating transport fee: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating transport fee.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating transport fee: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update transport fee.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getServiceCharge($school_id): array
  {
    try {
      $list = StudentService::where('school_id', $school_id)->get();
      return [
        'status' => true,
        'message' => 'Service charges fetched successfully.',
        'data' => $list,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching service charges: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching service charges.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching service charges: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch service charges.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteServiceCharge(int $id): array
  {
    try {
      $transportFee = $this->studentServiceRepository->findById($id);

      if (!$transportFee) {
        return [
          'status' => false,
          'message' => 'Transport fee record not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $this->studentServiceRepository->delete($id);

      return [
        'status' => true,
        'message' => 'Transport fee deleted successfully.',
        'data' => $transportFee,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error deleting transport fee: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while deleting transport fee.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error deleting transport fee: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete transport fee.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // public function getAllServiceCharges(): array
  // {
  //   try {
  //     $list = $this->studentServiceRepository->getAll();
  //     return [
  //       'status' => true,
  //       'message' => 'Service charges retrieved successfully.',
  //       'data' => $list,
  //       'error' => null,
  //     ];
  //   } catch (QueryException $e) {
  //     Log::error("DB error fetching all service charges: " . $e->getMessage());
  //     return [
  //       'status' => false,
  //       'message' => 'Database error while fetching service charges.',
  //       'data' => null,
  //       'error' => $e->getMessage(),
  //     ];
  //   } catch (Exception $e) {
  //     Log::error("Error fetching all service charges: " . $e->getMessage());
  //     return [
  //       'status' => false,
  //       'message' => 'Failed to fetch service charges.',
  //       'data' => null,
  //       'error' => $e->getMessage(),
  //     ];
  //   }
  // }


  public function updateStudentService(array $data): array
  {
    try {
      $studentDetailsId = $data['student_details_id'] ?? null;
      $schoolId = $data['school_id'] ?? null;
      $services = $data['services'] ?? [];

      if (!$studentDetailsId || !$schoolId) {
        return [
          'status' => false,
          'message' => 'Student details ID and school ID are required.',
          'data' => null,
          'error' => null,
        ];
      }

      $studentDetails = $this->studentDetailsRepository->findById($studentDetailsId);

      if (!$studentDetails) {
        return [
          'status' => false,
          'message' => 'Student details not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Validate services against available ones in the school
      $validServiceIds = StudentService::where('school_id', $schoolId)->pluck('id')->toArray();
      $filteredServices = array_intersect($services, $validServiceIds);

      if (empty($filteredServices)) {
        return [
          'status' => false,
          'message' => 'No valid services provided.',
          'data' => null,
          'error' => null,
        ];
      }

      // Sync student services via ExtraService (pivot table)
      // Assuming ExtraService has: id, student_details_id, service_id, school_id
      ExtraService::where('student_details_id', $studentDetailsId)
        ->where('school_id', $schoolId)
        ->delete();

      $insertData = [];
      foreach ($filteredServices as $serviceId) {
        $insertData[] = [
          'student_details_id' => $studentDetailsId,
          'service_id' => $serviceId,
          'school_id' => $schoolId,
          'created_at' => now(),
          'updated_at' => now(),
        ];
      }

      if (!empty($insertData)) {
        ExtraService::insert($insertData);
      }

      return [
        'status' => true,
        'message' => 'Student services updated successfully.',
        'data' => $filteredServices,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating student service: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating student service.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating student service: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update student service.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getStudentDetailsServices($school_id): array
  {
    try {
      $data = $this->studentDetailsRepository->getAllStudentsWithServices($school_id);

      return [
        'status' => true,
        'message' => 'Student details with services fetched successfully.',
        'data' => $data,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching student details services: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching student details services.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching student details services: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch student details services.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  MONTHLY PAYMENTS  =========================
  // ============================================================

  public function getAllPaymentsWithStudentInfo($school_id): array
  {
    try {
      $data = $this->studentDetailsRepository->getAllWithMonthlyPayments(
        [
          'id',
          'candidate_name',
          'class',
          'section',
          'roll_no',
          'father_name'
        ],
        [
          'id',
          'month',
          'total_amount',
          'status',
          'payment_date',
          'mode',
          'remarks',
        ],
        $school_id
      );

      return [
        'status' => true,
        'message' => 'Payments with student info fetched successfully.',
        'data' => $data,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching payments with student info: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching payments.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching payments with student info: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch payments with student info.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateMonthlyPaymentManually($studentDetailsId, array $data, $school_id): array
  {
    try {
      $payment = MonthlyPayment::where('school_id', $school_id)
        ->where('id', $data['id'])
        ->where('student_details_id', $studentDetailsId)
        ->firstOrFail();

      $payment->status = $data['status'] ?? $payment->status;
      $payment->mode = $data['mode'] ?? $payment->mode;
      $payment->remarks = $data['remarks'] ?? $payment->remarks;
      $payment->updated_at = now();
      $payment->save();

      return [
        'status' => true,
        'message' => 'Monthly payment updated successfully.',
        'data' => $payment,
        'error' => null,
      ];
    } catch (ModelNotFoundException $e) {
      Log::error("MonthlyPayment not found: ID {$data['id']} and StudentDetailsID {$studentDetailsId}");
      return [
        'status' => false,
        'message' => 'Monthly payment not found.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating monthly payment: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating monthly payment.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating monthly payment: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update monthly payment.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  SUBJECT MANAGEMENT  =======================
  // ============================================================

  public function createSubject(array $data, $school_id): array
  {
    try {
      $subject = $this->schoolSubjectRepository->create([
        'school_id' => $school_id,
        'subject_name' => $data['subject_name'],
        'description' => $data['description'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
      ]);

      return [
        'status' => true,
        'message' => 'Subject created successfully.',
        'data' => $subject,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error creating subject: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while creating subject.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error creating subject: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create subject.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getAllSubjects($school_id): array
  {
    try {
      $subjects = SchoolSubject::where('school_id', $school_id)->get();
      return [
        'status' => true,
        'message' => 'Subjects fetched successfully.',
        'data' => $subjects,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching subjects: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching subjects.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching subjects: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch subjects.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteSubject(int $id): array
  {
    try {
      $subject = $this->schoolSubjectRepository->findById($id);

      if (!$subject) {
        return [
          'status' => false,
          'message' => 'Subject not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $this->schoolSubjectRepository->delete($id);

      return [
        'status' => true,
        'message' => 'Subject deleted successfully.',
        'data' => $subject,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error deleting subject: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while deleting subject.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error deleting subject: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete subject.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSubject(array $data): array
  {
    try {
      $subject = $this->schoolSubjectRepository->findById($data['id']);

      if (!$subject) {
        return [
          'status' => false,
          'message' => 'Subject not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $updatableFields = ['subject_name', 'description'];
      $updateData = array_intersect_key($data, array_flip($updatableFields));

      if (empty($updateData)) {
        return [
          'status' => true,
          'message' => 'No fields updated.',
          'data' => $subject,
          'error' => null,
        ];
      }

      $updateData['updated_at'] = now();
      $updated = $this->schoolSubjectRepository->update($subject->id, $updateData);

      return [
        'status' => true,
        'message' => 'Subject updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating subject: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating subject.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating subject: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update subject.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  TEACHER MANAGEMENT  =======================
  // ============================================================

  public function createTeacher(array $data): array
  {
    $plainPassword = $data['name'] . '2026';
    DB::beginTransaction();

    try {
      $teacherData = [
        'school_id' => $data['school_id'],
        'name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'password' => Hash::make($plainPassword),
        'qualification' => $data['qualification'] ?? null,
        'dob' => isset($data['dob']) ? date('Y-m-d', strtotime($data['dob'])) : null,
        'gender' => $data['gender'] ?? null,
        'address' => $data['address'] ?? null,
        'city' => $data['city'] ?? null,
        'state' => $data['state'] ?? null,
        'employee_code' => $data['employee_code'] ?? null,
      ];

      $teacher = $this->teacherRepository->create($teacherData);

      if ($teacher) {
        $school = School::find($data['school_id']);
        $message = <<<EOT
Dear {$data['name']},

🎉 Welcome to {$school->school_name}!

Your registration has been successfully completed.

Here are your login credentials:

📧 Email: {$teacher->email}
🔑 Password: {$plainPassword}  (Please change after first login)

Best Regards,
Eklavya School
EOT;

        try {
          // Use queue if available, else log-only in local
          if (config('mail.default') !== 'log') {
            Mail::raw($message, function ($mail) use ($teacher) {
              $mail->to($teacher->email)
                ->subject('Welcome to Eklavya School – Login Credentials');
            });
          } else {
            Log::info("Simulated mail to {$teacher->email}: {$message}");
          }
        } catch (Throwable $e) {
          Log::error("Email sending failed: " . $e->getMessage());
          // Don’t fail creation because of mail
        }
      }

      DB::commit();

      return [
        'success' => true,
        'message' => 'Teacher created successfully',
        'data' => [
          'teacher' => $teacher->load('school'),
        ],
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error("Teacher creation failed: " . $e->getMessage());
      return [
        'success' => false,
        'message' => 'Failed to create teacher: ' . $e->getMessage(),
      ];
    }
  }

  public function updateTeacher(int $teacherId, array $data): array
  {
    DB::beginTransaction();

    try {
      // 1️⃣ Fetch teacher with subjects
      $teacher = $this->teacherRepository->findById($teacherId, $data['school_id']);
      if (!$teacher) {
        return [
          'success' => false,
          'message' => 'Teacher not found',
        ];
      }

      // 2️⃣ Compare & update only changed fields
      $changedData = [];

      foreach ($data as $key => $value) {
        if (array_key_exists($key, $teacher->getAttributes()) && $teacher->$key != $value) {
          $changedData[$key] = $value;
        }
      }

      if (!empty($changedData)) {
        $this->teacherRepository->update($teacherId, $data['school_id'], $changedData);
      }

      DB::commit();

      return [
        'success' => true,
        'message' => 'Teacher updated successfully',
        'data' => $teacher->fresh(),
      ];
    } catch (Exception $e) {
      DB::rollBack();
      return [
        'success' => false,
        'message' => 'Failed to update teacher: ' . $e->getMessage(),
      ];
    }
  }

  public function getAllTeachers($school_id): array
  {
    try {
      $teachers = $this->teacherRepository->getAll($school_id);

      return [
        'status' => true,
        'message' => 'Teachers fetched successfully.',
        'data' => $teachers,
        'error' => null,
      ];
    } catch (QueryException $e) {
      Log::error("DB error fetching teachers: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching teachers.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching teachers: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch teachers.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getTeacherMoreDetails(int $teacherId): array
  {
    try {
      // TeacherRepository->getDetails() already returns structured response
      $result = $this->teacherRepository->getDetails($teacherId);

      // Add error key if not present for consistency
      if (!isset($result['error'])) {
        $result['error'] = null;
      }

      return $result;
    } catch (QueryException $e) {
      Log::error("DB error fetching teacher: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while fetching teacher.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error fetching teacher: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch teacher.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteTeacher(int $teacherId): array
  {
    DB::beginTransaction();

    try {
      // 1️⃣ Fetch the teacher
      $teacher = Teacher::find($teacherId);
      if (!$teacher) {
        return [
          'success' => false,
          'message' => 'Teacher not found',
        ];
      }

      // 2️⃣ Delete the teacher
      $teacher->delete();

      DB::commit();

      return [
        'success' => true,
        'message' => 'Teacher deleted successfully',
      ];
    } catch (Exception $e) {
      DB::rollBack();
      return [
        'success' => false,
        'message' => 'Failed to delete teacher: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Record daily teacher attendance for multiple teachers at once
   */
  public function markBulkAttendance(array $data): array
  {
    DB::beginTransaction();
    try {
      $attendanceDate = Carbon::parse($data['attendance_date']);
      $year = $attendanceDate->year;
      $month = $attendanceDate->month;
      $schoolId = $data['school_id'];

      $records = [];
      $errors = [];

      foreach ($data['attendances'] as $attendance) {
        try {
          $teacherId = $attendance['teacher_id'];
          $status = $attendance['status'];
          $remarks = $attendance['remarks'] ?? null;
          $sessionId = $attendance['session_id'] ?? null;

          // Skip if already marked
          $exists = TeacherAttendanceRecord::where('teacher_id', $teacherId)
            ->where('school_id', $schoolId)
            ->whereDate('attendance_date', $attendanceDate)
            ->first();

          if ($exists) {
            $errors[] = [
              'teacher_id' => $teacherId,
              'message' => 'Already marked for this date',
            ];
            continue;
          }

          $record = TeacherAttendanceRecord::create([
            'teacher_id' => $teacherId,
            'school_id' => $schoolId,
            'attendance_date' => $attendanceDate,
            'status' => $status,
            'session_id' => $sessionId,
            'remarks' => $remarks,
          ]);

          $records[] = $record;

          // Update summary after each successful record
          $this->updateSummary($teacherId, $schoolId, $year, $month);
        } catch (Exception $e) {
          $errors[] = [
            'teacher_id' => $attendance['teacher_id'] ?? null,
            'message' => $e->getMessage(),
          ];
        }
      }

      DB::commit();

      return [
        'status' => true,
        'message' => 'Bulk attendance processed successfully.',
        'data' => [
          'success_count' => count($records),
          'failed_count' => count($errors),
          'successful_records' => $records,
          'errors' => $errors,
        ],
        'error' => null,
      ];
    } catch (QueryException $e) {
      DB::rollBack();
      Log::error('DB error in bulk attendance: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error during bulk attendance.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error('General error in bulk attendance: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Unexpected error occurred during bulk attendance.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Record daily teacher attendance
   */
  public function markAttendance(array $data): array
  {
    DB::beginTransaction();
    try {
      $attendanceDate = Carbon::parse($data['attendance_date']);
      $year = $attendanceDate->year;
      $month = $attendanceDate->month;

      // Prevent duplicate attendance for same teacher/date
      $existing = TeacherAttendanceRecord::where('teacher_id', $data['teacher_id'])
        ->where('school_id', $data['school_id'])
        ->whereDate('attendance_date', $attendanceDate)
        ->first();

      if ($existing) {
        return [
          'status' => false,
          'message' => 'Attendance already marked for this date.',
          'data' => $existing,
          'error' => null,
        ];
      }

      $record = TeacherAttendanceRecord::create([
        'teacher_id' => $data['teacher_id'],
        'school_id' => $data['school_id'],
        'attendance_date' => $attendanceDate,
        'status' => $data['status'],
        'session_id' => $data['session_id'] ?? null,
        'remarks' => $data['remarks'] ?? null,
      ]);

      // Update monthly summary
      $this->updateSummary($data['teacher_id'], $data['school_id'], $year, $month);

      DB::commit();
      return [
        'status' => true,
        'message' => 'Attendance marked successfully.',
        'data' => $record,
        'error' => null,
      ];
    } catch (QueryException $e) {
      DB::rollBack();
      Log::error('DB error marking attendance: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while marking attendance.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error('General error marking attendance: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Unexpected error while marking attendance.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Update monthly summary for a given teacher
   */
  private function updateSummary($teacherId, $schoolId, $year, $month)
  {
    $summaryData = TeacherAttendanceRecord::select(
      DB::raw('COUNT(*) as total_days'),
      DB::raw("SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days"),
      DB::raw("SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days"),
      DB::raw("SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days"),
      DB::raw("SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days")
    )
      ->where('teacher_id', $teacherId)
      ->where('school_id', $schoolId)
      ->whereYear('attendance_date', $year)
      ->whereMonth('attendance_date', $month)
      ->first();

    TeacherAttendanceSummary::updateOrCreate(
      [
        'teacher_id' => $teacherId,
        'school_id' => $schoolId,
        'year' => $year,
        'month' => $month,
      ],
      [
        'total_days' => $summaryData->total_days,
        'present_days' => $summaryData->present_days,
        'absent_days' => $summaryData->absent_days,
        'late_days' => $summaryData->late_days,
        'half_days' => $summaryData->half_days,
      ]
    );
  }

  /**
   * Fetch attendance for a teacher (daily)
   */
  public function getTeacherAttendance($teacherId, $schoolId, $month = null, $year = null): array
  {
    try {
      $query = TeacherAttendanceRecord::where('teacher_id', $teacherId)
        ->where('school_id', $schoolId);

      if ($year && $month) {
        $query->whereYear('attendance_date', $year)
          ->whereMonth('attendance_date', $month);
      }

      $records = $query->orderBy('attendance_date', 'asc')->get();

      return [
        'status' => true,
        'message' => 'Attendance records fetched successfully.',
        'data' => $records,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching attendance: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching attendance records.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Fetch monthly summary for a teacher
   */
  public function getTeacherMonthlySummary($teacherId, $schoolId, $year): array
  {
    try {
      $summaries = TeacherAttendanceSummary::where('teacher_id', $teacherId)
        ->where('school_id', $schoolId)
        ->where('year', $year)
        ->orderBy('month', 'asc')
        ->get();

      return [
        'status' => true,
        'message' => 'Attendance summary fetched successfully.',
        'data' => $summaries,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching attendance summary: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Error fetching attendance summary.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  CLASS MANAGEMENT  =========================
  // ============================================================

  public function createClass(array $data)
  {
    try {
      $class = SchoolClass::create($data);
      return [
        'status' => true,
        'message' => 'Class created successfully',
        'data' => $class
      ];
    } catch (Exception $e) {
      Log::error('Error creating class: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create class',
        'error' => $e->getMessage()
      ];
    }
  }

  /**
   * Update an existing class
   */
  public function updateClass($id, array $data)
  {
    try {
      $class = SchoolClass::find($id);
      if (!$class) {
        return [
          'status' => false,
          'message' => 'Class not found'
        ];
      }

      $class->update($data);
      return [
        'status' => true,
        'message' => 'Class updated successfully',
        'data' => $class
      ];
    } catch (Exception $e) {
      Log::error('Error updating class: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update class',
        'error' => $e->getMessage()
      ];
    }
  }

  /**
   * Delete a class
   */
  public function deleteClass($id)
  {
    try {
      $class = SchoolClass::find($id);
      if (!$class) {
        return [
          'status' => false,
          'message' => 'Class not found'
        ];
      }

      $class->delete();
      return [
        'status' => true,
        'message' => 'Class deleted successfully'
      ];
    } catch (Exception $e) {
      Log::error('Error deleting class: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete class',
        'error' => $e->getMessage()
      ];
    }
  }

  /**
   * Get all classes by school
   */
  public function getClassesBySchool($school_id)
  {
    try {
      $classes = SchoolClass::where('school_id', $school_id)->get();
      return [
        'status' => true,
        'message' => 'Classes fetched successfully',
        'data' => $classes
      ];
    } catch (Exception $e) {
      Log::error('Error fetching classes: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch classes',
        'error' => $e->getMessage()
      ];
    }
  }

  public function getAllDayClassTimeTable($school_id, $teacher_id)
  {
    try {
      $timetable = $this->classTimeTableRepository->getAllDayTimeTable($school_id, $teacher_id);

      return [
        'status' => true,
        'message' => 'Day class timetable fetched successfully.',
        'data' => $timetable,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching day class timetable: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while fetching the day class timetable.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getTimetableByClass($school_id, $class_id)
  {
    try {
      $filters = [
        'school_id' => $school_id,
        'class_id' => $class_id,
      ];

      $timetable = $this->classTimeTableRepository->getAll($filters);

      return [
        'status' => true,
        'message' => 'Timetable for class fetched successfully.',
        'data' => $timetable,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching timetable by class: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while fetching the timetable for the class.',
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  CLASS TIME_TABLE MANAGEMENT  ==============
  // ============================================================

  public function createClassTimeTable(array $data): array
  {
    DB::beginTransaction();
    try {
      $schoolId = $data['school_id'];
      $timetableEntries = $data['timetable'];
      $createdEntries = [];
      $errors = [];

      foreach ($timetableEntries as $index => $entry) {
        // Basic validation
        if (empty($entry['class_id']) || empty($entry['subject_id']) || empty($entry['teacher_id']) || empty($entry['day_of_week']) || empty($entry['start_time']) || empty($entry['end_time'])) {
          $errors[] = "Entry at index {$index} is missing required fields.";
          continue;
        }

        // Check for teacher conflicts
        $conflict = $this->classTimeTableRepository->checkTeacherConflict(
          $entry['teacher_id'],
          $entry['day_of_week'],
          $entry['start_time'],
          $entry['end_time']
        );

        if ($conflict) {
          $errors[] = "Teacher (ID: {$entry['teacher_id']}) has a time conflict on {$entry['day_of_week']} between {$entry['start_time']} and {$entry['end_time']}.";
          continue;
        }

        $createdEntry = $this->classTimeTableRepository->create([
          'school_id' => $schoolId,
          'class_id' => $entry['class_id'],
          'subject_id' => $entry['subject_id'],
          'teacher_id' => $entry['teacher_id'],
          'day_of_week' => $entry['day_of_week'],
          'start_time' => $entry['start_time'],
          'end_time' => $entry['end_time'],
        ]);

        if (!$createdEntry) {
          $errors[] = "Failed to create entry for class ID {$entry['class_id']} on {$entry['day_of_week']}.";
          continue;
        }

        $createdEntries[] = $createdEntry;
      }

      if (!empty($errors)) {
        DB::rollBack();
        return [
          'status' => false,
          'message' => 'Failed to create timetable due to conflicts or errors.',
          'errors' => $errors
        ];
      }

      DB::commit();

      return [
        'status' => true,
        'message' => 'Class timetable created successfully.',
        'data' => $createdEntries
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error('Error creating class timetable: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while creating the timetable.',
        'error' => $e->getMessage()
      ];
    }
  }

  public function getClassTimeTable(array $filters): array
  {
    try {
      $timetable = $this->classTimeTableRepository->getAll($filters);

      if ($timetable->isEmpty()) {
        return [
          'status' => true,
          'message' => 'No timetable entries found for the given criteria.',
          'data' => [],
        ];
      }

      return [
        'status' => true,
        'message' => 'Timetable fetched successfully.',
        'data' => $timetable,
      ];
    } catch (Exception $e) {
      Log::error('Error fetching class timetable: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while fetching the timetable.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateClassTimeTable(int $id, array $data): array
  {
    DB::beginTransaction();
    try {
      $entry = $this->classTimeTableRepository->findById($id);

      if (!$entry) {
        return ['status' => false, 'message' => 'Timetable entry not found.'];
      }

      // Check for teacher conflicts if time/teacher/day is being changed
      $requiresCheck = !empty(array_intersect(array_keys($data), ['teacher_id', 'day_of_week', 'start_time', 'end_time']));

      if ($requiresCheck) {
        $conflict = $this->classTimeTableRepository->checkTeacherConflict(
          $data['teacher_id'] ?? $entry->teacher_id,
          $data['day_of_week'] ?? $entry->day_of_week,
          $data['start_time'] ?? $entry->start_time,
          $data['end_time'] ?? $entry->end_time,
          $id // Exclude the current entry from the check
        );

        if ($conflict) {
          DB::rollBack();
          return [
            'status' => false,
            'message' => 'Teacher has a time conflict with another scheduled class.',
          ];
        }
      }

      $updated = $this->classTimeTableRepository->update($id, $data);

      if (!$updated) {
        DB::rollBack();
        return ['status' => false, 'message' => 'Failed to update timetable entry.'];
      }

      DB::commit();

      return [
        'status' => true,
        'message' => 'Timetable entry updated successfully.',
        'data' => $this->classTimeTableRepository->findById($id), // Return fresh data
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error('Error updating class timetable: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while updating the timetable.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteClassTimeTable(int $id): array
  {
    try {
      $deleted = $this->classTimeTableRepository->delete($id);

      if (!$deleted) {
        return ['status' => false, 'message' => 'Timetable entry not found or already deleted.'];
      }

      return ['status' => true, 'message' => 'Timetable entry deleted successfully.'];
    } catch (Exception $e) {
      Log::error('Error deleting class timetable entry: ' . $e->getMessage());
      return [
        'status' => false,
        'message' => 'An unexpected error occurred while deleting the entry.',
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  SCHOOL BUS MANAGEMENT  ====================
  // ============================================================

  public function createSchoolBus(array $data, int $schoolId): array
  {
    try {
      $data['school_id'] = $schoolId;
      $bus = $this->schoolBusRepository->create($data);

      return [
        'status' => true,
        'message' => 'School bus created successfully.',
        'data' => $bus,
      ];
    } catch (QueryException $e) {
      Log::error("DB error creating school bus: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while creating school bus.',
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error creating school bus: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create school bus.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getAllSchoolBuses(int $schoolId): array
  {
    try {
      $buses = $this->schoolBusRepository->getAllBySchool($schoolId);

      return [
        'status' => true,
        'message' => 'School buses fetched successfully.',
        'data' => $buses,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching school buses: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch school buses.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getSchoolBus(int $busId, int $schoolId): array
  {
    try {
      $bus = $this->schoolBusRepository->findById($busId);

      if (!$bus || $bus->school_id != $schoolId) {
        return [
          'status' => false,
          'message' => 'School bus not found.',
        ];
      }

      return [
        'status' => true,
        'message' => 'School bus details fetched successfully.',
        'data' => $bus,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching school bus details: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch school bus details.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchoolBus(int $busId, array $data, int $schoolId): array
  {
    try {
      $bus = $this->schoolBusRepository->findById($busId);

      if (!$bus || $bus->school_id != $schoolId) {
        return [
          'status' => false,
          'message' => 'School bus not found.',
        ];
      }

      $updatedBus = $this->schoolBusRepository->update($busId, $data);

      return [
        'status' => true,
        'message' => 'School bus updated successfully.',
        'data' => $updatedBus,
      ];
    } catch (QueryException $e) {
      Log::error("DB error updating school bus: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Database error while updating school bus.',
        'error' => $e->getMessage(),
      ];
    } catch (Exception $e) {
      Log::error("Error updating school bus: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update school bus.',
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteSchoolBus(int $busId, int $schoolId): array
  {
    try {
      $bus = $this->schoolBusRepository->findById($busId);

      if (!$bus || $bus->school_id != $schoolId) {
        return [
          'status' => false,
          'message' => 'School bus not found.',
        ];
      }

      $this->schoolBusRepository->delete($busId);

      return [
        'status' => true,
        'message' => 'School bus deleted successfully.',
      ];
    } catch (Exception $e) {
      Log::error("Error deleting school bus: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete school bus.',
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  SCHOOL FACILITIES MANAGEMENT  =============
  // ============================================================

  public function createSchoolFacility(array $data, int $schoolId): array
  {
    try {
      $data['school_id'] = $schoolId;
      $facility = $this->schoolFacilityRepository->create($data);

      if (!$facility) {
        return [
          'status' => false,
          'message' => 'Failed to create facility.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Facility created successfully.',
        'data' => $facility,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error creating facility: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create facility.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getSchoolFacilities(int $schoolId): array
  {
    try {
      $facilities = $this->schoolFacilityRepository->getBySchoolId($schoolId);

      return [
        'status' => true,
        'message' => 'Facilities fetched successfully.',
        'data' => $facilities,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching facilities: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch facilities.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchoolFacility(int $id, array $data): array
  {
    try {
      $facility = $this->schoolFacilityRepository->findById($id);

      if (!$facility) {
        return [
          'status' => false,
          'message' => 'Facility not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $updated = $this->schoolFacilityRepository->update($id, $data);

      return [
        'status' => true,
        'message' => 'Facility updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error updating facility: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update facility.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteSchoolFacility(int $id): array
  {
    try {
      $facility = $this->schoolFacilityRepository->findById($id);

      if (!$facility) {
        return [
          'status' => false,
          'message' => 'Facility not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $deleted = $this->schoolFacilityRepository->delete($id);

      if (!$deleted) {
        return [
          'status' => false,
          'message' => 'Failed to delete facility.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Facility deleted successfully.',
        'data' => null,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error deleting facility: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete facility.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  SCHOOL ACHIEVEMENTS MANAGEMENT  ===========
  // ============================================================

  public function createSchoolAchievement(array $data, int $schoolId): array
  {
    try {
      $data['school_id'] = $schoolId;

      // Handle certificate upload if provided
      if (isset($data['certificate_file']) && $data['certificate_file']) {
        $certPath = $this->uploadSchoolFile($data['certificate_file'], 'achievements');
        $data['certificate_path'] = $certPath;
        unset($data['certificate_file']);
      }

      $achievement = $this->schoolAchievementRepository->create($data);

      if (!$achievement) {
        return [
          'status' => false,
          'message' => 'Failed to create achievement.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Achievement created successfully.',
        'data' => $achievement,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error creating achievement: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create achievement.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getSchoolAchievements(int $schoolId): array
  {
    try {
      $achievements = $this->schoolAchievementRepository->getBySchoolId($schoolId);

      return [
        'status' => true,
        'message' => 'Achievements fetched successfully.',
        'data' => $achievements,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching achievements: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch achievements.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchoolAchievement(int $id, array $data): array
  {
    try {
      $achievement = $this->schoolAchievementRepository->findById($id);

      if (!$achievement) {
        return [
          'status' => false,
          'message' => 'Achievement not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Handle certificate upload if provided
      if (isset($data['certificate_file']) && $data['certificate_file']) {
        $certPath = $this->uploadSchoolFile($data['certificate_file'], 'achievements');
        $data['certificate_path'] = $certPath;

        // Delete old certificate if exists
        if ($achievement->certificate_path && file_exists(public_path($achievement->certificate_path))) {
          unlink(public_path($achievement->certificate_path));
        }
        unset($data['certificate_file']);
      }

      $updated = $this->schoolAchievementRepository->update($id, $data);

      return [
        'status' => true,
        'message' => 'Achievement updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error updating achievement: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update achievement.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteSchoolAchievement(int $id): array
  {
    try {
      $achievement = $this->schoolAchievementRepository->findById($id);

      if (!$achievement) {
        return [
          'status' => false,
          'message' => 'Achievement not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Delete certificate file if exists
      if ($achievement->certificate_path && file_exists(public_path($achievement->certificate_path))) {
        unlink(public_path($achievement->certificate_path));
      }

      $deleted = $this->schoolAchievementRepository->delete($id);

      if (!$deleted) {
        return [
          'status' => false,
          'message' => 'Failed to delete achievement.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Achievement deleted successfully.',
        'data' => null,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error deleting achievement: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete achievement.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  SCHOOL TIMINGS MANAGEMENT  ================
  // ============================================================

  public function createSchoolTiming(array $data, int $schoolId): array
  {
    try {
      $data['school_id'] = $schoolId;
      $timing = $this->schoolTimingRepository->create($data);

      if (!$timing) {
        return [
          'status' => false,
          'message' => 'Failed to create timing.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Timing created successfully.',
        'data' => $timing,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error creating timing: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to create timing.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function getSchoolTimings(int $schoolId): array
  {
    try {
      $timings = $this->schoolTimingRepository->getBySchoolId($schoolId);

      return [
        'status' => true,
        'message' => 'Timings fetched successfully.',
        'data' => $timings,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching timings: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch timings.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchoolTiming(int $id, array $data): array
  {
    try {
      $timing = $this->schoolTimingRepository->findById($id);

      if (!$timing) {
        return [
          'status' => false,
          'message' => 'Timing not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $updated = $this->schoolTimingRepository->update($id, $data);

      return [
        'status' => true,
        'message' => 'Timing updated successfully.',
        'data' => $updated,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error updating timing: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update timing.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function deleteSchoolTiming(int $id): array
  {
    try {
      $timing = $this->schoolTimingRepository->findById($id);

      if (!$timing) {
        return [
          'status' => false,
          'message' => 'Timing not found.',
          'data' => null,
          'error' => null,
        ];
      }

      $deleted = $this->schoolTimingRepository->delete($id);

      if (!$deleted) {
        return [
          'status' => false,
          'message' => 'Failed to delete timing.',
          'data' => null,
          'error' => null,
        ];
      }

      return [
        'status' => true,
        'message' => 'Timing deleted successfully.',
        'data' => null,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error deleting timing: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to delete timing.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  public function updateSchoolTimingsBulk(int $schoolId, array $timings): array
  {
    DB::beginTransaction();
    try {
      // Delete all existing timings for this school
      $this->schoolTimingRepository->deleteBySchoolId($schoolId);

      // Create new timings
      $createdTimings = [];
      foreach ($timings as $timing) {
        $timing['school_id'] = $schoolId;
        $created = $this->schoolTimingRepository->create($timing);
        if ($created) {
          $createdTimings[] = $created;
        }
      }

      DB::commit();

      return [
        'status' => true,
        'message' => 'Timings updated successfully.',
        'data' => $createdTimings,
        'error' => null,
      ];
    } catch (Exception $e) {
      DB::rollBack();
      Log::error("Error updating timings in bulk: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to update timings.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }

  // ============================================================
  // ===============  GET SCHOOL WITH ALL INFO  =================
  // ============================================================

  public function getSchoolWithCompleteInfo(int $schoolId): array
  {
    try {
      $school = $this->schoolRepository->findById($schoolId);

      if (!$school) {
        return [
          'status' => false,
          'message' => 'School not found.',
          'data' => null,
          'error' => null,
        ];
      }

      // Load relationships
      $school->load(['facilities', 'achievements', 'timings']);

      return [
        'status' => true,
        'message' => 'School information fetched successfully.',
        'data' => $school,
        'error' => null,
      ];
    } catch (Exception $e) {
      Log::error("Error fetching complete school info: " . $e->getMessage());
      return [
        'status' => false,
        'message' => 'Failed to fetch school information.',
        'data' => null,
        'error' => $e->getMessage(),
      ];
    }
  }
}
