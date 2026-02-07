<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRegistrationRequest;
use App\Http\Requests\StoreTeacherRegistrationRequest;
use App\Models\Program;
use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use Illuminate\Http\RedirectResponse;

class RegistrationController extends Controller
{
    public function storeStudent(StoreStudentRegistrationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->select(['id', 'name'])->findOrFail($data['program_id']);
        $data['program'] = $program->name;

        StudentRegistration::create($data);

        return back()->with('success', 'Pendaftaran murid berhasil dikirim.');
    }

    public function storeTeacher(StoreTeacherRegistrationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cv', 'public');
        }
        unset($data['cv']);

        TeacherRegistration::create($data);

        return back()->with('success', 'Pendaftaran pengajar berhasil dikirim.');
    }
}
