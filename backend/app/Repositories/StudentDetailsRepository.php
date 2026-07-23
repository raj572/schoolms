<?php

namespace App\Repositories;

use App\Models\Service;
use App\Models\StudentDetails;
use App\Models\StudentService;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentDetailsRepository
{
    public function create(array $data)
    {
        return StudentDetails::create($data);
    }

    public function find($id)
    {
        return StudentDetails::find($id);
    }
    public function getAll()
    {
        return StudentDetails::all();
    }

    public function getAllWithMonthlyPayments(array $studentFields = ['*'], array $paymentFields = ['*'], $school_id)
    {
        // Ensure the foreign key is included
        if (!in_array('student_details_id', $paymentFields)) {
            $paymentFields[] = 'student_details_id';
        }

        return StudentDetails::select($studentFields)
            ->where('school_id', $school_id)
            ->with(['monthlyPayments' => function ($query) use ($paymentFields) {
                $query->select($paymentFields);
            }])
            ->where('school_id', $school_id)
            ->get();
    }

    public function getAllStudentsWithServices(int $school_id)
    {
        // 1. Fetch students (only limited fields)
        $students = StudentDetails::select('id', 'candidate_name', 'class', 'secction', 'father_name', 'phone')
            ->where('school_id', $school_id)
            ->with(['services:id,service_type,service_name,charge']) // subscribed services only
            ->get();

        // 2. Fetch all services of this school
        $allServices = StudentService::where('school_id', $school_id)
            ->select('id', 'service_name', 'charge')
            ->get();

        // 3. Attach subscribed + unsubscribed for each student
        $students->transform(function ($student) use ($allServices) {
            $subscribedIds = $student->services->pluck('id')->toArray();

            $servicesWithFlag = $allServices->map(function ($service) use ($subscribedIds) {
                return [
                    'id' => $service->id,
                    'service_name' => $service->service_name,
                    'charge' => $service->charge,
                    'subscribed' => in_array($service->id, $subscribedIds),
                ];
            });

            // replace services relation with full list (subscribed/unsubscribed)
            $student->services = $servicesWithFlag;

            return $student;
        });

        return $students;
    }



    public function findByEmail($email)
    {
        return StudentDetails::where("email", $email)->first();
    }

    public function update($id, array $data)
    {
        return StudentDetails::where('id', $id)->update($data);
    }

    public function delete($id)
    {
        return StudentDetails::destroy($id);
    }

    public function findByStudentId($studentId)
    {
        return StudentDetails::where('student_id', $studentId)->first();
    }
    public function findById($studentId)
    {
        return StudentDetails::find($studentId);
    }

    public function findByCandidateFatherClass($candidateName, $fatherName, $class, $school_id)
    {
        return StudentDetails::where('candidate_name', $candidateName)
            ->where('school_id', $school_id)
            ->where('father_name', $fatherName)
            ->where('class', $class)
            ->first();
    }

    public function getclassstudentsList($schoolId, $class, $section)
    {
        return StudentDetails::where('school_id', $schoolId)
            ->where('class', $class)
            ->where('section', $section)
            ->where('status', 'studying')
            ->get();
    }

    /**
     * Return paginated students for a school with optional class/section filters.
     *
     * $filters must include 'school_id', can include 'class', 'section', 'per_page'
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getBySchoolWithFilters(array $filters): LengthAwarePaginator
    {
        $query = StudentDetails::select('id', 'name', 'class', 'section', 'school_id')
            ->where('school_id', $filters['school_id']);

        if (!empty($filters['class'])) {
            $query->where('class', $filters['class']);
        }

        if (!empty($filters['section'])) {
            $query->where('section', $filters['section']);
        }

        $perPage = $filters['per_page'] ?? 25;

        // adjust sorting to your preference
        $query->orderBy('class')->orderBy('section')->orderBy('name');

        return $query->paginate($perPage);
    }
}
