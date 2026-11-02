<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\ClassGroup;
use App\Models\Invoice;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    public function store(StoreProgramRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('programs', 'public');
        }
        unset($data['image']);

        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['is_featured'] = filter_var($data['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? null, $data['name']);

        Program::create($data);

        return back()->with('success', 'Program berhasil ditambahkan.');
    }

    public function update(UpdateProgramRequest $request, Program $program): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('programs', 'public');
        }
        unset($data['image']);

        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['is_featured'] = filter_var($data['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? null, $data['name'], $program->id);

        $program->update($data);

        return back()->with('success', 'Program berhasil diperbarui.');
    }

    public function destroy(Program $program): RedirectResponse
    {
        if ($program->packages()->exists() || $program->studentRegistrations()->exists()
            || ClassGroup::query()->where('program_id', $program->id)->exists()
            || Student::query()->where('program_id', $program->id)->exists()
            || Invoice::query()->where('program_id', $program->id)->exists()) {
            return back()->with('error', 'Program masih digunakan pada pilihan harga, murid, kelas, pendaftaran, atau tagihan. Nonaktifkan program agar riwayat tetap aman.');
        }

        $program->delete();

        return back()->with('success', 'Program berhasil dihapus.');
    }

    private function uniqueSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $name);
        $base = $base !== '' ? $base : 'program';
        $candidate = $base;
        $counter = 2;

        while (Program::query()
            ->where('slug', $candidate)
            ->when($ignoreId, fn ($query) => $query->where('id', '<>', $ignoreId))
            ->exists()) {
            $candidate = $base.'-'.$counter;
            $counter++;
        }

        return $candidate;
    }
}
