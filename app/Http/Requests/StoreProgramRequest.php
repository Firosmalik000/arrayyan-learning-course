<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999999'],
            'duration' => ['nullable', 'string', 'max:100'],
            'quota' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'schedule_info' => ['nullable', 'string', 'max:1000'],
            'syllabus' => ['nullable', 'array'],
            'syllabus.*' => ['nullable', 'string', 'max:255'],
            'teacher_id' => ['nullable', 'integer', Rule::exists('teachers', 'id')],
            'subjects' => ['nullable', 'array'],
            'subjects.*' => ['string', 'max:100'],
            'mode' => ['required', 'string', 'in:online,offline'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['nullable'],
            'is_featured' => ['nullable'],
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
