<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    public const STATUS_UNPAID = 'unpaid';

    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_REJECTED = 'rejected';

    public const STATUSES = [
        self::STATUS_UNPAID,
        self::STATUS_PENDING,
        self::STATUS_PAID,
        self::STATUS_EXPIRED,
        self::STATUS_REJECTED,
    ];

    protected $fillable = [
        'invoice_no',
        'student_registration_id',
        'student_id',
        'class_member_id',
        'class_group_id',
        'program_id',
        'package_id',
        'billing_type',
        'billing_month',
        'amount',
        'status',
        'due_date',
        'notes',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'billing_month' => 'date',
            'due_date' => 'date',
            'paid_at' => 'datetime',
        ];
    }

    public static function generateNumber(Invoice $invoice): string
    {
        $year = $invoice->created_at
            ? $invoice->created_at->format('Y')
            : now()->format('Y');

        return sprintf('INV-%s-%05d', $year, $invoice->getKey());
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(StudentRegistration::class, 'student_registration_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function classMember(): BelongsTo
    {
        return $this->belongsTo(ClassMember::class);
    }

    public function classGroup(): BelongsTo
    {
        return $this->belongsTo(ClassGroup::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->latest();
    }

    public function latestPayment(): ?Payment
    {
        return $this->payments()->first();
    }
}
