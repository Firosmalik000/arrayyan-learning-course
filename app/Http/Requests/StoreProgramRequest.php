<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
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
            'level' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'subjects' => ['nullable', 'array'],
            'subjects.*' => ['string', 'max:100'],
            'mode' => ['required', 'string', 'in:online,offline'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama program wajib diisi.',
            'level.required' => 'Jenjang wajib dipilih.',
            'mode.required' => 'Mode program wajib dipilih.',
            'mode.in' => 'Mode harus online atau offline.',
            'image.mimes' => 'Format gambar harus JPG, PNG, atau WEBP.',
            'image.max' => 'Ukuran gambar maksimal 4MB.',
        ];
    }
}
