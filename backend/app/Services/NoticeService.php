<?php

namespace App\Services;

use App\Repositories\NoticeRepository;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * NoticeService
 *
 * Handles business logic for notice/announcement management
 */
class NoticeService
{
    protected NoticeRepository $noticeRepository;

    public function __construct(NoticeRepository $noticeRepository)
    {
        $this->noticeRepository = $noticeRepository;
    }

    /**
     * Get all notices
     */
    public function getAllNotices(int $schoolId): array
    {
        try {
            $notices = $this->noticeRepository->getAllBySchool($schoolId);

            return [
                'status' => true,
                'message' => 'Notices fetched successfully',
                'data' => $notices,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching notices: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch notices',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get active notices
     */
    public function getActiveNotices(int $schoolId): array
    {
        try {
            $notices = $this->noticeRepository->getActive($schoolId);

            return [
                'status' => true,
                'message' => 'Active notices fetched successfully',
                'data' => $notices,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching active notices: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch active notices',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get notices for a specific role
     */
    public function getNoticesForRole(int $schoolId, string $role, ?int $classId = null): array
    {
        try {
            $notices = $this->noticeRepository->getForRole($schoolId, $role, $classId);

            return [
                'status' => true,
                'message' => 'Notices fetched successfully',
                'data' => $notices,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching notices for role: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch notices',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get unread notices for user
     */
    public function getUnreadNotices(int $schoolId, string $role, int $userId, string $userType, ?int $classId = null): array
    {
        try {
            $notices = $this->noticeRepository->getUnread($schoolId, $role, $userId, $userType, $classId);

            return [
                'status' => true,
                'message' => 'Unread notices fetched successfully',
                'data' => $notices,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching unread notices: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch unread notices',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get notice by ID
     */
    public function getNoticeById(int $id): array
    {
        try {
            $notice = $this->noticeRepository->findById($id);

            if (!$notice) {
                return [
                    'status' => false,
                    'message' => 'Notice not found',
                ];
            }

            return [
                'status' => true,
                'message' => 'Notice fetched successfully',
                'data' => $notice,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching notice: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch notice',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create notice
     */
    public function createNotice(array $data): array
    {
        try {
            $notice = $this->noticeRepository->create($data);

            return [
                'status' => true,
                'message' => 'Notice created successfully',
                'data' => $notice,
            ];
        } catch (Exception $e) {
            Log::error("Error creating notice: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to create notice',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update notice
     */
    public function updateNotice(int $id, array $data): array
    {
        try {
            $updated = $this->noticeRepository->update($id, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update notice',
                ];
            }

            return [
                'status' => true,
                'message' => 'Notice updated successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error updating notice: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update notice',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete notice
     */
    public function deleteNotice(int $id): array
    {
        try {
            $deleted = $this->noticeRepository->delete($id);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to delete notice',
                ];
            }

            return [
                'status' => true,
                'message' => 'Notice deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting notice: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to delete notice',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Mark notice as read
     */
    public function markAsRead(int $noticeId, int $readerId, string $readerType): array
    {
        try {
            $marked = $this->noticeRepository->markAsRead($noticeId, $readerId, $readerType);

            if (!$marked) {
                return [
                    'status' => false,
                    'message' => 'Failed to mark notice as read',
                ];
            }

            return [
                'status' => true,
                'message' => 'Notice marked as read',
            ];
        } catch (Exception $e) {
            Log::error("Error marking notice as read: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to mark notice as read',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Toggle notice active status
     */
    public function toggleActive(int $id): array
    {
        try {
            $toggled = $this->noticeRepository->toggleActive($id);

            if (!$toggled) {
                return [
                    'status' => false,
                    'message' => 'Failed to toggle notice status',
                ];
            }

            return [
                'status' => true,
                'message' => 'Notice status toggled successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error toggling notice status: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to toggle notice status',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get read count for notice
     */
    public function getReadCount(int $noticeId): array
    {
        try {
            $count = $this->noticeRepository->getReadCount($noticeId);

            return [
                'status' => true,
                'message' => 'Read count fetched successfully',
                'data' => ['count' => $count],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching read count: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch read count',
                'error' => $e->getMessage(),
            ];
        }
    }
}


