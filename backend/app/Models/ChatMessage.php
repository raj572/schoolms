<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatMessage extends Model
{
    protected $fillable = [
        'chat_room_id',
        'sender_id',
        'subject',
        'sender_type',
        'message',
        'attachment_url',
        'message_type',
        'status'
    ];

    // Belongs to a chat room
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    // Sender can be from students, teachers, parents, or users
    public function sender(): MorphTo
    {
        return $this->morphTo();
    }

    // Read receipts
    public function reads(): HasMany
    {
        return $this->hasMany(MessageRead::class);
    }
}
