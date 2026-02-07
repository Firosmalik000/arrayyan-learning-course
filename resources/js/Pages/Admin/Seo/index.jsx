import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Kontak & Sosmed' },
    { id: 'colors', label: 'Warna' },
    { id: 'social', label: 'Social Sharing' },
    { id: 'advanced', label: 'Advanced' },
];

const colorPresets = [
    { name: 'Violet (Default)', primary: '#7c3aed', secondary: '#f59e0b', accent: '#10b981' },
    { name: 'Blue Ocean', primary: '#2563eb', secondary: '#0891b2', accent: '#f97316' },
    { name: 'Forest Green', primary: '#059669', secondary: '#7c3aed', accent: '#f59e0b' },
    { name: 'Rose Pink', primary: '#e11d48', secondary: '#8b5cf6', accent: '#06b6d4' },
    { name: 'Indigo Night', primary: '#4f46e5', secondary: '#ec4899', accent: '#14b8a6' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#7c3aed', accent: '#0d9488' },
];

const iconOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'mail', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'mapPin', label: 'Location' },
];

const toneOptions = [
    { value: 'green', label: 'Green (WhatsApp)' },
    { value: 'rose', label: 'Rose (Instagram)' },
    { value: 'blue', label: 'Blue (Facebook)' },
    { value: 'slate', label: 'Slate (TikTok)' },
    { value: 'red', label: 'Red (YouTube)' },
    { value: 'violet', label: 'Violet' },
    { value: 'amber', label: 'Amber' },
];

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary';

const defaultSettings = {
    general: {
        siteName: { id: 'Ar Rayyan Learning Course', en: 'Ar Rayyan Learning Course' },
        tagline: { id: 'Lembaga Pendidikan Islami', en: 'Islamic Learning Institution' },
        defaultDescription: {
            id: 'Ar Rayyan Learning Course (ALC) adalah lembaga pendidikan islami yang ramah anak dengan program belajar fleksibel untuk berbagai jenjang.',
            en: 'Ar Rayyan Learning Course (ALC) is a child-friendly Islamic educational institution with flexible learning programs for various levels.',
        },
        keywords: 'bimbel islami, les privat, olimpiade matematika, bank soal, pendidikan islam',
    },
    contact: {
        logo: { path: '', url: '' },
        phone: '',
        email: '',
        address: {
            full: { id: '', en: '' },
            streetAddress: '',
            addressLocality: '',
            addressRegion: '',
            postalCode: '',
            addressCountry: 'ID',
            mapLink: '',
        },
        operatingHours: {
            weekday: { id: '', en: '' },
            weekend: { id: '', en: '' },
        },
        socials: [],
    },
    social: {
        ogImage: { path: '', url: '' },
        twitterHandle: '',
        facebookAppId: '',
    },
    advanced: {
        robotsDefault: 'index, follow',
        canonicalBase: '',
        googleVerification: '',
        bingVerification: '',
    },
    colors: {
        primary: '#7c3aed',
        secondary: '#f59e0b',
        accent: '#10b981',
    },
};

const mergeSettings = (base, override) => {
    if (!override) return base;
    const result = { ...base };
    Object.keys(override).forEach((key) => {
        if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
            result[key] = mergeSettings(base[key] || {}, override[key]);
        } else if (override[key] !== undefined) {
            result[key] = override[key];
        }
    });
    return result;
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const setAtPath = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        if (current[key] === undefined) {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
};

