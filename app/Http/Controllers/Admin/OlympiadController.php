<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOlympiadRequest;
use App\Http\Requests\UpdateOlympiadRequest;
use App\Models\Olympiad;
use App\Support\EducationCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class OlympiadController extends Controller
{
    public function store(StoreOlympiadRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('olympiads', 'public');
        }
        unset($data['image']);

        $data['education_levels'] = array_values($data['education_levels'] ?? []);
        $data['grades'] = array_values($data['grades'] ?? []);
        $data['level'] = EducationCatalog::summarize($data['education_levels']);
        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['is_registration_open'] = filter_var($data['is_registration_open'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['winners'] = $this->normalizeWinners($data['winners'] ?? null);
        $data['slug'] = $this->uniqueSlug($data['name']);

        Olympiad::create($data);

        return back()->with('success', 'Olimpiade berhasil ditambahkan.');
    }

    public function update(UpdateOlympiadRequest $request, Olympiad $olympiad): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('olympiads', 'public');
        }
        unset($data['image']);

        $data['education_levels'] = array_values($data['education_levels'] ?? []);
        $data['grades'] = array_values($data['grades'] ?? []);
        $data['level'] = EducationCatalog::summarize($data['education_levels']);
        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['is_registration_open'] = filter_var($data['is_registration_open'] ?? $olympiad->is_registration_open, FILTER_VALIDATE_BOOLEAN);
        $data['winners'] = $this->normalizeWinners($data['winners'] ?? null);
        $data['slug'] = $this->uniqueSlug($data['name'], $olympiad->id);

        $olympiad->update($data);

        return back()->with('success', 'Olimpiade berhasil diperbarui.');
    }

    public function destroy(Olympiad $olympiad): RedirectResponse
    {
        $olympiad->delete();

        return back()->with('success', 'Olimpiade berhasil dihapus.');
    }

    /**
     * @return array<int, string>
     */
    private function normalizeWinners(mixed $winners): ?array
    {
        if (is_string($winners)) {
            $winners = preg_split('/[\r\n,]+/', $winners);
        }

        if (! is_array($winners)) {
            return null;
        }

        $names = collect($winners)
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->values()
            ->all();

        return $names === [] ? null : $names;
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'olimpiade';
        $candidate = $base;
        $counter = 2;

        while (Olympiad::query()
            ->where('slug', $candidate)
            ->when($ignoreId, fn ($query) => $query->where('id', '<>', $ignoreId))
            ->exists()) {
            $candidate = $base.'-'.$counter;
            $counter++;
        }

        return $candidate;
    }
}
