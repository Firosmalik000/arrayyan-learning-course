<?php

namespace App\Http\Controllers;

use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LandingContentController extends Controller
{
    public function show(): Response
    {
        $content = PageContent::where('slug', 'landing')->first();

        return Inertia::render('Public/Home', [
            'landingContent' => $this->withMediaUrls($content?->content),
        ]);
    }

    public function edit(): Response
    {
        $content = PageContent::where('slug', 'landing')->first();

        return Inertia::render('Admin/Landing', [
            'landingContent' => $this->withMediaUrls($content?->content),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'content' => ['required', 'array'],
            'hero_image' => ['nullable', 'image', 'max:3072'],
            'about_image' => ['nullable', 'image', 'max:3072'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['image', 'max:3072'],
            'gallery_item_files' => ['nullable', 'array'],
            'gallery_item_files.*' => ['nullable', 'image', 'max:3072'],
            'logo' => ['nullable', 'image', 'max:3072'],
        ]);

        $content = $data['content'] ?? [];
        $content = is_array($content) ? $content : [];

        if ($request->hasFile('hero_image')) {
            $path = $request->file('hero_image')->store('landing', 'public');
            Arr::set($content, 'media.heroImage.path', $path);
        }

        if ($request->hasFile('about_image')) {
            $path = $request->file('about_image')->store('landing', 'public');
            Arr::set($content, 'media.aboutImage.path', $path);
        }

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('landing', 'public');
            Arr::set($content, 'media.logo.path', $path);
        }

        if ($request->hasFile('gallery_images')) {
            $items = Arr::get($content, 'gallery.items', []);
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('landing/gallery', 'public');
                $items[] = [
                    'path' => $path,
                    'alt' => ['id' => '', 'en' => ''],
                ];
            }
            Arr::set($content, 'gallery.items', $items);
        }

        if ($request->hasFile('gallery_item_files')) {
            $items = Arr::get($content, 'gallery.items', []);
            foreach ($request->file('gallery_item_files') as $index => $file) {
                if (!$file) {
                    continue;
                }
                $path = $file->store('landing/gallery', 'public');
                $item = $items[$index] ?? [];
                $item['path'] = $path;
                if (!isset($item['alt'])) {
                    $item['alt'] = ['id' => '', 'en' => ''];
                }
                $items[$index] = $item;
            }
            Arr::set($content, 'gallery.items', $items);
        }

        // Avoid persisting computed URLs if the frontend sends them back.
        if (isset($content['media']['heroImage']['url'])) {
            unset($content['media']['heroImage']['url']);
        }
        if (isset($content['media']['aboutImage']['url'])) {
            unset($content['media']['aboutImage']['url']);
        }
        if (isset($content['media']['logo']['url'])) {
            unset($content['media']['logo']['url']);
        }
        $galleryItems = Arr::get($content, 'gallery.items', []);
        if (is_array($galleryItems)) {
            foreach ($galleryItems as $index => $item) {
                if (isset($item['url'])) {
                    unset($item['url']);
                }
                $galleryItems[$index] = $item;
            }
            Arr::set($content, 'gallery.items', $galleryItems);
        }

        PageContent::updateOrCreate(
            ['slug' => 'landing'],
            ['content' => $content],
        );

        return back()->with('success', 'Konten landing berhasil disimpan.');
    }

    private function withMediaUrls(?array $content): ?array
    {
        if (!$content) {
            return null;
        }

        $heroPath = Arr::get($content, 'media.heroImage.path');
        if ($heroPath) {
            Arr::set($content, 'media.heroImage.url', Storage::url($heroPath));
        }

        $aboutPath = Arr::get($content, 'media.aboutImage.path');
        if ($aboutPath) {
            Arr::set($content, 'media.aboutImage.url', Storage::url($aboutPath));
        }

        $logoPath = Arr::get($content, 'media.logo.path');
        if ($logoPath) {
            Arr::set($content, 'media.logo.url', Storage::url($logoPath));
        }

        $galleryItems = Arr::get($content, 'gallery.items', []);
        if (is_array($galleryItems)) {
            foreach ($galleryItems as $index => $item) {
                $path = $item['path'] ?? null;
                if ($path) {
                    $item['url'] = Storage::url($path);
                }
                $galleryItems[$index] = $item;
            }
            Arr::set($content, 'gallery.items', $galleryItems);
        }

        return $content;
    }
}