function LanguageToggle({ value, onChange }) {
    return (
        <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
            <button
                type="button"
                onClick={() => onChange('id')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === 'id' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                ID
            </button>
            <button
                type="button"
                onClick={() => onChange('en')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === 'en' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                EN
            </button>
        </div>
    );
}

function FieldLabel({ children, required }) {
    return (
        <label className="mb-1.5 block text-xs font-medium text-slate-600">
            {children}
            {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
    );
}

function LocalizedField({ label, value, onChange, textarea = false, rows = 3, required = false, placeholder, maxLength, type = 'text' }) {
    return (
        <div>
            <FieldLabel required={required}>{label}</FieldLabel>
            {textarea ? (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${inputClass} resize-none`}
                    rows={rows}
                    placeholder={placeholder}
                    maxLength={maxLength}
                />
            ) : (
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                    placeholder={placeholder}
                    maxLength={maxLength}
                />
            )}
            {maxLength && (
                <p className="mt-1 text-xs text-slate-400">
                    {(value || '').length}/{maxLength} karakter
                </p>
            )}
        </div>
    );
}

function SelectInput({ label, value, onChange, options, placeholder }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Card({ children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ title, subtitle }) {
    return (
        <div className="mb-5">
            <h3 className="font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
    );
}

function ImageUpload({ label, description, previewUrl, onChange, onClear }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {previewUrl ? (
                        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Preview
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                    {previewUrl && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-xs font-medium text-rose-500 transition hover:text-rose-600"
                        >
                            Hapus gambar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function AddButton({ onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-brand-soft hover:bg-brand-faint hover:text-brand-primary"
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {label}
        </button>
    );
}

function SocialItemCard({ item, index, lang, onUpdate, onRemove }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                    {item.label?.[lang] || item.label?.id || `Social ${index + 1}`}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <LocalizedField
                    label="Label (ID)"
                    value={item.label?.id}
                    onChange={(v) => onUpdate('label.id', v)}
                    placeholder="WhatsApp"
                />
                <LocalizedField
                    label="Label (EN)"
                    value={item.label?.en}
                    onChange={(v) => onUpdate('label.en', v)}
                    placeholder="WhatsApp"
                />
                <LocalizedField
                    label="Value/Username"
                    value={item.value}
                    onChange={(v) => onUpdate('value', v)}
                    placeholder="+62 812 3456 7890"
                />
                <LocalizedField
                    label="Link URL"
                    value={item.link}
                    onChange={(v) => onUpdate('link', v)}
                    placeholder="https://wa.me/628123456789"
                    type="url"
                />
                <SelectInput
                    label="Icon"
                    value={item.icon}
                    onChange={(v) => onUpdate('icon', v)}
                    options={iconOptions}
                    placeholder="Pilih icon"
                />
                <SelectInput
                    label="Warna"
                    value={item.tone}
                    onChange={(v) => onUpdate('tone', v)}
                    options={toneOptions}
                    placeholder="Pilih warna"
                />
            </div>
        </div>
    );
}

export default function Seo({ settings }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('general');
    const [lang, setLang] = useState('id');

    const initialSettings = useMemo(
        () => mergeSettings(deepClone(defaultSettings), settings || {}),
        [settings],
    );

    const { data, setData, put, processing, recentlySuccessful } = useForm({
        content: initialSettings,
        og_image: null,
        logo: null,
    });

    const updateContent = (path, value) => {
        const content = deepClone(data.content);
        setAtPath(content, path, value);
        setData('content', content);
    };

    const handleSave = () => {
        put('/admin/seo', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const updateOgImage = (file) => {
        setData('og_image', file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            updateContent('social.ogImage.url', previewUrl);
        }
    };

    const updateLogo = (file) => {
        setData('logo', file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            updateContent('contact.logo.url', previewUrl);
        }
    };

    // Social media management
    const addSocial = () => {
        const socials = [...(data.content.contact.socials || []), {
            key: `social-${Date.now()}`,
            label: { id: '', en: '' },
            value: '',
            link: '',
            icon: 'whatsapp',
            tone: 'green',
        }];
        updateContent('contact.socials', socials);
    };

    const updateSocial = (index, path, value) => {
        const socials = [...(data.content.contact.socials || [])];
        const item = { ...socials[index] };
        setAtPath(item, path, value);
        socials[index] = item;
        updateContent('contact.socials', socials);
    };

    const removeSocial = (index) => {
        const socials = (data.content.contact.socials || []).filter((_, i) => i !== index);
        updateContent('contact.socials', socials);
    };

    const renderGeneralTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Informasi Situs"
                    subtitle="Nama situs dan tagline yang akan muncul di hasil pencarian"
                />
                <div className="mb-4 flex justify-end">
                    <LanguageToggle value={lang} onChange={setLang} />
                </div>
                <div className="space-y-4">
                    <LocalizedField
                        label="Nama Situs"
                        value={data.content.general.siteName?.[lang]}
                        onChange={(v) => updateContent(`general.siteName.${lang}`, v)}
                        placeholder="Ar Rayyan Learning Course"
                        maxLength={60}
                    />
                    <LocalizedField
                        label="Tagline"
                        value={data.content.general.tagline?.[lang]}
                        onChange={(v) => updateContent(`general.tagline.${lang}`, v)}
                        placeholder="Lembaga Pendidikan Islami"
                        maxLength={100}
                    />
                    <LocalizedField
                        label="Deskripsi Default"
                        value={data.content.general.defaultDescription?.[lang]}
                        onChange={(v) => updateContent(`general.defaultDescription.${lang}`, v)}
                        textarea
                        rows={3}
                        placeholder="Deskripsi singkat tentang website..."
                        maxLength={160}
                    />
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Keywords"
                    subtitle="Kata kunci untuk SEO (pisahkan dengan koma)"
                />
                <LocalizedField
                    label="Meta Keywords"
                    value={data.content.general.keywords}
                    onChange={(v) => updateContent('general.keywords', v)}
                    textarea
                    rows={2}
                    placeholder="bimbel islami, les privat, olimpiade matematika"
                />
            </Card>
        </div>
    );

    const renderContactTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Logo Organisasi"
                    subtitle="Logo utama yang digunakan di website dan structured data"
                />
                <ImageUpload
                    label="Logo"
                    description="Ukuran rekomendasi: 512x512px. Format: PNG/SVG. Max 2MB."
                    previewUrl={data.content.contact.logo?.url}
                    onChange={updateLogo}
                    onClear={() => {
                        setData('logo', null);
                        updateContent('contact.logo.url', '');
                        updateContent('contact.logo.path', '');
                    }}
                />
            </Card>

            <Card>
                <CardHeader
                    title="Kontak Utama"
                    subtitle="Telepon dan email yang ditampilkan di website"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <LocalizedField
                        label="Telepon"
                        value={data.content.contact.phone}
                        onChange={(v) => updateContent('contact.phone', v)}
                        placeholder="+62 812 3456 7890"
                    />
                    <LocalizedField
                        label="Email"
                        value={data.content.contact.email}
                        onChange={(v) => updateContent('contact.email', v)}
                        placeholder="info@alc.id"
                        type="email"
                    />
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Alamat"
                    subtitle="Alamat fisik untuk ditampilkan dan structured data"
                />
                <div className="mb-4 flex justify-end">
                    <LanguageToggle value={lang} onChange={setLang} />
                </div>
                <div className="space-y-4">
                    <LocalizedField
                        label="Alamat Lengkap (untuk display)"
                        value={data.content.contact.address?.full?.[lang]}
                        onChange={(v) => updateContent(`contact.address.full.${lang}`, v)}
                        textarea
                        rows={2}
                        placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <LocalizedField
                            label="Jalan"
                            value={data.content.contact.address?.streetAddress}
                            onChange={(v) => updateContent('contact.address.streetAddress', v)}
                            placeholder="Jl. Contoh No. 123"
                        />
                        <LocalizedField
                            label="Kota/Kabupaten"
                            value={data.content.contact.address?.addressLocality}
                            onChange={(v) => updateContent('contact.address.addressLocality', v)}
                            placeholder="Jakarta Selatan"
                        />
                        <LocalizedField
                            label="Provinsi"
                            value={data.content.contact.address?.addressRegion}
                            onChange={(v) => updateContent('contact.address.addressRegion', v)}
                            placeholder="DKI Jakarta"
                        />
                        <LocalizedField
                            label="Kode Pos"
                            value={data.content.contact.address?.postalCode}
                            onChange={(v) => updateContent('contact.address.postalCode', v)}
                            placeholder="12345"
                        />
                    </div>
                    <LocalizedField
                        label="Link Google Maps"
                        value={data.content.contact.address?.mapLink}
                        onChange={(v) => updateContent('contact.address.mapLink', v)}
                        placeholder="https://maps.google.com/..."
                        type="url"
                    />
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Jam Operasional"
                    subtitle="Jam buka untuk ditampilkan di halaman kontak"
                />
                <div className="mb-4 flex justify-end">
                    <LanguageToggle value={lang} onChange={setLang} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <LocalizedField
                        label="Hari Kerja (Senin-Jumat)"
                        value={data.content.contact.operatingHours?.weekday?.[lang]}
                        onChange={(v) => updateContent(`contact.operatingHours.weekday.${lang}`, v)}
                        placeholder="08:00 - 17:00 WIB"
                    />
                    <LocalizedField
                        label="Akhir Pekan (Sabtu-Minggu)"
                        value={data.content.contact.operatingHours?.weekend?.[lang]}
                        onChange={(v) => updateContent(`contact.operatingHours.weekend.${lang}`, v)}
                        placeholder="09:00 - 15:00 WIB"
                    />
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Social Media"
                    subtitle="Akun social media yang ditampilkan di halaman kontak"
                />
                <div className="space-y-4">
                    {(data.content.contact.socials || []).map((item, index) => (
                        <SocialItemCard
                            key={item.key || index}
                            item={item}
                            index={index}
                            lang={lang}
                            onUpdate={(path, value) => updateSocial(index, path, value)}
                            onRemove={() => removeSocial(index)}
                        />
                    ))}
                    <AddButton onClick={addSocial} label="Tambah Social Media" />
                </div>
            </Card>
        </div>
    );

    const renderSocialTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Open Graph Image"
                    subtitle="Gambar yang muncul saat website di-share di Facebook, WhatsApp, dll"
                />
                <ImageUpload
                    label="OG Image"
                    description="Ukuran rekomendasi: 1200x630px. Max 2MB."
                    previewUrl={data.content.social.ogImage?.url}
                    onChange={updateOgImage}
                    onClear={() => {
                        setData('og_image', null);
                        updateContent('social.ogImage.url', '');
                        updateContent('social.ogImage.path', '');
                    }}
                />
            </Card>

            <Card>
                <CardHeader
                    title="Twitter/X Integration"
                    subtitle="Pengaturan untuk Twitter Card"
                />
                <LocalizedField
                    label="Twitter Handle"
                    value={data.content.social.twitterHandle}
                    onChange={(v) => updateContent('social.twitterHandle', v)}
                    placeholder="@username"
                />
            </Card>

            <Card>
                <CardHeader
                    title="Facebook Integration"
                    subtitle="Pengaturan untuk Facebook"
                />
                <LocalizedField
                    label="Facebook App ID"
                    value={data.content.social.facebookAppId}
                    onChange={(v) => updateContent('social.facebookAppId', v)}
                    placeholder="123456789"
                />
            </Card>
        </div>
    );

    const renderAdvancedTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Robots Meta Tag"
                    subtitle="Direktif default untuk crawler mesin pencari"
                />
                <div>
                    <FieldLabel>Default Robots</FieldLabel>
                    <select
                        value={data.content.advanced.robotsDefault || 'index, follow'}
                        onChange={(e) => updateContent('advanced.robotsDefault', e.target.value)}
                        className={inputClass}
                    >
                        <option value="index, follow">index, follow (Recommended)</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Canonical URL"
                    subtitle="Base URL untuk canonical tags"
                />
                <LocalizedField
                    label="Canonical Base URL"
                    value={data.content.advanced.canonicalBase}
                    onChange={(v) => updateContent('advanced.canonicalBase', v)}
                    placeholder="https://www.example.com"
                />
            </Card>

            <Card>
                <CardHeader
                    title="Site Verification"
                    subtitle="Kode verifikasi untuk Google Search Console dan Bing Webmaster"
                />
                <div className="space-y-4">
                    <LocalizedField
                        label="Google Site Verification"
                        value={data.content.advanced.googleVerification}
                        onChange={(v) => updateContent('advanced.googleVerification', v)}
                        placeholder="google-site-verification code"
                    />
                    <LocalizedField
                        label="Bing Site Verification"
                        value={data.content.advanced.bingVerification}
                        onChange={(v) => updateContent('advanced.bingVerification', v)}
                        placeholder="msvalidate.01 code"
                    />
                </div>
            </Card>
        </div>
    );

    const renderColorsTab = () => {
        const primaryColor = data.content.colors?.primary || '#7c3aed';
        const secondaryColor = data.content.colors?.secondary || '#f59e0b';
        const accentColor = data.content.colors?.accent || '#10b981';
        const gradientStyle = {
            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        };
        const softBackground = (color, strength = 12) =>
            `color-mix(in oklab, ${color} ${strength}%, white)`;
        const softBorder = (color) =>
            `color-mix(in oklab, ${color} 22%, white)`;

        return (
            <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Color Palette"
                    subtitle="Warna dasar yang digunakan di seluruh website (public & admin)"
                />
                <div className="space-y-6">
                    {/* Color Inputs */}
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div>
                            <FieldLabel>Warna Primer</FieldLabel>
                            <p className="mb-2 text-xs text-slate-500">Warna utama untuk tombol, link, dan elemen penting</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => updateContent('colors.primary', e.target.value)}
                                    className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => updateContent('colors.primary', e.target.value)}
                                    className={`${inputClass} font-mono uppercase`}
                                    placeholder="#7c3aed"
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Warna Sekunder</FieldLabel>
                            <p className="mb-2 text-xs text-slate-500">Warna pendukung untuk aksen dan highlight</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => updateContent('colors.secondary', e.target.value)}
                                    className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200"
                                />
                                <input
                                    type="text"
                                    value={secondaryColor}
                                    onChange={(e) => updateContent('colors.secondary', e.target.value)}
                                    className={`${inputClass} font-mono uppercase`}
                                    placeholder="#f59e0b"
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Warna Aksen</FieldLabel>
                            <p className="mb-2 text-xs text-slate-500">Warna tambahan untuk variasi</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => updateContent('colors.accent', e.target.value)}
                                    className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200"
                                />
                                <input
                                    type="text"
                                    value={accentColor}
                                    onChange={(e) => updateContent('colors.accent', e.target.value)}
                                    className={`${inputClass} font-mono uppercase`}
                                    placeholder="#10b981"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-xs font-medium text-slate-600">Preview Komponen Dasar</p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Tombol Primer
                            </button>
                            <button
                                type="button"
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: secondaryColor }}
                            >
                                Tombol Sekunder
                            </button>
                            <button
                                type="button"
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: accentColor }}
                            >
                                Tombol Aksen
                            </button>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: primaryColor }}
                            >
                                Link Teks
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-xs font-medium text-slate-600">Preview Dashboard</p>
                            <div className="space-y-3">
                                <div
                                    className="flex items-center justify-between rounded-lg px-3 py-2 text-white"
                                    style={gradientStyle}
                                >
                                    <span className="text-sm font-semibold">Admin Console</span>
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                        style={{
                                            backgroundColor: softBackground(secondaryColor, 28),
                                            color: secondaryColor,
                                        }}
                                    >
                                        3 Pending
                                    </span>
                                </div>
                                <div
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                    style={{
                                        borderColor: softBorder(primaryColor),
                                        backgroundColor: softBackground(primaryColor, 6),
                                    }}
                                >
                                    <span className="text-sm font-medium" style={{ color: primaryColor }}>
                                        Menu Aktif
                                    </span>
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                        style={{
                                            backgroundColor: softBackground(accentColor, 22),
                                            color: accentColor,
                                        }}
                                    >
                                        Baru
                                    </span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border bg-white p-3" style={{ borderColor: softBorder(primaryColor) }}>
                                        <p className="text-xs text-slate-500">Total Siswa</p>
                                        <p className="text-lg font-semibold" style={{ color: primaryColor }}>128</p>
                                        <p className="text-xs font-medium" style={{ color: secondaryColor }}>+12%</p>
                                    </div>
                                    <div className="rounded-lg border bg-white p-3" style={{ borderColor: softBorder(accentColor) }}>
                                        <p className="text-xs text-slate-500">Kelas Aktif</p>
                                        <p className="text-lg font-semibold" style={{ color: accentColor }}>24</p>
                                        <p className="text-xs font-medium" style={{ color: secondaryColor }}>+4%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-xs font-medium text-slate-600">Preview Public</p>
                            <div
                                className="rounded-xl p-4 text-white"
                                style={gradientStyle}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75">Hero Section</p>
                                <p className="mt-2 text-lg font-semibold">Belajar Lebih Terarah</p>
                                <p className="mt-1 text-xs text-white/80">Nuansa warna utama untuk section publik.</p>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    CTA Utama
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                                    style={{ borderColor: primaryColor, color: primaryColor }}
                                >
                                    Outline
                                </button>
                                <span className="text-xs font-semibold" style={{ color: accentColor }}>
                                    Highlight Aksen
                                </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
                                <span className="text-xs text-slate-600">Penanda section/feature</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Preset Warna"
                    subtitle="Pilih kombinasi warna yang sudah disiapkan"
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {colorPresets.map((preset) => (
                        <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                                const content = deepClone(data.content);
                                setAtPath(content, 'colors.primary', preset.primary);
                                setAtPath(content, 'colors.secondary', preset.secondary);
                                setAtPath(content, 'colors.accent', preset.accent);
                                setData('content', content);
                            }}
                            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-soft hover:shadow-sm"
                        >
                            <div className="flex gap-1">
                                <div
                                    className="h-8 w-8 rounded-lg"
                                    style={{ backgroundColor: preset.primary }}
                                />
                                <div
                                    className="h-8 w-8 rounded-lg"
                                    style={{ backgroundColor: preset.secondary }}
                                />
                                <div
                                    className="h-8 w-8 rounded-lg"
                                    style={{ backgroundColor: preset.accent }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-brand-primary">
                                {preset.name}
                            </span>
                        </button>
                    ))}
                </div>
            </Card>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-amber-800">Perubahan Warna</p>
                        <p className="mt-1 text-sm text-amber-700">
                            Perubahan warna akan diterapkan setelah menyimpan dan me-refresh halaman.
                            Warna akan berlaku di seluruh website baik halaman publik maupun admin.
                        </p>
                    </div>
                </div>
            </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralTab();
            case 'contact':
                return renderContactTab();
            case 'colors':
                return renderColorsTab();
            case 'social':
                return renderSocialTab();
            case 'advanced':
                return renderAdvancedTab();
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="SEO Settings" />

            <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">SEO & Site Settings</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Pusat pengaturan SEO, kontak, dan informasi website
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Simpan
                            </>
                        )}
                    </button>
                </div>

                {/* Success message */}
                {(recentlySuccessful || flash?.success) && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-emerald-700">
                                {flash?.success || 'Pengaturan berhasil disimpan.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeTab === tab.id
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </>
    );
}
