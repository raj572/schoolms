<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Student extends Authenticatable
{
    protected $fillable = [
        'school_id',
        'username',
        'email',
        'password',
        'class',
        'role',
        'status',
        'otp',
        'otp_expiration_time'
    ];

    public function detail()
    {
        return $this->hasOne(StudentDetails::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
