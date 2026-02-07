<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_name',
        'address',
        'school_name',
        'level',
        'subjects',
        'program_id',
        'program',
        'package',
        'parent_contact',
        'preferred_mode',
        'notes',
        'status',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function programItem(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }
}
