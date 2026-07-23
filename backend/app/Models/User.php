<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'administrator_id',
        'username',
        'email',
        'password',
        'phone',
        'status',
        'assignment_status',
        'role',
        'otp',
        'otp_expiration_time',
        'registration_status',
        'full_name',
        'email_verified_at',
        'verification_token',
        'email_verified',
        'school_setup_completed',
        'subscription_active',
        'created_at',
        'updated_at'
    ];

    protected $hidden = ['password', 'verification_token', 'otp'];

    protected $casts = [
        'email_verified' => 'boolean',
        'school_setup_completed' => 'boolean',
        'subscription_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];
    /**
     * Relationship depends on user role:
     * - For Principals: belongsTo one School (via users.school_id)
     * - For Administrators: hasMany Schools (via schools.administrator_id)
     */
    public function school()
    {
        // For principals and librarians: they belong to one school
        if ($this->role === 'principal' || $this->role === 'librarian') {
            return $this->belongsTo(School::class, 'school_id');
        }

        // For administrators: they have many schools (return first one for legacy compatibility)
        // Use schools() method to get all schools for an administrator
        return $this->belongsTo(School::class, 'school_id');
    }

    /**
     * For Administrators: Get all schools they manage
     * Administrator has many Schools
     */
    public function schools()
    {
        return $this->hasMany(School::class, 'administrator_id');
    }

    /**
     * For Principals: Get the assigned school
     * Principal belongs to one School
     */
    public function assignedSchool()
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    /**
     * For Principals: Get the administrator who created them
     * Principal belongs to one Administrator
     */
    public function administrator()
    {
        return $this->belongsTo(User::class, 'administrator_id');
    }


    // In Student.php, Teacher.php, Parent.php, and User.php

    public function chatRooms()
    {
        return $this->morphMany(ChatRoomParticipant::class, 'participant');
    }

    public function messages()
    {
        return $this->morphMany(ChatMessage::class, 'sender');
    }

    public function messageReads()
    {
        return $this->morphMany(MessageRead::class, 'reader');
    }

    public function subscription()
    {
        return $this->hasOneThrough(
            Subscription::class,
            School::class,
            'id',
            'school_id',
            'school_id',
            'id'
        );
    }

    public function canAccessServices(): bool
    {
        return $this->registration_status === 'active' &&
               $this->subscription_active &&
               $this->school_setup_completed;
    }

    public function needsEmailVerification(): bool
    {
        return !$this->email_verified;
    }

    public function needsSchoolSetup(): bool
    {
        return $this->email_verified && !$this->school_setup_completed;
    }

    public function needsSubscription(): bool
    {
        return $this->school_setup_completed && !$this->subscription_active;
    }

    /**
     * For Accountants: Get accessible schools based on multi-level access
     * - Administrator-level: Has administrator_id, can access all schools under that administrator
     * - Principal-level: Has school_id, can access only that specific school
     */
    public function accountantSchools()
    {
        // If accountant has administrator_id, return all schools under that administrator
        if ($this->administrator_id) {
            $administrator = User::find($this->administrator_id);
            if ($administrator && $administrator->role === 'administrator') {
                return $administrator->schools();
            }
        }
        // If accountant has school_id, return that specific school
        if ($this->school_id) {
            return School::where('id', $this->school_id);
        }
        // Return empty query if no access
        return School::whereRaw('1 = 0');
    }
}
