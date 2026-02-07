<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'description',
        'subjects',
        'mode',
        'image_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'subjects' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
