<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrincipalMessagePermission extends Model
{
    protected $fillable = [
        'principal_id',
        'school_id',
        'allow_from_teachers',
        'allow_from_parents',
        'allow_from_students',
        'allow_from_administrator',
    ];

    protected $casts = [
        'allow_from_teachers' => 'boolean',
        'allow_from_parents' => 'boolean',
        'allow_from_students' => 'boolean',
        'allow_from_administrator' => 'boolean',
    ];

    /**
     * The principal this permission belongs to
     */
    public function principal(): BelongsTo
    {
        return $this->belongsTo(User::class, 'principal_id');
    }

    /**
     * The school this permission belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    /**
     * Check if a role can contact the principal
     */
    public function canContactFromRole(string $role): bool
    {
        return match ($role) {
            'teacher' => $this->allow_from_teachers,
            'parent' => $this->allow_from_parents,
            'student' => $this->allow_from_students,
            'administrator' => $this->allow_from_administrator,
            default => false,
        };
    }

    /**
     * Get default permissions (all enabled)
     */
    public static function getDefaults(): array
    {
        return [
            'allow_from_teachers' => true,
            'allow_from_parents' => true,
            'allow_from_students' => true,
            'allow_from_administrator' => true,
        ];
    }
}

