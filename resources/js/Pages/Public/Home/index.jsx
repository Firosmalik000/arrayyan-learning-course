import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
    ProgramCard,
    Accordion,
} from '@/Components/Public';

// Shared data
import { fadeUp, stagger, icons, toneStyles } from '@/data';
import { siteConfig, stats } from '@/data/content/site';

// Page-specific data
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
    olympiadContent,
    sectionTitles,
    learningJourney,
    testimonials,
    faqs,
    ctaButtons,
} from './data';
import { olympiadPasskey } from '../Olympiad/data';

export default function Home({ landingContent }) {
    const { language } = useI18n();
    const { seoSettings } = usePage().props;
    const shouldReduceMotion = useReducedMotion();

    const seoContact = seoSettings?.contact || {};

    const [showBankSoalPasskey, setShowBankSoalPasskey] = useState(false);
    const [bankSoalTargetUrl, setBankSoalTargetUrl] = useState('');
    const [showOlympiadPasskey, setShowOlympiadPasskey] = useState(false);
    const [olympiadTargetUrl, setOlympiadTargetUrl] = useState('');
    const galleryRef = useRef(null);

    const handleBankSoalClick = (format) => {
        const hasAccess = sessionStorage.getItem('banksoal_access') === 'granted';
        if (hasAccess) {
            window.location.href = `/bank-soal?format=${format}`;
        } else {
            setBankSoalTargetUrl(`/bank-soal?format=${format}`);
            setShowBankSoalPasskey(true);
        }
    };

    const handleOlympiadClick = (category) => {
        const hasAccess = sessionStorage.getItem('olympiad_access') === 'granted';
        if (hasAccess) {
            window.location.href = `/olimpiade?category=${category}`;
        } else {
            setOlympiadTargetUrl(`/olimpiade?category=${category}`);
            setShowOlympiadPasskey(true);
        }
    };

    const scrollGallery = (direction) => {
        if (!galleryRef.current) return;
        const scrollAmount = galleryRef.current.clientWidth * 0.8;
        galleryRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
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

    const localizeField = (value, lang) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        const localized = value[lang] ?? value.id ?? value.en ?? '';
        if (localized && typeof localized === 'object') {
            return localized[lang] ?? localized.id ?? localized.en ?? '';
        }
        return localized;
    };

    const localizeDeep = (value, lang) => {
        if (Array.isArray(value)) {
            return value.map((item) => localizeDeep(item, lang));
        }
        if (!value || typeof value !== 'object') {
            return value;
        }
        const keys = Object.keys(value);
        const isLocalizedLeaf = keys.length > 0 && keys.every((key) => key === 'id' || key === 'en');
        if (isLocalizedLeaf) {
            return localizeDeep(value[lang] ?? value.id ?? value.en ?? '', lang);
        }
        return keys.reduce((result, key) => {
            result[key] = localizeDeep(value[key], lang);
            return result;
        }, {});
    };

    const localizeList = (value, lang) => {
        if (!value) return [];
        if (Array.isArray(value)) return value.map((item) => localizeDeep(item, lang));
        return localizeDeep(value[lang] || value.id || [], lang);
    };

    const defaultContent = {
        siteConfig,
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
        olympiadContent,
        bankSoalItems: [],
        sectionTitles,
        learningJourney,
        testimonials,
        faqs,
        ctaButtons,
        packages: [],
        olympiadHighlights: [],
        gallery: {
            items: [],
        },
        media: {
            heroImage: { url: null, alt: { id: 'Siswa ALC', en: 'ALC student' } },
            aboutImage: { url: null, alt: { id: 'Kelas ALC', en: 'ALC class' } },
        },
    };

    const landing = mergeContent(defaultContent, landingContent || {});

    const socialCards = localizeList(seoContact.socials?.length ? seoContact.socials : [], language);

    const t = localizeDeep(landing.sectionTitles[language] || landing.sectionTitles.id, language);
    const cta = localizeDeep(landing.ctaButtons[language] || landing.ctaButtons.id, language);
    const about = localizeDeep(landing.aboutContent[language] || landing.aboutContent.id, language);
    const vm = localizeDeep(landing.visionMission[language] || landing.visionMission.id, language);
    const levels = localizeDeep(landing.educationLevels[language] || landing.educationLevels.id, language);
    const subj = localizeDeep(landing.subjects[language] || landing.subjects.id, language);
    const programContentText = localizeDeep(landing.programContent[language] || landing.programContent.id, language);
    const bank = localizeDeep(landing.bankSoalContent[language] || landing.bankSoalContent.id, language);
    const olympiad = localizeDeep(landing.olympiadContent[language] || landing.olympiadContent.id, language);
    const journeyItems = localizeList(landing.learningJourney || learningJourney, language);
    const testimonialItems = localizeList(landing.testimonials || testimonials, language);
    const faqItems = localizeList(landing.faqs || faqs, language);

    const hours = {
        weekday: localizeField(seoContact.operatingHours?.weekday, language) || 'Sen - Jum: 08:00 - 20:00',
        weekend: localizeField(seoContact.operatingHours?.weekend, language) || 'Sabtu: 08:00 - 16:00',
    };

    const contactAddress = {
        text: localizeField(seoContact.address?.full, language) || 'Jl. Pendidikan Islami No. 8, Bandung, Jawa Barat 40123',
        mapLink: seoContact.address?.mapLink || 'https://maps.google.com',
    };

    const badges = localizeList(landing.heroContent.badges[language] || landing.heroContent.badges.id, language);
    const heroPanel = {
        left: localizeDeep(landing.heroContent.panels.left[language] || landing.heroContent.panels.left.id, language),
        right: localizeDeep(landing.heroContent.panels.right[language] || landing.heroContent.panels.right.id, language),
    };

    const features = localizeList(landing.featureCards[language] || landing.featureCards.id, language);
    const statItems = localizeList(landing.stats[language] || landing.stats.id, language);
    const programSource = Array.isArray(landing.programs) ? landing.programs : [];
    const siteTitle = localizeField(landing.siteConfig?.name, language) || siteConfig.name;

    const programPreview = programSource.slice(0, 3);
    const heroImageUrl = landing.media?.heroImage?.url || landing.media?.heroImage?.path || '/images/hero-student.jpg';
    const aboutImageUrl = landing.media?.aboutImage?.url || landing.media?.aboutImage?.path || '/images/about-class.jpg';
    const heroImageAlt = localizeField(landing.media?.heroImage?.alt, language) || (language === 'en' ? 'ALC student' : 'Siswa ALC');
    const aboutImageAlt = localizeField(landing.media?.aboutImage?.alt, language) || (language === 'en' ? 'ALC class' : 'Kelas ALC');
    const galleryItems = landing.gallery?.items || [];

    return (
        <>
            <SeoHead title={siteTitle} type="website" />

            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/60 via-white to-slate-50/40 pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-28">
                {/* Background decorative glows */}
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-full max-w-7xl">
                    <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
                    <div className="absolute right-10 top-12 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl" />
                </div>

                <Container>
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
                        {/* Left Hero Content */}
                        <div className="flex flex-col lg:col-span-7">
                            {/* Eyebrow Pill */}
                            <div className="inline-flex items-center gap-2 self-start rounded-full bg-violet-100/80 px-3.5 py-1.5 text-xs font-semibold text-brand-primary backdrop-blur-xs border border-violet-200/60 shadow-2xs">
                                <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                                <span>Bimbingan Belajar Personal & Berkarakter</span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                                {t.hero?.title || (
                                    <>
                                        Dampingi Tumbuh Kembang Akademik & Karakter Mulia{' '}
                                        <span className="text-brand-primary underline decoration-violet-300 decoration-wavy underline-offset-4">
                                            Buah Hati Anda
                                        </span>
                                    </>
                                )}
                            </h1>

                            {/* Subtitle */}
                            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                                {t.hero?.description ||
                                    'Bimbingan belajar dengan pendekatan ramah, sabar, dan terarah. Membantu siswa memahami pelajaran secara mendalam, siap ujian, serta membentuk adab dan kecintaan belajar.'}
                            </p>

                            {/* CTA Action Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                                <Button
                                    href="/pendaftaran"
                                    variant="primary"
                                    size="lg"
                                    iconRight={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    }
                                >
                                    {cta.primary || 'Daftar Siswa Baru'}
                                </Button>

                                <Button href="/program" variant="outline" size="lg">
                                    {cta.secondary || 'Jelajahi Program'}
                                </Button>
                            </div>

                            {/* Trust Badges Row */}
                            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {badges.map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{badge.title}</p>
                                            <p className="text-[11px] text-slate-500">{badge.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Hero Visual Card */}
                        <div className="relative lg:col-span-5 flex justify-center">
                            <div className="relative w-full max-w-md lg:max-w-none">
                                {/* Frame with subtle ambient glow */}
                                <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border-2 border-white/80 bg-gradient-to-br from-violet-100 via-amber-50 to-slate-100 shadow-2xl">
                                    <img
                                        src={heroImageUrl}
                                        alt={heroImageAlt}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            if (e.currentTarget.nextSibling) {
                                                e.currentTarget.nextSibling.style.display = 'flex';
                                            }
                                        }}
                                    />
                                    <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/90 to-purple-800/90 p-8 text-center text-white">
                                        <div>
                                            <p className="font-display text-2xl font-bold">Ar Rayyan Learning Course</p>
                                            <p className="mt-2 text-sm text-violet-200">Suasana belajar hangat, interaktif, dan berkarakter.</p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                </div>

                                {/* Floating Stat Panel 1: Left Bottom */}
                                <div className="absolute -left-3 sm:-left-6 -bottom-4 sm:-bottom-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-brand-primary">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{heroPanel.left?.title || '15+ Kelas Aktif'}</p>
                                        <p className="text-[11px] font-medium text-slate-500">{heroPanel.left?.subtitle || 'Senin - Sabtu'}</p>
                                    </div>
                                </div>

                                {/* Floating Stat Panel 2: Right Top */}
                                <div className="absolute -right-3 sm:-right-6 top-6 sm:top-8 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{heroPanel.right?.title || '98% Orang Tua'}</p>
                                        <p className="text-[11px] font-medium text-slate-500">{heroPanel.right?.subtitle || 'Puas dengan Progres'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 2. STATS & IMPACT METRICS STRIP */}
            <section className="relative -mt-6 z-20">
                <Container>
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-slate-100">
                            {statItems.map((item, index) => (
                                <div key={index} className="flex flex-col items-center text-center px-2 sm:px-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-brand-primary mb-3">
                                        {icons[item.icon] || icons.trophy}
                                    </div>
                                    <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {item.value}
                                    </span>
                                    <span className="mt-1 text-xs font-medium text-slate-500">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* 3. WHY CHOOSE US (KEUNGGULAN ALC) */}
            <section className="py-20 sm:py-24 bg-white">
                <Container>
                    <SectionHeader
                        eyebrow={t.why?.eyebrow || 'Keunggulan ALC'}
                        title={t.why?.title || 'Mengapa Mempercayakan Belajar Anak Bersama Kami?'}
                        subtitle={t.why?.subtitle || 'Fondasi metode bimbingan teruji yang menggabungkan penguasaan akademik dengan pembentukan karakter mulia.'}
                    />

                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                        {features.map((feature, idx) => {
                            const iconColors = [
                                'bg-violet-100 text-brand-primary border-violet-200',
                                'bg-amber-100 text-amber-700 border-amber-200',
                                'bg-emerald-100 text-emerald-700 border-emerald-200',
                            ];
                            const currentTone = iconColors[idx % iconColors.length];

                            return (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
                                >
                                    <div>
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-2xs ${currentTone}`}>
                                            {icons[feature.icon] || icons.book}
                                        </div>
                                        <h3 className="mt-6 font-display text-xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-brand-primary">
                                        <span>Pendekatan Berkarakter</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* 4. PROFIL & VISI MISI LEMBAGA */}
            <section id="profil" className="py-20 sm:py-24 bg-slate-50/70 border-y border-slate-200/60">
                <Container>
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        {/* Left Column: Image with badges */}
                        <div className="relative lg:col-span-5">
                            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border-2 border-white bg-slate-200 shadow-xl">
                                <img
                                    src={aboutImageUrl}
                                    alt={aboutImageAlt}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextSibling) {
                                            e.currentTarget.nextSibling.style.display = 'flex';
                                        }
                                    }}
                                />
                                <div className="hidden h-full w-full items-center justify-center bg-violet-700 text-white p-6 text-center">
                                    <p className="font-bold">Dokumentasi Belajar ALC</p>
                                </div>
                            </div>

                            <div className="absolute -bottom-5 right-4 sm:-right-4 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                                <p className="text-xs font-bold text-slate-900">{about.panelTitle || '25+ Aktivitas Belajar'}</p>
                                <p className="text-[11px] font-medium text-slate-500">{about.panelSubtitle || 'Per Pekan Bersama ALC'}</p>
                            </div>
                        </div>

                        {/* Right Column: About details */}
                        <div className="flex flex-col lg:col-span-7">
                            <SectionHeader
                                align="left"
                                eyebrow={t.profile?.eyebrow || 'Tentang Kami'}
                                title={about.title || 'Mengenal Ar Rayyan Learning Course'}
                                subtitle={null}
                                className="mb-4"
                            />

                            <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                {about.description}
                            </div>

                            {/* Core Values */}
                            <div className="mt-6">
                                <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900">
                                    {about.valuesTitle || 'Nilai Utama Kami'}
                                </h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(about.values || []).map((val, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/70 border border-violet-200/80 px-3.5 py-1 text-xs font-semibold text-brand-primary"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{val}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Visi & Misi Box */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-primary mb-2">
                                        <span className="h-2 w-2 rounded-full bg-brand-primary" />
                                        <span>{vm.visionTitle || 'Visi'}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {vm.vision}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-600 mb-2">
                                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span>{vm.missionTitle || 'Misi'}</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                                        {(vm.missionList || []).slice(0, 3).map((m, i) => (
                                            <li key={i} className="flex items-start gap-1.5">
                                                <span className="text-amber-500 font-bold">•</span>
                                                <span>{m}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 5. JENJANG & MATA PELAJARAN */}
            <section className="py-20 sm:py-24 bg-white">
                <Container>
                    <SectionHeader
                        eyebrow={t.education?.eyebrow || 'Jenjang & Mata Pelajaran'}
                        title={t.education?.title || 'Program Belajar Lengkap dari Usia Dini hingga SMA'}
                        subtitle={t.education?.subtitle || 'Kurikulum yang disesuaikan dengan tahapan kognitif anak untuk memastikan pemahaman konsep yang kokoh.'}
                    />

                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Levels Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-violet-50/40 via-white to-slate-50 p-6 sm:p-8 shadow-xs">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-brand-primary">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-slate-900">{levels.title}</h3>
                                    <p className="text-xs text-slate-500">Tersedia kelas reguler dan privat</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {(levels.levels || []).map((lvl, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-2xs transition hover:border-violet-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-bold text-brand-primary">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">{lvl}</span>
                                        </div>
                                        <Badge variant="neutral" size="xs">Aktif</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subjects Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 p-6 sm:p-8 shadow-xs">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-slate-900">{subj.title}</h3>
                                    <p className="text-xs text-slate-500">Materi disesuaikan kurikulum nasional</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                {(subj.list || []).map((subject, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs transition hover:border-amber-400 hover:text-amber-800 hover:bg-amber-50/50"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        <span>{subject}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 6. PROGRAM UNGGULAN (HIGHLIGHT DARI DATABASE) */}
            <section id="program" className="py-20 sm:py-24 bg-slate-50/60 border-t border-slate-200/60">
                <Container>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
                        <SectionHeader
                            align="left"
                            eyebrow={t.program?.eyebrow || 'Program Pilihan'}
                            title={t.program?.title || 'Program Belajar Unggulan ALC'}
                            subtitle={t.program?.subtitle || 'Pilihan paket bimbingan belajar terfavorit yang dirancang sesuai target prestasi siswa.'}
                            className="max-w-2xl"
                        />
                        <Button href="/program" variant="outline" size="md" className="shrink-0">
                            Lihat Semua Program ({programSource.length})
                        </Button>
                    </div>

                    {programPreview.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {programPreview.map((item) => (
                                <ProgramCard
                                    key={item.id}
                                    program={item}
                                    language={language}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                            Program bimbingan belajar akan segera diperbarui.
                        </div>
                    )}
                </Container>
            </section>

            {/* 7. BANK SOAL & PUSAT OLIMPIADE SHOWCASE */}
            <section className="py-20 sm:py-24 bg-white">
                <Container>
                    <SectionHeader
                        eyebrow="Fasilitas Siswa"
                        title="Dukungan Belajar Eksklusif & Pembinaan Prestasi"
                        subtitle="Akses ribuan bank soal ujian berkualitas dan pembinaan intensif untuk ajang olimpiade sains & matematika."
                    />

                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Bank Soal Card */}
                        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-7 sm:p-8 shadow-xs">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <Badge variant="accent">Bank Soal Terintegrasi</Badge>
                                    <span className="text-xs text-slate-400 font-medium">Khusus Siswa & Pengajar</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-slate-900">
                                    {bank.title || 'Bank Soal & Latihan Ujian'}
                                </h3>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                    {bank.subtitle || 'Kumpulan soal latihan terlengkap untuk ulangan harian, Asesmen Nasional (ANBK), dan ujian masuk sekolah favorit.'}
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-xl bg-white border border-slate-200/70 p-3 shadow-2xs">
                                        <p className="font-bold text-slate-800">Modul PDF Cetak</p>
                                        <p className="text-slate-500 mt-0.5">Siap diunduh dan dipelajari</p>
                                    </div>
                                    <div className="rounded-xl bg-white border border-slate-200/70 p-3 shadow-2xs">
                                        <p className="font-bold text-slate-800">Latihan Online</p>
                                        <p className="text-slate-500 mt-0.5">Simulasi berbasis komputer</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleBankSoalClick('all')}
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                    <span>Buka Bank Soal</span>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                                <Link href="/bank-soal" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                                    Info Selengkapnya
                                </Link>
                            </div>
                        </div>

                        {/* Olimpiade Card */}
                        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 p-7 sm:p-8 shadow-xs">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <Badge variant="warning">Pusat Prestasi Siswa</Badge>
                                    <span className="text-xs text-slate-400 font-medium">Terbuka & Berprestasi</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-slate-900">
                                    {olympiad.title || 'Informasi Olimpiade & Lomba'}
                                </h3>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                    {olympiad.subtitle || 'Dapatkan informasi kompetisi terkini dari tingkat kota hingga nasional beserta modul persiapan eksklusif dari para mentor ALC.'}
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-xl bg-white border border-slate-200/70 p-3 shadow-2xs">
                                        <p className="font-bold text-slate-800">Kompetisi Gratis</p>
                                        <p className="text-slate-500 mt-0.5">Asah bakat tanpa biaya pendaftaran</p>
                                    </div>
                                    <div className="rounded-xl bg-white border border-slate-200/70 p-3 shadow-2xs">
                                        <p className="font-bold text-slate-800">Bimbingan Khusus</p>
                                        <p className="text-slate-500 mt-0.5">Intensif OSN & KSM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOlympiadClick('all')}
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition"
                                >
                                    <span>Jelajahi Olimpiade</span>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                                <Link href="/olimpiade" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                                    Jadwal Lomba
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 8. GALERI KEGIATAN SISWA */}
            <section className="py-20 sm:py-24 bg-slate-50/60 border-t border-slate-200/60">
                <Container>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                        <SectionHeader
                            align="left"
                            eyebrow={t.gallery?.eyebrow || 'Galeri Kegiatan'}
                            title={t.gallery?.title || 'Momen Belajar Hangat & Menyenangkan di ALC'}
                            subtitle={t.gallery?.subtitle || 'Dokumentasi interaksi siswa dan tutor dalam menciptakan suasana belajar yang nyaman.'}
                            className="max-w-2xl"
                        />
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => scrollGallery(-1)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-violet-300 hover:text-brand-primary transition"
                                aria-label="Sebelumnya"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollGallery(1)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-violet-300 hover:text-brand-primary transition"
                                aria-label="Berikutnya"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div
                        ref={galleryRef}
                        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
                    >
                        {galleryItems.length > 0 ? (
                            galleryItems.map((item, index) => {
                                const src = item.url || item.path || item.src;
                                const alt = localizeField(item.alt, language) || `Galeri ALC ${index + 1}`;
                                if (!src) return null;
                                return (
                                    <div
                                        key={index}
                                        className="group relative min-w-[260px] sm:min-w-[320px] aspect-4/3 shrink-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs snap-start transition hover:shadow-lg"
                                    >
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-xs font-semibold text-white">{alt}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            [1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="min-w-[260px] sm:min-w-[300px] aspect-4/3 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center shadow-xs text-slate-400"
                                >
                                    <svg className="h-10 w-10 text-violet-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <p className="text-xs font-semibold text-slate-600">Suasana Belajar ALC</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Kelas Aktif & Interaktif</p>
                                </div>
                            ))
                        )}
                    </div>
                </Container>
            </section>

            {/* 8.2. METODOLOGI & ALUR BELAJAR (LEARNING JOURNEY) */}
            <section className="py-20 sm:py-24 bg-white border-t border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow={t.journey?.eyebrow || 'Metode & Alur Belajar'}
                        title={t.journey?.title || '4 Langkah Pendampingan Belajar di ALC'}
                        subtitle={t.journey?.subtitle || 'Alur terstruktur dan terukur untuk memastikan setiap anak berkembang dengan bahagia dan berprestasi.'}
                    />

                    <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
                        {journeyItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 p-7 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-display text-3xl font-extrabold text-violet-300 group-hover:text-brand-primary transition-colors">
                                        {item.step}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-violet-100/90 border border-violet-200 px-3 py-0.5 text-xs font-bold text-brand-primary shadow-2xs">
                                        {item.badge}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                    <span>Langkah {idx + 1} dari 4</span>
                                    <svg className="h-4 w-4 text-violet-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* 8.4. KISAH SUKSES & TESTIMONI ORANG TUA */}
            <section className="py-20 sm:py-24 bg-slate-50/70 border-t border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow={t.testimonials?.eyebrow || 'Cerita Orang Tua'}
                        title={t.testimonials?.title || 'Kisah Sukses & Kepercayaan Keluarga ALC'}
                        subtitle={t.testimonials?.subtitle || 'Dukungan nyata kami yang telah membantu ratusan siswa mencapai potensi terbaik dan prestasi impian.'}
                    />

                    <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
                        {testimonialItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div>
                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(item.rating || 5)].map((_, i) => (
                                            <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                            {item.highlight}
                                        </span>
                                    </div>

                                    {/* Quote */}
                                    <p className="mt-5 text-sm sm:text-base italic text-slate-700 leading-relaxed font-sans">
                                        "{item.quote}"
                                    </p>
                                </div>

                                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-3.5">
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-200"
                                    />
                                    <div>
                                        <h4 className="font-display text-sm font-bold text-slate-900 leading-tight">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-brand-primary font-medium mt-0.5">
                                            {item.student}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {item.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* 8.6. PERTANYAAN SERING DIAJUKAN (FAQ ACCORDION) */}
            <section className="py-20 sm:py-24 bg-white border-t border-slate-200/60">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-5">
                            <SectionHeader
                                align="left"
                                eyebrow={t.faqs?.eyebrow || 'Tanya Jawab'}
                                title={t.faqs?.title || 'Pertanyaan yang Sering Diajukan'}
                                subtitle={t.faqs?.subtitle || 'Jawaban lengkap atas pertanyaan yang paling sering diajukan orang tua sebelum memulai bimbingan.'}
                                className="mb-6"
                            />

                            <div className="rounded-3xl border border-violet-100 bg-violet-50/60 p-6 sm:p-7 text-slate-700 shadow-2xs">
                                <h4 className="font-display text-sm font-bold text-brand-primary">Butuh Informasi Lebih Lanjut?</h4>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Konsultan akademik kami siap berdiskusi mengenai kurikulum sekolah, jadwal fleksibel, serta estimasi biaya yang sesuai dengan kebutuhan buah hati Anda.
                                </p>
                                <div className="mt-5">
                                    <Button
                                        href={seoContact.whatsapp?.link || 'https://wa.me/6281234567890'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="primary"
                                        size="md"
                                        iconLeft={icons.whatsapp}
                                    >
                                        Konsultasi via WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <Accordion items={faqItems} allowMultiple={false} />
                        </div>
                    </div>
                </Container>
            </section>

            {/* 9. BIG CONVERSION CTA BANNER */}
            <section className="py-20 bg-slate-50/70 border-t border-slate-200/60">
                <Container>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-brand-primary to-purple-800 px-6 py-14 sm:px-12 sm:py-16 text-white shadow-2xl">
                        {/* Decorative circles */}
                        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

                        <div className="relative max-w-3xl">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200 backdrop-blur-xs">
                                Mulai Bersama ALC
                            </span>
                            <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                                {t.register?.title || 'Wujudkan Potensi Terbaik Anak Sekarang Juga'}
                            </h2>
                            <p className="mt-4 text-sm sm:text-base text-violet-100 leading-relaxed">
                                {t.register?.subtitle ||
                                    'Daftarkan putra-putri Anda untuk konsultasi belajar dan asesmen awal gratis bersama tim pengajar profesional kami.'}
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <Button
                                    href="/pendaftaran"
                                    variant="secondary"
                                    size="lg"
                                    iconRight={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    }
                                >
                                    {cta.studentRegister || 'Daftar Siswa Baru'}
                                </Button>

                                <Button
                                    href="/pendaftaran?tab=teacher"
                                    variant="white"
                                    size="lg"
                                >
                                    {cta.teacherRegister || 'Gabung Jadi Pengajar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 10. KONTAK & LOKASI KANTOR */}
            <section id="kontak" className="py-20 bg-slate-50/70 border-t border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow={t.contact?.eyebrow || 'Hubungi Kami'}
                        title={t.contact?.title || 'Konsultasi & Kunjungan Langsung'}
                        subtitle={t.contact?.subtitle || 'Kami siap menjawab pertanyaan dan mendiskusikan kebutuhan belajar buah hati Anda.'}
                    />

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {socialCards.map((item, idx) => {
                            const icon = icons[item.icon] || icons.mail;
                            const label = localizeField(item.label, language) || item.label || '';
                            const value = localizeField(item.value, language) || item.value || '';
                            const link = localizeField(item.link, language) || item.link || '#';
                            const isExternal = link.startsWith('http');

                            return (
                                <a
                                    key={idx}
                                    href={link}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    className="group flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-brand-primary group-hover:scale-110 transition-transform">
                                        {icon}
                                    </div>
                                    <h4 className="mt-4 font-bold text-slate-900 text-sm">{label}</h4>
                                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">{value}</p>
                                </a>
                            );
                        })}

                        {/* Jam Operasional */}
                        <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xs">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                {icons.clock}
                            </div>
                            <h4 className="mt-4 font-bold text-slate-900 text-sm">Jam Layanan</h4>
                            <p className="mt-1 text-xs text-slate-500">{hours.weekday}</p>
                            <p className="text-xs text-slate-500">{hours.weekend}</p>
                        </div>
                    </div>

                    {/* Address Map Card */}
                    <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center sm:text-left">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-brand-primary">
                                {icons.mapPin}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-base">Kantor Pembelajaran ALC</h4>
                                <p className="mt-1 text-sm text-slate-500">{contactAddress.text}</p>
                            </div>
                        </div>

                        {contactAddress.mapLink && (
                            <Button
                                href={contactAddress.mapLink}
                                variant="outline"
                                size="md"
                                className="shrink-0"
                            >
                                {cta.viewMap || 'Buka Google Maps'}
                            </Button>
                        )}
                    </div>
                </Container>
            </section>

            {/* Passkey Modals */}
            <PasskeyModal
                isOpen={showBankSoalPasskey}
                onClose={() => {
                    setShowBankSoalPasskey(false);
                    setBankSoalTargetUrl('');
                }}
                targetUrl={bankSoalTargetUrl}
                correctPasskey={landing.bankSoalPasskey}
                language={language}
                onSuccess={() => {
                    sessionStorage.setItem('banksoal_access', 'granted');
                }}
            />

            <PasskeyModal
                isOpen={showOlympiadPasskey}
                onClose={() => {
                    setShowOlympiadPasskey(false);
                    setOlympiadTargetUrl('');
                }}
                targetUrl={olympiadTargetUrl}
                correctPasskey={olympiadPasskey}
                language={language}
                onSuccess={() => {
                    sessionStorage.setItem('olympiad_access', 'granted');
                }}
            />
        </>
    );
}
