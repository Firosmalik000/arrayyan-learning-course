<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UnlockBankSoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'passkey' => ['required', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'passkey.required' => 'Passkey wajib diisi.',
            'passkey.string' => 'Passkey harus berupa teks.',
            'passkey.max' => 'Passkey maksimal 100 karakter.',
        ];
    }
}
