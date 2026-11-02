<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ExportAttendancePdfRequest extends FormRequest
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
            'month' => ['required', 'date_format:Y-m'],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'month.required' => 'Pilih bulan absensi yang akan diunduh.',
            'month.date_format' => 'Bulan harus menggunakan format YYYY-MM.',
            'search.string' => 'Pencarian murid harus berupa teks.',
            'search.max' => 'Pencarian murid maksimal 255 karakter.',
        ];
    }
}
