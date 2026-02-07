<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:100'],
            'subjects' => ['nullable', 'string', 'max:255'],
            'program_id' => [
                'required',
                'integer',
                Rule::exists('programs', 'id')->where('is_active', true),
            ],
            'package' => ['nullable', 'string', 'max:100'],
            'parent_contact' => ['nullable', 'string', 'max:255'],
            'preferred_mode' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelajar wajib diisi.',
            'program_id.required' => 'Program wajib dipilih.',
            'program_id.exists' => 'Program tidak ditemukan atau tidak aktif.',
        ];
    }
}
