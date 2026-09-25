<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event',
        'subject_type',
        'subject_id',
        'description',
        'properties',
        'caused_by',
        'caused_by_name',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    public static function record(
        string $event,
        string $description,
        ?object $subject = null,
        ?array $properties = null,
    ): self {
        $user = Auth::user();

        return self::create([
            'event' => $event,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'properties' => $properties,
            'caused_by' => $user?->getKey(),
            'caused_by_name' => $user?->name,
            'ip_address' => request()->ip(),
        ]);
    }

    public function causer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'caused_by');
    }
}
