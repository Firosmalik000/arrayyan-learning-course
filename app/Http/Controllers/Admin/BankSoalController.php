<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BankSoalController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'format' => ['required', 'string', 'max:100'],
            'questions' => ['nullable', 'integer', 'min:0'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $data['name'] = ['id' => $data['name'], 'en' => $data['name']];
        $data['category'] = ['id' => $data['category'], 'en' => $data['category']];
        $data['level'] = ['id' => $data['level'], 'en' => $data['level']];
        $data['description'] = ['id' => $data['description'] ?? '', 'en' => $data['description'] ?? ''];

        BankSoal::create($data);

        return back()->with('success', 'Modul berhasil ditambahkan.');
    }

    public function update(Request $request, BankSoal $bankSoal): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'format' => ['required', 'string', 'max:100'],
            'questions' => ['nullable', 'integer', 'min:0'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $data['name'] = ['id' => $data['name'], 'en' => $data['name']];
        $data['category'] = ['id' => $data['category'], 'en' => $data['category']];
        $data['level'] = ['id' => $data['level'], 'en' => $data['level']];
        $data['description'] = ['id' => $data['description'] ?? '', 'en' => $data['description'] ?? ''];

        $bankSoal->update($data);

        return back()->with('success', 'Modul berhasil diperbarui.');
    }

    public function destroy(BankSoal $bankSoal): RedirectResponse
    {
        $bankSoal->delete();

        return back()->with('success', 'Modul berhasil dihapus.');
    }
}
