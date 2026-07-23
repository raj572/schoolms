<?php

namespace App\Repositories;

use App\Models\Student;

class StudentRepository
{
    public function getStudent($email, $school_id)
    {
        return Student::where('school_id', $school_id)
            ->where('email', $email)->get();
    }
    public function create(array $data)
    {
        return Student::create($data);
    }

    public function update($id, array $data)
    {
        $user = Student::where('id', $id);
        $updated = $user->update($data);
        return $updated;
    }
    public function findById($id, $school_id)
    {
        return Student::where('school_id', $school_id)
            ->where('id', $id)->get();
    }

    public function find($id)
    {
        return Student::find($id);
    }
    public function findByEmail($email)
    {
        return Student::where('status', 'active')
            ->where('email', $email)->first();
    }
    public function delete($id)
    {
        return Student::destroy($id);
    }

    public function findByUsername($username)
    {
        return Student::where('username', $username)->first();
    }
}
