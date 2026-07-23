<?php

namespace App\Services;

use App\Events\ChatMessageSent;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\ChatRoomParticipant;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\PrincipalMessagePermission;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MessagingService
{
  public function createCustomGroup(array $data)
  {
    DB::beginTransaction();
    try {
      $room = ChatRoom::create([
        'type'            => $data['type'],
        'class'           => $data['class'],
        'section'         => $data['section'],
        'group_name'      => $data['group_name'],
        'created_by_id'   => $data['teacher_id'],
        'created_by_type' => $data['created_by_type'],
      ]);

      DB::commit();
      return $room->load('members');
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception('Failed to create custom group: ' . $e->getMessage(), 0, $e);
    }
  }

  public function addMembersToGroup($groupId, array $members)
  {
    DB::beginTransaction();
    try {
      $room = ChatRoom::findOrFail($groupId);

      foreach ($members as $member) {
        $exists = ChatRoomParticipant::where('chat_room_id', $groupId)
          ->where('user_id', $member['id'])
          ->where('user_type', $member['type'])
          ->exists();

        if (!$exists) {
          ChatRoomParticipant::create([
            'chat_room_id' => $groupId,
            'user_id'      => $member['id'],
            'user_type'    => $member['type'],
          ]);
        }
      }

      DB::commit();
      return $room->load('members');
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception('Failed to add members: ' . $e->getMessage(), 0, $e);
    }
  }

  public function sendGroupMessage(array $data)
  {
    DB::beginTransaction();
    try {
      // Step 1: Get sender model
      if ($data['role'] === 'teacher') {
        $user = Teacher::findOrFail($data['sender_id']);
      } else {
        $user = User::findOrFail($data['sender_id']);
      }

      // Step 2: Verify role
      if (!in_array($user->role, ['teacher', 'principal'])) {
        throw new Exception("Only teachers or principal can send messages in groups");
      }

      // Step 3: Ensure sender belongs to group
      $isMember = ChatRoomParticipant::where('chat_room_id', $data['group_id'])
        ->where('participant_id', $user->id)
        ->where('participant_type', get_class($user))
        ->exists();

      if (!$isMember) {
        throw new Exception("User is not a member of this group");
      }

      // Step 4: Save message
      $message = $user->messages()->create([
        'chat_room_id' => $data['group_id'],
        'subject'      => $data['subject'] ?? null,
        'message'      => $data['message'],
      ]);

      DB::commit();

      // Step 5: Broadcast (safe try/catch, don’t rollback DB if socket fails)
      try {
        broadcast(new ChatMessageSent($message))->toOthers();
      } catch (Exception $e) {
        // Log socket failure but don’t stop the app
        Log::warning("Broadcast failed for message {$message->id}: " . $e->getMessage());
      }

      return $message;
    } catch (Exception $e) {
      DB::rollBack();
      throw new Exception('Failed to send message: ' . $e->getMessage(), 0, $e);
    }
  }

  public function sendPersonalMessage(array $data)
  {
    return DB::transaction(function () use ($data) {

      $senderRole = $data['sender_role'];
      $senderId = $data['sender_id'];
      $reciverRole = $data['reciver_role'];
      $reciverId = $data['reciver_id'];

      if ($senderRole === 'teacher') {
        $sender = Teacher::findOrFail($senderId);
      } else if ($senderRole === 'student') {
        // Assuming Student model exists
        $sender = Student::findOrFail($senderId);
      } else if ($senderRole === 'parent') {
        // Assuming Parent model exists
        $sender = Parent::findOrFail($senderId);
      } else {
        $sender = User::findOrFail($senderId);
      }

      if ($reciverRole === 'teacher') {
        $receiver = Teacher::findOrFail($reciverId);
      } else if ($reciverRole === 'student') {
        // Assuming Student model exists
        $receiver = Student::findOrFail($reciverId);
      } else if ($reciverRole === 'parent') {
        // Assuming Parent model exists
        $receiver = Parent::findOrFail($reciverId);
      } else {
        $receiver = User::findOrFail($reciverId);
      }

      // Check if receiver is a principal and if sender has permission to contact
      if ($receiver instanceof User && $receiver->role === 'principal') {
        $permission = PrincipalMessagePermission::where('principal_id', $receiver->id)->first();
        if ($permission && !$permission->canContactFromRole($senderRole)) {
          throw new Exception("You do not have permission to message the principal. The principal has restricted messaging from {$senderRole}s.");
        }
      }


      // 2. Find existing room (private between same 2 users)
      $room = ChatRoom::where('type', 'private')
        ->whereHas('participants', function ($q) use ($sender) {
          $q->where('participant_id', $sender->id)
            ->where('participant_type', $sender->participant_type);
        })
        ->whereHas('participants', function ($q) use ($receiver) {
          $q->where('participant_id', $receiver->id)
            ->where('participant_type', $receiver->participant_type);
        })
        ->first();

      // 3. If not found → create
      if (!$room) {
        $room = ChatRoom::create([
          'type'            => 'private',
          'group_name'      => null,
          'class'           => null,
          'section'         => null,
          'created_by_id'   => $sender->id,
          'created_by_type' => get_class($sender),
        ]);

        ChatRoomParticipant::insert([
          [
            'chat_room_id' => $room->id,
            'participant_id'   => $sender->id,
            'participant_type' => $sender->participant_type,
          ],
          [
            'chat_room_id' => $room->id,
            'participant_id'   => $receiver->id,
            'participant_type' => $receiver->participant_type,
          ],
        ]);
      }

      // 4. Store message
      $message = $sender->messages()->create([
        'sender_id'   => $sender->id,
        'sender_type' => $sender->role,
        'receiver_id'   => $receiver->id,
        'receiver_type' => $receiver->role,
        'chat_room_id' => $room->id,
        'subject'      => $data['subject'] ?? null,
        'message'      => $data['message'],
      ]);

      // 5. Fire event (optional WebSocket)
      try {
        broadcast(new ChatMessageSent($message))->toOthers();
      } catch (Exception $e) {
        Log::warning("Broadcast failed: " . $e->getMessage());
      }

      return $message;
    });
  }


  /**
   * Get history for a group chat (by chat_room_id).
   */
  public function getGroupChatHistory(int $roomId, int $limit = 20): Collection
  {
    return ChatMessage::with('sender')
      ->where('chat_room_id', $roomId)
      ->orderBy('created_at', 'desc')
      ->take($limit)
      ->get()
      ->reverse()
      ->values();
  }

  /**
   * Get history for personal chat between 2 users (morph aware).
   */
  public function getPersonalChatHistory(array $data, int $limit = 50)
  {
    $senderId   = $data['sender_id'];
    $senderType = strtolower($data['sender_type']);   // e.g. "teacher"

    $receiverId   = $data['receiver_id'];
    $receiverType = strtolower($data['receiver_type']); // e.g. "student"

    // Find private room where BOTH participants exist
    $room = ChatRoom::where('type', 'private')
      ->whereHas('participants', function ($q) use ($senderId, $senderType) {
        $q->where('participant_id', $senderId)
          ->where('participant_type', $senderType);
      })
      ->whereHas('participants', function ($q) use ($receiverId, $receiverType) {
        $q->where('participant_id', $receiverId)
          ->where('participant_type', $receiverType);
      })
      ->first();

    if (!$room) {
      return collect(); // no history yet
    }

    return ChatMessage::with('sender')
      ->where('chat_room_id', $room->id)
      ->orderBy('created_at', 'desc')
      ->take($limit)
      ->get()
      ->reverse()
      ->values();
  }
}



