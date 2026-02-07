<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'array'],

            // General
            'content.general.siteName' => ['nullable', 'array'],
            'content.general.siteName.id' => ['nullable', 'string', 'max:100'],
            'content.general.siteName.en' => ['nullable', 'string', 'max:100'],
            'content.general.tagline' => ['nullable', 'array'],
            'content.general.tagline.id' => ['nullable', 'string', 'max:200'],
            'content.general.tagline.en' => ['nullable', 'string', 'max:200'],
            'content.general.defaultDescription' => ['nullable', 'array'],
            'content.general.defaultDescription.id' => ['nullable', 'string', 'max:300'],
            'content.general.defaultDescription.en' => ['nullable', 'string', 'max:300'],
            'content.general.keywords' => ['nullable', 'string', 'max:500'],

            // Contact (centralized site info)
            'content.contact.logo' => ['nullable', 'array'],
            'content.contact.phone' => ['nullable', 'string', 'max:30'],
            'content.contact.email' => ['nullable', 'email', 'max:100'],
            'content.contact.address' => ['nullable', 'array'],
            'content.contact.address.full' => ['nullable', 'array'],
            'content.contact.address.full.id' => ['nullable', 'string', 'max:500'],
            'content.contact.address.full.en' => ['nullable', 'string', 'max:500'],
            'content.contact.address.streetAddress' => ['nullable', 'string', 'max:300'],
            'content.contact.address.addressLocality' => ['nullable', 'string', 'max:100'],
            'content.contact.address.addressRegion' => ['nullable', 'string', 'max:100'],
            'content.contact.address.postalCode' => ['nullable', 'string', 'max:20'],
            'content.contact.address.addressCountry' => ['nullable', 'string', 'max:5'],
            'content.contact.address.mapLink' => ['nullable', 'url', 'max:500'],
            'content.contact.operatingHours' => ['nullable', 'array'],
            'content.contact.operatingHours.weekday' => ['nullable', 'array'],
            'content.contact.operatingHours.weekday.id' => ['nullable', 'string', 'max:100'],
            'content.contact.operatingHours.weekday.en' => ['nullable', 'string', 'max:100'],
            'content.contact.operatingHours.weekend' => ['nullable', 'array'],
            'content.contact.operatingHours.weekend.id' => ['nullable', 'string', 'max:100'],
            'content.contact.operatingHours.weekend.en' => ['nullable', 'string', 'max:100'],
            'content.contact.socials' => ['nullable', 'array'],
            'content.contact.socials.*.key' => ['nullable', 'string', 'max:50'],
            'content.contact.socials.*.label' => ['nullable', 'array'],
            'content.contact.socials.*.label.id' => ['nullable', 'string', 'max:50'],
            'content.contact.socials.*.label.en' => ['nullable', 'string', 'max:50'],
            'content.contact.socials.*.value' => ['nullable', 'string', 'max:100'],
            'content.contact.socials.*.link' => ['nullable', 'url', 'max:255'],
            'content.contact.socials.*.icon' => ['nullable', 'string', 'max:30'],
            'content.contact.socials.*.tone' => ['nullable', 'string', 'max:30'],

            // Social Sharing
            'content.social.ogImage' => ['nullable', 'array'],
            'content.social.twitterHandle' => ['nullable', 'string', 'max:50'],
            'content.social.facebookAppId' => ['nullable', 'string', 'max:50'],

            // Advanced
            'content.advanced.robotsDefault' => ['nullable', 'string', 'max:50'],
            'content.advanced.canonicalBase' => ['nullable', 'url', 'max:255'],
            'content.advanced.googleVerification' => ['nullable', 'string', 'max:100'],
            'content.advanced.bingVerification' => ['nullable', 'string', 'max:100'],

            // Colors
            'content.colors' => ['nullable', 'array'],
            'content.colors.primary' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'content.colors.secondary' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'content.colors.accent' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],

            // File uploads
            'og_image' => ['nullable', 'image', 'max:2048'],
            'logo' => ['nullable', 'image', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Data konten wajib diisi.',
            'content.general.siteName.id.max' => 'Nama situs (ID) maksimal 100 karakter.',
            'content.general.siteName.en.max' => 'Nama situs (EN) maksimal 100 karakter.',
            'content.general.defaultDescription.id.max' => 'Deskripsi default (ID) maksimal 300 karakter.',
            'content.general.defaultDescription.en.max' => 'Deskripsi default (EN) maksimal 300 karakter.',
            'content.contact.email.email' => 'Format email tidak valid.',
            'content.contact.socials.*.link.url' => 'Format URL social link tidak valid.',
            'content.contact.address.mapLink.url' => 'Format URL Google Maps tidak valid.',
            'content.advanced.canonicalBase.url' => 'Format URL canonical base tidak valid.',
            'og_image.image' => 'File OG Image harus berupa gambar.',
            'og_image.max' => 'Ukuran OG Image maksimal 2MB.',
            'logo.image' => 'File logo harus berupa gambar.',
            'logo.max' => 'Ukuran logo maksimal 2MB.',
        ];
    }
}
