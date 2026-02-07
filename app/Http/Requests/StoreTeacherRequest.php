<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
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
        ];
    }
}
