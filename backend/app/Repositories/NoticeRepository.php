<?php

namespace App\Repositories;

use App\Models\Notice;
use App\Models\NoticeRead;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * NoticeRepository
 *
 * Handles database operations for Notice model
 */
class NoticeRepository
{
    /**
     * Get all notices for a school
     */
    public function getAllBySchool(int $schoolId): Collection
    {
        return Notice::where('school_id', $schoolId)
            ->with(['creator'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get active notices
     */
    public function getActive(int $schoolId): Collection
    {
        return Notice::where('school_id', $schoolId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('publish_date')
                    ->orWhere('publish_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            })
            ->with(['creator'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get notices for a specific user role
     */
    public function getForRole(int $schoolId, string $role, ?int $classId = null): Collection
    {
        return Notice::where('school_id', $schoolId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('publish_date')
                    ->orWhere('publish_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            })
            ->where(function ($query) use ($role, $classId) {
                $query->whereNull('target_roles')
                    ->orWhereJsonContains('target_roles', 'all')
                    ->orWhereJsonContains('target_roles', $role);
            })
            ->when($classId, function ($query) use ($classId) {
                $query->where(function ($q) use ($classId) {
                    $q->whereNull('target_classes')
                        ->orWhereJsonContains('target_classes', $classId);
                });
            })
            ->with(['creator'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find notice by ID
     */
    public function findById(int $id): ?Notice
    {
        return Notice::with(['creator', 'reads'])->find($id);
    }

    /**
     * Create notice
     */
    public function create(array $data): Notice
    {
        return DB::transaction(function () use ($data) {
            return Notice::create($data);
        });
    }

    /**
     * Update notice
     */
    public function update(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $notice = Notice::findOrFail($id);
            return $notice->update($data);
        });
    }

    /**
     * Delete notice
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $notice = Notice::findOrFail($id);
            return $notice->delete();
        });
    }

    /**
     * Mark notice as read
     */
    public function markAsRead(int $noticeId, int $readerId, string $readerType): bool
    {
        return DB::transaction(function () use ($noticeId, $readerId, $readerType) {
            NoticeRead::updateOrCreate(
                [
                    'notice_id' => $noticeId,
                    'reader_id' => $readerId,
                    'reader_type' => $readerType,
                ],
                [
                    'read_at' => now(),
                ]
            );
            return true;
        });
    }

    /**
     * Check if user has read notice
     */
    public function hasRead(int $noticeId, int $readerId, string $readerType): bool
    {
        return NoticeRead::where('notice_id', $noticeId)
            ->where('reader_id', $readerId)
            ->where('reader_type', $readerType)
            ->exists();
    }

    /**
     * Get unread notices for user
     */
    public function getUnread(int $schoolId, string $role, int $userId, string $userType, ?int $classId = null): Collection
    {
        $notices = $this->getForRole($schoolId, $role, $classId);

        return $notices->filter(function ($notice) use ($userId, $userType) {
            return !$this->hasRead($notice->id, $userId, $userType);
        });
    }

    /**
     * Get read count for a notice
     */
    public function getReadCount(int $noticeId): int
    {
        return NoticeRead::where('notice_id', $noticeId)->count();
    }

    /**
     * Toggle notice active status
     */
    public function toggleActive(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $notice = Notice::findOrFail($id);
            return $notice->update(['is_active' => !$notice->is_active]);
        });
    }
}


