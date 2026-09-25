<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Faq;
use App\Models\PageContent;
use App\Models\PageContentRevision;
use App\Models\Post;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = in_array($request->query('tab'), ['posts', 'testimonials', 'faqs', 'revisions'], true)
            ? $request->query('tab')
            : 'posts';

        return Inertia::render('Admin/Content', [
            'tab' => $tab,
            'posts' => Post::query()
                ->latest()
                ->get()
                ->map(fn (Post $post) => [
                    'id' => $post->id,
                    'type' => $post->type,
                    'slug' => $post->slug,
                    'title' => $post->title,
                    'excerpt' => $post->excerpt,
                    'published_at' => $post->published_at,
                    'is_active' => $post->is_active,
                    'image_url' => $post->image_path ? Storage::url($post->image_path) : null,
                ]),
            'testimonials' => Testimonial::query()
                ->orderBy('sort_order')
                ->latest()
                ->get(),
            'faqs' => Faq::query()
                ->orderBy('sort_order')
                ->latest()
                ->get(),
            'revisions' => PageContentRevision::query()
                ->with('creator:id,name')
                ->latest()
                ->limit(50)
                ->get()
                ->map(fn (PageContentRevision $revision) => [
                    'id' => $revision->id,
                    'slug' => $revision->slug,
                    'note' => $revision->note,
                    'created_by_name' => $revision->creator?->name,
                    'created_at' => $revision->created_at,
                ]),
        ]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:blog,pengumuman'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('posts', 'public');
        }
        unset($data['image']);

        $post = Post::create([
            ...$data,
            'slug' => Post::uniqueSlug($data['title']),
            'is_active' => (bool) ($data['is_active'] ?? true),
            'created_by' => Auth::id(),
        ]);

        ActivityLog::record('konten.post.buat', "Artikel \"{$post->title}\" dibuat.", $post);

        return back()->with('success', 'Konten berhasil ditambahkan.');
    }

    public function updatePost(Request $request, Post $post): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:blog,pengumuman'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('posts', 'public');
        }
        unset($data['image']);

        $post->update([
            ...$data,
            'slug' => Post::uniqueSlug($data['title'], $post->id),
            'is_active' => (bool) ($data['is_active'] ?? $post->is_active),
            'updated_by' => Auth::id(),
        ]);

        ActivityLog::record('konten.post.ubah', "Artikel \"{$post->title}\" diperbarui.", $post);

        return back()->with('success', 'Konten berhasil diperbarui.');
    }

    public function destroyPost(Post $post): RedirectResponse
    {
        ActivityLog::record('konten.post.hapus', "Artikel \"{$post->title}\" dihapus.", $post);
        $post->delete();

        return back()->with('success', 'Konten dihapus.');
    }

    public function storeTestimonial(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Testimonial::create([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return back()->with('success', 'Testimoni ditambahkan.');
    }

    public function updateTestimonial(Request $request, Testimonial $testimonial): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $testimonial->update([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? $testimonial->is_active),
        ]);

        return back()->with('success', 'Testimoni diperbarui.');
    }

    public function destroyTestimonial(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->delete();

        return back()->with('success', 'Testimoni dihapus.');
    }

    public function storeFaq(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:2000'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Faq::create([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return back()->with('success', 'FAQ ditambahkan.');
    }

    public function updateFaq(Request $request, Faq $faq): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:2000'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faq->update([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? $faq->is_active),
        ]);

        return back()->with('success', 'FAQ diperbarui.');
    }

    public function destroyFaq(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return back()->with('success', 'FAQ dihapus.');
    }

    public function restoreRevision(PageContentRevision $revision): RedirectResponse
    {
        PageContent::updateOrCreate(
            ['slug' => $revision->slug],
            ['content' => $revision->content ?? []],
        );

        ActivityLog::record(
            'konten.revisi.restore',
            "Revisi landing \"{$revision->slug}\" dikembalikan (revisi #{$revision->id}).",
        );

        return back()->with('success', "Bagian \"{$revision->slug}\" dikembalikan ke revisi terpilih.");
    }
}
