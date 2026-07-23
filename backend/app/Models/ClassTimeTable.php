<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassTimeTable extends Model
{
    protected $table = 'class_time_table';

    protected $fillable = [
        'school_id',
        'class_id',
        'subject_id',
        'teacher_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }
    public function subject()
    {
        return $this->belongsTo(SchoolSubject::class);
    }
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
    
}
