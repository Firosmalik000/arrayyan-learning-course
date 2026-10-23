<?php

namespace App\Http\Requests;

use App\Models\PortalAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePortalProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('portal') instanceof PortalAccount;
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
            'contact' => (string) preg_replace('/[\s\-.\(\)]/', '', (string) $this->input('contact')),
        ]);
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        $account = $this->user('portal');
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('portal_accounts', 'email')->ignore($account?->id),
            ],
            'contact' => [
                'required',
                'string',
                'max:20',
                'regex:/^(?:\+62|62|0)8[0-9]{5,13}$/',
                Rule::unique('portal_accounts', 'contact')->ignore($account?->id),
            ],
        ];

        if (! $account?->isTeacher()) {
            return $rules;
        }

        return [
            ...$rules,
            'address' => ['required', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'teacher_role' => ['nullable', 'string', 'max:100'],
            'education' => ['required', 'string', 'max:255'],
            'subjects' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan akun portal lain.',
            'contact.required' => 'Nomor WhatsApp wajib diisi.',
            'contact.regex' => 'Nomor WhatsApp Indonesia tidak valid.',
            'contact.unique' => 'Nomor WhatsApp sudah digunakan akun portal lain.',
            'address.required' => 'Alamat domisili wajib diisi.',
            'education.required' => 'Pendidikan terakhir wajib diisi.',
            'subjects.required' => 'Keahlian atau mata pelajaran wajib diisi.',
            'photo.image' => 'Foto pengajar harus berupa gambar.',
            'photo.mimes' => 'Format foto pengajar harus JPG, PNG, atau WebP.',
            'photo.max' => 'Ukuran foto pengajar maksimal 2 MB.',
        ];
    }
}
