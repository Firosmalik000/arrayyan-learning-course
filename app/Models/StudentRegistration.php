<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_name',
        'address',
        'school_name',
        'level',
        'subjects',
        'program',
        'package',
        'parent_contact',
        'preferred_mode',
        'notes',
    ];
}
