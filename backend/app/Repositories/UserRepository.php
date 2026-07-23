<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function getAll()
    {
        return User::all();
    }

    public function getUser($email, $school_id)
    {
        return User::where('school_id', $school_id)
            ->where('email', $email)->get();
    }
    public function findByUsername($username)
    {
        return User::where("username", $username)->first();
    }

    public function findById($id, $school_id)
    {
        return User::where('school_id', $school_id)
            ->where('id', $id)->first();
    }
    public function findByEmail($email)
    {
        return User::where('email', $email)->where('status', 'active')->first();
    }
    public function create(array $data)
    {
        return User::create($data);
    }

    public function update($id, array $data)
    {
        $user = User::findOrFail($id);
        $user->update($data);
        return $user->fresh(); // Return the updated user model
    }

    public function delete($id)
    {
        return User::destroy($id);
    }
}
