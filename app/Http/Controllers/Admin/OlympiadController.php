<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Olympiad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OlympiadController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'schedule' => ['nullable', 'date'],
            'selection_system' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:free,paid'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable'],
        ]);

        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['slug'] = Str::slug($data['name']);

        Olympiad::create($data);

        return back()->with('success', 'Olimpiade berhasil ditambahkan.');
    }

    public function update(Request $request, Olympiad $olympiad): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'schedule' => ['nullable', 'date'],
            'selection_system' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:free,paid'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable'],
        ]);

        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['slug'] = Str::slug($data['name']);

        $olympiad->update($data);

        return back()->with('success', 'Olimpiade berhasil diperbarui.');
    }

    public function destroy(Olympiad $olympiad): RedirectResponse
    {
        $olympiad->delete();

        return back()->with('success', 'Olimpiade berhasil dihapus.');
    }
}
