<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageContentRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'content',
        'created_by',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
