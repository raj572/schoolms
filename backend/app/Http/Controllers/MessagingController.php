<?php

namespace App\Http\Controllers;

use App\Services\MessagingService;
use App\Models\ChatRoom;
use App\Models\ChatRoomParticipant;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\ParentModel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MessagingController
{

  private MessagingService $messagingService;

  public function __construct(MessagingService $messagingService)
  {
    $this->messagingService = $messagingService;
  }
  public function createCustomGroup(Request $request)
  {
    try {
      $validated = $request->validate([
        'type'        => 'required|string',
        'class'       => 'required|string',
        'section'     => 'required|string',
        'group_name'  => 'required|string|max:255',
        'teacher_id'  => 'required|exists:teachers,id',
        'created_by_type' => 'required|string',
      ]);

      $group = $this->messagingService->createCustomGroup($validated);

      return response()->json([
        'status' => true,
        'data'   => $group,
        'message' => 'Custom group created successfully'
      ]);
    } catch (ValidationException $e) {
      return response()->json(['status' => false, 'errors' => $e->errors()], 422);
    } catch (Exception $e) {
      return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function addMembers(Request $request, $groupId)
  {
    try {
      $validated = $request->validate([
        'members'     => 'required|array|min:1',
        'members.*.id'   => 'required|integer',
        'members.*.type' => 'required|string|in:student,teacher,parent,user'
      ]);

      $group = $this->messagingService->addMembersToGroup($groupId, $validated['members']);

      return response()->json([
        'status'  => true,
        'message' => 'Members added successfully',
        'data'    => $group
      ]);
    } catch (ValidationException $e) {
      return response()->json(['status' => false, 'errors' => $e->errors()], 422);
    } catch (Exception $e) {
      return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function sendDiaryMessage(Request $request)
  {
    try {
      $validated = $request->validate([
        'sender_role' => 'required',
        'sender_id' => 'required',
        'group_id' => 'required|exists:chat_groups,id',
        'subject' => 'nullable|string',
        'message' => 'required|string',
      ]);

      // Only teacher can send (ensure middleware or guard check here)
      $result = $this->messagingService->sendGroupMessage($validated);

      return response()->json([
        'status' => true,
        'message' => 'Message sent successfully',
        'data' => $result
      ]);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'error' => $e->getMessage()
      ], 400);
    }
  }

  public function sendPersonal(Request $request)
  {
    $validated = $request->validate([
      'sender_role'   => 'required|string',
      'sender_id'     => 'required|integer',
      'receiver_role' => 'required|string',
      'receiver_id'   => 'required|integer',
      'message'       => 'required|string',
    ]);

    try {
      $message = $this->messagingService->sendPersonalMessage($validated);

      return response()->json([
        'success' => true,
        'data'    => $message->load('sender'),
      ]);
    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'error'   => $e->getMessage(),
      ], 400);
    }
  }


  /**
   * Get group chat history
   */
  public function groupHistory($roomId, Request $request)
  {
    $limit = $request->query('limit', 50);

    $history = $this->messagingService->getGroupChatHistory($roomId, $limit);

    return response()->json($history);
  }

  /**
   * Get personal chat history between authenticated user and another
   */
  public function personalHistory(Request $request)
  {
    $validated = $request->validate([
      'receiver_id' => 'required|integer',
      'receiver_type' => 'required|string',
      'sender_id' => 'required|integer',
      'sender_type' => 'required|string',
    ]);


    $history = $this->messagingService->getPersonalChatHistory($validated, 50);

    return response()->json($history);
  }

  /**
   * Get all conversations for a principal
   */
  public function getPrincipalConversations($principalId)
  {
    try {
      // Get all chat rooms where principal is a participant
      $rooms = ChatRoom::where('type', 'private')
        ->whereHas('participants', function ($q) use ($principalId) {
          $q->where('participant_id', $principalId)
            ->where('participant_type', 'App\Models\User');
        })
        ->with(['participants', 'messages' => function ($query) {
          $query->orderBy('created_at', 'desc')->limit(1);
        }])
        ->get();

      // Format conversations
      $conversations = [];
      foreach ($rooms as $room) {
        $otherParticipant = $room->participants
          ->where('participant_id', '!=', $principalId)
          ->first();

        if ($otherParticipant) {
          $conversations[] = [
            'room_id' => $room->id,
            'participant_id' => $otherParticipant->participant_id,
            'participant_type' => $otherParticipant->participant_type,
            'last_message' => $room->messages->first(),
            'created_at' => $room->created_at,
          ];
        }
      }

      return response()->json([
        'status' => true,
        'data' => $conversations
      ]);
    } catch (Exception $e) {
      Log::error("MessagingController::getPrincipalConversations - " . $e->getMessage());
      return response()->json([
        'status' => false,
        'message' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get list of users that a principal can message
   */
  public function getContactableUsers($principalId)
  {
    try {
      $principal = User::findOrFail($principalId);
      $schoolId = $principal->school_id;

      $contactable = [
        'teachers' => [],
        'parents' => [],
        'students' => [],
        'administrator' => null,
      ];

      // Get teachers
      $teachers = Teacher::where('school_id', $schoolId)
        ->select('id', 'name', 'email', 'phone')
        ->get()
        ->map(function($teacher) {
          return [
            'id' => $teacher->id,
            'full_name' => $teacher->name,
            'email' => $teacher->email,
            'phone' => $teacher->phone
          ];
        });
      $contactable['teachers'] = $teachers;

      // Get parents
      $parents = ParentModel::where('school_id', $schoolId)
        ->select('id', 'father_name', 'mother_name', 'guardian_name', 'email', 'phone')
        ->get()
        ->map(function($parent) {
          $name = $parent->father_name . ' & ' . $parent->mother_name;
          if ($parent->guardian_name) {
            $name = $parent->guardian_name;
          }
          return [
            'id' => $parent->id,
            'full_name' => $name,
            'email' => $parent->email,
            'phone' => $parent->phone
          ];
        });
      $contactable['parents'] = $parents;

      // Get students
      $students = Student::where('school_id', $schoolId)
        ->with('detail')
        ->get()
        ->map(function($student) {
          $detail = $student->detail;
          $name = $detail ? $detail->candidate_name : $student->username;
          return [
            'id' => $student->id,
            'full_name' => $name,
            'email' => $student->email,
            'phone' => $detail ? $detail->phone : null
          ];
        });
      $contactable['students'] = $students;

      // Get administrator
      if ($principal->administrator_id) {
        $admin = User::where('id', $principal->administrator_id)
          ->where('role', 'administrator')
          ->select('id', 'full_name', 'email', 'phone')
          ->first();
        $contactable['administrator'] = $admin;
      }

      return response()->json([
        'status' => true,
        'data' => $contactable
      ]);
    } catch (Exception $e) {
      Log::error("MessagingController::getContactableUsers - " . $e->getMessage());
      return response()->json([
        'status' => false,
        'message' => $e->getMessage()
      ], 500);
    }
  }
}
