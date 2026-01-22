<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'subjects',
        'sessions',
        'mode',
        'schedule',
        'is_active',
    ];

    protected $casts = [
        'subjects' => 'array',
        'sessions' => 'integer',
        'is_active' => 'boolean',
    ];
}
