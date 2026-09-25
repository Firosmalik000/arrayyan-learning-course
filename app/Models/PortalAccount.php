<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;

class PortalAccount extends Authenticatable
{
    use HasFactory;

    public const TYPE_STUDENT = 'student';

    public const TYPE_TEACHER = 'teacher';

    protected $fillable = [
        'type',
        'student_id',
        'teacher_id',
        'name',
        'contact',
        'password',
        'must_change_password',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'must_change_password' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function isStudent(): bool
    {
        return $this->type === self::TYPE_STUDENT;
    }

    public function isTeacher(): bool
    {
        return $this->type === self::TYPE_TEACHER;
    }
}
