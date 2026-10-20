<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveClassGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'program_id' => ['required', 'integer', Rule::exists('programs', 'id')],
            'level' => ['nullable', 'string', 'max:50'],
            'package_id' => ['nullable', 'integer', Rule::exists('packages', 'id')],
            'total_sessions' => ['nullable', 'integer', 'min:1', 'max:100'],
            'teacher_id' => [
                Rule::requiredIf(fn (): bool => $this->boolean('is_active', true)),
                'nullable',
                'integer',
                Rule::exists('teachers', 'id')->where('is_active', true),
            ],
            'name' => ['required', 'string', 'max:100'],
            'quota' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'teacher_id.required' => 'Pengajar wajib dipilih untuk kelas aktif.',
            'teacher_id.exists' => 'Pengajar yang dipilih tidak tersedia atau sudah tidak aktif.',
        ];
    }
}
