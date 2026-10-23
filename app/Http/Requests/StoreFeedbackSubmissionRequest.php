<?php

namespace App\Http\Requests;

use App\Models\FeedbackSubmission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeedbackSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('portal')?->isParent() === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'student_id' => [
                'nullable',
                'integer',
                Rule::exists('students', 'id')->where(fn ($query) => $query
                    ->where('parent_portal_account_id', $this->user('portal')->id)
                    ->where('is_active', true)),
            ],
            'category' => ['required', 'string', Rule::in(array_keys(FeedbackSubmission::CATEGORIES))],
            'rating' => ['required', 'integer', 'between:1,5'],
            'subject' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.exists' => 'Anak yang dipilih tidak terhubung dengan akun Anda.',
            'category.required' => 'Pilih kategori masukan.',
            'category.in' => 'Kategori masukan tidak valid.',
            'rating.required' => 'Pilih penilaian dari 1 sampai 5.',
            'rating.between' => 'Penilaian harus antara 1 sampai 5.',
            'subject.required' => 'Judul singkat wajib diisi.',
            'subject.max' => 'Judul maksimal 120 karakter.',
            'message.required' => 'Kritik atau saran wajib diisi.',
            'message.min' => 'Ceritakan masukan Anda minimal 10 karakter.',
            'message.max' => 'Kritik atau saran maksimal 3.000 karakter.',
        ];
    }
}
