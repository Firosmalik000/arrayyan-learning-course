<?php

namespace App\Http\Controllers;

use App\Http\Requests\UnlockBankSoalRequest;
use App\Models\BankSoal;
use App\Models\BankSoalResource;
use App\Models\EducationClass;
use App\Models\EducationLevel;
use App\Models\PageContent;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BankSoalAccessController extends Controller
{
    public function unlockGlobal(UnlockBankSoalRequest $request): RedirectResponse
    {
        $globalPasskey = self::globalPasskey();
        $input = trim($request->validated('passkey'));

        if (! $globalPasskey || ! hash_equals($globalPasskey, $input)) {
            return back()->withErrors([
                'passkey' => 'Passkey salah. Silakan coba lagi atau hubungi admin.',
            ]);
        }

        $request->session()->put('banksoal.global', self::globalSessionFingerprint($globalPasskey));

        return back()->with('success', 'Akses Bank Soal berhasil dibuka.');
    }

    public function unlock(
        UnlockBankSoalRequest $request,
        EducationLevel $educationLevel,
        EducationClass $educationClass,
        Subject $subject,
        BankSoal $bankSoal,
    ): RedirectResponse {
        self::ensureHierarchy($educationLevel, $educationClass, $subject, $bankSoal);

        if (self::hasAccess($bankSoal, $request)) {
            return back()->with('success', 'Materi sudah terbuka.');
        }

        $input = trim($request->validated('passkey'));
        $globalPasskey = self::globalPasskey();
        if ($globalPasskey && hash_equals($globalPasskey, $input)) {
            $request->session()->put('banksoal.global', self::globalSessionFingerprint($globalPasskey));

            return back()->with('success', 'Materi berhasil dibuka.');
        }

        return back()->with('error', 'Passkey salah. Silakan coba lagi atau hubungi admin.');
    }

    public function download(
        Request $request,
        EducationLevel $educationLevel,
        EducationClass $educationClass,
        Subject $subject,
        BankSoal $bankSoal,
        BankSoalResource $resource,
    ): RedirectResponse|StreamedResponse {
        self::ensureHierarchy($educationLevel, $educationClass, $subject, $bankSoal);
        abort_unless($resource->bank_soal_id === $bankSoal->id, 404);

        if (! self::hasAccess($bankSoal, $request)) {
            return redirect()->route('banksoal.detail', [$educationLevel, $educationClass, $subject, $bankSoal])
                ->with('error', 'Materi terkunci. Verifikasi passkey global dan login menggunakan akun portal.');
        }
        abort_if(blank($resource->file_path) && blank($resource->destination_url), 404);

        $source = $request->query('source');
        abort_if($source !== null && ! in_array($source, ['file', 'link'], true), 404);

        if ($source === 'link') {
            abort_if(blank($resource->destination_url), 404);
            $bankSoal->increment('download_count');

            return redirect()->away($resource->destination_url);
        }

        if ($source === 'file' || filled($resource->file_path)) {
            abort_if(blank($resource->file_path), 404);
            abort_unless(Storage::disk('public')->exists($resource->file_path), 404);
            $bankSoal->increment('download_count');

            return Storage::disk('public')->download(
                $resource->file_path,
                $resource->file_name ?? basename($resource->file_path),
            );
        }

        $bankSoal->increment('download_count');

        return redirect()->away($resource->destination_url);
    }

    public static function hasAccess(BankSoal $bankSoal, Request $request): bool
    {
        if (Auth::guard('admin')->check() || Auth::guard('web')->check()) {
            return true;
        }

        if (! Auth::guard('portal')->check()) {
            return false;
        }

        return self::hasGlobalAccess($request);
    }

    public static function hasGlobalAccess(Request $request): bool
    {
        $globalPasskey = self::globalPasskey();
        if (! $globalPasskey) {
            return true;
        }

        $globalSession = $request->session()->get('banksoal.global');

        return is_string($globalSession)
            && hash_equals(self::globalSessionFingerprint($globalPasskey), $globalSession);
    }

    public static function isAuthenticated(): bool
    {
        return Auth::guard('portal')->check()
            || Auth::guard('admin')->check()
            || Auth::guard('web')->check();
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

    private static function globalSessionFingerprint(string $passkey): string
    {
        return hash('sha256', $passkey);
    }

    public static function ensureHierarchy(
        EducationLevel $educationLevel,
        EducationClass $educationClass,
        Subject $subject,
        ?BankSoal $bankSoal = null,
    ): void {
        abort_unless($educationClass->education_level_id === $educationLevel->id, 404);
        abort_unless($educationLevel->subjects()->whereKey($subject->id)->exists(), 404);
        if ($bankSoal) {
            abort_unless(
                $bankSoal->is_active
                && $bankSoal->education_class_id === $educationClass->id
                && $bankSoal->subject_id === $subject->id,
                404,
            );
        }
    }
}
