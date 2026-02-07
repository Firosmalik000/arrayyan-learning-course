<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

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
}
