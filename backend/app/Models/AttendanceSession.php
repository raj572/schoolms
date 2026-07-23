<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AttendanceSession extends Model
{
    protected $fillable = [
        'school_id',
        'class_id',
        'teacher_id',
        'session_code',
        'session_date',
        'period_number',
        'subject_id',
        'session_type',
        'status',
        'expires_at',
        'total_students',
        'checked_in_count',
    ];

    protected $casts = [
        'session_date' => 'date',
        'expires_at' => 'datetime',
        'total_students' => 'integer',
        'checked_in_count' => 'integer',
        'period_number' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($session) {
            if (!$session->session_code) {
                $session->session_code = $session->generateSessionCode();
            }
            
            if (!$session->expires_at) {
                $session->expires_at = Carbon::now()->addMinutes(30); // Default 30 min expiry
            }
        });
    }

    /**
     * Generate unique session code for QR
     */
    public function generateSessionCode(): string
    {
        return strtoupper(Str::random(8));
    }

    /**
     * Check if session is expired
     */
    public function isExpired(): bool
    {
        return Carbon::now()->gt($this->expires_at) || $this->status === 'expired';
    }

    /**
     * Check if session is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isExpired();
    }

    /**
     * Mark session as completed
     */
    public function complete()
    {
        $this->status = 'completed';
        $this->save();
    }

    /**
     * Mark session as expired
     */
    public function expire()
    {
        $this->status = 'expired';
        $this->save();
    }

    /**
     * Increment checked-in count
     */
    public function incrementCheckIn()
    {
        $this->checked_in_count++;
        $this->save();
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentage(): float
    {
        if ($this->total_students === 0) {
            return 0;
        }
        return round(($this->checked_in_count / $this->total_students) * 100, 2);
    }

    /**
     * Relationships
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(SchoolSubject::class, 'subject_id');
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(StudentAttendanceRecord::class, 'session_id');
    }
}

