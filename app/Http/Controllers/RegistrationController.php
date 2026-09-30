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
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class RegistrationController extends Controller
{
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

        return back()
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

        return back()
            ->with('success', 'Pendaftaran pengajar berhasil dikirim. No. tiket Anda: '.$registration->registration_no)
            ->with('ticket', $registration->registration_no);
    }
}
