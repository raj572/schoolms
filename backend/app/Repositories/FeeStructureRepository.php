<?php

namespace App\Repositories;

use App\Models\FeeStructure;

class FeeStructureRepository
{
    public function getAll()
    {
        return FeeStructure::all();
    }

    public function findById($id)
    {
        return FeeStructure::findOrFail($id);
    }

    public function create(array $data)
    {
        return FeeStructure::create($data);
    }

    public function findBySchoolClass(int $schoolId, string $class)
    {
        return FeeStructure::where('school_id', $schoolId)->where('class', $class)->first();
    }

    public function update($id, array $data)
    {
        $structure = FeeStructure::findOrFail($id);
        $structure->update($data);
        return $structure;
    }

    public function delete($id)
    {
        return FeeStructure::destroy($id);
    }
}
