<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'contact' => (string) preg_replace('/[\s\-.\(\)]/', '', (string) $this->input('contact')),
            'email' => strtolower(trim((string) $this->input('email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('teachers', 'email')],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'teacher_role' => ['nullable', 'string', 'max:100'],
            'education' => ['nullable', 'string', 'max:255'],
            'subjects' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:500'],
            'contact' => ['required', 'string', 'max:20', 'regex:/^(?:\+62|62|0)8[0-9]{5,13}$/', Rule::unique('teachers', 'contact')],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'temporary_password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pengajar wajib diisi.',
            'email.required' => 'Email pengajar wajib diisi.',
            'email.email' => 'Format email pengajar tidak valid.',
            'email.unique' => 'Email tersebut sudah digunakan oleh pengajar lain.',
            'contact.required' => 'Kontak pengajar wajib diisi.',
            'contact.regex' => 'Kontak pengajar harus nomor WhatsApp Indonesia yang valid.',
            'contact.unique' => 'Kontak tersebut sudah digunakan oleh pengajar lain.',
            'temporary_password.required' => 'Password sementara wajib diisi.',
            'temporary_password.min' => 'Password sementara minimal 8 karakter.',
            'temporary_password.confirmed' => 'Konfirmasi password sementara tidak cocok.',
        ];
    }
}
