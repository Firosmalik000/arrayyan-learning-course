<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassGroupLifecycle extends Model
{
    protected $fillable = [
        'class_group_id',
        'activated_at',
        'deactivated_at',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'date',
            'deactivated_at' => 'date',
        ];
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class);
    }
}
