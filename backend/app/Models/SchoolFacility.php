<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolFacility extends Model
{
    use HasFactory;

    protected $table = 'school_facilities';

    protected $fillable = [
        'school_id',
        'name',
        'count',
        'description',
        'status',
    ];

    protected $casts = [
        'count' => 'integer',
    ];

    /**
     * Get the school that owns the facility
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

