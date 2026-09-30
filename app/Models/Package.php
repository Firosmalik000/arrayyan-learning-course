<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'name',
        'slug',
        'level',
        'subjects',
        'sessions',
        'intensity',
        'max_participants',
        'sort_order',
        'mode',
        'schedule',
        'price',
        'duration',
        'quota',
        'schedule_info',
        'syllabus',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'subjects' => 'array',
            'syllabus' => 'array',
            'sessions' => 'integer',
            'max_participants' => 'integer',
            'sort_order' => 'integer',
            'price' => 'decimal:2',
            'quota' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function studentRegistrations(): HasMany
    {
        return $this->hasMany(StudentRegistration::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function displayName(): string
    {
        $parts = array_filter([
            $this->level,
            $this->sessions ? $this->sessions.' pertemuan/bulan' : null,
            $this->intensity,
        ]);

        return implode(' • ', $parts) ?: $this->name;
    }
}
