<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Olympiad extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'level',
        'schedule',
        'selection_system',
        'category',
        'fee',
        'quota',
        'registration_deadline',
        'winners',
        'is_registration_open',
        'notes',
        'image_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'fee' => 'decimal:2',
            'quota' => 'integer',
            'registration_deadline' => 'date',
            'winners' => 'array',
            'is_registration_open' => 'boolean',
            'is_active' => 'boolean',
            'schedule' => 'date',
        ];
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(OlympiadRegistration::class, 'olympiad_id');
    }

    public function isPaid(): bool
    {
        $category = strtolower((string) $this->category);

        return $category === 'paid' || $category === 'berbayar' || (float) $this->fee > 0;
    }

    public function quotaFilled(): int
    {
        return $this->registrations()
            ->whereIn('status', [
                OlympiadRegistration::STATUS_PENDING,
                OlympiadRegistration::STATUS_APPROVED,
            ])
            ->count();
    }

    public function quotaRemaining(): ?int
    {
        if ($this->quota === null) {
            return null;
        }

        return max(0, $this->quota - $this->quotaFilled());
    }

    public function registrationClosedReason(): ?string
    {
        if (! $this->is_active) {
            return 'Olimpiade tidak aktif.';
        }

        if (! $this->is_registration_open) {
            return 'Pendaftaran ditutup panitia.';
        }

        if ($this->registration_deadline && $this->registration_deadline->isPast()) {
            return 'Masa pendaftaran telah berakhir.';
        }

        if ($this->quota !== null && $this->quotaRemaining() <= 0) {
            return 'Kuota peserta sudah penuh.';
        }

        return null;
    }
}
