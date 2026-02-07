<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'education' => ['required', 'string', 'max:255'],
            'subjects' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:500'],
            'contact' => ['required', 'string', 'max:255'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'address.required' => 'Alamat wajib diisi.',
            'education.required' => 'Pendidikan wajib diisi.',
            'subjects.required' => 'Mata pelajaran wajib diisi.',
            'contact.required' => 'Kontak wajib diisi.',
            'cv.required' => 'CV wajib diunggah.',
            'cv.mimes' => 'Format CV harus PDF atau DOC.',
            'cv.max' => 'Ukuran CV maksimal 5MB.',
        ];
    }
}
