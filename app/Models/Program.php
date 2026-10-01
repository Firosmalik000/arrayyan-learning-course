<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'level',
        'description',
        'price',
        'duration',
        'quota',
        'schedule_info',
        'syllabus',
        'teacher_id',
        'subjects',
        'mode',
        'image_path',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'subjects' => 'array',
            'syllabus' => 'array',
            'price' => 'decimal:2',
            'quota' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class)
            ->orderBy('sort_order')
            ->orderBy('level')
            ->orderBy('sessions');
    }

    public function studentRegistrations(): HasMany
    {
        return $this->hasMany(StudentRegistration::class);
    }

    public function startingPrice(): ?string
    {
        $packagePrices = ($this->relationLoaded('packages')
            ? $this->packages->where('is_active', true)
            : $this->packages()->where('is_active', true)->get())
            ->whereNotNull('price')
            ->pluck('price')
            ->filter(fn ($price) => $price !== null && $price !== '')
            ->map(fn ($price) => (float) $price);

        $prices = collect();
        if ($this->price !== null && $this->price !== '') {
            $prices->push((float) $this->price);
        }
        $prices = $prices->merge($packagePrices);

        return $prices->isNotEmpty() ? number_format((float) $prices->min(), 2, '.', '') : null;
    }

    public function quotaFilled(): int
    {
        return StudentRegistration::query()
            ->where('program_id', $this->getKey())
            ->whereIn('status', ['pending', 'approved'])
            ->count();
    }

    public function quotaRemaining(): ?int
    {
        if ($this->quota === null) {
            return null;
        }

        return max(0, $this->quota - $this->quotaFilled());
    }

    public function hasAvailableQuota(): bool
    {
        if ($this->quota === null) {
            return true;
        }

        return $this->quotaRemaining() > 0;
    }
}
