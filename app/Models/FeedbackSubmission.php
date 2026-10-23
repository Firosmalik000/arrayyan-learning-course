<?php

namespace App\Models;

use Database\Factories\FeedbackSubmissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackSubmission extends Model
{
    /** @use HasFactory<FeedbackSubmissionFactory> */
    use HasFactory;

    public const STATUS_NEW = 'new';

    public const STATUS_REVIEWED = 'reviewed';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_UNREPLIED = 'unreplied';

    public const STATUS_REPLIED = 'replied';

    public const CATEGORIES = [
        'teacher' => 'Pengajar',
        'material' => 'Materi Belajar',
        'schedule' => 'Jadwal',
        'service' => 'Pelayanan',
        'payment' => 'Pembayaran',
        'application' => 'Aplikasi Portal',
        'other' => 'Lainnya',
    ];

    protected $fillable = [
        'portal_account_id',
        'student_id',
        'submitter_name',
        'submitter_email',
        'submitter_contact',
        'category',
        'rating',
        'subject',
        'message',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
        'admin_reply',
        'replied_by',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'reviewed_at' => 'datetime',
            'replied_at' => 'datetime',
        ];
    }

    public function isReplied(): bool
    {
        return filled($this->admin_reply);
    }

    public function portalAccount(): BelongsTo
    {
        return $this->belongsTo(PortalAccount::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function repliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }
}
