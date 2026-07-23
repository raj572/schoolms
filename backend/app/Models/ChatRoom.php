<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatRoom extends Model
{
    protected $fillable = [
        'type',
        'class',
        'group_name',
        'created_by_id',
        'created_by_type'
    ];


    // Participants
    public function participants(): HasMany
    {
        return $this->hasMany(ChatRoomParticipant::class);
    }

    // Messages
    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }
}
