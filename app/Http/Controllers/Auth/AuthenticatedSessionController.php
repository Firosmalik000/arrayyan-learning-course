<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PortalAccount;
use App\Models\User;
use App\Support\RegistrationTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the unified login view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::guard('admin')->check() || Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard');
        }

        if (Auth::guard('portal')->check()) {
            return redirect()->route('portal.dashboard');
        }

        $intended = $request->session()->get('url.intended');
        $intendedPath = $intended ? parse_url($intended, PHP_URL_PATH) : null;

        $context =
            $request->routeIs('admin.login') ||
            ($intendedPath && str_starts_with($intendedPath, '/admin'))
                ? 'admin'
                : 'public';

        return Inertia::render('Auth/Login', [
            'context' => $context,
        ]);
    }

    /**
     * Handle unified incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $rawIdentity = trim((string) ($request->input('identity') ?? $request->input('email') ?? $request->input('contact') ?? ''));
        $password = (string) $request->input('password');
        $remember = $request->boolean('remember');

        if ($rawIdentity === '' || $password === '') {
            throw ValidationException::withMessages([
                'identity' => 'Email / Nomor WhatsApp dan kata sandi wajib diisi.',
                'email' => 'Email / Nomor WhatsApp dan kata sandi wajib diisi.',
                'contact' => 'Email / Nomor WhatsApp dan kata sandi wajib diisi.',
            ]);
        }

        $isEmail = filter_var($rawIdentity, FILTER_VALIDATE_EMAIL) !== false;

        // 1. Coba autentikasi sebagai Admin / Staff (User Model) jika input berupa Email
        if ($isEmail) {
            $user = User::query()
                ->where('email', strtolower($rawIdentity))
                ->first();

            if ($user && Hash::check($password, $user->password)) {
                if (isset($user->is_active) && ! $user->is_active) {
                    throw ValidationException::withMessages([
                        'identity' => 'Akun Anda dinonaktifkan. Hubungi administrator.',
                        'email' => 'Akun Anda dinonaktifkan. Hubungi administrator.',
                        'contact' => 'Akun Anda dinonaktifkan. Hubungi administrator.',
                    ]);
                }

                Auth::guard('admin')->login($user, $remember);
                Auth::guard('web')->login($user, $remember);
                $request->session()->regenerate();

                return redirect()->intended(route('admin.dashboard'));
            }
        }

        // 2. Coba autentikasi sebagai Akun Portal (Wali Murid / Siswa / Pengajar)
        $portalAccount = null;
        if ($isEmail) {
            $portalAccount = PortalAccount::query()
                ->where('email', strtolower($rawIdentity))
                ->where('is_active', true)
                ->first();
        } else {
            $normalizedPhone = RegistrationTicket::normalizePhone($rawIdentity);
            $portalAccount = PortalAccount::query()
                ->where(function ($q) use ($normalizedPhone, $rawIdentity) {
                    $q->where('contact', $normalizedPhone)
                        ->orWhere('contact', $rawIdentity);
                })
                ->where('is_active', true)
                ->first();
        }

        if ($portalAccount && Hash::check($password, $portalAccount->password)) {
            Auth::guard('portal')->login($portalAccount, $remember);
            $portalAccount->update(['last_login_at' => now()]);
            $request->session()->regenerate();

            if ($portalAccount->must_change_password) {
                return redirect()->route('portal.password');
            }

            return redirect()->intended(route('portal.dashboard'));
        }

        // 3. Kredensial tidak cocok di kedua guard
        throw ValidationException::withMessages([
            'identity' => 'Email / Nomor WhatsApp atau kata sandi tidak sesuai.',
            'email' => 'Email / Nomor WhatsApp atau kata sandi tidak sesuai.',
            'contact' => 'Email / Nomor WhatsApp atau kata sandi tidak sesuai.',
        ]);
    }

    /**
     * Destroy an authenticated session across all guards.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if (Auth::guard('admin')->check()) {
            Auth::guard('admin')->logout();
        }
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
        }
        if (Auth::guard('portal')->check()) {
            Auth::guard('portal')->logout();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
