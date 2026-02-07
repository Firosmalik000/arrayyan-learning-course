<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOlympiadRequest;
use App\Http\Requests\UpdateOlympiadRequest;
use App\Models\Olympiad;
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

        $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['slug'] = Str::slug($data['name']);

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
