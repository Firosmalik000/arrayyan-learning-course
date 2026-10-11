<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('contact')) {
            $merge['contact'] = (string) preg_replace('/[\s\-.\(\)]/', '', (string) $this->input('contact'));
        }
        if ($this->has('email')) {
            $merge['email'] = strtolower(trim((string) $this->input('email')));
        }
        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'education' => ['required', 'string', 'max:255'],
            'subjects' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:500'],
            'contact' => ['required', 'string', 'max:20', 'regex:/^(?:\+62|62|0)8[0-9]{5,13}$/'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
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
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'address.required' => 'Alamat wajib diisi.',
            'education.required' => 'Pendidikan wajib diisi.',
            'subjects.required' => 'Mata pelajaran wajib diisi.',
            'contact.required' => 'Kontak wajib diisi.',
            'contact.regex' => 'Kontak harus nomor WhatsApp Indonesia yang valid (contoh: 081234567890).',
            'cv.required' => 'CV wajib diunggah.',
            'cv.mimes' => 'Format CV harus PDF atau DOC.',
            'cv.max' => 'Ukuran CV maksimal 5MB.',
        ];
    }
}
