<?php

namespace App\Support;

use App\Models\Invoice;
use App\Models\Package;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentRegistration;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
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
