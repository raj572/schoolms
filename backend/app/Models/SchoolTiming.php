<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolTiming extends Model
{
    use HasFactory;

    protected $table = 'school_timings';

    protected $fillable = [
        'school_id',
        'day',
        'morning',
        'office',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /**
     * Get the school that owns the timing
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

