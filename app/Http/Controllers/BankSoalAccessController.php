<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class BankSoalAccessController extends Controller
{
    public function unlock(Request $request, string $slug): RedirectResponse
    {
        $bankSoal = BankSoal::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $bankSoal) {
            return back()->with('error', 'Modul tidak ditemukan.');
        }

        if (self::hasAccess($bankSoal, $request)) {
            return back()->with('success', 'Materi sudah terbuka.');
        }

        $data = $request->validate([
            'passkey' => ['required', 'string', 'max:100'],
        ], [
            'passkey.required' => 'Passkey wajib diisi.',
        ]);

        $input = trim($data['passkey']);
        $granted = false;

        if ($bankSoal->passkey && Hash::check($input, $bankSoal->passkey)) {
            $granted = true;
        }

        if (! $granted && ($global = self::globalPasskey()) && hash_equals($global, $input)) {
            $granted = true;
        }

        if (! $granted) {
            return back()->with('error', 'Passkey salah. Silakan coba lagi atau hubungi admin.');
        }

        $request->session()->put("banksoal.{$bankSoal->id}", true);

        return back()->with('success', 'Materi berhasil dibuka.');
    }

    public function download(Request $request, string $slug, int $linkId): RedirectResponse
    {
        $bankSoal = BankSoal::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $bankSoal) {
            abort(404);
        }

        if (! self::hasAccess($bankSoal, $request)) {
            return redirect()->route('banksoal.detail', $slug)
                ->with('error', 'Materi terkunci. Masukkan passkey atau login sebagai murid.');
        }

        $links = $bankSoal->links ?? [];
        $target = collect($links)->firstWhere('id', $linkId);

        if (! $target || empty($target['link'])) {
            abort(404);
        }

        $bankSoal->increment('download_count');

        return redirect()->away($target['link']);
    }

    public static function hasAccess(BankSoal $bankSoal, Request $request): bool
    {
        if (Auth::guard('portal')->check()) {
            return true;
        }

        if ($request->session()->get("banksoal.{$bankSoal->id}") === true) {
            return true;
        }

        return ! $bankSoal->passkey && ! self::globalPasskey();
    }

    public static function globalPasskey(): ?string
    {
        $content = PageContent::query()->where('slug', 'bank-soal')->first()?->content;

        if (is_array($content)) {
            $key = trim((string) ($content['bankSoalPasskey'] ?? ''));
        } else {
            $key = trim((string) ($content ?? ''));
        }

        return $key !== '' ? $key : null;
    }
}
