<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceStreak extends Model
{
    protected $fillable = [
        'user_id',
        'user_type',
        'school_id',
        'current_streak',
        'best_streak',
        'last_attendance_date',
        'badges_earned',
        'perfect_weeks',
        'perfect_months',
    ];

    protected $casts = [
        'badges_earned' => 'array',
        'last_attendance_date' => 'date',
        'current_streak' => 'integer',
        'best_streak' => 'integer',
        'perfect_weeks' => 'integer',
        'perfect_months' => 'integer',
    ];

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user (polymorphic)
     */
    public function user()
    {
        if ($this->user_type === 'student') {
            return $this->belongsTo(Student::class, 'user_id');
        }
        return $this->belongsTo(Teacher::class, 'user_id');
    }

    /**
     * Update streak based on attendance
     */
    public function updateStreak($attendanceDate, $wasPresent)
    {
        if (!$wasPresent) {
            $this->current_streak = 0;
            $this->save();
            return;
        }

        $lastDate = $this->last_attendance_date;
        
        if ($lastDate) {
            $daysDiff = $lastDate->diffInDays($attendanceDate);
            
            if ($daysDiff === 1) {
                // Consecutive day
                $this->current_streak++;
            } elseif ($daysDiff > 1) {
                // Streak broken
                $this->current_streak = 1;
            }
        } else {
            $this->current_streak = 1;
        }

        // Update best streak
        if ($this->current_streak > $this->best_streak) {
            $this->best_streak = $this->current_streak;
        }

        $this->last_attendance_date = $attendanceDate;
        $this->save();
    }

    /**
     * Award badge
     */
    public function awardBadge(string $badgeName)
    {
        $badges = $this->badges_earned ?? [];
        
        if (!in_array($badgeName, $badges)) {
            $badges[] = $badgeName;
            $this->badges_earned = $badges;
            $this->save();
        }
    }

    /**
     * Check if user has badge
     */
    public function hasBadge(string $badgeName): bool
    {
        return in_array($badgeName, $this->badges_earned ?? []);
    }
}

