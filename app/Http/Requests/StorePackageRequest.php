<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => ['required', 'integer', Rule::exists('programs', 'id')],
            'level' => ['required', 'string', 'max:100'],
            'sessions' => [
                'required',
                'integer',
                'min:1',
                'max:100',
                Rule::unique('packages', 'sessions')
                    ->where(fn ($query) => $query
                        ->where('program_id', $this->input('program_id'))
                        ->where('level', $this->input('level')))
                    ->ignore($this->route('package')),
            ],
            'intensity' => ['nullable', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'max_participants' => ['nullable', 'integer', 'min:1', 'max:100'],
            'mode' => ['required', 'string', Rule::in(['online', 'offline', 'hybrid'])],
            'schedule' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'is_active' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return [
            'program_id.required' => 'Program wajib dipilih.',
            'program_id.exists' => 'Program yang dipilih tidak ditemukan.',
            'level.required' => 'Jenjang wajib dipilih.',
            'sessions.required' => 'Jumlah pertemuan wajib diisi.',
            'sessions.min' => 'Jumlah pertemuan minimal 1.',
            'sessions.unique' => 'Pilihan harga untuk program, jenjang, dan jumlah pertemuan tersebut sudah ada.',
            'price.required' => 'Harga paket wajib diisi.',
            'price.min' => 'Harga paket tidak boleh negatif.',
            'mode.required' => 'Mode belajar wajib dipilih.',
            'mode.in' => 'Mode belajar tidak valid.',
        ];
    }
}
