<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'parent_contact' => (string) preg_replace('/[\s\-.\(\)]/', '', (string) $this->input('parent_contact')),
            'parent_email' => strtolower(trim((string) $this->input('parent_email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'school_name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'class_level' => ['nullable', 'string', 'max:100'],
            'subjects' => ['required', 'string', 'max:255'],
            'program_id' => [
                'required',
                'integer',
                Rule::exists('programs', 'id')->where('is_active', true),
            ],
            'package_id' => [
                'nullable',
                'integer',
                Rule::exists('packages', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->where('program_id', $this->input('program_id'))),
            ],
            'parent_contact' => ['required', 'string', 'max:20', 'regex:/^(?:\+62|62|0)8[0-9]{5,13}$/'],
            'parent_email' => ['required', 'email', 'max:255'],
            'preferred_mode' => ['nullable', 'string', Rule::in(['online', 'offline', 'Online', 'Offline'])],
            'notes' => ['nullable', 'string', 'max:500'],
            'temporary_password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelajar wajib diisi.',
            'address.required' => 'Alamat wajib diisi.',
            'school_name.required' => 'Nama sekolah wajib diisi.',
            'level.required' => 'Jenjang wajib diisi.',
            'subjects.required' => 'Mata pelajaran wajib diisi.',
            'program_id.required' => 'Program wajib dipilih.',
            'program_id.exists' => 'Program tidak ditemukan atau tidak aktif.',
            'package_id.exists' => 'Pilihan paket tidak sesuai dengan program.',
            'parent_contact.required' => 'Kontak orang tua wajib diisi.',
            'parent_contact.regex' => 'Kontak orang tua harus nomor WhatsApp Indonesia yang valid.',
            'parent_email.required' => 'Email orang tua wajib diisi.',
            'parent_email.email' => 'Format email orang tua tidak valid.',
            'temporary_password.required' => 'Password sementara wajib diisi.',
            'temporary_password.min' => 'Password sementara minimal 8 karakter.',
            'temporary_password.confirmed' => 'Konfirmasi password sementara tidak cocok.',
        ];
    }
}
