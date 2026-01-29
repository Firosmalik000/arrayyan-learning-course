<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'education',
        'subjects',
        'experience',
        'contact',
        'cv_path',
        'notes',
    ];
}
