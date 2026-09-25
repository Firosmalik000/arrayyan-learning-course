<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankSoal extends Model
{
    use HasFactory;

    protected $table = 'bank_soals';

    protected $fillable = [
        'slug',
        'name',
        'category',
        'level',
        'format',
        'questions',
        'description',
        'links',
        'passkey',
        'view_count',
        'download_count',
        'image_path',
        'tone',
        'is_active',
    ];

    protected $casts = [
        'name' => 'array',
        'category' => 'array',
        'level' => 'array',
        'description' => 'array',
        'links' => 'array',
        'questions' => 'integer',
        'view_count' => 'integer',
        'download_count' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'passkey',
    ];
}
