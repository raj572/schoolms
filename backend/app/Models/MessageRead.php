<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageRead extends Model
{
    protected $fillable = [
        'chat_message_id',
        'reader_id',
        'reader_type',
        'read_at'
    ];

    public $timestamps = false;

    // Belongs to a message
    public function message(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'chat_message_id');
    }

    // Reader can be student, teacher, parent, or user
    public function reader(): MorphTo
    {
        return $this->morphTo();
    }
}
