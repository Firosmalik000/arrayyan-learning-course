<?php

namespace App\Support;

use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentRegistration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvoiceService
{
    public static function linkInitialInvoiceToMember(ClassMember $member): ?Invoice
    {
        if ($member->is_scholarship) {
            return null;
        }

        $member->loadMissing('classGroup');
        $billingMonth = ($member->joined_at ?? $member->created_at)->copy()->startOfMonth();

        if (Invoice::query()
            ->where('class_member_id', $member->id)
            ->whereDate('billing_month', $billingMonth->toDateString())
            ->exists()) {
            return null;
        }

        $invoice = Invoice::query()
            ->where('student_id', $member->student_id)
            ->whereNull('class_member_id')
            ->whereNull('billing_month')
            ->where('billing_type', 'registration')
            ->where('program_id', $member->classGroup?->program_id)
            ->when(
                $member->classGroup?->package_id,
                fn ($query, $packageId) => $query->where(function ($inner) use ($packageId): void {
                    $inner->whereNull('package_id')->orWhere('package_id', $packageId);
                }),
            )
            ->oldest()
            ->first();

        if (! $invoice) {
            return null;
        }

        $invoice->update([
            'class_member_id' => $member->id,
            'class_group_id' => $member->class_group_id,
            'billing_month' => $billingMonth->toDateString(),
        ]);

        return $invoice->fresh();
    }

    /**
     * @param  array{billing_month: string, amount?: int|float|string|null, due_date: string, notes?: ?string}  $data
     * @return array{invoice: Invoice, created: bool}
     */
    public static function createMonthlyForMember(ClassMember $member, array $data): array
    {
        $billingMonth = Carbon::createFromFormat('!Y-m', $data['billing_month'])->startOfMonth();

        return DB::transaction(function () use ($member, $data, $billingMonth): array {
            $lockedMember = ClassMember::query()
                ->with([
                    'student.packageItem',
                    'classGroup.program',
                    'classGroup.package',
                    'classGroup.lifecycles',
                ])
                ->lockForUpdate()
                ->findOrFail($member->id);

            self::assertMemberBillableForMonth($lockedMember, $billingMonth);

            $existing = Invoice::query()
                ->where('class_member_id', $lockedMember->id)
                ->whereDate('billing_month', $billingMonth->toDateString())
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return ['invoice' => $existing, 'created' => false];
            }

            $amount = array_key_exists('amount', $data) && $data['amount'] !== null && $data['amount'] !== ''
                ? (float) $data['amount']
                : self::defaultMonthlyAmount($lockedMember);

            $invoice = Invoice::create([
                'invoice_no' => 'TEMP',
                'student_id' => $lockedMember->student_id,
                'class_member_id' => $lockedMember->id,
                'class_group_id' => $lockedMember->class_group_id,
                'program_id' => $lockedMember->classGroup->program_id,
                'package_id' => $lockedMember->classGroup->package_id ?? $lockedMember->student?->package_id,
                'billing_type' => 'monthly',
                'billing_month' => $billingMonth->toDateString(),
                'amount' => $amount,
                'status' => Invoice::STATUS_UNPAID,
                'due_date' => $data['due_date'],
                'notes' => $data['notes'] ?? null,
            ]);
            $invoice->update(['invoice_no' => Invoice::generateNumber($invoice)]);

            return ['invoice' => $invoice->fresh(), 'created' => true];
        });
    }

    /**
     * @param  array{billing_month: string, amount?: int|float|string|null, due_date: string, notes?: ?string}  $data
     * @return array{created: int, existing: int, skipped: array<int, string>}
     */
    public static function createMonthlyForClass(ClassGroup $classGroup, array $data): array
    {
        $members = $classGroup->members()
            ->with(['student.packageItem', 'classGroup.program', 'classGroup.package', 'classGroup.lifecycles'])
            ->get();

        return self::createMonthlyForMembers($members, $data);
    }

    /**
     * @param  iterable<ClassMember>  $members
     * @param  array{billing_month: string, amount?: int|float|string|null, due_date: string, notes?: ?string}  $data
     * @return array{created: int, existing: int, skipped: array<int, string>}
     */
    public static function createMonthlyForMembers(iterable $members, array $data): array
    {
        $created = 0;
        $existing = 0;
        $skipped = [];

        foreach ($members as $member) {
            try {
                $result = self::createMonthlyForMember($member, $data);
                $result['created'] ? $created++ : $existing++;
            } catch (RuntimeException $exception) {
                $skipped[] = ($member->student?->name ?? "Murid #{$member->student_id}").': '.$exception->getMessage();
            }
        }

        return compact('created', 'existing', 'skipped');
    }

    public static function defaultMonthlyAmount(ClassMember $member): float
    {
        $member->loadMissing(['student.packageItem', 'classGroup.package', 'classGroup.program']);

        return (float) (
            $member->classGroup?->package?->price
            ?? $member->student?->packageItem?->price
            ?? $member->classGroup?->program?->price
            ?? 0
        );
    }

    public static function assertMemberBillableForMonth(ClassMember $member, Carbon $billingMonth): void
    {
        $member->loadMissing(['classGroup.lifecycles', 'student']);
        $monthStart = $billingMonth->copy()->startOfMonth();
        $monthEnd = $billingMonth->copy()->endOfMonth();

        if ($member->is_scholarship) {
            throw new RuntimeException('Murid berstatus beasiswa dan tidak perlu ditagih.');
        }

        if ($member->joined_at && $member->joined_at->gt($monthEnd)) {
            throw new RuntimeException('Murid belum bergabung pada bulan tersebut.');
        }

        if ($member->ended_at && $member->ended_at->lt($monthStart)) {
            throw new RuntimeException('Keikutsertaan murid sudah selesai sebelum bulan tersebut.');
        }

        $classWasActive = $member->classGroup->lifecycles->contains(
            fn ($lifecycle): bool => $lifecycle->activated_at->lte($monthEnd)
                && ($lifecycle->deactivated_at === null || $lifecycle->deactivated_at->gte($monthStart))
        );

        if (! $classWasActive) {
            throw new RuntimeException('Kelas tidak aktif pada bulan tersebut.');
        }
    }

    public static function createForRegistration(StudentRegistration $registration, ?Student $student): Invoice
    {
        $existing = Invoice::query()
            ->where('student_registration_id', $registration->id)
            ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING])
            ->first();

        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($registration, $student): Invoice {
            $program = $registration->program_id
                ? Program::query()->select(['id', 'price'])->find($registration->program_id)
                : null;
            $package = $registration->package_id
                ? Package::query()->select(['id', 'price'])->find($registration->package_id)
                : null;

            $invoice = Invoice::create([
                'invoice_no' => 'TEMP',
                'student_registration_id' => $registration->id,
                'student_id' => $student?->id,
                'program_id' => $registration->program_id,
                'package_id' => $registration->package_id,
                'amount' => $package?->price ?? $program?->price ?? 0,
                'status' => Invoice::STATUS_UNPAID,
                'due_date' => now()->addDays(7)->toDateString(),
            ]);
            $invoice->update(['invoice_no' => Invoice::generateNumber($invoice)]);

            return $invoice->fresh();
        });
    }

    public static function findStudentFor(StudentRegistration $registration): ?Student
    {
        return Student::query()
            ->where('name', $registration->student_name)
            ->where('parent_contact', $registration->parent_contact)
            ->where('program_id', $registration->program_id)
            ->first();
    }

    /**
     * @return array{0: string, 1: string}
     */
    public static function resolveRecipient(Invoice $invoice): array
    {
        $student = $invoice->relationLoaded('student') ? $invoice->student : $invoice->student()->first();
        $registration = $invoice->relationLoaded('registration') ? $invoice->registration : $invoice->registration()->first();

        $contact = $student?->parent_contact ?? $registration?->parent_contact ?? '';
        $name = $student?->name ?? $registration?->student_name ?? 'Bapak/Ibu';

        return [$contact, $name];
    }
}
