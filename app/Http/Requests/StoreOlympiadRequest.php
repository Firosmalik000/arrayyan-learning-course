<?php

namespace App\Http\Requests;

use App\Support\EducationCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'level' => ['nullable', 'string', 'max:100'],
            'education_levels' => ['required', 'array', 'min:1'],
            'education_levels.*' => ['required', 'string', 'distinct', Rule::in(EducationCatalog::levels())],
            'grades' => ['nullable', 'array'],
            'grades.*' => ['required', 'string', 'distinct', Rule::in(EducationCatalog::gradesFor((array) $this->input('education_levels', [])))],
            'schedule' => ['nullable', 'date'],
            'selection_system' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:free,paid'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'registration_deadline' => ['nullable', 'date'],
            'winners' => ['nullable', 'array'],
            'winners.*' => ['nullable', 'string', 'max:255'],
            'is_registration_open' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama olimpiade wajib diisi.',
            'education_levels.required' => 'Pilih minimal satu jenjang.',
            'education_levels.min' => 'Pilih minimal satu jenjang.',
            'education_levels.*.in' => 'Jenjang yang dipilih tidak valid.',
            'grades.*.in' => 'Kelas harus sesuai dengan jenjang yang dipilih.',
            'category.required' => 'Kategori wajib dipilih.',
            'category.in' => 'Kategori harus gratis atau berbayar.',
            'image.mimes' => 'Format gambar harus JPG, PNG, atau WEBP.',
            'image.max' => 'Ukuran gambar maksimal 4MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('education_levels')) {
            $this->merge([
                'education_levels' => EducationCatalog::extractLevels($this->input('level')),
                'grades' => $this->input('grades', []),
            ]);
        }
    }
}
