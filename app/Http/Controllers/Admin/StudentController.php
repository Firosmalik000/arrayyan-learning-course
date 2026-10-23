<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetPortalAccountPasswordRequest;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\ClassMember;
use App\Models\Package;
use App\Models\Program;
use App\Models\Student;
use App\Support\PortalAccountNotificationService;
use App\Support\PortalAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function __construct(private PortalAccountNotificationService $portalAccountNotificationService) {}

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->select(['id', 'name'])->findOrFail($data['program_id']);
        $package = ! empty($data['package_id'])
            ? Package::query()->findOrFail($data['package_id'])
            : null;

        $portalResult = DB::transaction(function () use ($data, $program, $package): array {
            $student = Student::create([
                ...collect($data)->except(['temporary_password', 'temporary_password_confirmation'])->all(),
                'program' => $program->name,
                'package' => $package?->displayName(),
                'is_active' => true,
                'created_by' => Auth::id(),
            ]);

            $portalResult = PortalAccountService::createOrLinkForStudent(
                student: $student,
                parentEmail: $data['parent_email'],
                temporaryPassword: $data['temporary_password'],
            );

            abort_unless($portalResult !== null, 422, 'Akun portal orang tua tidak dapat dibuat.');

            return $portalResult;
        });

        $this->portalAccountNotificationService->sendLoginInformation(
            $portalResult['account'],
            $portalResult['is_new'] ? $portalResult['password'] : null,
        );

        return back()->with('success', $portalResult['is_new']
            ? 'Pelajar dan akun Portal Orang Tua berhasil dibuat.'
            : 'Pelajar berhasil dibuat dan dihubungkan ke akun Portal Orang Tua yang sudah ada.');
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->select(['id', 'name'])->findOrFail($data['program_id']);
        $package = ! empty($data['package_id'])
            ? Package::query()->findOrFail($data['package_id'])
            : null;

        $student->update([
            ...$data,
            'program' => $program->name,
            'package' => $package?->displayName() ?? $data['package'] ?? null,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Data pelajar berhasil diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->update([
            'is_active' => false,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pelajar dinonaktifkan.');
    }

    public function resetPortalPassword(
        ResetPortalAccountPasswordRequest $request,
        Student $student,
    ): RedirectResponse {
        $password = $request->string('password')->value();
        $account = $student->parentAccount;

        if (! $account) {
            $portalResult = PortalAccountService::createOrLinkForStudent(
                student: $student,
                parentEmail: $student->parent_email,
                temporaryPassword: $password,
            );
            $account = $portalResult['account'] ?? null;
        } else {
            $account->forceFill([
                'password' => Hash::make($password),
                'must_change_password' => true,
                'remember_token' => Str::random(60),
            ])->save();
        }

        if (! $account) {
            return back()->with('error', 'Akun portal tidak dapat dibuat karena email atau kontak orang tua belum lengkap.');
        }

        $sent = $this->portalAccountNotificationService->sendLoginInformation($account, $password);

        return back()->with(
            $sent ? 'success' : 'error',
            $sent
                ? 'Password sementara berhasil direset dan informasi login telah dikirim.'
                : 'Password sementara berhasil direset, tetapi email informasi login gagal dikirim.',
        );
    }

    public function resendPortalInformation(Student $student): RedirectResponse
    {
        $account = $student->parentAccount;
        $temporaryPassword = null;

        if (! $account) {
            $portalResult = PortalAccountService::createOrLinkForStudent($student, $student->parent_email);
            $account = $portalResult['account'] ?? null;
            $temporaryPassword = ($portalResult['is_new'] ?? false) ? $portalResult['password'] : null;
        }

        if (! $account) {
            return back()->with('error', 'Informasi login tidak dapat dikirim karena email atau kontak orang tua belum lengkap.');
        }

        $sent = $this->portalAccountNotificationService->sendLoginInformation($account, $temporaryPassword);

        return back()->with(
            $sent ? 'success' : 'error',
            $sent ? 'Informasi login Portal Orang Tua berhasil dikirim ulang.' : 'Informasi login gagal dikirim. Pastikan email orang tua tersedia.',
        );
    }

    public function card(Student $student): Response
    {
        $student->load('programItem:id,name');

        $activeClass = ClassMember::query()
            ->with('classGroup:id,name,teacher_id')
            ->where('student_id', $student->id)
            ->where('status', ClassMember::STATUS_ACTIVE)
            ->latest()
            ->first();

        return Inertia::render('Admin/Students/Card', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'school_name' => $student->school_name,
                'level' => $student->level,
                'program' => $student->programItem?->name ?? $student->program,
                'parent_contact' => $student->parent_contact,
                'is_active' => $student->is_active,
            ],
            'class_name' => $activeClass?->classGroup?->name,
        ]);
    }
}
