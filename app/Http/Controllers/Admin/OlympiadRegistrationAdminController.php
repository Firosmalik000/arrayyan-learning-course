<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Olympiad;
use App\Models\OlympiadRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OlympiadRegistrationAdminController extends Controller
{
    private const STATUSES = ['pending', 'approved', 'rejected'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->filled('status') ? (string) $request->query('status') : 'pending';
        $olympiadId = $request->filled('olympiad_id') ? (int) $request->query('olympiad_id') : null;

        $query = OlympiadRegistration::query()
            ->with(['olympiad:id,name,slug', 'approver:id,name', 'rejector:id,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('ticket_no', 'like', "%{$search}%")
                        ->orWhere('school', 'like', "%{$search}%")
                        ->orWhere('contact', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, self::STATUSES, true), fn ($query) => $query->where('status', $status))
            ->when($olympiadId, fn ($query) => $query->where('olympiad_id', $olympiadId));

        $registrations = (clone $query)
            ->latest()
            ->paginate(15)
            ->withQueryString();
        $registrations->through(fn (OlympiadRegistration $registration) => [
            'id' => $registration->id,
            'ticket_no' => $registration->ticket_no,
            'name' => $registration->name,
            'school' => $registration->school,
            'level' => $registration->level,
            'contact' => $registration->contact,
            'olympiad' => $registration->olympiad?->name ?? '-',
            'olympiad_id' => $registration->olympiad_id,
            'fee_status' => $registration->fee_status,
            'status' => $registration->status,
            'admin_note' => $registration->admin_note,
            'approved_by_name' => $registration->approver?->name,
            'rejected_by_name' => $registration->rejector?->name,
            'created_at' => $registration->created_at,
        ]);

        $counts = OlympiadRegistration::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return Inertia::render('Admin/OlympiadRegistrations', [
            'registrations' => $registrations,
            'stats' => [
                'total' => (int) $counts->sum(),
                'pending' => (int) ($counts['pending'] ?? 0),
                'approved' => (int) ($counts['approved'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
            ],
            'olympiads' => Olympiad::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Olympiad $olympiad) => [
                    'id' => $olympiad->id,
                    'name' => $olympiad->name,
                ])
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'olympiad_id' => $olympiadId,
            ],
        ]);
    }

    public function approve(OlympiadRegistration $registration): RedirectResponse
    {
        if ($registration->status !== OlympiadRegistration::STATUS_PENDING) {
            return back()->with('error', 'Pendaftaran sudah diproses sebelumnya.');
        }

        $registration->update([
            'status' => OlympiadRegistration::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        ActivityLog::record('olimpiade.setujui', "Peserta lomba \"{$registration->name}\" disetujui.", $registration);

        return back()->with('success', "Peserta {$registration->name} disetujui.");
    }

    public function reject(Request $request, OlympiadRegistration $registration): RedirectResponse
    {
        if ($registration->status !== OlympiadRegistration::STATUS_PENDING) {
            return back()->with('error', 'Pendaftaran sudah diproses sebelumnya.');
        }

        $data = $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $registration->update([
            'status' => OlympiadRegistration::STATUS_REJECTED,
            'admin_note' => $data['admin_note'] ?? null,
            'rejected_at' => now(),
            'rejected_by' => Auth::id(),
        ]);

        ActivityLog::record('olimpiade.tolak', "Peserta lomba \"{$registration->name}\" ditolak.", $registration);

        return back()->with('success', "Peserta {$registration->name} ditolak.");
    }

    public function markFeePaid(OlympiadRegistration $registration): RedirectResponse
    {
        $registration->update(['fee_status' => OlympiadRegistration::FEE_PAID]);

        return back()->with('success', "Biaya {$registration->ticket_no} ditandai lunas.");
    }

    public function destroy(OlympiadRegistration $registration): RedirectResponse
    {
        $registration->delete();

        return back()->with('success', 'Data pendaftaran olimpiade dihapus.');
    }
}
