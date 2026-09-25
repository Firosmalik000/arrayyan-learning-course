<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\PortalAccount;
use App\Support\RegistrationTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PortalAuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::guard('portal')->check()) {
            return redirect()->route('portal.dashboard');
        }

        return Inertia::render('Portal/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'contact' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string'],
        ]);

        $contact = RegistrationTicket::normalizePhone($data['contact']);

        $account = PortalAccount::query()
            ->where('contact', $contact)
            ->where('is_active', true)
            ->first();

        if (! $account || ! Hash::check($data['password'], $account->password)) {
            throw ValidationException::withMessages([
                'contact' => 'Nomor WhatsApp atau password salah.',
            ]);
        }

        Auth::guard('portal')->login($account, $request->boolean('remember'));
        $account->update(['last_login_at' => now()]);
        $request->session()->regenerate();

        return redirect()->intended(route('portal.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('portal')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('portal.login');
    }
}
