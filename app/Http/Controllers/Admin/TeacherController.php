<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetPortalAccountPasswordRequest;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Support\PortalAccountNotificationService;
use App\Support\PortalAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    public function __construct(private PortalAccountNotificationService $portalAccountNotificationService) {}

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cv', 'public');
        }
        unset($data['cv']);

        $portalResult = DB::transaction(function () use ($data): array {
            $teacher = Teacher::create([
                ...collect($data)->except(['temporary_password', 'temporary_password_confirmation'])->all(),
                'is_active' => true,
                'created_by' => Auth::id(),
            ]);

            $portalResult = PortalAccountService::createForTeacher(
                teacher: $teacher,
                teacherEmail: $data['email'],
                temporaryPassword: $data['temporary_password'],
            );

            abort_unless($portalResult !== null, 422, 'Akun portal pengajar tidak dapat dibuat.');

            return $portalResult;
        });

        $this->portalAccountNotificationService->sendLoginInformation(
            $portalResult['account'],
            $portalResult['is_new'] ? $portalResult['password'] : null,
        );

        return back()->with('success', $portalResult['is_new']
            ? 'Pengajar dan akun Portal Pengajar berhasil dibuat.'
            : 'Pengajar berhasil dibuat dan dihubungkan ke akun Portal Pengajar yang sudah ada.');
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cv', 'public');
        }
        unset($data['cv']);

        $teacher->update([
            ...$data,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Data pengajar berhasil diperbarui.');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->update([
            'is_active' => false,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pengajar dinonaktifkan.');
    }

    public function resetPortalPassword(
        ResetPortalAccountPasswordRequest $request,
        Teacher $teacher,
    ): RedirectResponse {
        $password = $request->string('password')->value();
        $account = $teacher->portalAccount;

        if (! $account) {
            $portalResult = PortalAccountService::createForTeacher($teacher, $teacher->email, $password);
            $account = $portalResult['account'] ?? null;
        } else {
            $account->forceFill([
                'password' => Hash::make($password),
                'must_change_password' => true,
                'remember_token' => Str::random(60),
            ])->save();
        }

        if (! $account) {
            return back()->with('error', 'Akun portal tidak dapat dibuat karena email atau kontak pengajar belum lengkap.');
        }

        $sent = $this->portalAccountNotificationService->sendLoginInformation($account, $password);

        return back()->with(
            $sent ? 'success' : 'error',
            $sent
                ? 'Password sementara berhasil direset dan informasi login telah dikirim.'
                : 'Password sementara berhasil direset, tetapi email informasi login gagal dikirim.',
        );
    }

    public function resendPortalInformation(Teacher $teacher): RedirectResponse
    {
        $account = $teacher->portalAccount;
        $temporaryPassword = null;

        if (! $account) {
            $portalResult = PortalAccountService::createForTeacher($teacher, $teacher->email);
            $account = $portalResult['account'] ?? null;
            $temporaryPassword = ($portalResult['is_new'] ?? false) ? $portalResult['password'] : null;
        }

        if (! $account) {
            return back()->with('error', 'Informasi login tidak dapat dikirim karena email atau kontak pengajar belum lengkap.');
        }

        $sent = $this->portalAccountNotificationService->sendLoginInformation($account, $temporaryPassword);

        return back()->with(
            $sent ? 'success' : 'error',
            $sent ? 'Informasi login Portal Pengajar berhasil dikirim ulang.' : 'Informasi login gagal dikirim. Pastikan email pengajar tersedia.',
        );
    }
}
