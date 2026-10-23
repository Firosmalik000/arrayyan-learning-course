<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackSubmissionRequest;
use App\Models\FeedbackSubmission;
use App\Models\PortalAccount;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $this->account();

        abort_unless($account->isParent(), 403, 'Halaman kritik dan saran hanya untuk orang tua.');

        $students = $account->students()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $selectedStudentId = (int) session('portal.selected_student_id');
        if (! $students->contains('id', $selectedStudentId)) {
            $selectedStudentId = $students->first()?->id;
        }

        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $status = trim((string) $request->query('status', ''));
        $studentId = $request->query('student_id');
        $perPage = min(max($request->integer('per_page', 10), 5), 50);

        $query = $account->feedbackSubmissions()
            ->with('student:id,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('subject', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%")
                        ->orWhere('admin_reply', 'like', "%{$search}%");
                });
            })
            ->when(array_key_exists($category, FeedbackSubmission::CATEGORIES), fn ($q) => $q->where('category', $category))
            ->when($status === 'unreplied', fn ($q) => $q->where(fn ($sub) => $sub->whereNull('admin_reply')->orWhere('admin_reply', '')))
            ->when($status === 'replied', fn ($q) => $q->whereNotNull('admin_reply')->where('admin_reply', '!=', ''))
            ->when($studentId !== null && $studentId !== '', function ($q) use ($studentId): void {
                if ($studentId === 'general') {
                    $q->whereNull('student_id');
                } else {
                    $q->where('student_id', (int) $studentId);
                }
            });

        $statsQuery = $account->feedbackSubmissions();

        $myReview = Testimonial::query()
            ->with('student:id,name,photo_path')
            ->where('portal_account_id', $account->id)
            ->first();

        $publicReviews = Testimonial::query()
            ->with('student:id,name,photo_path')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Testimonial $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'role' => $t->role ?: 'Orang Tua Siswa',
                'student' => $t->student_name ?: 'Keluarga ALC',
                'rating' => $t->rating,
                'message' => $t->message,
                'highlight' => $t->highlight ?: 'Ulasan Terverifikasi',
                'avatar' => $t->avatar_url,
                'created_at' => $t->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Portal/Feedback', [
            'submissions' => $query->latest()->paginate($perPage)->withQueryString(),
            'students' => $students,
            'selectedStudentId' => $selectedStudentId,
            'categories' => FeedbackSubmission::CATEGORIES,
            'account_type' => 'parent',
            'myReview' => $myReview ? [
                'id' => $myReview->id,
                'name' => $myReview->name,
                'role' => $myReview->role,
                'student_id' => $myReview->student_id,
                'student_name' => $myReview->student_name,
                'rating' => $myReview->rating,
                'highlight' => $myReview->highlight,
                'message' => $myReview->message,
                'is_active' => $myReview->is_active,
                'avatar_url' => $myReview->avatar_url,
                'updated_at' => $myReview->updated_at?->toIso8601String(),
            ] : null,
            'publicReviews' => $publicReviews,
            'defaultTab' => $request->query('tab', 'feedback'),
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'unreplied' => (clone $statsQuery)->where(fn ($q) => $q->whereNull('admin_reply')->orWhere('admin_reply', ''))->count(),
                'replied' => (clone $statsQuery)->whereNotNull('admin_reply')->where('admin_reply', '!=', '')->count(),
            ],
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => in_array($status, ['unreplied', 'replied'], true) ? $status : '',
                'student_id' => $studentId !== null ? (string) $studentId : '',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreFeedbackSubmissionRequest $request): RedirectResponse
    {
        $account = $this->account();
        $validated = $request->validated();

        $account->feedbackSubmissions()->create([
            ...$validated,
            'submitter_name' => $account->name,
            'submitter_email' => $account->email,
            'submitter_contact' => $account->contact,
            'status' => FeedbackSubmission::STATUS_NEW,
        ]);

        return back()->with('success', 'Terima kasih. Kritik dan saran Anda sudah diterima untuk ditinjau admin.');
    }

    public function storeReview(Request $request): RedirectResponse
    {
        $account = $this->account();
        abort_unless($account->isParent(), 403);

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'message' => ['required', 'string', 'min:10', 'max:1000'],
            'highlight' => ['nullable', 'string', 'max:80'],
            'student_id' => [
                'nullable',
                'integer',
                Rule::exists('students', 'id')->where(fn ($query) => $query
                    ->where('parent_portal_account_id', $account->id)
                    ->where('is_active', true)),
            ],
            'student_name' => ['nullable', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:80'],
        ], [
            'rating.required' => 'Pilih penilaian rating bintang.',
            'rating.between' => 'Rating harus antara 1 sampai 5.',
            'message.required' => 'Ulasan wajib diisi.',
            'message.min' => 'Ulasan minimal 10 karakter.',
            'message.max' => 'Ulasan maksimal 1.000 karakter.',
            'student_id.exists' => 'Data anak tidak valid.',
        ]);

        $student = ! empty($validated['student_id'])
            ? $account->students()->find($validated['student_id'])
            : null;

        $studentLabel = $student
            ? "Orang Tua dari {$student->name}"
            : (! empty($validated['student_name']) ? "Orang Tua dari {$validated['student_name']}" : ($validated['role'] ?? 'Orang Tua Siswa'));

        Testimonial::updateOrCreate(
            ['portal_account_id' => $account->id],
            [
                'name' => $account->name,
                'role' => $validated['role'] ?? 'Orang Tua Siswa',
                'student_id' => $student?->id,
                'student_name' => $studentLabel,
                'rating' => (int) $validated['rating'],
                'highlight' => ! empty($validated['highlight']) ? $validated['highlight'] : 'Ulasan Terverifikasi',
                'message' => $validated['message'],
                'is_active' => true,
            ]
        );

        return back()->with('success', 'Terima kasih! Ulasan & testimoni Anda berhasil disimpan dan akan tampil di halaman depan website.');
    }

    public function destroyReview(): RedirectResponse
    {
        $account = $this->account();
        abort_unless($account->isParent(), 403);

        Testimonial::where('portal_account_id', $account->id)->delete();

        return back()->with('success', 'Ulasan berhasil dihapus.');
    }

    private function account(): PortalAccount
    {
        return Auth::guard('portal')->user();
    }
}
