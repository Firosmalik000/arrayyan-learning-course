<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('contact')) {
            $data['contact'] = (string) preg_replace('/[\s\-.\(\)]/', '', (string) $this->input('contact'));
        }

        if ($this->has('email')) {
            $data['email'] = strtolower(trim((string) $this->input('email')));
        }

        if ($data !== []) {
            $this->merge($data);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'teacher_role' => ['nullable', 'string', 'max:100'],
            'education' => ['nullable', 'string', 'max:255'],
            'subjects' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:500'],
            'contact' => ['nullable', 'string', 'max:255'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pengajar wajib diisi.',
            'email.required' => 'Email pengajar wajib diisi.',
            'email.email' => 'Format email pengajar tidak valid.',
            'contact.required' => 'Kontak pengajar wajib diisi.',
            'contact.regex' => 'Kontak pengajar harus nomor WhatsApp Indonesia yang valid.',
        ];
    }
}
