<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolSubject extends Model
{
    use HasFactory;

    protected $table = 'school_subjects';

    protected $fillable = [
        'school_id',
        'subject_name',
        'subject_code',
        'description',
    ];

    /**
     * Each subject belongs to a school.
     */
    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
