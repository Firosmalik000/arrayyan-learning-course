<?php

namespace App\Models;

use Database\Factories\ClassMemberPeriodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassMemberPeriod extends Model
{
    /** @use HasFactory<ClassMemberPeriodFactory> */
    use HasFactory;

    protected $fillable = [
        'class_member_id',
        'start_date',
        'end_date',
        'session_limit',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'session_limit' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(ClassMember::class, 'class_member_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
