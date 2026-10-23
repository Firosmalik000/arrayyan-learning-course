<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassGroup extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::created(function (ClassGroup $classGroup): void {
            $classGroup->lifecycles()->create([
                'activated_at' => $classGroup->created_at?->toDateString() ?? now()->toDateString(),
                'deactivated_at' => $classGroup->is_active ? null : now()->toDateString(),
            ]);
        });
    }

    protected $fillable = [
        'program_id',
        'level',
        'package_id',
        'total_sessions',
        'teacher_id',
        'name',
        'quota',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'total_sessions' => 'integer',
            'quota' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ClassMember::class, 'class_group_id');
    }

    public function lifecycles(): HasMany
    {
        return $this->hasMany(ClassGroupLifecycle::class)->orderBy('activated_at');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function activeMembers(): HasMany
    {
        return $this->members()->where('status', 'active');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'class_members', 'class_group_id', 'student_id')
            ->withPivot(['status', 'joined_at', 'ended_at', 'is_scholarship', 'notes'])
            ->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'class_group_id')->orderBy('day_of_week')->orderBy('start_time');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'class_group_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'class_group_id');
    }

    public function activeMemberCount(): int
    {
        return $this->activeMembers()->count();
    }

    public function hasAvailableSeat(): bool
    {
        if ($this->quota === null) {
            return true;
        }

        return $this->activeMemberCount() < $this->quota;
    }
}
