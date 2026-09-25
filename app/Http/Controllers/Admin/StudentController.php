<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\ClassMember;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->select(['id', 'name'])->findOrFail($data['program_id']);

        $student->update([
            ...$data,
            'program' => $program->name,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Data pelajar berhasil diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->update([
            'is_active' => false,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Pelajar dinonaktifkan.');
    }

    public function card(Student $student): Response
    {
        $student->load('programItem:id,name');

        $activeClass = ClassMember::query()
            ->with('classGroup:id,name,teacher_id')
            ->where('student_id', $student->id)
            ->where('status', ClassMember::STATUS_ACTIVE)
            ->latest()
            ->first();

        return Inertia::render('Admin/Students/Card', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'school_name' => $student->school_name,
                'level' => $student->level,
                'program' => $student->programItem?->name ?? $student->program,
                'parent_contact' => $student->parent_contact,
                'is_active' => $student->is_active,
            ],
            'class_name' => $activeClass?->classGroup?->name,
        ]);
    }
}
