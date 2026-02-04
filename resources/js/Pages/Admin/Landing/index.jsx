import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { siteConfig, contactInfo, operatingHours, stats } from '@/data/content/site';
import {
    heroContent,
    featureCards,
    aboutContent,
    visionMission,
    educationLevels,
    subjects,
    programContent,
    bankSoalContent,
    bankSoalPasskey,
    bankSoalPageContent,
    olympiadContent,
    sectionTitles,
    ctaButtons,
} from '@/Pages/Public/Home/data';

const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'why', label: 'Why' },
    { id: 'profile', label: 'Profile' },
    { id: 'education', label: 'Education' },
    { id: 'program', label: 'Program' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'stats', label: 'Stats' },
    { id: 'bank-soal', label: 'Bank Soal' },
    { id: 'olimpiade', label: 'Olimpiade' },
    { id: 'cta', label: 'CTA' },
    { id: 'contact', label: 'Contact' },
    { id: 'logo', label: 'Logo' },
];

const iconOptions = [
    { value: 'book', label: 'Book' },
    { value: 'user', label: 'User' },
    { value: 'heart', label: 'Heart' },
    { value: 'chat', label: 'Chat' },
    { value: 'list', label: 'List' },
    { value: 'check', label: 'Check' },
    { value: 'users', label: 'Users' },
    { value: 'trophy', label: 'Trophy' },
    { value: 'clock', label: 'Clock' },
    { value: 'phone', label: 'Phone' },
    { value: 'mail', label: 'Mail' },
    { value: 'mapPin', label: 'Map Pin' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
];

const toneOptions = [
    { value: 'violet', label: 'Violet' },
    { value: 'amber', label: 'Amber' },
    { value: 'rose', label: 'Rose' },
    { value: 'slate', label: 'Slate' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
];

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

const defaultContent = {
    siteConfig,
    contactInfo,
    operatingHours,
    stats,
    heroContent,
    featureCards,
    aboutContent,
    visionMission,
    educationLevels,
    subjects,
    programContent,
    bankSoalContent,
    bankSoalPasskey,
    bankSoalPageContent,
    olympiadContent,
    sectionTitles,
    ctaButtons,
    programs: [],
    bankSoalItems: [],
    olympiadHighlights: [],
    gallery: {
        items: [],
    },
    media: {
        heroImage: { url: null, alt: { id: 'Siswa ALC', en: 'ALC student' } },
        aboutImage: { url: null, alt: { id: 'Kelas ALC', en: 'ALC class' } },
        logo: { url: null, path: null },
    },
};

const mergeContent = (base, override) => {
    if (Array.isArray(base)) {
        return Array.isArray(override) ? override : base;
    }
    if (base && typeof base === 'object') {
        const result = { ...base };
        if (override && typeof override === 'object') {
            Object.keys(override).forEach((key) => {
                if (override[key] === undefined || override[key] === null) {
                    return;
                }
                result[key] = mergeContent(base[key], override[key]);
            });
        }
        return result;
    }
    return override !== undefined ? override : base;
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const getAtPath = (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

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
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === 'id' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                ID
            </button>
            <button
                type="button"
                onClick={() => onChange('en')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === 'en' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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

function LocalizedField({ label, value, onChange, textarea = false, rows = 3, required = false, placeholder }) {
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
                />
            ) : (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                    placeholder={placeholder}
                />
            )}
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

function CardHeader({ title, subtitle, actions }) {
    return (
        <div className="mb-5 flex items-start justify-between gap-4">
            <div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

function ItemCard({ children, onDelete, title }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50">
            <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <svg className={`h-4 w-4 text-slate-400 transition ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">{title}</span>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            {isOpen && <div className="border-t border-slate-200 p-4">{children}</div>}
        </div>
    );
}
function AddButton({ onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600"
        >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {label}
        </button>
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

function SelectInput({ label, value, onChange, options }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
            >
                <option value="">Pilih {label}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
export default function Landing({ landingContent, programs = [], bankSoalItems = [], olympiadHighlights = [] }) {
    const [activeTab, setActiveTab] = useState('hero');
    const [lang, setLang] = useState('id');

    const initialContent = useMemo(
        () => mergeContent(deepClone(defaultContent), landingContent || {}),
        [landingContent],
    );

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        content: initialContent,
        hero_image: null,
        about_image: null,
        logo: null,
        gallery_images: [],
        gallery_item_files: [],
    });

    const updateContentBatch = (mutate) => {
        const content = deepClone(data.content);
        mutate(content);
        setData('content', content);
    };

    const updateContent = (path, value) => {
        updateContentBatch((content) => {
            setAtPath(content, path, value);
        });
    };

    const addDualListItem = (idPath, enPath, idItem, enItem) => {
        updateContentBatch((content) => {
            const idList = getAtPath(content, idPath) || [];
            const enList = getAtPath(content, enPath) || [];
            setAtPath(content, idPath, [...idList, idItem]);
            setAtPath(content, enPath, [...enList, enItem]);
        });
    };

    const removeDualListItem = (idPath, enPath, index) => {
        updateContentBatch((content) => {
            const idList = getAtPath(content, idPath) || [];
            const enList = getAtPath(content, enPath) || [];
            setAtPath(content, idPath, idList.filter((_, i) => i !== index));
            setAtPath(content, enPath, enList.filter((_, i) => i !== index));
        });
    };

    const syncStatField = (index, key, value) => {
        updateContentBatch((content) => {
            setAtPath(content, `stats.id.${index}.${key}`, value);
            setAtPath(content, `stats.en.${index}.${key}`, value);
        });
    };

    const syncFeatureField = (index, key, value) => {
        updateContentBatch((content) => {
            setAtPath(content, `featureCards.id.${index}.${key}`, value);
            setAtPath(content, `featureCards.en.${index}.${key}`, value);
        });
    };

    const handleSave = () => {
        put('/admin/landing', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const updateGalleryFile = (index, file) => {
        const files = [...(data.gallery_item_files || [])];
        files[index] = file;
        setData('gallery_item_files', files);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            updateContent(`gallery.items.${index}.url`, previewUrl);
        }
    };

    const updateHeroImage = (file) => {
        setData('hero_image', file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            updateContent('media.heroImage.url', previewUrl);
        }
    };

    const updateAboutImage = (file) => {
        setData('about_image', file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            updateContent('media.aboutImage.url', previewUrl);
        }
    };

    const updateLogo = (file) => {
        setData('logo', file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            updateContent('media.logo.url', previewUrl);
        }
    };

    const content = data.content;
    const heroPreview = content?.media?.heroImage?.url || content?.media?.heroImage?.path;
    const aboutPreview = content?.media?.aboutImage?.url || content?.media?.aboutImage?.path;
    const logoPreview = content?.media?.logo?.url || content?.media?.logo?.path;
    const localizeValue = (value, fallback = '-') => {
        if (!value) {
            return fallback;
        }

        if (typeof value === 'string') {
            return value;
        }

        return value?.[lang] || value?.id || value?.en || fallback;
    };
    const getOlympiadBadgeTone = (label) => {
        const normalized = (label || '').toLowerCase();

        if (normalized.includes('berbayar') || normalized.includes('paid')) {
            return 'border-amber-200 bg-amber-50 text-amber-700';
        }

        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    };

    return (
        <>
            <Head title="Content Landing" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Content Landing</h1>
                        <p className="mt-1 text-sm text-slate-500">Kelola konten halaman Home</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageToggle value={lang} onChange={setLang} />
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
                    {lang === 'id' ? 'Sedang mengedit konten Bahasa Indonesia' : 'Currently editing English content'}
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                        Ada input yang perlu diperiksa sebelum menyimpan.
                    </div>
                )}

                {recentlySuccessful && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-600">
                        Konten berhasil disimpan.
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'hero' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Site Info" subtitle="Nama situs dan tagline" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FieldLabel required>Nama Site</FieldLabel>
                                    <input
                                        type="text"
                                        value={content.siteConfig.name || ''}
                                        onChange={(e) => updateContent('siteConfig.name', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Nama Singkat</FieldLabel>
                                    <input
                                        type="text"
                                        value={content.siteConfig.shortName || ''}
                                        onChange={(e) => updateContent('siteConfig.shortName', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <LocalizedField
                                    label="Tagline"
                                    value={content.siteConfig.tagline?.[lang]}
                                    onChange={(value) => updateContent(`siteConfig.tagline.${lang}`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Konten Program" subtitle="Label dan deskripsi program" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <LocalizedField
                                    label="Deskripsi Default"
                                    value={content.programContent?.[lang]?.fallbackDescription}
                                    onChange={(value) => updateContent(`programContent.${lang}.fallbackDescription`, value)}
                                    textarea
                                    rows={2}
                                />
                                <LocalizedField
                                    label="Label Jenjang"
                                    value={content.programContent?.[lang]?.levelLabel}
                                    onChange={(value) => updateContent(`programContent.${lang}.levelLabel`, value)}
                                />
                                <LocalizedField
                                    label="Label Pertemuan"
                                    value={content.programContent?.[lang]?.sessionsLabel}
                                    onChange={(value) => updateContent(`programContent.${lang}.sessionsLabel`, value)}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Hero Title & Deskripsi" subtitle="Judul dan deskripsi utama di hero" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.hero?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.hero.title`, value)}
                                    required
                                />
                                <LocalizedField
                                    label="Deskripsi"
                                    value={content.sectionTitles?.[lang]?.hero?.description}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.hero.description`, value)}
                                    textarea
                                    rows={3}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="CTA Hero" subtitle="Teks tombol di hero" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <LocalizedField
                                    label="CTA Primary"
                                    value={content.ctaButtons?.[lang]?.primary}
                                    onChange={(value) => updateContent(`ctaButtons.${lang}.primary`, value)}
                                />
                                <LocalizedField
                                    label="CTA Secondary"
                                    value={content.ctaButtons?.[lang]?.secondary}
                                    onChange={(value) => updateContent(`ctaButtons.${lang}.secondary`, value)}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Hero Badges" subtitle="Badge kecil di bawah CTA" />
                            <div className="space-y-3">
                                {(content.heroContent.badges?.[lang] || []).map((badge, index) => (
                                    <ItemCard
                                        key={`${lang}-badge-${index}`}
                                        title={badge.title || `Badge ${index + 1}`}
                                        onDelete={() => removeDualListItem('heroContent.badges.id', 'heroContent.badges.en', index)}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <LocalizedField
                                                label="Judul"
                                                value={badge.title}
                                                onChange={(value) => updateContent(`heroContent.badges.${lang}.${index}.title`, value)}
                                            />
                                            <LocalizedField
                                                label="Detail"
                                                value={badge.detail}
                                                onChange={(value) => updateContent(`heroContent.badges.${lang}.${index}.detail`, value)}
                                            />
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton
                                    label="Tambah Badge"
                                    onClick={() =>
                                        addDualListItem(
                                            'heroContent.badges.id',
                                            'heroContent.badges.en',
                                            { title: '', detail: '' },
                                            { title: '', detail: '' },
                                        )
                                    }
                                />
                            </div>
                        </Card>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card>
                                <CardHeader title="Panel Kiri" subtitle="Panel info kecil kiri hero" />
                                <div className="space-y-4">
                                    <LocalizedField
                                        label="Judul"
                                        value={content.heroContent.panels?.left?.[lang]?.title}
                                        onChange={(value) => updateContent(`heroContent.panels.left.${lang}.title`, value)}
                                    />
                                    <LocalizedField
                                        label="Subtitle"
                                        value={content.heroContent.panels?.left?.[lang]?.subtitle}
                                        onChange={(value) => updateContent(`heroContent.panels.left.${lang}.subtitle`, value)}
                                    />
                                </div>
                            </Card>
                            <Card>
                                <CardHeader title="Panel Kanan" subtitle="Panel info kecil kanan hero" />
                                <div className="space-y-4">
                                    <LocalizedField
                                        label="Judul"
                                        value={content.heroContent.panels?.right?.[lang]?.title}
                                        onChange={(value) => updateContent(`heroContent.panels.right.${lang}.title`, value)}
                                    />
                                    <LocalizedField
                                        label="Subtitle"
                                        value={content.heroContent.panels?.right?.[lang]?.subtitle}
                                        onChange={(value) => updateContent(`heroContent.panels.right.${lang}.subtitle`, value)}
                                    />
                                </div>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader title="Gambar Hero" subtitle="Upload foto utama di hero" />
                            <div className="space-y-4">
                                <ImageUpload
                                    label="Hero Image"
                                    description="Rekomendasi ukuran 1200x1500px."
                                    previewUrl={heroPreview}
                                    onChange={updateHeroImage}
                                    onClear={() => {
                                        setData('hero_image', null);
                                        updateContent('media.heroImage.path', null);
                                        updateContent('media.heroImage.url', null);
                                    }}
                                />
                                <LocalizedField
                                    label="Alt Text"
                                    value={content.media?.heroImage?.alt?.[lang]}
                                    onChange={(value) => updateContent(`media.heroImage.alt.${lang}`, value)}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'why' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section" subtitle="Judul dan subtitle Kenapa Memilih ALC" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.why?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.why.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.why?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.why.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.why?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.why.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Feature Cards" subtitle="Kartu fitur di section Why" />
                            <div className="space-y-3">
                                {(content.featureCards?.[lang] || []).map((feature, index) => (
                                    <ItemCard
                                        key={`${lang}-feature-${index}`}
                                        title={feature.title || `Feature ${index + 1}`}
                                        onDelete={() => removeDualListItem('featureCards.id', 'featureCards.en', index)}
                                    >
                                        <div className="space-y-4">
                                            <LocalizedField
                                                label="Judul"
                                                value={feature.title}
                                                onChange={(value) => updateContent(`featureCards.${lang}.${index}.title`, value)}
                                            />
                                            <LocalizedField
                                                label="Deskripsi"
                                                value={feature.description}
                                                onChange={(value) => updateContent(`featureCards.${lang}.${index}.description`, value)}
                                                textarea
                                                rows={2}
                                            />
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <SelectInput
                                                    label="Icon"
                                                    value={feature.icon}
                                                    onChange={(value) => syncFeatureField(index, 'icon', value)}
                                                    options={iconOptions}
                                                />
                                                <SelectInput
                                                    label="Tone"
                                                    value={feature.tone}
                                                    onChange={(value) => syncFeatureField(index, 'tone', value)}
                                                    options={toneOptions}
                                                />
                                            </div>
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton
                                    label="Tambah Feature"
                                    onClick={() =>
                                        addDualListItem(
                                            'featureCards.id',
                                            'featureCards.en',
                                            { title: '', description: '', icon: 'book', tone: 'violet' },
                                            { title: '', description: '', icon: 'book', tone: 'violet' },
                                        )
                                    }
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section" subtitle="Profil lembaga" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.profile?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.profile.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.profile?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.profile.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.profile?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.profile.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Tentang Kami" subtitle="Konten utama profil" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Judul"
                                    value={content.aboutContent?.[lang]?.title}
                                    onChange={(value) => updateContent(`aboutContent.${lang}.title`, value)}
                                />
                                <LocalizedField
                                    label="Deskripsi"
                                    value={content.aboutContent?.[lang]?.description}
                                    onChange={(value) => updateContent(`aboutContent.${lang}.description`, value)}
                                    textarea
                                    rows={4}
                                />
                                <LocalizedField
                                    label="Judul Nilai Utama"
                                    value={content.aboutContent?.[lang]?.valuesTitle}
                                    onChange={(value) => updateContent(`aboutContent.${lang}.valuesTitle`, value)}
                                />
                                <div className="space-y-2">
                                    {(content.aboutContent?.[lang]?.values || []).map((value, index) => (
                                        <div key={`${lang}-value-${index}`} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={value || ''}
                                                onChange={(e) => updateContent(`aboutContent.${lang}.values.${index}`, e.target.value)}
                                                className={inputClass}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeDualListItem('aboutContent.id.values', 'aboutContent.en.values', index)}
                                                className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <AddButton
                                        label="Tambah Nilai"
                                        onClick={() =>
                                            addDualListItem('aboutContent.id.values', 'aboutContent.en.values', '', '')
                                        }
                                    />
                                </div>
                                <LocalizedField
                                    label="Panel Title"
                                    value={content.aboutContent?.[lang]?.panelTitle}
                                    onChange={(value) => updateContent(`aboutContent.${lang}.panelTitle`, value)}
                                />
                                <LocalizedField
                                    label="Panel Subtitle"
                                    value={content.aboutContent?.[lang]?.panelSubtitle}
                                    onChange={(value) => updateContent(`aboutContent.${lang}.panelSubtitle`, value)}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Visi & Misi" subtitle="Konten visi dan misi" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Judul Visi"
                                    value={content.visionMission?.[lang]?.visionTitle}
                                    onChange={(value) => updateContent(`visionMission.${lang}.visionTitle`, value)}
                                />
                                <LocalizedField
                                    label="Isi Visi"
                                    value={content.visionMission?.[lang]?.vision}
                                    onChange={(value) => updateContent(`visionMission.${lang}.vision`, value)}
                                    textarea
                                    rows={2}
                                />
                                <LocalizedField
                                    label="Judul Misi"
                                    value={content.visionMission?.[lang]?.missionTitle}
                                    onChange={(value) => updateContent(`visionMission.${lang}.missionTitle`, value)}
                                />
                                <div className="space-y-2">
                                    {(content.visionMission?.[lang]?.missionList || []).map((item, index) => (
                                        <div key={`${lang}-mission-${index}`} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item || ''}
                                                onChange={(e) => updateContent(`visionMission.${lang}.missionList.${index}`, e.target.value)}
                                                className={inputClass}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeDualListItem('visionMission.id.missionList', 'visionMission.en.missionList', index)}
                                                className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <AddButton
                                        label="Tambah Misi"
                                        onClick={() =>
                                            addDualListItem('visionMission.id.missionList', 'visionMission.en.missionList', '', '')
                                        }
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Gambar Profil" subtitle="Foto di section profil" />
                            <div className="space-y-4">
                                <ImageUpload
                                    label="Profile Image"
                                    description="Rekomendasi ukuran 1200x1200px."
                                    previewUrl={aboutPreview}
                                    onChange={updateAboutImage}
                                    onClear={() => {
                                        setData('about_image', null);
                                        updateContent('media.aboutImage.path', null);
                                        updateContent('media.aboutImage.url', null);
                                    }}
                                />
                                <LocalizedField
                                    label="Alt Text"
                                    value={content.media?.aboutImage?.alt?.[lang]}
                                    onChange={(value) => updateContent(`media.aboutImage.alt.${lang}`, value)}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section" subtitle="Jenjang Pendidikan & Mata Pelajaran" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.education?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.education.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.education?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.education.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.education?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.education.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card>
                                <CardHeader title="Jenjang Pendidikan" subtitle="List jenjang pendidikan" />
                                <div className="space-y-4">
                                    <LocalizedField
                                        label="Judul"
                                        value={content.educationLevels?.[lang]?.title}
                                        onChange={(value) => updateContent(`educationLevels.${lang}.title`, value)}
                                    />
                                    <div className="space-y-2">
                                        {(content.educationLevels?.[lang]?.levels || []).map((level, index) => (
                                            <div key={`${lang}-level-${index}`} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={level || ''}
                                                    onChange={(e) => updateContent(`educationLevels.${lang}.levels.${index}`, e.target.value)}
                                                    className={inputClass}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeDualListItem('educationLevels.id.levels', 'educationLevels.en.levels', index)}
                                                    className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <AddButton
                                            label="Tambah Jenjang"
                                            onClick={() =>
                                                addDualListItem('educationLevels.id.levels', 'educationLevels.en.levels', '', '')
                                            }
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader title="Mata Pelajaran" subtitle="List mata pelajaran" />
                                <div className="space-y-4">
                                    <LocalizedField
                                        label="Judul"
                                        value={content.subjects?.[lang]?.title}
                                        onChange={(value) => updateContent(`subjects.${lang}.title`, value)}
                                    />
                                    <div className="space-y-2">
                                        {(content.subjects?.[lang]?.list || []).map((subject, index) => (
                                            <div key={`${lang}-subject-${index}`} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={subject || ''}
                                                    onChange={(e) => updateContent(`subjects.${lang}.list.${index}`, e.target.value)}
                                                    className={inputClass}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeDualListItem('subjects.id.list', 'subjects.en.list', index)}
                                                    className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <AddButton
                                            label="Tambah Mata Pelajaran"
                                            onClick={() =>
                                                addDualListItem('subjects.id.list', 'subjects.en.list', '', '')
                                            }
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'program' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section" subtitle="Program & Paket Belajar" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.program?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.program.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.program?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.program.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.program?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.program.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader
                                title="Data Program"
                                subtitle="Data ini diambil dari Master Data → Program."
                                actions={(
                                    <Link
                                        href="/admin/program"
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-4 sm:py-1.5 sm:text-xs"
                                    >
                                        Kelola Program
                                    </Link>
                                )}
                            />
                            <div className="space-y-3">
                                {programs.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Belum ada data program. Silakan isi di menu Program.
                                    </div>
                                )}
                                {programs.map((program) => (
                                    <div
                                        key={program.id}
                                        className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{program.name}</p>
                                                <p className="text-xs text-slate-500">{program.level || 'Semua Jenjang'}</p>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                                program.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {program.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        {program.description && (
                                            <p className="mt-2 text-xs text-slate-500">{program.description}</p>
                                        )}
                                        {Array.isArray(program.subjects) && program.subjects.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {program.subjects.map((subject) => (
                                                    <span key={`${program.id}-${subject}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section Galeri" subtitle="Judul dan subtitle galeri" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.gallery?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.gallery.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.gallery?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.gallery.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.gallery?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.gallery.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Foto Galeri" subtitle="Upload dan kelola foto galeri" />
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {(content.gallery?.items || []).map((item, index) => (
                                        <div
                                            key={`gallery-${index}`}
                                            className="rounded-xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                                <div className="h-24 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                    {(item.url || item.path || item.src) ? (
                                                        <img
                                                            src={item.url || item.path || item.src}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                                            Preview
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <FieldLabel>Foto</FieldLabel>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => updateGalleryFile(index, e.target.files?.[0] || null)}
                                                            className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                                                        />
                                                    </div>
                                                    <LocalizedField
                                                        label="Alt Text"
                                                        value={item.alt?.[lang]}
                                                        onChange={(value) => updateContent(`gallery.items.${index}.alt.${lang}`, value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateContent(
                                                                'gallery.items',
                                                                content.gallery.items.filter((_, i) => i !== index),
                                                            )
                                                        }
                                                        className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                                                    >
                                                        Hapus Foto
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <AddButton
                                        label="Tambah Foto"
                                        onClick={() =>
                                            updateContent('gallery.items', [
                                                ...(content.gallery?.items || []),
                                                { path: null, alt: { id: '', en: '' } },
                                            ])
                                        }
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Statistik" subtitle="Angka-angka pencapaian" />
                            <div className="space-y-3">
                                {(content.stats?.[lang] || []).map((stat, index) => (
                                    <ItemCard
                                        key={`${lang}-stat-${index}`}
                                        title={`${stat.value || '-'} - ${stat.label || ''}`}
                                        onDelete={() => removeDualListItem('stats.id', 'stats.en', index)}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <FieldLabel>Nilai</FieldLabel>
                                                <input
                                                    type="text"
                                                    value={stat.value || ''}
                                                    onChange={(e) => syncStatField(index, 'value', e.target.value)}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <LocalizedField
                                                label="Label"
                                                value={stat.label}
                                                onChange={(value) => updateContent(`stats.${lang}.${index}.label`, value)}
                                            />
                                            <SelectInput
                                                label="Icon"
                                                value={stat.icon}
                                                onChange={(value) => syncStatField(index, 'icon', value)}
                                                options={iconOptions}
                                            />
                                            <SelectInput
                                                label="Tone"
                                                value={stat.tone}
                                                onChange={(value) => syncStatField(index, 'tone', value)}
                                                options={toneOptions}
                                            />
                                        </div>
                                    </ItemCard>
                                ))}
                                <AddButton
                                    label="Tambah Statistik"
                                    onClick={() =>
                                        addDualListItem(
                                            'stats.id',
                                            'stats.en',
                                            { value: '', label: '', icon: 'users', tone: 'violet' },
                                            { value: '', label: '', icon: 'users', tone: 'violet' },
                                        )
                                    }
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'bank-soal' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Bank Soal" subtitle="Konten utama bank soal" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.bankSoalContent?.[lang]?.eyebrow}
                                    onChange={(value) => updateContent(`bankSoalContent.${lang}.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.bankSoalContent?.[lang]?.title}
                                    onChange={(value) => updateContent(`bankSoalContent.${lang}.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.bankSoalContent?.[lang]?.subtitle}
                                    onChange={(value) => updateContent(`bankSoalContent.${lang}.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <LocalizedField
                                        label="Offline Title"
                                        value={content.bankSoalContent?.[lang]?.offline?.title}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.offline.title`, value)}
                                    />
                                    <LocalizedField
                                        label="Offline Description"
                                        value={content.bankSoalContent?.[lang]?.offline?.description}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.offline.description`, value)}
                                        textarea
                                        rows={2}
                                    />
                                    <LocalizedField
                                        label="Online Title"
                                        value={content.bankSoalContent?.[lang]?.online?.title}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.online.title`, value)}
                                    />
                                    <LocalizedField
                                        label="Online Description"
                                        value={content.bankSoalContent?.[lang]?.online?.description}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.online.description`, value)}
                                        textarea
                                        rows={2}
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <LocalizedField
                                        label="Teks Lihat Detail"
                                        value={content.bankSoalContent?.[lang]?.viewDetail}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.viewDetail`, value)}
                                    />
                                    <LocalizedField
                                        label="Teks Filter All"
                                        value={content.bankSoalContent?.[lang]?.filterAll}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.filterAll`, value)}
                                    />
                                    <LocalizedField
                                        label="Label Jumlah Soal"
                                        value={content.bankSoalContent?.[lang]?.questionCount}
                                        onChange={(value) => updateContent(`bankSoalContent.${lang}.questionCount`, value)}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Passkey Bank Soal</FieldLabel>
                                    <input
                                        type="text"
                                        value={content.bankSoalPasskey || ''}
                                        onChange={(e) => updateContent('bankSoalPasskey', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Konten Halaman Bank Soal" subtitle="Judul dan deskripsi halaman bank soal" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <LocalizedField
                                    label="Judul Halaman"
                                    value={content.bankSoalPageContent?.[lang]?.title}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.title`, value)}
                                />
                                <LocalizedField
                                    label="Deskripsi Halaman"
                                    value={content.bankSoalPageContent?.[lang]?.description}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.description`, value)}
                                    textarea
                                    rows={2}
                                />
                                <LocalizedField
                                    label="Placeholder Pencarian"
                                    value={content.bankSoalPageContent?.[lang]?.searchPlaceholder}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.searchPlaceholder`, value)}
                                />
                                <LocalizedField
                                    label="Teks Tidak Ada Data"
                                    value={content.bankSoalPageContent?.[lang]?.noResults}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.noResults`, value)}
                                />
                                <LocalizedField
                                    label="Teks Kembali"
                                    value={content.bankSoalPageContent?.[lang]?.backToHome}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.backToHome`, value)}
                                />
                                <LocalizedField
                                    label="Teks Semua Format"
                                    value={content.bankSoalPageContent?.[lang]?.formatAll}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.formatAll`, value)}
                                />
                                <LocalizedField
                                    label="Teks Semua Kategori"
                                    value={content.bankSoalPageContent?.[lang]?.categoryAll}
                                    onChange={(value) => updateContent(`bankSoalPageContent.${lang}.categoryAll`, value)}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader
                                title="Item Bank Soal"
                                subtitle="Data ini diambil dari Master Data → Bank Soal."
                                actions={(
                                    <Link
                                        href="/admin/bank-soal"
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-4 sm:py-1.5 sm:text-xs"
                                    >
                                        Kelola Bank Soal
                                    </Link>
                                )}
                            />
                            <div className="space-y-3">
                                {bankSoalItems.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Belum ada item bank soal. Silakan isi di menu Bank Soal.
                                    </div>
                                )}
                                {bankSoalItems.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{item.name?.[lang] || item.name?.id || item.slug}</p>
                                                <p className="text-xs text-slate-500">
                                                    {item.category?.[lang] || item.category?.id || '-'} · {item.level?.[lang] || item.level?.id || '-'}
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                {item.format || '-'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">{item.questions ?? 0} soal</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'olimpiade' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section Olimpiade" subtitle="Judul dan subtitle section Olimpiade" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.olympiad?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.olympiad.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.olympiad?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.olympiad.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.olympiad?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.olympiad.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Konten Kartu Olimpiade" subtitle="Konten untuk box gratis dan berbayar" />
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                                        Gratis
                                    </p>
                                    <LocalizedField
                                        label="Badge"
                                        value={content.olympiadContent?.[lang]?.free?.badge}
                                        onChange={(value) => updateContent(`olympiadContent.${lang}.free.badge`, value)}
                                    />
                                    <LocalizedField
                                        label="Judul"
                                        value={content.olympiadContent?.[lang]?.free?.title}
                                        onChange={(value) => updateContent(`olympiadContent.${lang}.free.title`, value)}
                                    />
                                    <LocalizedField
                                        label="Deskripsi"
                                        value={content.olympiadContent?.[lang]?.free?.description}
                                        onChange={(value) => updateContent(`olympiadContent.${lang}.free.description`, value)}
                                        textarea
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                                        Berbayar
                                    </p>
                                    <LocalizedField
                                        label="Badge"
                                        value={content.olympiadContent?.[lang]?.paid?.badge}
                                        onChange={(value) => updateContent(`olympiadContent.${lang}.paid.badge`, value)}
                                    />
                                    <LocalizedField
                                        label="Judul"
                                        value={content.olympiadContent?.[lang]?.paid?.title}
                                        onChange={(value) => updateContent(`olympiadContent.${lang}.paid.title`, value)}
                                    />
                                    <LocalizedField
                                        label="Deskripsi"
                                        value={content.olympiadContent?.[lang]?.paid?.description}
                                        onChange={(value) => updateContent(`olympiadContent.${lang}.paid.description`, value)}
                                        textarea
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardHeader
                                title="Item Olimpiade"
                                subtitle="Data ini diambil dari Master Data -> Olimpiade."
                                actions={(
                                    <Link
                                        href="/admin/olimpiade"
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-4 sm:py-1.5 sm:text-xs"
                                    >
                                        Kelola Olimpiade
                                    </Link>
                                )}
                            />
                            <div className="space-y-3">
                                {olympiadHighlights.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Belum ada item olimpiade. Silakan isi di menu Olimpiade.
                                    </div>
                                )}
                                {olympiadHighlights.map((item) => {
                                    const name = localizeValue(item.name, item.slug || '-');
                                    const level = localizeValue(item.level);
                                    const schedule = localizeValue(item.schedule);
                                    const categoryLabel = localizeValue(item.category);

                                    return (
                                        <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {level} - {schedule}
                                                    </p>
                                                </div>
                                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getOlympiadBadgeTone(categoryLabel)}`}>
                                                    {categoryLabel}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'cta' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section Pendaftaran" subtitle="Judul dan subtitle CTA pendaftaran" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.register?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.register.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.register?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.register.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.register?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.register.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="CTA Buttons" subtitle="Teks tombol CTA lain" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <LocalizedField
                                    label="CTA Pendaftaran Murid"
                                    value={content.ctaButtons?.[lang]?.studentRegister}
                                    onChange={(value) => updateContent(`ctaButtons.${lang}.studentRegister`, value)}
                                />
                                <LocalizedField
                                    label="CTA Pendaftaran Pengajar"
                                    value={content.ctaButtons?.[lang]?.teacherRegister}
                                    onChange={(value) => updateContent(`ctaButtons.${lang}.teacherRegister`, value)}
                                />
                                <LocalizedField
                                    label="CTA Lihat Peta"
                                    value={content.ctaButtons?.[lang]?.viewMap}
                                    onChange={(value) => updateContent(`ctaButtons.${lang}.viewMap`, value)}
                                />
                                <LocalizedField
                                    label="CTA Detail Olimpiade"
                                    value={content.ctaButtons?.[lang]?.viewOlympiad}
                                    onChange={(value) => updateContent(`ctaButtons.${lang}.viewOlympiad`, value)}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader title="Judul Section Kontak" subtitle="Judul dan subtitle kontak" />
                            <div className="space-y-4">
                                <LocalizedField
                                    label="Eyebrow"
                                    value={content.sectionTitles?.[lang]?.contact?.eyebrow}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.contact.eyebrow`, value)}
                                />
                                <LocalizedField
                                    label="Judul"
                                    value={content.sectionTitles?.[lang]?.contact?.title}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.contact.title`, value)}
                                />
                                <LocalizedField
                                    label="Subtitle"
                                    value={content.sectionTitles?.[lang]?.contact?.subtitle}
                                    onChange={(value) => updateContent(`sectionTitles.${lang}.contact.subtitle`, value)}
                                    textarea
                                    rows={2}
                                />
                            </div>
                        </Card>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card>
                                <CardHeader title="Sosial Media" subtitle="Kontak dan social link" />
                                <div className="space-y-3">
                                    {(content.contactInfo.socials || []).map((social, index) => (
                                        <ItemCard
                                            key={social.key || `social-${index}`}
                                            title={social.label?.[lang] || social.key || `Sosial ${index + 1}`}
                                            onDelete={() =>
                                                updateContent(
                                                    'contactInfo.socials',
                                                    content.contactInfo.socials.filter((_, i) => i !== index),
                                                )
                                            }
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <FieldLabel>Key</FieldLabel>
                                                    <input
                                                        type="text"
                                                        value={social.key || ''}
                                                        onChange={(e) => updateContent(`contactInfo.socials.${index}.key`, e.target.value)}
                                                        className={inputClass}
                                                        placeholder="contoh: facebook"
                                                    />
                                                </div>
                                                <LocalizedField
                                                    label="Label"
                                                    value={social.label?.[lang]}
                                                    onChange={(value) => updateContent(`contactInfo.socials.${index}.label.${lang}`, value)}
                                                />
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <FieldLabel>Value</FieldLabel>
                                                        <input
                                                            type="text"
                                                            value={social.value || ''}
                                                            onChange={(e) => updateContent(`contactInfo.socials.${index}.value`, e.target.value)}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FieldLabel>Link</FieldLabel>
                                                        <input
                                                            type="text"
                                                            value={social.link || ''}
                                                            onChange={(e) => updateContent(`contactInfo.socials.${index}.link`, e.target.value)}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <SelectInput
                                                        label="Icon"
                                                        value={social.icon}
                                                        onChange={(value) => updateContent(`contactInfo.socials.${index}.icon`, value)}
                                                        options={iconOptions}
                                                    />
                                                    <SelectInput
                                                        label="Tone"
                                                        value={social.tone}
                                                        onChange={(value) => updateContent(`contactInfo.socials.${index}.tone`, value)}
                                                        options={toneOptions}
                                                    />
                                                </div>
                                            </div>
                                        </ItemCard>
                                    ))}
                                    <AddButton
                                        label="Tambah Sosial"
                                        onClick={() =>
                                            updateContent('contactInfo.socials', [
                                                ...(content.contactInfo.socials || []),
                                                {
                                                    key: '',
                                                    label: { id: '', en: '' },
                                                    value: '',
                                                    link: '',
                                                    icon: 'phone',
                                                    tone: 'slate',
                                                },
                                            ])
                                        }
                                    />
                                </div>
                            </Card>

                            <Card>
                                <CardHeader title="Alamat & Jam Operasional" subtitle="Alamat dan jam layanan" />
                                <div className="space-y-4">
                                    <LocalizedField
                                        label="Alamat"
                                        value={content.contactInfo.address?.[lang]}
                                        onChange={(value) => updateContent(`contactInfo.address.${lang}`, value)}
                                        textarea
                                        rows={2}
                                    />
                                    <div>
                                        <FieldLabel>Map Link</FieldLabel>
                                        <input
                                            type="text"
                                            value={content.contactInfo.address?.mapLink || ''}
                                            onChange={(e) => updateContent('contactInfo.address.mapLink', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <LocalizedField
                                        label="Jam Kerja (Weekday)"
                                        value={content.operatingHours?.[lang]?.weekday}
                                        onChange={(value) => updateContent(`operatingHours.${lang}.weekday`, value)}
                                    />
                                    <LocalizedField
                                        label="Jam Kerja (Weekend)"
                                        value={content.operatingHours?.[lang]?.weekend}
                                        onChange={(value) => updateContent(`operatingHours.${lang}.weekend`, value)}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'logo' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader
                                title="Logo Website"
                                subtitle="Logo ini digunakan di navbar & footer halaman publik, serta sidebar admin dashboard."
                            />
                            <ImageUpload
                                label="Upload Logo"
                                description="Format: JPG, PNG, SVG. Maks 3MB. Rekomendasi: gambar persegi atau transparan."
                                previewUrl={logoPreview}
                                onChange={updateLogo}
                                onClear={() => {
                                    setData('logo', null);
                                    updateContent('media.logo', { url: null, path: null });
                                }}
                            />
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
