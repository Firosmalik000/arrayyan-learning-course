<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
