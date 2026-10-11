<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory;

    public const DAYS = [
        1 => 'Senin',
        2 => 'Selasa',
        3 => 'Rabu',
        4 => 'Kamis',
        5 => 'Jumat',
        6 => 'Sabtu',
        7 => 'Minggu',
    ];

    protected $fillable = [
        'class_group_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class, 'class_group_id');
    }

    public function dayLabel(): string
    {
        return self::DAYS[$this->day_of_week] ?? '-';
    }

    public function overlapsWith(int $day, string $start, string $end, ?int $ignoreId = null): bool
    {
        if ($this->day_of_week !== $day) {
            return false;
        }

        if ($ignoreId && $this->getKey() === $ignoreId) {
            return false;
        }

        return $start < $this->end_time && $this->start_time < $end;
    }
}
