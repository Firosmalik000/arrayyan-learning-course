<?php

namespace App\Models;

use Database\Factories\EducationLevelFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class EducationLevel extends Model
{
    /** @use HasFactory<EducationLevelFactory> */
    use HasFactory;

    protected $fillable = ['name', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer', 'is_active' => 'boolean'];
    }

    public function educationClasses(): HasMany
    {
        return $this->hasMany(EducationClass::class)->orderBy('sort_order')->orderBy('name');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class)->withTimestamps()->orderBy('sort_order')->orderBy('name');
    }

    public function bankSoals(): HasManyThrough
    {
        return $this->hasManyThrough(BankSoal::class, EducationClass::class);
    }
}
