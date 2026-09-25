<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OlympiadRegistration extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const FEE_FREE = 'free';

    public const FEE_UNPAID = 'unpaid';

    public const FEE_PAID = 'paid';

    protected $fillable = [
        'olympiad_id',
        'ticket_no',
        'name',
        'school',
        'level',
        'contact',
        'fee_status',
        'status',
        'admin_note',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public static function generateTicket(OlympiadRegistration $registration): string
    {
        $year = $registration->created_at
            ? $registration->created_at->format('Y')
            : now()->format('Y');

        return sprintf('OLS-%s-%05d', $year, $registration->getKey());
    }

    public function olympiad(): BelongsTo
    {
        return $this->belongsTo(Olympiad::class, 'olympiad_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}
