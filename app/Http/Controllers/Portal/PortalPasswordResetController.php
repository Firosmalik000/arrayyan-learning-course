<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetPortalPasswordRequest;
use App\Http\Requests\SendPortalPasswordResetLinkRequest;
use App\Models\PortalAccount;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortalPasswordResetController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(SendPortalPasswordResetLinkRequest $request): RedirectResponse
    {
        Password::broker('portal_accounts')->sendResetLink([
            'email' => $request->string('email')->value(),
            'is_active' => true,
        ]);

        return back()->with(
            'status',
            'Jika email terdaftar pada akun portal yang aktif, tautan pengaturan ulang kata sandi telah dikirim.'
        );
    }

    public function edit(string $token): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => request()->string('email')->value(),
        ]);
    }

    public function update(ResetPortalPasswordRequest $request): RedirectResponse
    {
        $status = Password::broker('portal_accounts')->reset(
            [
                ...$request->safe()->only(['email', 'password', 'password_confirmation', 'token']),
                'is_active' => true,
            ],
            function (PortalAccount $account, string $password): void {
                $account->forceFill([
                    'password' => Hash::make($password),
                    'must_change_password' => false,
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($account));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')
                ->with('success', 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.');
        }

        return back()
            ->withErrors(['email' => 'Tautan pengaturan ulang kata sandi tidak valid atau sudah kedaluwarsa.'])
            ->withInput($request->only('email'));
    }
}
