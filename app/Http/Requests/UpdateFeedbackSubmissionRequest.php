<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedbackSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'admin_reply' => ['nullable', 'string', 'max:3000'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_reply.max' => 'Balasan admin maksimal 3.000 karakter.',
            'admin_notes.max' => 'Catatan internal maksimal 2.000 karakter.',
        ];
    }
}
