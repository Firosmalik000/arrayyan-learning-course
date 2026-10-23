<?php

namespace App\Http\Requests;

use App\Models\ClassGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SyncAttendanceSessionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->routeIs('portal.classes.sessions.generate')) {
            $account = $this->user('portal');
            $classGroup = $this->route('classGroup');

            return $account?->isTeacher() === true
                && $classGroup instanceof ClassGroup
                && $classGroup->teacher_id === $account->teacher_id;
        }

        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
            'dates' => ['nullable', 'array', 'max:50'],
            'dates.*' => ['required', 'date_format:Y-m-d', 'distinct'],
            'start_date' => ['nullable', 'date'],
            'count' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $month = $this->input('month');

                if (! is_string($month) || $month === '') {
                    return;
                }

                if (! $this->exists('dates')) {
                    $validator->errors()->add('dates', 'Daftar tanggal pertemuan wajib dikirim.');

                    return;
                }

                foreach ($this->input('dates', []) as $index => $date) {
                    if (is_string($date) && ! str_starts_with($date, "{$month}-")) {
                        $validator->errors()->add(
                            "dates.{$index}",
                            'Semua tanggal pertemuan harus berada pada bulan yang dipilih.'
                        );
                    }
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'month.date_format' => 'Bulan jadwal tidak valid.',
            'dates.required' => 'Daftar tanggal pertemuan wajib dikirim.',
            'dates.max' => 'Maksimal 50 tanggal pertemuan dapat disimpan sekaligus.',
            'dates.*.date_format' => 'Format tanggal pertemuan tidak valid.',
            'dates.*.distinct' => 'Tanggal pertemuan tidak boleh duplikat.',
        ];
    }
}
