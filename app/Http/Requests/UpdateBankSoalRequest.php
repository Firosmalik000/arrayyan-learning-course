<?php

namespace App\Http\Requests;

use App\Models\EducationClass;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateBankSoalRequest extends FormRequest
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
            'education_level_id' => ['required', 'integer', 'exists:education_levels,id'],
            'education_class_id' => ['required', 'integer', 'exists:education_classes,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'format' => ['required', 'string', 'max:100'],
            'questions' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'resources' => ['required', 'array', 'min:1'],
            'resources.*.id' => ['nullable', 'integer', 'exists:bank_soal_resources,id'],
            'resources.*.label' => ['nullable', 'string', 'max:255'],
            'resources.*.destination_url' => ['nullable', 'url', 'max:500'],
            'resources.*.file' => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,jpg,jpeg,png,webp', 'max:20480'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama modul wajib diisi.',
            'education_level_id.required' => 'Pilih jenjang.',
            'education_class_id.required' => 'Pilih satu kelas.',
            'subject_id.required' => 'Pilih mata pelajaran.',
            'format.required' => 'Format wajib diisi.',
            'image.mimes' => 'Format gambar harus JPG, PNG, atau WEBP.',
            'image.max' => 'Ukuran gambar maksimal 4MB.',
            'resources.required' => 'Tambahkan minimal satu file atau link soal.',
            'resources.*.destination_url.url' => 'Link destinasi harus berupa URL yang valid.',
            'resources.*.file.mimes' => 'File modul harus berupa PDF, Word, Excel, PowerPoint, ZIP, JPG, PNG, atau WEBP.',
            'resources.*.file.max' => 'Ukuran file modul maksimal 20MB.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $class = EducationClass::query()->find($this->integer('education_class_id'));
            if ($class && $class->education_level_id !== $this->integer('education_level_id')) {
                $validator->errors()->add('education_class_id', 'Kelas harus berasal dari jenjang yang dipilih.');
            }
            if ($class && ! $class->educationLevel->subjects()->whereKey($this->integer('subject_id'))->exists()) {
                $validator->errors()->add('subject_id', 'Mata pelajaran belum tersedia untuk jenjang yang dipilih.');
            }
            foreach ((array) $this->input('resources', []) as $index => $resource) {
                if (! $this->hasFile("resources.{$index}.file") && blank($resource['destination_url'] ?? null) && blank($resource['id'] ?? null)) {
                    $validator->errors()->add("resources.{$index}.file", 'Isi file atau link destinasi.');
                }
            }
        });
    }
}
