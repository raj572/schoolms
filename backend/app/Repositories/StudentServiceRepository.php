<?php

namespace App\Repositories;

use App\Models\StudentService;

class StudentServiceRepository
{
    public function getAll()
    {
        return StudentService::all();
    }

    public function getAllCharges()
    {
        return StudentService::all()->keyBy('service_name');
    }

    public function getAllWithServiceName()
    {
        return StudentService::all()->keyBy('service_name');
    }


    public function findById($id)
    {
        return StudentService::find($id);
    }

    public function create(array $data)
    {
        return StudentService::create($data);
    }

    public function update($id, array $data)
    {
        $service = StudentService::find($id);
        if ($service) {
            $service->update($data);
            return $service;
        }
        return null;
    }

    public function delete($id)
    {
        $service = StudentService::find($id);
        if ($service) {
            return $service->delete();
        }
        return false;
    }
}
