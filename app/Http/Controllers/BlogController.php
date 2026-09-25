<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\Post;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $type = in_array($request->query('type'), ['blog', 'pengumuman'], true)
            ? $request->query('type')
            : '';

        $posts = Post::query()
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->latest('published_at')
            ->latest()
            ->paginate(9)
            ->withQueryString();

        $posts->through(fn (Post $post) => $this->formatCard($post));

        return Inertia::render('Public/Blog/Index', [
            'posts' => $posts,
            'type' => $type,
            'testimonials' => Testimonial::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->limit(6)
                ->get(),
        ]);
    }

    public function show(string $slug): Response
    {
        $post = Post::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        $related = [];
        if ($post) {
            $related = Post::query()
                ->where('is_active', true)
                ->where('id', '<>', $post->id)
                ->where('type', $post->type)
                ->latest('published_at')
                ->limit(3)
                ->get()
                ->map(fn (Post $item) => $this->formatCard($item))
                ->values()
                ->all();
        }

        return Inertia::render('Public/Blog/Detail', [
            'post' => $post ? $this->formatDetail($post) : null,
            'related' => $related,
        ]);
    }

    public function faq(): Response
    {
        $faqs = Faq::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->get()
            ->map(fn (Faq $faq) => [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
            ])
            ->values()
            ->all();

        $categories = collect($faqs)
            ->pluck('category')
            ->filter()
            ->unique()
            ->values()
            ->all();

        return Inertia::render('Public/Faq', [
            'faqs' => $faqs,
            'categories' => $categories,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCard(Post $post): array
    {
        return [
            'id' => $post->id,
            'type' => $post->type,
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'published_at' => $post->published_at,
            'reading_minutes' => $post->readingMinutes(),
            'image_url' => $post->image_path ? Storage::url($post->image_path) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatDetail(Post $post): array
    {
        return [
            ...$this->formatCard($post),
            'content' => $post->content,
            'meta_title' => $post->meta_title ?: $post->title,
            'meta_description' => $post->meta_description ?: $post->excerpt,
        ];
    }
}
