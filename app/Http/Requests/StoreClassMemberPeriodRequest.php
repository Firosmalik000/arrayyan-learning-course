<?php

namespace App\Http\Requests;

use App\Models\ClassMember;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

class StoreClassMemberPeriodRequest extends FormRequest
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
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'session_limit' => ['required', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $startDate = Carbon::createFromFormat('!Y-m-d', (string) $this->input('start_date'));
                $endDate = Carbon::createFromFormat('!Y-m-d', (string) $this->input('end_date'));

                if ($startDate->diffInDays($endDate) > 366) {
                    $validator->errors()->add('end_date', 'Rentang periode maksimal satu tahun.');

                    return;
                }

                $member = $this->route('member');
                if (! $member instanceof ClassMember) {
                    return;
                }

                $overlaps = $member->periods()
                    ->whereDate('start_date', '<=', $endDate->toDateString())
                    ->whereDate('end_date', '>=', $startDate->toDateString())
                    ->exists();

                if ($overlaps) {
                    $validator->errors()->add('start_date', 'Periode ini bertumpang tindih dengan periode yang sudah ada.');
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'session_limit.max' => 'Batas pertemuan maksimal 100 kali per periode.',
        ];
    }
}
