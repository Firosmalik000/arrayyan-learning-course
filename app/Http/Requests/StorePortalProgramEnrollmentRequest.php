<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePortalProgramEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('portal') !== null;
    }

    public function prepareForValidation(): void
    {
        if ($this->filled('program_id') && ! $this->filled('package_id') && ! $this->filled('package')) {
            $program = Program::find($this->input('program_id'));
            if ($program && $program->packages()->where('is_active', true)->doesntExist()) {
                $this->merge(['package' => 'Standar']);
            }
        }
    }

    public function rules(): array
    {
        return [
            'program_id' => [
                'required',
                'integer',
                Rule::exists('programs', 'id')->where('is_active', true),
            ],
            'package_id' => [
                'nullable',
                'integer',
                Rule::exists('packages', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->where('program_id', $this->input('program_id'))),
            ],
            'package' => ['required_without:package_id', 'nullable', 'string', 'max:100'],
            'subjects' => ['required', 'string', 'max:255'],
            'preferred_mode' => ['nullable', 'string', Rule::in(['online', 'offline', 'Online', 'Offline'])],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'program_id.required' => 'Program wajib dipilih.',
            'program_id.exists' => 'Program tidak ditemukan atau tidak aktif.',
            'package.required_without' => 'Pilihan paket harga wajib dipilih.',
            'package_id.exists' => 'Pilihan harga tidak sesuai dengan program yang dipilih.',
            'subjects.required' => 'Mata pelajaran wajib diisi.',
            'preferred_mode.in' => 'Mode belajar harus Online atau Offline.',
        ];
    }
}
