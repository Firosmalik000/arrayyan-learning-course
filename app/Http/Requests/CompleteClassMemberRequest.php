<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CompleteClassMemberRequest extends FormRequest
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
            'deactivate_student' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'deactivate_student.required' => 'Pilihan status murid wajib ditentukan.',
            'deactivate_student.boolean' => 'Pilihan status murid tidak valid.',
        ];
    }
}
