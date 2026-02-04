<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\Teacher;
use App\Models\TeacherRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class RegistrationController extends Controller
{
    public function approveStudent(StudentRegistration $studentRegistration): RedirectResponse
    {
        $studentRegistration->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        Student::create([
            'name' => $studentRegistration->student_name,
            'address' => $studentRegistration->address,
            'school_name' => $studentRegistration->school_name,
            'level' => $studentRegistration->level,
            'subjects' => $studentRegistration->subjects,
            'program' => $studentRegistration->program,
            'package' => $studentRegistration->package,
            'parent_contact' => $studentRegistration->parent_contact,
            'preferred_mode' => $studentRegistration->preferred_mode,
            'notes' => $studentRegistration->notes,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pendaftaran murid disetujui.');
    }

    public function rejectStudent(StudentRegistration $studentRegistration): RedirectResponse
    {
        $studentRegistration->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pendaftaran murid ditolak.');
    }

    public function destroyStudent(StudentRegistration $studentRegistration): RedirectResponse
    {
        $studentRegistration->delete();

        return back()->with('success', 'Pendaftaran murid dihapus.');
    }

    public function approveTeacher(TeacherRegistration $teacherRegistration): RedirectResponse
    {
        $teacherRegistration->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        Teacher::create([
            'name' => $teacherRegistration->name,
            'address' => $teacherRegistration->address,
            'education' => $teacherRegistration->education,
            'subjects' => $teacherRegistration->subjects,
            'experience' => $teacherRegistration->experience,
            'contact' => $teacherRegistration->contact,
            'cv_path' => $teacherRegistration->cv_path,
            'notes' => $teacherRegistration->notes,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pendaftaran pengajar disetujui.');
    }

    public function rejectTeacher(TeacherRegistration $teacherRegistration): RedirectResponse
    {
        $teacherRegistration->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pendaftaran pengajar ditolak.');
    }

    public function destroyTeacher(TeacherRegistration $teacherRegistration): RedirectResponse
    {
        $teacherRegistration->delete();

        return back()->with('success', 'Pendaftaran pengajar dihapus.');
    }
}
