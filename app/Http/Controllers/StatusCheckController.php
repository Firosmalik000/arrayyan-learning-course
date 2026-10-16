<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Support\RegistrationTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatusCheckController extends Controller
{
    public function show(Request $request): Response
    {
        $data = $request->validate([
            'ticket' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $result = null;
        $searched = false;

        if (! empty($data['ticket']) && ! empty($data['phone'])) {
            $searched = true;
            $found = RegistrationTicket::findByTicketAndPhone($data['ticket'], $data['phone']);

            if ($found) {
                $result = $this->formatResult($found['type'], $found['registration']);
            }
        }

        return Inertia::render('Public/StatusCheck', [
            'ticket' => $data['ticket'] ?? '',
            'phone' => $data['phone'] ?? '',
            'searched' => $searched,
            'result' => $result,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatResult(string $type, object $registration): array
    {
        if ($type === 'student') {
            return [
                'type' => 'student',
                'type_label' => 'Murid',
                'ticket' => $registration->registration_no,
                'name' => $registration->student_name,
                'program' => $registration->programItem?->name ?? $registration->program,
                'status' => $registration->status,
                'admin_note' => $registration->admin_note,
                'created_at' => $registration->created_at,
                'approved_at' => $registration->approved_at,
                'rejected_at' => $registration->rejected_at,
                'invoices' => Invoice::query()
                    ->where('student_registration_id', $registration->id)
                    ->orderByDesc('id')
                    ->get(['invoice_no', 'amount', 'status', 'due_date'])
                    ->map(fn (Invoice $invoice) => [
                        'invoice_no' => $invoice->invoice_no,
                        'amount' => $invoice->amount,
                        'status' => $invoice->status,
                        'due_date' => $invoice->due_date,
                    ])
                    ->values()
                    ->all(),
            ];
        }

        return [
            'type' => 'teacher',
            'type_label' => 'Pengajar',
            'ticket' => $registration->registration_no,
            'name' => $registration->name,
            'program' => $registration->teacher_role
                ? ($registration->teacher_role.($registration->subjects ? ' • '.$registration->subjects : ''))
                : ($registration->subjects ?? 'Pengajar'),
            'status' => $registration->status,
            'admin_note' => $registration->admin_note,
            'created_at' => $registration->created_at,
            'approved_at' => $registration->approved_at,
            'rejected_at' => $registration->rejected_at,
        ];
    }
}
