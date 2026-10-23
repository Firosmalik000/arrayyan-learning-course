<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFeedbackSubmissionRequest;
use App\Models\ActivityLog;
use App\Models\FeedbackSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $status = trim((string) $request->query('status', ''));
        $rating = $request->integer('rating');
        $perPage = min(max($request->integer('per_page', 10), 5), 100);

        $query = FeedbackSubmission::query()
            ->with(['student:id,name', 'repliedBy:id,name', 'reviewedBy:id,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('submitter_name', 'like', "%{$search}%")
                        ->orWhere('submitter_email', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%")
                        ->orWhere('admin_reply', 'like', "%{$search}%")
                        ->orWhereHas('student', fn ($studentQuery) => $studentQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when(array_key_exists($category, FeedbackSubmission::CATEGORIES), fn ($query) => $query->where('category', $category))
            ->when($status === 'unreplied', fn ($query) => $query->where(fn ($q) => $q->whereNull('admin_reply')->orWhere('admin_reply', '')))
            ->when($status === 'replied', fn ($query) => $query->whereNotNull('admin_reply')->where('admin_reply', '!=', ''))
            ->when(in_array($rating, [1, 2, 3, 4, 5], true), fn ($query) => $query->where('rating', $rating));

        $statsQuery = FeedbackSubmission::query();

        return Inertia::render('Admin/Feedback', [
            'submissions' => $query->latest()->paginate($perPage)->withQueryString(),
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'unreplied' => (clone $statsQuery)->where(fn ($q) => $q->whereNull('admin_reply')->orWhere('admin_reply', ''))->count(),
                'replied' => (clone $statsQuery)->whereNotNull('admin_reply')->where('admin_reply', '!=', '')->count(),
                'average_rating' => round((float) ((clone $statsQuery)->avg('rating') ?? 0), 1),
            ],
            'categories' => FeedbackSubmission::CATEGORIES,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => in_array($status, ['unreplied', 'replied'], true) ? $status : '',
                'rating' => in_array($rating, [1, 2, 3, 4, 5], true) ? $rating : null,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function update(UpdateFeedbackSubmissionRequest $request, FeedbackSubmission $feedbackSubmission): RedirectResponse
    {
        $validated = $request->validated();
        $adminReply = isset($validated['admin_reply']) ? trim((string) $validated['admin_reply']) : null;
        $hasReply = ! empty($adminReply);

        $feedbackSubmission->update([
            'admin_reply' => $hasReply ? $adminReply : null,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'replied_by' => $hasReply ? $request->user('admin')->id : null,
            'replied_at' => $hasReply ? now() : null,
            'status' => $hasReply ? FeedbackSubmission::STATUS_REPLIED : FeedbackSubmission::STATUS_UNREPLIED,
        ]);

        ActivityLog::record(
            'feedback.replied',
            $hasReply
                ? "Tanggapan untuk masukan {$feedbackSubmission->submitter_name} berhasil disimpan."
                : "Catatan internal masukan {$feedbackSubmission->submitter_name} diperbarui.",
            $feedbackSubmission,
            ['has_reply' => $hasReply],
        );

        return back()->with('success', $hasReply ? 'Tanggapan untuk kritik & saran berhasil disimpan.' : 'Catatan berhasil diperbarui.');
    }
}
