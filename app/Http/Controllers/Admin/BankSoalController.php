<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBankSoalRequest;
use App\Http\Requests\UpdateBankSoalPasskeyRequest;
use App\Http\Requests\UpdateBankSoalRequest;
use App\Models\ActivityLog;
use App\Models\BankSoal;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BankSoalController extends Controller
{
    public function updateGlobalPasskey(UpdateBankSoalPasskeyRequest $request): RedirectResponse
    {
        $pageContent = PageContent::query()->firstOrNew(['slug' => 'bank-soal']);
        $content = is_array($pageContent->content) ? $pageContent->content : [];
        $content['bankSoalPasskey'] = trim((string) ($request->validated('passkey') ?? ''));

        $pageContent->content = $content;
        $pageContent->save();

        Cache::forget('landing-content');

        ActivityLog::record(
            'bank-soal.passkey.ubah',
            filled($content['bankSoalPasskey'])
                ? 'Passkey global Bank Soal diperbarui.'
                : 'Passkey global Bank Soal dinonaktifkan.',
        );

        return back()->with('success', 'Passkey global Bank Soal berhasil disimpan.');
    }

    public function store(StoreBankSoalRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('bank-soals', 'public');
        }
        unset($data['image']);
        $data = $this->normalizePayload($data);

        if (! empty($data['passkey'])) {
            $data['passkey'] = Hash::make(trim($data['passkey']));
        } else {
            unset($data['passkey']);
        }

        BankSoal::create($data);

        return back()->with('success', 'Modul berhasil ditambahkan.');
    }

    public function update(UpdateBankSoalRequest $request, BankSoal $bankSoal): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('bank-soals', 'public');
        }
        unset($data['image']);
        $data = $this->normalizePayload($data);

        if (filter_var($data['passkey_clear'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $data['passkey'] = null;
        } elseif (! empty($data['passkey'])) {
            $data['passkey'] = Hash::make(trim($data['passkey']));
        } else {
            unset($data['passkey']);
        }
        unset($data['passkey_clear']);

        $bankSoal->update($data);

        return back()->with('success', 'Modul berhasil diperbarui.');
    }

    public function destroy(BankSoal $bankSoal): RedirectResponse
    {
        $bankSoal->delete();

        return back()->with('success', 'Modul berhasil dihapus.');
    }

    private function normalizePayload(array $data): array
    {
        $data['slug'] = $data['slug'] ?? null;
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $data['name'] = ['id' => $data['name'], 'en' => $data['name']];
        $data['category'] = ['id' => $data['category'], 'en' => $data['category']];
        $data['level'] = ['id' => $data['level'], 'en' => $data['level']];
        $description = $data['description'] ?? '';
        $data['description'] = ['id' => $description, 'en' => $description];

        $links = collect($data['links'] ?? [])
            ->filter(fn ($link) => is_array($link) && (filled($link['label'] ?? null) || filled($link['link'] ?? null)))
            ->values()
            ->map(function (array $link) {
                return [
                    'id' => Arr::get($link, 'id'),
                    'label' => $link['label'] ?? '',
                    'link' => $link['link'] ?? '',
                ];
            })
            ->values()
            ->all();

        $usedIds = [];
        $links = collect($links)->map(function (array $link, int $index) use (&$usedIds) {
            $id = (int) ($link['id'] ?? 0);
            if ($id <= 0 || in_array($id, $usedIds, true)) {
                $id = $this->generateLinkId($usedIds, $index);
            }

            $usedIds[] = $id;

            return [
                'id' => $id,
                'label' => $link['label'] ?? '',
                'link' => $link['link'] ?? '',
            ];
        })->values()->all();

        $data['links'] = $links;
        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);

        return $data;
    }

    /**
     * @param  array<int, int>  $usedIds
     */
    private function generateLinkId(array $usedIds, int $index): int
    {
        do {
            $id = (int) (microtime(true) * 1000) + random_int(0, 999) + $index;
        } while (in_array($id, $usedIds, true));

        return $id;
    }
}
