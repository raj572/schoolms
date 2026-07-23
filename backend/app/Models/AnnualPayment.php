<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnualPayment extends Model
{
    protected $fillable = [
        'school_id',
        'student_details_id',
        'class',
        'admission_fee',
        'registration_fee',
        'other_fee',
        'total_amount',
        'status',
        'payment_date',
        'mode',
        'remarks'
    ];

    public function studentDetail()
    {
        return $this->belongsTo(StudentDetails::class, 'student_details_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
