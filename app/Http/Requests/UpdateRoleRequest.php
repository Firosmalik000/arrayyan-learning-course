<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $label = (string) $this->input('label');

        $this->merge([
            'name' => Str::slug($label),
        ]);
    }

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $role = $this->route('role');
        $roleId = $role?->id;

        return [
            'label' => ['required', 'string', 'max:80'],
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'group' => ['nullable', 'string', 'max:60'],
            'access_type' => ['nullable', Rule::in(['full', 'content', 'limited', 'custom'])],
        ];
    }

    public function messages(): array
    {
        return [
            'label.required' => 'Nama role wajib diisi.',
            'label.max' => 'Nama role terlalu panjang.',
            'name.unique' => 'Nama role sudah digunakan.',
        ];
    }
}
