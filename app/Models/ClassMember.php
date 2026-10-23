<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassMember extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_GRADUATED = 'graduated';

    public const STATUS_MOVED = 'moved';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_GRADUATED,
        self::STATUS_MOVED,
    ];

    protected $fillable = [
        'class_group_id',
        'student_id',
        'status',
        'joined_at',
        'ended_at',
        'is_scholarship',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'ended_at' => 'date',
            'is_scholarship' => 'boolean',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class, 'class_group_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function periods(): HasMany
    {
        return $this->hasMany(ClassMemberPeriod::class)->orderByDesc('start_date');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
