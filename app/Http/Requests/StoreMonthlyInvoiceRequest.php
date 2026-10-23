<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMonthlyInvoiceRequest extends FormRequest
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
            'billing_month' => ['required', 'date_format:Y-m'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'due_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'billing_month.required' => 'Bulan tagihan wajib dipilih.',
            'billing_month.date_format' => 'Format bulan tagihan tidak valid.',
            'amount.numeric' => 'Nominal tagihan harus berupa angka.',
            'amount.min' => 'Nominal tagihan tidak boleh negatif.',
            'due_date.required' => 'Tanggal jatuh tempo wajib diisi.',
            'due_date.date' => 'Tanggal jatuh tempo tidak valid.',
        ];
    }
}
