<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Notice Model
 *
 * Represents a notice/announcement in the school
 *
 * @property int $id
 * @property int $school_id
 * @property string $title
 * @property string $content
 * @property string $type
 * @property string $priority
 * @property array|null $target_roles
 * @property array|null $target_classes
 * @property string|null $publish_date
 * @property string|null $expiry_date
 * @property bool $is_active
 * @property string|null $attachment_url
 * @property int $created_by
 * @property string|null $created_by_role
 */
class Notice extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'title',
        'content',
        'type',
        'priority',
        'target_roles',
        'target_classes',
        'publish_date',
        'expiry_date',
        'is_active',
        'attachment_url',
        'created_by',
        'created_by_role',
    ];

    protected $casts = [
        'target_roles' => 'array',
        'target_classes' => 'array',
        'publish_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school that owns the notice
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created the notice
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all read records for this notice
     */
    public function reads(): HasMany
    {
        return $this->hasMany(NoticeRead::class);
    }

    /**
     * Check if notice is active and not expired
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->publish_date && now()->lessThan($this->publish_date)) {
            return false;
        }

        if ($this->expiry_date && now()->greaterThan($this->expiry_date)) {
            return false;
        }

        return true;
    }

    /**
     * Check if a user should see this notice based on target roles
     */
    public function isTargetedTo(string $role, ?int $classId = null): bool
    {
        // If target_roles includes 'all' or is empty, everyone can see
        if (empty($this->target_roles) || in_array('all', $this->target_roles)) {
            return true;
        }

        // Check if user's role is in target_roles
        if (in_array($role, $this->target_roles)) {
            // If target_classes is specified, check class
            if (!empty($this->target_classes) && $classId !== null) {
                return in_array($classId, $this->target_classes);
            }
            return true;
        }

        return false;
    }
}


