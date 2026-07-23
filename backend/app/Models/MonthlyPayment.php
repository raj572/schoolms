<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyPayment extends Model
{
    protected $fillable = [
        'school_id',
        'student_details_id',
        'month',
        'total_amount',
        'status',
        'payment_date',
        'mode',
        'remarks',
    ];

    // 🔗 Relations
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function student()
    {
        return $this->belongsTo(StudentDetails::class, 'student_details_id');
    }

    public function items()
    {
        return $this->hasMany(MonthlyPaymentItem::class);
    }
}
