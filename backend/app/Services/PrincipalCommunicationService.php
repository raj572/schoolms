<?php

namespace App\Services;

use App\Models\PrincipalMessagePermission;
use App\Models\User;
use App\Models\School;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PrincipalCommunicationService
{
    /**
     * Get message permissions for a principal
     */
    public function getMessagePermissions(int $principalId): array
    {
        try {
            $permission = PrincipalMessagePermission::where('principal_id', $principalId)->first();

            if (!$permission) {
                // Return default permissions if none exist
                return [
                    'status' => true,
                    'data' => [
                        'principal_id' => $principalId,
                        'allow_from_teachers' => true,
                        'allow_from_parents' => true,
                        'allow_from_students' => true,
                        'allow_from_administrator' => true,
                    ]
                ];
            }

            return [
                'status' => true,
                'data' => [
                    'principal_id' => $permission->principal_id,
                    'school_id' => $permission->school_id,
                    'allow_from_teachers' => $permission->allow_from_teachers,
                    'allow_from_parents' => $permission->allow_from_parents,
                    'allow_from_students' => $permission->allow_from_students,
                    'allow_from_administrator' => $permission->allow_from_administrator,
                ]
            ];
        } catch (Exception $e) {
            Log::error("PrincipalCommunicationService::getMessagePermissions - " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to get message permissions'
            ];
        }
    }

    /**
     * Update message permissions for a principal
     */
    public function updateMessagePermissions(int $principalId, array $permissions): array
    {
        DB::beginTransaction();
        try {
            $permission = PrincipalMessagePermission::updateOrCreate(
                ['principal_id' => $principalId],
                [
                    'school_id' => $permissions['school_id'] ?? null,
                    'allow_from_teachers' => $permissions['allow_from_teachers'] ?? true,
                    'allow_from_parents' => $permissions['allow_from_parents'] ?? true,
                    'allow_from_students' => $permissions['allow_from_students'] ?? true,
                    'allow_from_administrator' => $permissions['allow_from_administrator'] ?? true,
                ]
            );

            DB::commit();

            return [
                'status' => true,
                'message' => 'Message permissions updated successfully',
                'data' => $permission
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("PrincipalCommunicationService::updateMessagePermissions - " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update message permissions'
            ];
        }
    }

    /**
     * Check if a sender can contact the principal
     */
    public function canContactPrincipal(int $principalId, string $senderRole): bool
    {
        try {
            $permission = PrincipalMessagePermission::where('principal_id', $principalId)->first();

            // If no permission record exists, allow by default
            if (!$permission) {
                return true;
            }

            return $permission->canContactFromRole($senderRole);
        } catch (Exception $e) {
            Log::error("PrincipalCommunicationService::canContactPrincipal - " . $e->getMessage());
            return false; // Deny if there's an error for security
        }
    }

    /**
     * Get communication statistics for a principal
     */
    public function getCommunicationStats(int $principalId): array
    {
        try {
            $principal = User::find($principalId);
            
            if (!$principal || $principal->role !== 'principal') {
                return [
                    'status' => false,
                    'message' => 'Principal not found'
                ];
            }

            $schoolId = $principal->school_id;

            // Count total messages
            $totalMessages = DB::table('chat_messages')
                ->join('chat_rooms', 'chat_messages.chat_room_id', '=', 'chat_rooms.id')
                ->join('chat_room_participants', 'chat_rooms.id', '=', 'chat_room_participants.chat_room_id')
                ->where('chat_room_participants.participant_id', $principalId)
                ->where('chat_room_participants.participant_type', 'App\Models\User')
                ->count();

            // Count active notices
            $activeNotices = DB::table('notices')
                ->where('school_id', $schoolId)
                ->where('is_active', true)
                ->count();

            // Count unread messages
            $unreadMessages = DB::table('chat_messages')
                ->join('chat_rooms', 'chat_messages.chat_room_id', '=', 'chat_rooms.id')
                ->join('chat_room_participants', 'chat_rooms.id', '=', 'chat_room_participants.chat_room_id')
                ->leftJoin('message_reads', function($join) use ($principalId) {
                    $join->on('chat_messages.id', '=', 'message_reads.chat_message_id')
                         ->where('message_reads.reader_id', $principalId);
                })
                ->where('chat_room_participants.participant_id', $principalId)
                ->where('chat_room_participants.participant_type', 'App\Models\User')
                ->whereNull('message_reads.id')
                ->where('chat_messages.sender_id', '!=', $principalId)
                ->count();

            return [
                'status' => true,
                'data' => [
                    'total_messages' => $totalMessages,
                    'active_notices' => $activeNotices,
                    'unread_messages' => $unreadMessages,
                ]
            ];
        } catch (Exception $e) {
            Log::error("PrincipalCommunicationService::getCommunicationStats - " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to get communication statistics'
            ];
        }
    }
}

