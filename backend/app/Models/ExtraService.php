<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExtraService extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_details_id',
        'service_id', 
    ];

    public function student()
    {
        return $this->belongsTo(StudentDetails::class, 'student_details_id');
    }

    public function service()
    {
        return $this->belongsTo(StudentService::class, 'service_id');
    }
}
