<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
  use HasFactory;

  protected $table = 'schools'; // explicitly define table (optional, Laravel infers from class name)

  protected $fillable = [
    'administrator_id', // The administrator who manages this school (User with role='administrator')
    'name',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'country',
    'pincode',
    // Additional fields
    'logo_path',
    'principal_sign_path',
    'principal_name',
    'principal_phone',
    'principal_email',
    'affiliation_number',
    'board',
    'website',
    'description',
    'established_date',
    'school_code',
    'status',
  ];

  protected $casts = [
    'established_date' => 'date',
  ];

  /**
   * The administrator who manages this school
   * School belongs to one Administrator
   */
  public function administrator()
  {
    return $this->belongsTo(User::class, 'administrator_id')->where('role', 'administrator');
  }

  /**
   * Legacy relationship - kept for backward compatibility
   * Use administrator() instead
   */
  public function user()
  {
    return $this->administrator();
  }

  /**
   * The principal assigned to this school
   * School has one Principal (assigned via users.school_id)
   */
  public function principal()
  {
    return $this->hasOne(User::class, 'school_id')->where('role', 'principal');
  }

  public function student()
  {
    return $this->hasmany(Student::class);
  }

  public function studnetDetails()
  {
    return $this->hasmany(StudentDetails::class);
  }

  public function teacher()
  {
    return $this->hasmany(Teacher::class);
  }

  public function extraService()
  {
    return $this->hasmany(ExtraService::class);
  }

  public function feeStructure()
  {
    return $this->hasmany(FeeStructure::class);
  }

  public function monthlyPayments()
  {
    return $this->hasMany(MonthlyPayment::class);
  }

  public function onlineTransaction()
  {
    return $this->hasMany(OnlineTransaction::class);
  }

  public function studentService()
  {
    return $this->hasMany(StudentService::class);
  }

  public function facilities()
  {
    return $this->hasMany(SchoolFacility::class);
  }

  public function achievements()
  {
    return $this->hasMany(SchoolAchievement::class);
  }

  public function timings()
  {
    return $this->hasMany(SchoolTiming::class)->orderBy('order');
  }

  public function subscriptions()
  {
    return $this->hasMany(Subscription::class);
  }
}
