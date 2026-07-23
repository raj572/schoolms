<?php

namespace App\Repositories;

use App\Models\MonthlyPayment;
use App\Models\MonthlyPayments;
use App\Models\Student;

class MonthlyPaymentRepository
{
    public function getAll()
    {
        return MonthlyPayments::all();
    }
    
    public function getAllPaginated(array $fields = ['*'], int $perPage = 10)
    {
        return MonthlyPayments::select($fields)->with('studentDetail')->paginate($perPage);
    }

    public function findById($id)
    {
        return MonthlyPayments::findOrFail($id);
    }

    public function getMonthlyPaymentsOfIndividual($studentId)
    {
        return Student::where('id', $studentId)->get();
    }
    public function getMonthlyPaymentsByStudentId($studentId)
    {
        return MonthlyPayments::where('student_details_id', $studentId)->get();
    }

    public function create(array $data)
    {
        return MonthlyPayments::create($data);
    }

    public function update($id, array $data)
    {
        $payment = MonthlyPayments::findOrFail($id);
        $payment->update($data);
        return $payment;
    }

    public function delete($id)
    {
        return MonthlyPayments::destroy($id);
    }

    public function checkExists($studentId, $month)
    {
        return MonthlyPayments::where('student_details_id', $studentId)
            ->where('month', $month)
            ->exists();
    }


    public function withRelation($relation)
    {
        $payment = MonthlyPayments::with($relation);
        return $payment;
    }

    public function orderByDesc($column)
    {
        $payment = MonthlyPayments::orderByDesc($column);
        return $payment;
    }
}
