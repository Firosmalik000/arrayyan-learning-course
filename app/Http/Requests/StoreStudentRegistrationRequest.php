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

    public function prepareForValidation(): void
    {
        if ($this->has('parent_contact')) {
            $this->merge([
                'parent_contact' => $this->normalizePhone((string) $this->input('parent_contact')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'student_name' => ['required', 'string', 'max:255'],
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
            'package' => ['required_without:package_id', 'nullable', 'string', 'max:100'],
            'parent_contact' => ['required', 'string', 'max:20', 'regex:/^(?:\+62|62|0)8[0-9]{5,13}$/'],
            'parent_email' => ['required', 'email', 'max:255'],
            'preferred_mode' => ['nullable', 'string', Rule::in(['online', 'offline', 'Online', 'Offline'])],
            'notes' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'prohibited'],
            'form_started_at' => ['nullable', 'integer', function ($attribute, $value, $fail): void {
                if (is_numeric($value) && (time() - (int) $value) < 3) {
                    $fail('Formulir dikirim terlalu cepat. Silakan isi dengan wajar.');
                }
            }],
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
            'package.required_without' => 'Pilihan harga wajib dipilih.',
            'package_id.exists' => 'Pilihan harga tidak ditemukan atau sudah tidak aktif.',
            'parent_contact.required' => 'Kontak orang tua wajib diisi.',
            'parent_contact.regex' => 'Kontak orang tua harus nomor WhatsApp Indonesia yang valid (contoh: 081234567890).',
            'parent_email.required' => 'Email orang tua wajib diisi.',
            'parent_email.email' => 'Format email orang tua tidak valid.',
            'preferred_mode.in' => 'Mode belajar harus Online atau Offline.',
            'website.prohibited' => 'Deteksi spam. Silakan coba lagi.',
        ];
    }

    private function normalizePhone(string $value): string
    {
        return (string) preg_replace('/[\s\-.\(\)]/', '', $value);
    }
}
