<?php

namespace App\Services;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public $message;

  public function __construct(ChatMessage $message)
  {
    $this->message = $message;
  }

  /**
   * Dynamically choose the broadcast channel
   */
  public function broadcastOn(): Channel
  {
    if ($this->message->chat_room_id) {
      // Group chat → broadcast to room
      return new Channel("chat.group.{$this->message->chat_room_id}");
    }

    if ($this->message->receiver_id) {
      // Personal chat → broadcast to unique room (both sender & receiver share same channel)
      $user1Key = class_basename($this->message->sender_type) . "_" . $this->message->sender_id;
      $user2Key = class_basename($this->message->receiver_type) . "_" . $this->message->receiver_id;

      // Sort to make it consistent (so sender/receiver order doesn’t matter)
      $sorted = collect([$user1Key, $user2Key])->sort()->values();
      $channelName = "chat.personal." . $sorted[0] . "_" . $sorted[1];

      return new Channel($channelName);
    }

    // fallback (rare)
    return new Channel('chat.general');
  }

  /**
   * Payload for frontend
   */
  public function broadcastWith(): array
  {
    return [
      'id'         => $this->message->id,
      'sender_id'  => $this->message->sender_id,
      'receiver_id' => $this->message->receiver_id,
      'chat_room_id' => $this->message->chat_room_id,
      'message'    => $this->message->message,
      'created_at' => $this->message->created_at->toDateTimeString(),
    ];
  }
}
