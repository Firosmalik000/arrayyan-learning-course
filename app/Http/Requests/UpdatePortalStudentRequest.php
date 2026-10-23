<?php

namespace App\Http\Requests;

use App\Models\PortalAccount;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePortalStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $account = $this->user('portal');
        $student = $this->route('student');

        return $account instanceof PortalAccount
            && $account->isParent()
            && $student instanceof Student
            && ($student->parent_portal_account_id === $account->id || $account->student_id === $student->id);
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'school_name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'class_level' => ['nullable', 'string', 'max:100'],
            'subjects' => ['required', 'string', 'max:255'],
            'preferred_mode' => ['nullable', 'string', Rule::in(['online', 'offline', 'Online', 'Offline'])],
            'notes' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama murid wajib diisi.',
            'address.required' => 'Alamat murid wajib diisi.',
            'school_name.required' => 'Nama sekolah wajib diisi.',
            'level.required' => 'Jenjang wajib diisi.',
            'subjects.required' => 'Mata pelajaran wajib diisi.',
            'preferred_mode.in' => 'Sistem belajar harus Online atau Offline.',
            'photo.image' => 'Foto murid harus berupa gambar.',
            'photo.mimes' => 'Format foto murid harus JPG, PNG, atau WebP.',
            'photo.max' => 'Ukuran foto murid maksimal 2 MB.',
        ];
    }
}
