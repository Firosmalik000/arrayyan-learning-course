<?php

namespace App\Http\Controllers;

use App\Models\Olympiad;
use App\Models\OlympiadRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OlympiadRegistrationController extends Controller
{
    public function create(string $slug): Response
    {
        $olympiad = $this->findOlympiad($slug);

        return Inertia::render('Public/Olympiad/Register', [
            'olympiad' => $olympiad ? $this->formatOlympiad($olympiad) : null,
        ]);
    }

    public function store(Request $request, string $slug): RedirectResponse
    {
        $olympiad = $this->findOlympiad($slug);

        if (! $olympiad) {
            return back()->with('error', 'Olimpiade tidak ditemukan atau tidak aktif.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'school' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:100'],
            'contact' => ['required', 'string', 'max:20', 'regex:/^(?:\+62|62|0)8[0-9]{5,13}$/'],
        ], [
            'contact.regex' => 'Kontak harus nomor WhatsApp Indonesia yang valid (contoh: 081234567890).',
        ]);

        if ($reason = $olympiad->registrationClosedReason()) {
            return back()->with('error', $reason)->withInput();
        }

        $data['contact'] = (string) preg_replace('/[\s\-.\(\)]/', '', $data['contact']);

        $registration = DB::transaction(function () use ($olympiad, $data): OlympiadRegistration {
            $registration = OlympiadRegistration::create([
                'olympiad_id' => $olympiad->id,
                'ticket_no' => 'TEMP',
                'name' => $data['name'],
                'school' => $data['school'] ?? null,
                'level' => $data['level'] ?? null,
                'contact' => $data['contact'],
                'fee_status' => $olympiad->isPaid() ? OlympiadRegistration::FEE_UNPAID : OlympiadRegistration::FEE_FREE,
                'status' => OlympiadRegistration::STATUS_PENDING,
            ]);
            $registration->update(['ticket_no' => OlympiadRegistration::generateTicket($registration)]);

            return $registration->fresh();
        });

        $message = 'Pendaftaran olimpiade berhasil dikirim. No. tiket Anda: '.$registration->ticket_no;

        if ($olympiad->isPaid()) {
            $message .= ' Biaya pendaftaran akan dikonfirmasi admin via WhatsApp.';
        }

        return back()->with('success', $message)->with('ticket', $registration->ticket_no);
    }

    private function findOlympiad(string $slug): ?Olympiad
    {
        return Olympiad::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOlympiad(Olympiad $olympiad): array
    {
        return [
            'id' => $olympiad->id,
            'slug' => $olympiad->slug,
            'name' => $olympiad->name,
            'level' => $olympiad->level,
            'schedule' => $olympiad->schedule,
            'selection_system' => $olympiad->selection_system,
            'category' => $olympiad->category,
            'fee' => $olympiad->fee,
            'is_paid' => $olympiad->isPaid(),
            'quota' => $olympiad->quota,
            'quota_filled' => $olympiad->quotaFilled(),
            'quota_remaining' => $olympiad->quotaRemaining(),
            'registration_deadline' => $olympiad->registration_deadline,
            'is_registration_open' => $olympiad->is_registration_open,
            'closed_reason' => $olympiad->registrationClosedReason(),
            'notes' => $olympiad->notes,
        ];
    }
}
