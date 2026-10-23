<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankSoal extends Model
{
    use HasFactory;

    protected $table = 'bank_soals';

    protected $fillable = [
        'education_class_id',
        'subject_id',
        'classification_status',
        'name',
        'format',
        'questions',
        'description',
        'passkey',
        'view_count',
        'download_count',
        'image_path',
        'tone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'questions' => 'integer',
            'view_count' => 'integer',
            'download_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected $hidden = [
        'passkey',
    ];

    public function educationClass(): BelongsTo
    {
        return $this->belongsTo(EducationClass::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(BankSoalResource::class)->orderBy('sort_order')->orderBy('id');
    }
}
