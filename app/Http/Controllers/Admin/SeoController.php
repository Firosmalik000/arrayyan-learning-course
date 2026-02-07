<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSeoSettingsRequest;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SeoController extends Controller
{
    private const SEO_SLUG = 'seo-settings';

    public function edit(): Response
    {
        $seoSettings = PageContent::where('slug', self::SEO_SLUG)->first();
        $settings = $seoSettings?->content ?? $this->getDefaults();

        return Inertia::render('Admin/Seo', [
            'settings' => $this->withMediaUrls($settings),
        ]);
    }

    public function update(UpdateSeoSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $content = $data['content'] ?? [];

        // Handle OG image upload
        if ($request->hasFile('og_image')) {
            $path = $request->file('og_image')->store('seo', 'public');
            Arr::set($content, 'social.ogImage.path', $path);
        }

        // Handle logo upload (now under contact)
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('seo', 'public');
            Arr::set($content, 'contact.logo.path', $path);
        }

        // Remove computed URLs before saving
        if (isset($content['social']['ogImage']['url'])) {
            unset($content['social']['ogImage']['url']);
        }
        if (isset($content['contact']['logo']['url'])) {
            unset($content['contact']['logo']['url']);
        }

        PageContent::updateOrCreate(
            ['slug' => self::SEO_SLUG],
            ['content' => $content],
        );

        return back()->with('success', 'Pengaturan SEO berhasil disimpan.');
    }

    private function getDefaults(): array
    {
        return [
            'general' => [
                'siteName' => [
                    'id' => 'Ar Rayyan Learning Course',
                    'en' => 'Ar Rayyan Learning Course',
                ],
                'tagline' => [
                    'id' => 'Lembaga Pendidikan Islami',
                    'en' => 'Islamic Learning Institution',
                ],
                'defaultDescription' => [
                    'id' => 'Ar Rayyan Learning Course (ALC) adalah lembaga pendidikan islami yang ramah anak dengan program belajar fleksibel untuk berbagai jenjang.',
                    'en' => 'Ar Rayyan Learning Course (ALC) is a child-friendly Islamic educational institution with flexible learning programs for various levels.',
                ],
                'keywords' => 'bimbel islami, les privat, olimpiade matematika, bank soal, pendidikan islam',
            ],
            'contact' => [
                'logo' => [
                    'path' => '',
                    'url' => '',
                ],
                'phone' => '',
                'email' => '',
                'address' => [
                    'full' => ['id' => '', 'en' => ''],
                    'streetAddress' => '',
                    'addressLocality' => '',
                    'addressRegion' => '',
                    'postalCode' => '',
                    'addressCountry' => 'ID',
                    'mapLink' => '',
                ],
                'operatingHours' => [
                    'weekday' => ['id' => '', 'en' => ''],
                    'weekend' => ['id' => '', 'en' => ''],
                ],
                'socials' => [],
            ],
            'social' => [
                'ogImage' => [
                    'path' => '',
                    'url' => '',
                ],
                'twitterHandle' => '',
                'facebookAppId' => '',
            ],
            'advanced' => [
                'robotsDefault' => 'index, follow',
                'canonicalBase' => '',
                'googleVerification' => '',
                'bingVerification' => '',
            ],
            'colors' => [
                'primary' => '#7c3aed',
                'secondary' => '#f59e0b',
                'accent' => '#10b981',
            ],
        ];
    }

    private function withMediaUrls(array $settings): array
    {
        $ogImagePath = Arr::get($settings, 'social.ogImage.path');
        if ($ogImagePath) {
            Arr::set($settings, 'social.ogImage.url', Storage::url($ogImagePath));
        }

        $logoPath = Arr::get($settings, 'contact.logo.path');
        if ($logoPath) {
            Arr::set($settings, 'contact.logo.url', Storage::url($logoPath));
        }

        return $settings;
    }

    /**
     * Get SEO settings for sharing with public pages.
     */
    public static function getPublicSettings(): array
    {
        $seoSettings = PageContent::where('slug', self::SEO_SLUG)->first();
        $settings = $seoSettings?->content ?? (new self)->getDefaults();

        // Add URLs for images
        $ogImagePath = Arr::get($settings, 'social.ogImage.path');
        if ($ogImagePath) {
            Arr::set($settings, 'social.ogImage.url', Storage::url($ogImagePath));
        }

        $logoPath = Arr::get($settings, 'contact.logo.path');
        if ($logoPath) {
            Arr::set($settings, 'contact.logo.url', Storage::url($logoPath));
        }

        return $settings;
    }
}
