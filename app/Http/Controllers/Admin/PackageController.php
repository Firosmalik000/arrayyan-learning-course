<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePackageRequest;
use App\Http\Requests\UpdatePackageRequest;
use App\Models\Package;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    public function store(StorePackageRequest $request): RedirectResponse
    {
        Package::create($this->normalizePayload($request->validated()));

        return back()->with('success', 'Pilihan harga berhasil ditambahkan.');
    }

    public function update(UpdatePackageRequest $request, Package $package): RedirectResponse
    {
        $package->update($this->normalizePayload($request->validated(), $package));

        return back()->with('success', 'Pilihan harga berhasil diperbarui.');
    }

    public function destroy(Package $package): RedirectResponse
    {
        if ($package->studentRegistrations()->exists()) {
            return back()->with('error', 'Pilihan harga sudah digunakan pada pendaftaran. Nonaktifkan agar riwayat tetap aman.');
        }

        $package->delete();

        return back()->with('success', 'Pilihan harga berhasil dihapus.');
    }

    private function normalizePayload(array $data, ?Package $package = null): array
    {
        $program = Program::query()->findOrFail($data['program_id']);
        $data['name'] = sprintf('%s - %s - %s Pertemuan', $program->name, $data['level'], $data['sessions']);
        $data['duration'] = $data['sessions'].' pertemuan / bulan';
        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);
        $data['slug'] = $this->uniqueSlug($data['name'], $package?->id);

        return $data;
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'pilihan-harga';
        $candidate = $base;
        $counter = 2;

        while (Package::query()
            ->where('slug', $candidate)
            ->when($ignoreId, fn ($query) => $query->where('id', '<>', $ignoreId))
            ->exists()) {
            $candidate = $base.'-'.$counter;
            $counter++;
        }

        return $candidate;
    }
}
