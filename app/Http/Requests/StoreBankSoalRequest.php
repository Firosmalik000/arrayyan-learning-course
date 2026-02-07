<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankSoalRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'format' => ['required', 'string', 'max:100'],
            'questions' => ['nullable', 'integer', 'min:0'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'links' => ['nullable', 'array'],
            'links.*.id' => ['nullable', 'integer', 'min:1'],
            'links.*.label' => ['nullable', 'string', 'max:255'],
            'links.*.link' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama modul wajib diisi.',
            'category.required' => 'Kategori wajib diisi.',
            'level.required' => 'Jenjang wajib dipilih.',
            'format.required' => 'Format wajib diisi.',
            'links.*.id.integer' => 'ID link harus berupa angka.',
            'links.*.label.string' => 'Label link harus berupa teks.',
            'links.*.link.string' => 'Link harus berupa teks.',
        ];
    }
}
