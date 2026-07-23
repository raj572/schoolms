<?php

namespace App\Services;

use App\Repositories\MonthlyPaymentRepository;
use App\Repositories\StudentDetailsRepository;
use App\Repositories\StudentRepository;

class StudentService
{
  private StudentDetailsRepository $student_details_repository;
  private StudentRepository $student_repository;
  private OnlineTransactionService $onlineTransactionService;
  private MonthlyPaymentRepository $monthlyPaymentRepository;
  public function __construct(
    StudentDetailsRepository $student_details_repository,
    StudentRepository $student_repository,
    OnlineTransactionService $onlineTransactionService,
    MonthlyPaymentRepository $monthlyPaymentRepository
  ) {
    $this->student_details_repository = $student_details_repository;
    $this->student_repository = $student_repository;
    $this->onlineTransactionService = $onlineTransactionService;
    $this->monthlyPaymentRepository = $monthlyPaymentRepository;
  }

  public function getStudentDetails($id)
  {
    $studentDetails = $this->student_details_repository->findByStudentId($id);
    if (!$studentDetails) {
      return null;
    }
    return [
      'details' => $studentDetails
    ];
  }

  public function getMonthlyPaymentsOfIndividual($studentId)
{
    $studentDetails = $this->student_details_repository->findByStudentId($studentId);

    if (!$studentDetails) {
        return null;
    }

    $studentDetailsId = $studentDetails->id;

    $payments = $this->monthlyPaymentRepository->getMonthlyPaymentsByStudentId($studentDetailsId);

    if (!$payments) {
        return null;
    }

    return [
        'payments' => $payments
    ];
}

}
