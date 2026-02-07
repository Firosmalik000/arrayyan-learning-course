<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOlympiadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'schedule' => ['nullable', 'date'],
            'selection_system' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:free,paid'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama olimpiade wajib diisi.',
            'level.required' => 'Jenjang wajib dipilih.',
            'category.required' => 'Kategori wajib dipilih.',
            'category.in' => 'Kategori harus gratis atau berbayar.',
            'image.mimes' => 'Format gambar harus JPG, PNG, atau WEBP.',
            'image.max' => 'Ukuran gambar maksimal 4MB.',
        ];
    }
}
