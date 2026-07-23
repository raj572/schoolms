<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    protected $fillable = [
        'school_id',
        'class',
        'tuition_fee',
        'other_fee',
        'registration_fee',
        'admission_fee'
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
