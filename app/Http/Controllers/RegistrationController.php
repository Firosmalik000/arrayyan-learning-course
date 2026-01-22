<?php

namespace App\Http\Controllers;

use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function storeStudent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'student_name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'subjects' => ['required', 'string', 'max:255'],
            'parent_contact' => ['required', 'string', 'max:255'],
            'preferred_mode' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        StudentRegistration::create($data);

        return back()->with('success', 'Pendaftaran murid berhasil dikirim.');
    }

    public function storeTeacher(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'education' => ['required', 'string', 'max:255'],
            'subjects' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:500'],
            'contact' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        TeacherRegistration::create($data);

        return back()->with('success', 'Pendaftaran pengajar berhasil dikirim.');
    }
}
