<?php

namespace App\Http\Requests;

use App\Models\ClassGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->routeIs('portal.classes.attendance.store')) {
            $account = $this->user('portal');
            $classGroup = $this->route('classGroup');

            return $account?->isTeacher() === true
                && $classGroup instanceof ClassGroup
                && $classGroup->teacher_id === $account->teacher_id;
        }

        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'subject' => ['required', 'string', 'max:100'],
            'material' => ['required', 'string', 'max:2000'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'rows.*.status' => ['required', 'string', 'in:hadir,izin,sakit,alpa'],
            'rows.*.understanding_score' => ['nullable', 'integer', 'between:1,5'],
            'rows.*.evaluation' => ['nullable', 'string', 'max:2000'],
            'rows.*.note' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ($this->input('rows', []) as $index => $row) {
                    if (($row['status'] ?? null) !== 'hadir') {
                        continue;
                    }

                    if (empty($row['understanding_score'])) {
                        $validator->errors()->add(
                            "rows.{$index}.understanding_score",
                            'Skala pemahaman wajib dipilih untuk murid yang hadir.'
                        );
                    }

                    if (blank($row['evaluation'] ?? null)) {
                        $validator->errors()->add(
                            "rows.{$index}.evaluation",
                            'Evaluasi wajib diisi untuk murid yang hadir.'
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
            'subject.required' => 'Mata pelajaran wajib diisi.',
            'material.required' => 'Materi yang diajarkan wajib diisi.',
            'rows.*.understanding_score.between' => 'Skala pemahaman harus berada pada rentang 1 sampai 5.',
            'rows.*.evaluation.max' => 'Evaluasi maksimal 2.000 karakter.',
        ];
    }
}
