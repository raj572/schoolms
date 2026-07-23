<?php

namespace App\Repositories;

use App\Models\ParentModel;
use App\Models\Teacher;
use Dom\ParentNode;

class ParentRepository
{
  public function getAll($schoolId)
  {
    return ParentModel::where('school_id', $schoolId)->get();
  }
  public function getParent($email, $school_id)
  {
    return ParentModel::where('school_id', $school_id)
      ->where('email', $email)->get();
  }
  public function findById($id, $schoolId)
  {
    return ParentModel::where('school_id', $schoolId)->findOrFail($id);
  }

  public function findByEmail($email)
  {
    return ParentModel::where('email', $email)->where('status', 'active')->get();
  }

  public function create(array $data)
  {
    return ParentModel::create($data);
  }

  public function update($id, array $data)
  {
    $parent = Teacher::where('id', $id);
    $parent->update($data);
    return $parent;
  }

  public function delete($id, $schoolId)
  {
    $parent = $this->findById($id, $schoolId);
    return $parent->delete();
  }
}
