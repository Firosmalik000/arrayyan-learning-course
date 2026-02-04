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
        'tone',
        'is_active',
    ];

    protected $casts = [
        'name' => 'array',
        'category' => 'array',
        'level' => 'array',
        'description' => 'array',
        'questions' => 'integer',
        'is_active' => 'boolean',
    ];
}
