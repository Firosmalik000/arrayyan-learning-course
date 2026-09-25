<?php

namespace App\Http\Controllers;

use App\Jobs\SendRegistrationNotification;
use App\Models\Invoice;
use App\Models\Payment;
use App\Support\RegistrationTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function show(Request $request): Response
    {
        $data = $request->validate([
            'invoice' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $result = null;
        $searched = false;

        if (! empty($data['invoice']) && ! empty($data['phone'])) {
            $searched = true;
            $result = $this->findInvoice($data['invoice'], $data['phone']);
        }

        return Inertia::render('Public/Payment', [
            'invoice' => $data['invoice'] ?? '',
            'phone' => $data['phone'] ?? '',
            'searched' => $searched,
            'result' => $result,
        ]);
    }

    public function upload(Request $request, Invoice $invoice): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'note' => ['nullable', 'string', 'max:500'],
        ], [
            'proof.mimes' => 'Bukti pembayaran harus berupa gambar (JPG/PNG/WEBP) atau PDF.',
            'proof.max' => 'Ukuran bukti maksimal 5MB.',
        ]);

        if (! $this->phoneMatches($invoice, $data['phone'])) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor WhatsApp tidak cocok dengan data tagihan ini.',
            ]);
        }

        if ($invoice->status === Invoice::STATUS_PAID) {
            return back()->with('error', 'Tagihan ini sudah lunas. Tidak perlu mengunggah bukti lagi.');
        }

        $path = $request->file('proof')->store('payment-proofs', 'public');

        Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => $path,
            'note' => $data['note'] ?? null,
            'status' => Payment::STATUS_PENDING,
        ]);

        $invoice->update(['status' => Invoice::STATUS_PENDING]);

        [$contact, $name] = $this->resolveRecipient($invoice);

        SendRegistrationNotification::dispatch(
            event: 'payment',
            recipient: $contact,
            name: $name,
            ticket: $invoice->invoice_no,
            reason: null,
            registrationType: 'invoice',
            registrationId: $invoice->id,
        );

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Admin akan memverifikasi paling lambat 1x24 jam.');
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findInvoice(string $invoiceNo, string $phone): ?array
    {
        $invoice = Invoice::query()
            ->with([
                'student:id,name,parent_contact',
                'registration:id,student_name,parent_contact',
                'program:id,name',
                'payments',
            ])
            ->where('invoice_no', strtoupper(trim($invoiceNo)))
            ->first();

        if (! $invoice || ! $this->phoneMatches($invoice, $phone)) {
            return null;
        }

        [$contact] = $this->resolveRecipient($invoice);

        return [
            'id' => $invoice->id,
            'invoice_no' => $invoice->invoice_no,
            'student_name' => $invoice->student?->name ?? $invoice->registration?->student_name ?? '-',
            'program' => $invoice->program?->name ?? '-',
            'amount' => $invoice->amount,
            'status' => $invoice->status,
            'due_date' => $invoice->due_date,
            'paid_at' => $invoice->paid_at,
            'contact' => $contact,
            'payments' => $invoice->payments->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'proof_url' => Storage::url($payment->proof_path),
                'note' => $payment->note,
                'status' => $payment->status,
                'created_at' => $payment->created_at,
            ])->values()->all(),
        ];
    }

    private function phoneMatches(Invoice $invoice, string $phone): bool
    {
        $phone = RegistrationTicket::normalizePhone($phone);
        $invoice->loadMissing(['student:id,parent_contact', 'registration:id,parent_contact']);

        foreach ([$invoice->student?->parent_contact, $invoice->registration?->parent_contact] as $candidate) {
            if ($candidate && RegistrationTicket::normalizePhone((string) $candidate) === $phone) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function resolveRecipient(Invoice $invoice): array
    {
        $invoice->loadMissing(['student:id,name,parent_contact', 'registration:id,student_name,parent_contact']);

        $contact = $invoice->student?->parent_contact ?? $invoice->registration?->parent_contact ?? '';
        $name = $invoice->student?->name ?? $invoice->registration?->student_name ?? 'Bapak/Ibu';

        return [$contact, $name];
    }
}
