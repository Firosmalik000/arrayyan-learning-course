<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'school_name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'subjects' => ['required', 'string', 'max:255'],
            'program_id' => [
                'required',
                'integer',
                Rule::exists('programs', 'id')->where('is_active', true),
            ],
            'package' => ['required', 'string', 'max:100'],
            'parent_contact' => ['required', 'string', 'max:255'],
            'preferred_mode' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_name.required' => 'Nama siswa wajib diisi.',
            'address.required' => 'Alamat wajib diisi.',
            'school_name.required' => 'Nama sekolah wajib diisi.',
            'level.required' => 'Jenjang wajib diisi.',
            'subjects.required' => 'Mata pelajaran wajib diisi.',
            'program_id.required' => 'Program wajib dipilih.',
            'program_id.exists' => 'Program tidak ditemukan atau tidak aktif.',
            'package.required' => 'Paket wajib dipilih.',
            'parent_contact.required' => 'Kontak orang tua wajib diisi.',
        ];
    }
}
