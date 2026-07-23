<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentService extends Model
{
    protected $fillable = [
        'school_id',
        'service_type',
        'service_name',
        'stopage',
        'charge',
        'description',
    ];

    public function extraServices()
    {
        return $this->hasMany(ExtraService::class, 'service_id');
    }
}
