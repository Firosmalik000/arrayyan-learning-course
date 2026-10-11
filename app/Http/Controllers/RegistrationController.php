<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRegistrationRequest;
use App\Http\Requests\StoreTeacherRegistrationRequest;
use App\Jobs\SendRegistrationNotification;
use App\Models\Package;
use App\Models\Program;
use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use App\Support\RegistrationTicket;
use App\Support\StudentRegistrationEmailService;
use App\Support\TeacherRegistrationEmailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function __construct(
        private StudentRegistrationEmailService $studentRegistrationEmailService,
        private TeacherRegistrationEmailService $teacherRegistrationEmailService,
    ) {}

    public function storeStudent(StoreStudentRegistrationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->select(['id', 'name', 'quota'])->findOrFail($data['program_id']);
        unset($data['website'], $data['form_started_at']);

        if (! $program->hasAvailableQuota()) {
            return back()
                ->withErrors(['program_id' => 'Kuota program "'.$program->name.'" sudah penuh. Silakan pilih program lain atau hubungi admin.'])
                ->withInput();
        }

        $package = null;
        if (! empty($data['package_id'])) {
            $package = Package::query()
                ->whereKey($data['package_id'])
                ->where('program_id', $program->id)
                ->where('is_active', true)
                ->first();

            if (! $package) {
                return back()
                    ->withErrors(['package_id' => 'Pilihan harga tidak sesuai dengan program yang dipilih.'])
                    ->withInput();
            }
        }

        $data['program'] = $program->name;
        if ($package) {
            $data['package'] = $package->displayName();
        }

        $registration = DB::transaction(function () use ($data): StudentRegistration {
            $registration = StudentRegistration::create($data);
            $registration->update([
                'registration_no' => RegistrationTicket::generateFor($registration),
            ]);

            return $registration->fresh();
        });

        SendRegistrationNotification::dispatch(
            event: 'received',
            recipient: $registration->parent_contact,
            name: $registration->student_name,
            ticket: $registration->registration_no,
            reason: null,
            registrationType: 'student',
            registrationId: $registration->id,
        );

        $this->studentRegistrationEmailService->sendReceived($registration);

        return to_route('registrations.success', [
            'registrationType' => 'murid',
            'ticket' => $registration->registration_no,
        ])
            ->with('success', 'Pendaftaran murid berhasil dikirim. No. tiket Anda: '.$registration->registration_no)
            ->with('ticket', $registration->registration_no);
    }

    public function storeTeacher(StoreTeacherRegistrationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cv', 'public');
        }
        unset($data['cv'], $data['website'], $data['form_started_at']);

        $registration = DB::transaction(function () use ($data): TeacherRegistration {
            $registration = TeacherRegistration::create($data);
            $registration->update([
                'registration_no' => RegistrationTicket::generateFor($registration),
            ]);

            return $registration->fresh();
        });

        SendRegistrationNotification::dispatch(
            event: 'received',
            recipient: $registration->contact,
            name: $registration->name,
            ticket: $registration->registration_no,
            reason: null,
            registrationType: 'teacher',
            registrationId: $registration->id,
        );

        $this->teacherRegistrationEmailService->sendReceived($registration);

        return to_route('registrations.success', [
            'registrationType' => 'pengajar',
            'ticket' => $registration->registration_no,
        ])
            ->with('success', 'Pendaftaran pengajar berhasil dikirim. No. tiket Anda: '.$registration->registration_no)
            ->with('ticket', $registration->registration_no);
    }

    public function success(string $registrationType, string $ticket): Response
    {
        $registration = $registrationType === 'murid'
            ? StudentRegistration::query()->with(['programItem', 'packageItem'])->where('registration_no', $ticket)->first()
            : TeacherRegistration::query()->where('registration_no', $ticket)->first();

        abort_unless($registration !== null, 404);

        $details = $registrationType === 'murid'
            ? [
                'name' => $registration->student_name,
                'program' => $registration->programItem?->name ?? $registration->program ?? 'Reguler',
                'package' => $registration->packageItem?->name ?? $registration->package,
                'level' => $registration->level ? ($registration->level.($registration->class_level ? ' • '.$registration->class_level : '')) : null,
                'mode' => $registration->preferred_mode ? ucfirst($registration->preferred_mode) : 'Offline',
                'phone' => $registration->parent_contact,
                'email' => $registration->parent_email,
                'school' => $registration->school_name,
                'createdAt' => $registration->created_at?->format('d M Y, H:i'),
            ]
            : [
                'name' => $registration->name,
                'program' => $registration->subjects ?? 'Pengajar',
                'package' => null,
                'level' => $registration->education,
                'mode' => null,
                'phone' => $registration->contact,
                'email' => $registration->email,
                'school' => null,
                'createdAt' => $registration->created_at?->format('d M Y, H:i'),
            ];

        return Inertia::render('Public/Register/Success', [
            'registrationType' => $registrationType,
            'ticket' => $ticket,
            'registration' => $details,
        ]);
    }
}
