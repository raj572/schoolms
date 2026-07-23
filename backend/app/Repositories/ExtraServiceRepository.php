<?php

// app/Repositories/ExtraServiceRepository.php

namespace App\Repositories;

use App\Models\ExtraService;

class ExtraServiceRepository
{
    
    public function create(array $data)
    {
        return ExtraService::create($data);
    }

    public function updateExtraService(int $studentDetailsId, array $data)
    {
        $service = ExtraService::Where('student_details_id', $studentDetailsId)->first();
        $service->update($data);
        return $service;
    }

    public function findByStudentId(int $studentId)
    {
        return ExtraService::where('student_details_id', $studentId)->get();
    }

    public function all()
    {
        return ExtraService::all();
    }

    public function delete(int $id)
    {
        return ExtraService::destroy($id);
    }
}
