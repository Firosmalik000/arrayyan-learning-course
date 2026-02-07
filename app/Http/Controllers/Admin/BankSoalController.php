<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBankSoalRequest;
use App\Http\Requests\UpdateBankSoalRequest;
use App\Models\BankSoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class BankSoalController extends Controller
{
    public function store(StoreBankSoalRequest $request): RedirectResponse
    {
        $data = $this->normalizePayload($request->validated());

        BankSoal::create($data);

        return back()->with('success', 'Modul berhasil ditambahkan.');
    }

    public function update(UpdateBankSoalRequest $request, BankSoal $bankSoal): RedirectResponse
    {
        $data = $this->normalizePayload($request->validated());

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
