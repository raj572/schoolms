<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentModel extends Model
{
  use HasFactory;

  protected $table = 'parents';

  protected $fillable = [
    'school_id',
    'user_id',
    'student_id',
    'father_name',
    'mother_name',
    'guardian_name',
    'phone',
    'email',
    'password',
    'address',
    'relation',
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

  public function student()
  {
    return $this->hasMany(Student::class);
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

  // public function messageReads()
  // {
  //   return $this->morphMany(MessageRead::class, 'reader');
  // }
}
