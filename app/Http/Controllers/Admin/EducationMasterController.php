<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEducationClassRequest;
use App\Http\Requests\StoreEducationLevelRequest;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateEducationClassRequest;
use App\Http\Requests\UpdateEducationLevelRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\EducationClass;
use App\Models\EducationLevel;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EducationMasterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/EducationMaster', [
            'levels' => EducationLevel::query()->with(['educationClasses', 'subjects'])->orderBy('sort_order')->get(),
            'subjects' => Subject::query()->with('educationLevels:id,name')->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function storeLevel(StoreEducationLevelRequest $request): RedirectResponse
    {
        EducationLevel::query()->create($request->validated());

        return back()->with('success', 'Jenjang berhasil ditambahkan.');
    }

    public function storeClass(StoreEducationClassRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $exists = EducationClass::query()->where('education_level_id', $data['education_level_id'])->where('name', $data['name'])->exists();
        if ($exists) {
            return back()->withErrors(['name' => 'Nama kelas sudah ada pada jenjang ini.']);
        }
        EducationClass::query()->create($data);

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function storeSubject(StoreSubjectRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $subject = Subject::query()->create($data);
        $subject->educationLevels()->sync($data['education_level_ids']);

        return back()->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function updateLevel(UpdateEducationLevelRequest $request, EducationLevel $educationLevel): RedirectResponse
    {
        $educationLevel->update($request->validated());

        return back()->with('success', 'Jenjang berhasil diperbarui.');
    }

    public function destroyLevel(EducationLevel $educationLevel): RedirectResponse
    {
        if ($educationLevel->educationClasses()->exists()) {
            return back()->withErrors(['level' => 'Jenjang masih memiliki kelas. Hapus atau pindahkan kelas terlebih dahulu.']);
        }
        $educationLevel->delete();

        return back()->with('success', 'Jenjang berhasil dihapus.');
    }

    public function updateClass(UpdateEducationClassRequest $request, EducationClass $educationClass): RedirectResponse
    {
        $educationClass->update($request->validated());

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroyClass(EducationClass $educationClass): RedirectResponse
    {
        if ($educationClass->bankSoals()->exists()) {
            return back()->withErrors(['class' => 'Kelas masih digunakan oleh bank soal dan tidak dapat dihapus.']);
        }
        $educationClass->delete();

        return back()->with('success', 'Kelas berhasil dihapus.');
    }

    public function updateSubject(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $data = $request->validated();
        $usedLevelIds = $subject->bankSoals()->with('educationClass:id,education_level_id')->get()
            ->pluck('educationClass.education_level_id')->filter()->unique();
        if ($usedLevelIds->diff($data['education_level_ids'])->isNotEmpty()) {
            return back()->withErrors(['education_level_ids' => 'Mapel masih dipakai bank soal pada jenjang yang dilepas.']);
        }
        $subject->update($data);
        $subject->educationLevels()->sync($data['education_level_ids']);

        return back()->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroySubject(Subject $subject): RedirectResponse
    {
        if ($subject->bankSoals()->exists()) {
            return back()->withErrors(['subject' => 'Mata pelajaran masih digunakan oleh bank soal dan tidak dapat dihapus.']);
        }
        $subject->delete();

        return back()->with('success', 'Mata pelajaran berhasil dihapus.');
    }
}