// src/echo.js
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";

// window.Pusher = Pusher; // required

// const echo = new Echo({
//   broadcaster: "pusher",
//   key: import.meta.env.VITE_PUSHER_APP_KEY,
//   cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "mt1",
//   forceTLS: true,
// });

// export default echo;



// import { useEffect } from "react";
// import echo from "../echo";

// export default function ChatRoom({ chatRoomId }) {
//   useEffect(() => {
//     const channel = echo.channel(`chat.group.${chatRoomId}`);

//     channel.listen("MessageSent", (e) => {
//       console.log("📢 Group message:", e.message);
//     });

//     return () => {
//       echo.leaveChannel(`chat.group.${chatRoomId}`);
//     };
//   }, [chatRoomId]);

//   return <div>Group Chat Room #{chatRoomId}</div>;
// }




// import { useEffect } from "react";
// import echo from "../echo";

// export default function PersonalChat({ me, other }) {
//   // me = { type: "Student", id: 5 }
//   // other = { type: "Teacher", id: 12 }

//   useEffect(() => {
//     let keys = [`${me.type}_${me.id}`, `${other.type}_${other.id}`].sort();
//     let channelName = `chat.personal.${keys[0]}_${keys[1]}`;

//     const channel = echo.channel(channelName);

//     channel.listen("MessageSent", (e) => {
//       console.log("💬 Personal message:", e.message);
//     });

//     return () => {
//       echo.leaveChannel(channelName);
//     };
//   }, [me, other]);

//   return <div>Personal Chat between {me.type} {me.id} and {other.type} {other.id}</div>;
// }
