<?php

namespace App\Console\Commands;

use App\Repositories\FeeStructureRepository;
use App\Repositories\MonthlyPaymentRepository;
use App\Repositories\StudentDetailsRepository;
use App\Repositories\ExtraServiceRepository;
use App\Models\HostelAllocation;
use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyDues extends Command
{
    protected $signature = 'generate:monthly-dues';
    protected $description = 'Generate due monthly payments for all students';

    private MonthlyPaymentRepository $monthlyPaymentRepository;
    private StudentDetailsRepository $studentDetailsRepository;
    private FeeStructureRepository $feeStructureRepository;
    private ExtraServiceRepository $extraServiceRepository;

    public function __construct(
        MonthlyPaymentRepository $monthlyPaymentRepository,
        StudentDetailsRepository $studentDetailsRepository,
        FeeStructureRepository $feeStructureRepository,
        ExtraServiceRepository $extraServiceRepository
    ) {
        parent::__construct();
        $this->monthlyPaymentRepository = $monthlyPaymentRepository;
        $this->studentDetailsRepository = $studentDetailsRepository;
        $this->feeStructureRepository = $feeStructureRepository;
        $this->extraServiceRepository = $extraServiceRepository;
    }

    public function handle()
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        $students = $this->studentDetailsRepository->getAll();
        $createdCount = 0;
        $skippedCount = 0;

        foreach ($students as $student) {
            for ($monthNum = 1; $monthNum <= $currentMonth; $monthNum++) {
                $month = Carbon::create($currentYear, $monthNum, 1)->format('Y-m');

                // Skip if already exists
                if ($this->monthlyPaymentRepository->checkExists($student->id, $month)) {
                    $skippedCount++;
                    continue;
                }

                $lineItems = [];
                $totalAmount = 0;

                // Base Tuition Fee from FeeStructure
                if (!empty($student->class)) {
                    $feeStructure = $this->feeStructureRepository->findBySchoolClass($student->school_id, $student->class);
                    if ($feeStructure) {
                        // Tuition Fee
                        $lineItems[] = [
                            'service_id' => null,
                            'label' => 'Tuition Fee',
                            'amount' => $feeStructure->monthly_fee ?? 0,
                        ];
                        $totalAmount += $feeStructure->monthly_fee ?? 0;

                        // Other Fee
                        if ($feeStructure->other_fee) {
                            $lineItems[] = [
                                'service_id' => null,
                                'label' => 'Other Fee',
                                'amount' => $feeStructure->other_fee,
                            ];
                            $totalAmount += $feeStructure->other_fee;
                        }
                    } else {
                        Log::warning("No FeeStructure found for class: {$student->class}");
                    }
                } else {
                    Log::warning("Class missing for student: {$student->candidate_name}");
                }

                // Extra Services subscribed by student
                $extraServices = $this->extraServiceRepository->findByStudentId($student->id);

                if ($extraServices && count($extraServices) > 0) {
                    foreach ($extraServices as $service) {
                        $lineItems[] = [
                            'service_id' => $service->service_id,
                            'label' => $service->service->service_name ?? 'Service',
                            'amount' => $service->charge,
                        ];
                        $totalAmount += $service->charge;
                    }
                } else {
                    Log::info("No extra services for student: {$student->candidate_name}");
                }

                // Hostel Fee - Check if student has active hostel allocation
                $hostelAllocation = HostelAllocation::where('student_details_id', $student->id)
                    ->where('status', 'active')
                    ->first();

                if ($hostelAllocation) {
                    $lineItems[] = [
                        'service_id' => null,
                        'label' => 'Hostel Fee',
                        'amount' => $hostelAllocation->monthly_fee,
                    ];
                    $totalAmount += $hostelAllocation->monthly_fee;
                }

                // Create MonthlyPayment (bill header)
                $monthlyPayment = $this->monthlyPaymentRepository->create([
                    'school_id' => $student->school_id,
                    'student_details_id' => $student->id,
                    'month' => $month,
                    'total_amount' => $totalAmount,
                    'status' => 'due',
                    'payment_date' => null,
                    'mode' => null,
                    'remarks' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Create MonthlyPaymentItems (line items)
                foreach ($lineItems as $item) {
                    $monthlyPayment->items()->create($item);
                }

                $createdCount++;
            }
        }

        $this->info("✅ Monthly dues generated from Jan to current month for {$currentYear}.");
        $this->info("🧾 Created: {$createdCount}, Skipped: {$skippedCount}");

        return [
            'created' => $createdCount,
            'skipped' => $skippedCount,
        ];
    }
}
