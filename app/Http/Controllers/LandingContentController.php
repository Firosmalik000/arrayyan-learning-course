<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\PageContent;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LandingContentController extends Controller
{
    private const SECTION_SLUGS = [
        'hero',
        'why',
        'profile',
        'education',
        'program',
        'gallery',
        'stats',
        'bank-soal',
        'olympiad',
        'cta',
        'contact',
        'logo',
    ];

    public function show(): Response
    {
        $content = $this->loadLandingContent();
        $content['programs'] = $this->getPrograms(true);
        $content['bankSoalItems'] = $this->getBankSoalItems(true);
        $content['olympiadHighlights'] = $this->getOlympiadHighlights(true);

        return Inertia::render('Public/Home', [
            'landingContent' => $this->withMediaUrls($content),
        ]);
    }

    public function edit(): Response
    {
        $content = $this->loadLandingContent();
        $content['programs'] = $this->getPrograms();
        $content['bankSoalItems'] = $this->getBankSoalItems();
        $content['olympiadHighlights'] = $this->getOlympiadHighlights();

        return Inertia::render('Admin/Landing', [
            'landingContent' => $this->withMediaUrls($content),
            'programs' => $content['programs'],
            'bankSoalItems' => $content['bankSoalItems'],
            'olympiadHighlights' => $content['olympiadHighlights'],
        ]);
    }

    public function bankSoal(): Response
    {
        $content = $this->loadLandingContent();
        $content['bankSoalItems'] = $this->getBankSoalItems(true);

        return Inertia::render('Public/BankSoal', [
            'landingContent' => $this->withMediaUrls($content),
            'bankSoalItems' => $content['bankSoalItems'],
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
                if (! $file) {
                    continue;
                }
                $path = $file->store('landing/gallery', 'public');
                $item = $items[$index] ?? [];
                $item['path'] = $path;
                if (! isset($item['alt'])) {
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

        unset(
            $content['programs'],
            $content['packages'],
            $content['bankSoalItems'],
            $content['olympiadHighlights'],
        );

        $sections = $this->buildSectionPayloads($content);

        foreach ($sections as $slug => $payload) {
            PageContent::updateOrCreate(
                ['slug' => $slug],
                ['content' => $payload],
            );
        }

        return back()->with('success', 'Konten landing berhasil disimpan.');
    }

    private function withMediaUrls(?array $content): array
    {
        if (! $content) {
            return [];
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

    private function loadLandingContent(): array
    {
        $content = [];
        $sections = PageContent::whereIn('slug', self::SECTION_SLUGS)->get()->keyBy('slug');

        foreach (self::SECTION_SLUGS as $slug) {
            $sectionContent = $sections->get($slug)?->content;
            if (is_array($sectionContent)) {
                $content = $this->mergeContent($content, $sectionContent);
            }
        }

        return $content;
    }

    private function mergeContent(array $base, array $override): array
    {
        $result = $base;

        foreach ($override as $key => $value) {
            if (is_array($value)) {
                if (array_is_list($value)) {
                    $result[$key] = $value;

                    continue;
                }
                $result[$key] = $this->mergeContent($base[$key] ?? [], $value);

                continue;
            }

            $result[$key] = $value;
        }

        return $result;
    }

    private function buildSectionPayloads(array $content): array
    {
        $sectionTitles = $content['sectionTitles'] ?? [];
        $media = $content['media'] ?? [];

        $payloads = [
            'hero' => array_filter([
                'siteConfig' => $content['siteConfig'] ?? null,
                'heroContent' => $content['heroContent'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['hero']),
                'media' => $this->pickMedia($media, ['heroImage']),
            ]),
            'why' => array_filter([
                'featureCards' => $content['featureCards'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['why']),
            ]),
            'profile' => array_filter([
                'aboutContent' => $content['aboutContent'] ?? null,
                'visionMission' => $content['visionMission'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['profile']),
                'media' => $this->pickMedia($media, ['aboutImage']),
            ]),
            'education' => array_filter([
                'educationLevels' => $content['educationLevels'] ?? null,
                'subjects' => $content['subjects'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['education']),
            ]),
            'program' => array_filter([
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['program']),
                'programContent' => $content['programContent'] ?? null,
            ]),
            'gallery' => array_filter([
                'gallery' => $content['gallery'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['gallery']),
            ]),
            'stats' => array_filter([
                'stats' => $content['stats'] ?? null,
            ]),
            'bank-soal' => array_filter([
                'bankSoalContent' => $content['bankSoalContent'] ?? null,
                'bankSoalPasskey' => $content['bankSoalPasskey'] ?? null,
                'bankSoalPageContent' => $content['bankSoalPageContent'] ?? null,
            ]),
            'olympiad' => array_filter([
                'olympiadContent' => $content['olympiadContent'] ?? null,
            ]),
            'cta' => array_filter([
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['olympiad', 'register']),
                'ctaButtons' => $content['ctaButtons'] ?? null,
            ]),
            'contact' => array_filter([
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['contact']),
                'contactInfo' => $content['contactInfo'] ?? null,
                'operatingHours' => $content['operatingHours'] ?? null,
            ]),
            'logo' => array_filter([
                'media' => $this->pickMedia($media, ['logo']),
            ]),
        ];

        return array_filter($payloads);
    }

    private function pickSectionTitles(array $sectionTitles, array $keys): array
    {
        $result = [];
        foreach (['id', 'en'] as $lang) {
            foreach ($keys as $key) {
                $value = $sectionTitles[$lang][$key] ?? null;
                if ($value !== null) {
                    $result[$lang][$key] = $value;
                }
            }
        }

        return $result;
    }

    private function pickMedia(array $media, array $keys): array
    {
        $picked = [];
        foreach ($keys as $key) {
            if (isset($media[$key])) {
                $picked[$key] = $media[$key];
            }
        }

        return $picked;
    }

    private function normalizeLocalized(null|array|string $value): array
    {
        if (is_array($value)) {
            return [
                'id' => $value['id'] ?? ($value['en'] ?? ''),
                'en' => $value['en'] ?? ($value['id'] ?? ''),
            ];
        }

        $stringValue = $value ?? '';

        return [
            'id' => $stringValue,
            'en' => $stringValue,
        ];
    }

    private function getBankSoalItems(bool $onlyActive = false): array
    {
        $query = BankSoal::query();
        if ($onlyActive) {
            $query->where('is_active', true);
        }

        return $query->latest()->get()->map(function (BankSoal $item) {
            return [
                'id' => $item->id,
                'slug' => $item->slug,
                'name' => $this->normalizeLocalized($item->name),
                'category' => $this->normalizeLocalized($item->category),
                'level' => $this->normalizeLocalized($item->level),
                'format' => $item->format,
                'questions' => $item->questions,
                'description' => $this->normalizeLocalized($item->description),
                'tone' => $item->tone,
                'is_active' => $item->is_active,
            ];
        })->values()->all();
    }

    private function getPrograms(bool $onlyActive = false): array
    {
        $query = Program::query();
        if ($onlyActive) {
            $query->where('is_active', true);
        }

        return $query->latest()->get()->map(function (Program $program) {
            return [
                'id' => $program->id,
                'name' => $program->name,
                'level' => $program->level,
                'description' => $program->description,
                'subjects' => $program->subjects ?? [],
                'is_active' => $program->is_active,
            ];
        })->values()->all();
    }

    private function getOlympiadHighlights(bool $onlyActive = false): array
    {
        $query = Olympiad::query();
        if ($onlyActive) {
            $query->where('is_active', true);
        }

        return $query->latest()->get()->map(function (Olympiad $olympiad) {
            $category = strtolower((string) $olympiad->category);
            $isPaid = $category === 'paid' || $category === 'berbayar';

            return [
                'id' => $olympiad->id,
                'name' => $this->normalizeLocalized($olympiad->name),
                'level' => $this->normalizeLocalized($olympiad->level),
                'schedule' => $this->normalizeLocalized($olympiad->schedule ?? ''),
                'category' => [
                    'id' => $isPaid ? 'Berbayar' : 'Gratis',
                    'en' => $isPaid ? 'Paid' : 'Free',
                ],
            ];
        })->values()->all();
    }
}
