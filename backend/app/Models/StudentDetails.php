<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// use App\Models\MessageRead;

class StudentDetails extends Model
{
    protected $fillable = [
        'school_id',
        'student_id',
        'parent_id',
        'candidate_name',
        'gender',
        'addhar',
        'dob',
        'class',
        'roll_no',
        'section',
        'email',
        'father_name',
        'mother_name',
        'phone',
        'address',
        'admission_date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function parent()
    {
        return $this->belongsTo(ParentModel::class, 'parent_id');
    }

    public function monthlyPayments()
    {
        return $this->hasMany(MonthlyPayment::class, 'student_details_id');
    }


    public function annualPayments()
    {
        return $this->hasMany(MonthlyPayment::class);
    }

    public function onlineTransactions()
    {
        return $this->hasMany(MonthlyPayment::class);
    }

    public function extraServices()
    {
        return $this->hasMany(ExtraService::class, 'student_details_id');
    }

    public function services()
    {
        // direct many-to-many through extra_services
        return $this->belongsToMany(StudentService::class, 'extra_services', 'student_details_id', 'service_id')
            ->withTimestamps();
    }


    public function school()
    {
        return $this->belongsTo(School::class);
    }


    public function chatRooms()
    {
        return $this->morphMany(ChatRoomParticipant::class, 'participant');
    }

    public function messages()
    {
        return $this->morphMany(ChatMessage::class, 'sender');
    }

    // public function messageReads()
    // {
    //     return $this->morphMany(MessageRead::class, 'reader');
    // }

    // ✅ One student has many attendance records
    public function attendanceRecords()
    {
        return $this->hasMany(StudentAttendanceRecord::class, 'student_details_id');
    }

    // ✅ One student has one (or many) attendance summary record(s)
    public function attendanceSummary()
    {
        return $this->hasOne(StudentAttendanceSummary::class, 'student_details_id');
        // OR ->hasMany(...) if you plan to store monthly summaries
    }

    /**
     * Get all transport assignments for this student
     */
    public function transportAssignments()
    {
        return $this->hasMany(TransportAssignment::class, 'student_details_id');
    }
}
