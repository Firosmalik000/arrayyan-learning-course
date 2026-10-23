<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'photo_path',
        'address',
        'school_name',
        'level',
        'class_level',
        'subjects',
        'program_id',
        'package_id',
        'program',
        'package',
        'parent_contact',
        'parent_email',
        'parent_portal_account_id',
        'preferred_mode',
        'notes',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function programItem(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function packageItem(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function parentAccount(): BelongsTo
    {
        return $this->belongsTo(PortalAccount::class, 'parent_portal_account_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(StudentRegistration::class, 'student_id');
    }

    public function classMembers(): HasMany
    {
        return $this->hasMany(ClassMember::class, 'student_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function feedbackSubmissions(): HasMany
    {
        return $this->hasMany(FeedbackSubmission::class);
    }

    public function classGroups(): BelongsToMany
    {
        return $this->belongsToMany(ClassGroup::class, 'class_members', 'student_id', 'class_group_id')
            ->withPivot(['status', 'joined_at', 'ended_at', 'is_scholarship', 'notes'])
            ->withTimestamps();
    }
}
