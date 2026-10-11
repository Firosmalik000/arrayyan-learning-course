<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendRegistrationNotification;
use App\Models\ActivityLog;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\Teacher;
use App\Models\TeacherRegistration;
use App\Support\InvoiceService;
use App\Support\PortalAccountService;
use App\Support\StudentRegistrationEmailService;
use App\Support\TeacherRegistrationEmailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RegistrationController extends Controller
{
    public function approveStudent(StudentRegistration $studentRegistration): RedirectResponse
    {
        if ($studentRegistration->status !== 'pending') {
            return back()->with('error', 'Pendaftaran murid sudah diproses sebelumnya.');
        }

        $existingStudent = $studentRegistration->student_id
            ? Student::find($studentRegistration->student_id)
            : Student::query()
                ->where('name', $studentRegistration->student_name)
                ->where(function ($query) use ($studentRegistration): void {
                    $query->where('parent_contact', $studentRegistration->parent_contact);
                    if ($studentRegistration->parent_email) {
                        $query->orWhere('parent_email', $studentRegistration->parent_email);
                    }
                })
                ->first();

        $student = null;
        $isExisting = $existingStudent !== null;

        DB::transaction(function () use ($studentRegistration, $existingStudent, &$student): void {
            if ($existingStudent) {
                $student = $existingStudent;

                if ($studentRegistration->subjects && ! str_contains((string) $existingStudent->subjects, $studentRegistration->subjects)) {
                    $existingStudent->update([
                        'subjects' => trim(($existingStudent->subjects ? $existingStudent->subjects.', ' : '').$studentRegistration->subjects),
                    ]);
                }

                $studentRegistration->update([
                    'student_id' => $existingStudent->id,
                    'status' => 'approved',
                    'approved_at' => now(),
                    'approved_by' => Auth::id(),
                ]);
            } else {
                $student = Student::create([
                    'name' => $studentRegistration->student_name,
                    'address' => $studentRegistration->address,
                    'school_name' => $studentRegistration->school_name,
                    'level' => $studentRegistration->level,
                    'class_level' => $studentRegistration->class_level,
                    'subjects' => $studentRegistration->subjects,
                    'program_id' => $studentRegistration->program_id,
                    'package_id' => $studentRegistration->package_id,
                    'program' => $studentRegistration->programItem?->name ?? $studentRegistration->program,
                    'package' => $studentRegistration->package,
                    'parent_contact' => $studentRegistration->parent_contact,
                    'parent_email' => $studentRegistration->parent_email,
                    'preferred_mode' => $studentRegistration->preferred_mode,
                    'notes' => $studentRegistration->notes,
                    'is_active' => true,
                    'created_by' => Auth::id(),
                ]);

                $studentRegistration->update([
                    'student_id' => $student->id,
                    'status' => 'approved',
                    'approved_at' => now(),
                    'approved_by' => Auth::id(),
                ]);
            }
        });

        $portalExtra = null;

        if ($student) {
            $portalResult = PortalAccountService::createOrLinkForStudent(
                $student,
                $studentRegistration->parent_email
            );

            $emailService = app(StudentRegistrationEmailService::class);

            if ($portalResult) {
                if ($portalResult['is_new']) {
                    $portalExtra = 'Akun portal orang tua Anda telah dibuat. Login di '.route('portal.login')
                        ." dengan email ini atau nomor WA dan password sementara: {$portalResult['password']}. Segera ganti password setelah login.";

                    if ($studentRegistration->parent_email) {
                        $emailService->sendApprovedNewParent($studentRegistration->fresh(), (string) $portalResult['password']);
                    }
                } else {
                    $portalExtra = 'Pendaftaran ananda telah terhubung ke akun Portal Orang Tua Anda yang sudah ada. Silakan login di '.route('portal.login');

                    if ($studentRegistration->parent_email) {
                        $emailService->sendApprovedExistingParent($studentRegistration->fresh());
                    }
                }
            }
        }

        $this->notify($studentRegistration->fresh(), 'approved', $portalExtra);

        InvoiceService::createForRegistration($studentRegistration->fresh(), $student);

        ActivityLog::record(
            'pendaftaran.murid.setujui',
            "Pendaftaran murid \"{$studentRegistration->student_name}\" disetujui.",
            $studentRegistration
        );

        if ($isExisting) {
            return back()->with('success', 'Pendaftaran murid disetujui. Program berhasil ditambahkan ke profil murid.');
        }

        return back()->with('success', 'Pendaftaran murid disetujui.');
    }

    public function rejectStudent(Request $request, StudentRegistration $studentRegistration): RedirectResponse
    {
        if ($studentRegistration->status !== 'pending') {
            return back()->with('error', 'Pendaftaran murid sudah diproses sebelumnya.');
        }

        $data = $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $studentRegistration->update([
            'status' => 'rejected',
            'admin_note' => $data['admin_note'] ?? null,
            'rejected_at' => now(),
            'rejected_by' => Auth::id(),
        ]);

        $this->notify($studentRegistration->fresh(), 'rejected');

        ActivityLog::record(
            'pendaftaran.murid.tolak',
            "Pendaftaran murid \"{$studentRegistration->student_name}\" ditolak.",
            $studentRegistration
        );

        return back()->with('success', 'Pendaftaran murid ditolak.');
    }

    public function bulkApproveStudents(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['integer'],
        ]);

        $processed = $this->bulkApprove(StudentRegistration::class, $data['ids']);

        return back()->with('success', "Berhasil menyetujui {$processed} pendaftaran murid.");
    }

    public function destroyStudent(StudentRegistration $studentRegistration): RedirectResponse
    {
        $studentRegistration->delete();

        return back()->with('success', 'Pendaftaran murid dihapus.');
    }

    public function exportRegistrations(string $type): StreamedResponse
    {
        abort_unless(in_array($type, ['murid', 'pengajar'], true), 404);

        $isStudent = $type === 'murid';

        $rows = $isStudent
            ? StudentRegistration::query()->with('programItem:id,name')->latest()->get()
            : TeacherRegistration::query()->latest()->get();

        $header = $isStudent
            ? ['Tiket', 'Nama', 'Sekolah', 'Jenjang', 'Program', 'Kontak', 'Email', 'Status', 'Tanggal']
            : ['Tiket', 'Nama', 'Pendidikan', 'Mapel', 'Kontak', 'Email', 'Status', 'Tanggal'];

        return response()->streamDownload(function () use ($rows, $isStudent, $header): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $header);

            foreach ($rows as $row) {
                fputcsv($handle, $isStudent ? [
                    $row->registration_no,
                    $row->student_name,
                    $row->school_name,
                    $row->class_level ? "{$row->level} ({$row->class_level})" : $row->level,
                    $row->programItem?->name ?? $row->program,
                    $row->parent_contact,
                    $row->parent_email,
                    $row->status,
                    $row->created_at?->format('Y-m-d H:i'),
                ] : [
                    $row->registration_no,
                    $row->name,
                    $row->education,
                    $row->subjects,
                    $row->contact,
                    $row->email,
                    $row->status,
                    $row->created_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, "pendaftaran-{$type}-".now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv']);
    }

    public function approveTeacher(TeacherRegistration $teacherRegistration): RedirectResponse
    {
        if ($teacherRegistration->status !== 'pending') {
            return back()->with('error', 'Pendaftaran pengajar sudah diproses sebelumnya.');
        }

        $duplicateExists = Teacher::query()
            ->where('name', $teacherRegistration->name)
            ->where('contact', $teacherRegistration->contact)
            ->exists();

        $teacher = null;

        DB::transaction(function () use ($teacherRegistration, $duplicateExists, &$teacher): void {
            $teacherRegistration->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => Auth::id(),
            ]);

            if ($duplicateExists) {
                return;
            }

            $teacher = Teacher::create([
                'name' => $teacherRegistration->name,
                'address' => $teacherRegistration->address,
                'education' => $teacherRegistration->education,
                'subjects' => $teacherRegistration->subjects,
                'experience' => $teacherRegistration->experience,
                'contact' => $teacherRegistration->contact,
                'email' => $teacherRegistration->email,
                'cv_path' => $teacherRegistration->cv_path,
                'notes' => $teacherRegistration->notes,
                'is_active' => true,
                'created_by' => Auth::id(),
            ]);
        });

        $portalExtra = null;

        if (! $teacher) {
            $teacher = Teacher::query()
                ->where('name', $teacherRegistration->name)
                ->where('contact', $teacherRegistration->contact)
                ->first();
        }

        if ($teacher && $teacherRegistration->email && ! $teacher->email) {
            $teacher->update(['email' => $teacherRegistration->email]);
        }

        if ($teacher) {
            $portalResult = PortalAccountService::createForTeacher(
                $teacher,
                $teacherRegistration->email
            );

            $emailService = app(TeacherRegistrationEmailService::class);

            if ($portalResult) {
                if ($portalResult['is_new']) {
                    $portalExtra = 'Akun portal pengajar Anda telah dibuat. Login di '.route('portal.login')
                        ." dengan email ini atau nomor WA dan password sementara: {$portalResult['password']}. Segera ganti password setelah login.";

                    if ($teacherRegistration->email) {
                        $emailService->sendApprovedNewTeacher($teacherRegistration->fresh(), (string) $portalResult['password']);
                    }
                } else {
                    $portalExtra = 'Pendaftaran pengajar Anda disetujui. Akun Portal Pengajar Anda sudah aktif. Silakan login di '.route('portal.login');

                    if ($teacherRegistration->email) {
                        $emailService->sendApprovedExistingTeacher($teacherRegistration->fresh());
                    }
                }
            }
        }

        $this->notify($teacherRegistration->fresh(), 'approved', $portalExtra);

        ActivityLog::record(
            'pendaftaran.pengajar.setujui',
            "Pendaftaran pengajar \"{$teacherRegistration->name}\" disetujui.",
            $teacherRegistration
        );

        if ($duplicateExists) {
            return back()->with('success', 'Pendaftaran pengajar disetujui. Data pengajar sudah ada, tidak dibuat duplikat.');
        }

        return back()->with('success', 'Pendaftaran pengajar disetujui.');
    }

    public function rejectTeacher(Request $request, TeacherRegistration $teacherRegistration): RedirectResponse
    {
        if ($teacherRegistration->status !== 'pending') {
            return back()->with('error', 'Pendaftaran pengajar sudah diproses sebelumnya.');
        }

        $data = $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $teacherRegistration->update([
            'status' => 'rejected',
            'admin_note' => $data['admin_note'] ?? null,
            'rejected_at' => now(),
            'rejected_by' => Auth::id(),
        ]);

        $this->notify($teacherRegistration->fresh(), 'rejected');

        ActivityLog::record(
            'pendaftaran.pengajar.tolak',
            "Pendaftaran pengajar \"{$teacherRegistration->name}\" ditolak.",
            $teacherRegistration
        );

        return back()->with('success', 'Pendaftaran pengajar ditolak.');
    }

    public function resendStudentEmail(StudentRegistration $studentRegistration): RedirectResponse
    {
        if (! $studentRegistration->parent_email) {
            return back()->with('error', 'Pendaftaran murid ini tidak memiliki alamat email orang tua.');
        }

        $emailService = app(StudentRegistrationEmailService::class);

        if ($studentRegistration->status === 'approved') {
            $student = Student::query()
                ->where('parent_contact', $studentRegistration->parent_contact)
                ->where('name', $studentRegistration->student_name)
                ->first();

            $account = $student?->parentAccount;

            if ($account) {
                $sent = $emailService->sendApprovedExistingParent($studentRegistration);

                return $sent
                    ? back()->with('success', "Email informasi portal orang tua berhasil dikirim ulang ke {$studentRegistration->parent_email}.")
                    : back()->with('error', "Gagal mengirim email ke {$studentRegistration->parent_email}. Periksa konfigurasi mail server.");
            }
        }

        $sent = $emailService->sendReceived($studentRegistration);

        return $sent
            ? back()->with('success', "Email bukti pendaftaran berhasil dikirim ulang ke {$studentRegistration->parent_email}.")
            : back()->with('error', "Gagal mengirim email ke {$studentRegistration->parent_email}. Periksa konfigurasi mail server.");
    }

    public function resendTeacherEmail(TeacherRegistration $teacherRegistration): RedirectResponse
    {
        if (! $teacherRegistration->email) {
            return back()->with('error', 'Pendaftaran pengajar ini tidak memiliki alamat email.');
        }

        $emailService = app(TeacherRegistrationEmailService::class);

        if ($teacherRegistration->status === 'approved') {
            $sent = $emailService->sendApprovedExistingTeacher($teacherRegistration);

            return $sent
                ? back()->with('success', "Email informasi portal pengajar berhasil dikirim ulang ke {$teacherRegistration->email}.")
                : back()->with('error', "Gagal mengirim email ke {$teacherRegistration->email}. Periksa konfigurasi mail server.");
        }

        $sent = $emailService->sendReceived($teacherRegistration);

        return $sent
            ? back()->with('success', "Email bukti pendaftaran berhasil dikirim ulang ke {$teacherRegistration->email}.")
            : back()->with('error', "Gagal mengirim email ke {$teacherRegistration->email}. Periksa konfigurasi mail server.");
    }

    public function bulkApproveTeachers(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['integer'],
        ]);

        $processed = $this->bulkApprove(TeacherRegistration::class, $data['ids']);

        return back()->with('success', "Berhasil menyetujui {$processed} pendaftaran pengajar.");
    }

    public function destroyTeacher(TeacherRegistration $teacherRegistration): RedirectResponse
    {
        $teacherRegistration->delete();

        return back()->with('success', 'Pendaftaran pengajar dihapus.');
    }

    /**
     * @param  class-string<StudentRegistration|TeacherRegistration>  $model
     */
    private function bulkApprove(string $model, array $ids): int
    {
        $processed = 0;

        $model::query()
            ->whereIn('id', $ids)
            ->where('status', 'pending')
            ->orderBy('id')
            ->eachById(function (StudentRegistration|TeacherRegistration $registration) use (&$processed): void {
                if ($registration instanceof StudentRegistration) {
                    $this->approveStudent($registration);
                } else {
                    $this->approveTeacher($registration);
                }
                $processed++;
            });

        return $processed;
    }

    private function notify(StudentRegistration|TeacherRegistration $registration, string $event, ?string $extra = null): void
    {
        if ($registration instanceof StudentRegistration) {
            $recipient = (string) $registration->parent_contact;
            $name = (string) $registration->student_name;
            $type = 'student';
        } else {
            $recipient = (string) $registration->contact;
            $name = (string) $registration->name;
            $type = 'teacher';
        }

        if ($recipient === '') {
            return;
        }

        SendRegistrationNotification::dispatch(
            event: $event,
            recipient: $recipient,
            name: $name,
            ticket: (string) $registration->registration_no,
            reason: $registration->admin_note,
            registrationType: $type,
            registrationId: $registration->id,
            extra: $extra,
        );

        $registration->update(['notified_at' => now()]);
    }
}
