<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * NoticeRead Model
 *
 * Tracks who has read a notice
 *
 * @property int $id
 * @property int $notice_id
 * @property int $reader_id
 * @property string $reader_type
 * @property string $read_at
 */
class NoticeRead extends Model
{
    use HasFactory;

    protected $fillable = [
        'notice_id',
        'reader_id',
        'reader_type',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the notice
     */
    public function notice(): BelongsTo
    {
        return $this->belongsTo(Notice::class);
    }

    /**
     * Get the reader (polymorphic)
     */
    public function reader(): MorphTo
    {
        return $this->morphTo();
    }
}


