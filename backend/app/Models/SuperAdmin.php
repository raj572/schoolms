<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuperAdmin extends Authenticatable
{
    use SoftDeletes;

    protected $fillable = [
        'username',
        'email',
        'password',
        'password_reset_token',
        'password_reset_expires_at',
        'full_name',
        'phone',
        'status',
        'role',
        'last_login_at',
        'last_login_ip',
        'permissions',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'permissions' => 'array',
        'last_login_at' => 'datetime',
        'password_reset_expires_at' => 'datetime',
    ];

    /**
     * Check if super admin is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if has specific permission
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'super_admin') {
            return true; // Super admin has all permissions
        }

        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Update last login information
     */
    public function updateLastLogin(string $ip): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);
    }

    /**
     * Get activity logs (if implemented)
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'causer');
    }
}

