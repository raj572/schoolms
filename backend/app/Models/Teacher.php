<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
  use HasFactory;

  protected $fillable = [
    'school_id',
    'parent_id',
    'user_id',
    'name',
    'email',
    'password',
    'phone',
    'qualification',
    'dob',
    'gender',
    'address',
    'city',
    'state',
    'status',
    'employee_code',
  ];

  // 🔹 Relationships
  public function school()
  {
    return $this->belongsTo(School::class);
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function timetableEntries()
  {
    return $this->hasMany(ClassTimeTable::class, 'teacher_id');
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
}
