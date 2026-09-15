<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DigitalResource extends Model
{
    protected $table = 'digital_resources';

    protected $fillable = [
        'school_id',
        'title',
        'resource_type',
        'file_size',
        'file_path_url',
        'downloads',
        'created_by',
    ];
}
