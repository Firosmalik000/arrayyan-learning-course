<?php

namespace App\Models;

use App\Notifications\PortalResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class PortalAccount extends Authenticatable
{
    use HasFactory, Notifiable;

    public const TYPE_PARENT = 'parent';

    public const TYPE_STUDENT = 'student';

    public const TYPE_TEACHER = 'teacher';

    protected $fillable = [
        'type',
        'student_id',
        'teacher_id',
        'name',
        'email',
        'contact',
        'password',
        'must_change_password',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'must_change_password' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'parent_portal_account_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function isParent(): bool
    {
        return in_array($this->type, [self::TYPE_PARENT, self::TYPE_STUDENT], true);
    }

    public function isStudent(): bool
    {
        return $this->isParent();
    }

    public function isTeacher(): bool
    {
        return $this->type === self::TYPE_TEACHER;
    }

    /**
     * @param  string  $token
     */
    public function sendPasswordResetNotification(#[\SensitiveParameter] $token)
    {
        $this->notify(new PortalResetPasswordNotification($token));
    }
}
