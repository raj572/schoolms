<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatRoomParticipant extends Model
{
    protected $fillable = [
        'chat_room_id',
        'participant_id',
        'participant_type',
        'role',
        'joined_at'
    ];

    public $timestamps = false;

    // Belongs to a chat room
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    // Polymorphic participant (student, teacher, parent, user)
    public function participant(): MorphTo
    {
        return $this->morphTo();
    }
}
