<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class TeacherController extends Controller
{
    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cv', 'public');
        }
        unset($data['cv']);

        Teacher::create([
            ...$data,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pengajar baru berhasil ditambahkan.');
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cv', 'public');
        }
        unset($data['cv']);

        $teacher->update([
            ...$data,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Data pengajar berhasil diperbarui.');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->update([
            'is_active' => false,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pengajar dinonaktifkan.');
    }
}
