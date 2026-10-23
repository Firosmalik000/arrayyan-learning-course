<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_account_id',
        'student_id',
        'student_name',
        'name',
        'role',
        'message',
        'rating',
        'highlight',
        'avatar_path',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function portalAccount(): BelongsTo
    {
        return $this->belongsTo(PortalAccount::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar_path) {
            return Storage::url($this->avatar_path);
        }

        if ($this->student?->photo_path) {
            return Storage::disk('public')->url($this->student->photo_path);
        }

        return 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&background=7c3aed&color=fff';
    }
}
