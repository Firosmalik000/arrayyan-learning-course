import { Link, usePage } from '@inertiajs/react';
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

// Shared data & icons
import { icons } from '@/data';
import { siteConfig, stats } from '@/data/content/site';

// Page-specific data
import {
    heroContent,
    featureCards,
    aboutContent,
    visionMission,
    educationLevels,
    subjects,
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

    const seoContact = seoSettings?.contact || {};

    const [showBankSoalPasskey, setShowBankSoalPasskey] = useState(false);
    const [bankSoalTargetUrl, setBankSoalTargetUrl] = useState('');
    const [showOlympiadPasskey, setShowOlympiadPasskey] = useState(false);
    const [olympiadTargetUrl, setOlympiadTargetUrl] = useState('');
    const galleryRef = useRef(null);

    const handleBankSoalClick = (format = 'all') => {
        const hasAccess = sessionStorage.getItem('banksoal_access') === 'granted';
        if (hasAccess) {
            window.location.href = `/bank-soal?format=${format}`;
        } else {
            setBankSoalTargetUrl(`/bank-soal?format=${format}`);
            setShowBankSoalPasskey(true);
        }
    };

    const handleOlympiadClick = (category = 'all') => {
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
        const scrollAmount = galleryRef.current.clientWidth * 0.75;
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

    const waLink = seoContact.whatsapp?.link || 'https://wa.me/6281234567890';

    return (
        <div className="bg-[#fafbfc] text-slate-900">
            <SeoHead title={siteTitle} type="website" />

            {/* 1. HERO SECTION - Clean, Airy, Elegant, High-Trust */}
            <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-18 lg:pb-28">
                {/* Ambient Soft Glows */}
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-7xl">
                    <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
                    <div className="absolute right-1/4 top-16 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />
                </div>

                <Container>
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
                        {/* Left Column: Focused Copy & Clear Actions */}
                        <div className="flex flex-col lg:col-span-7">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-2 self-start rounded-full bg-violet-100/70 px-3.5 py-1.5 text-xs font-semibold text-brand-primary border border-violet-200/60 backdrop-blur-xs">
                                <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                                <span>Bimbingan Belajar Personal & Berkarakter</span>
                            </div>

                            {/* Headline */}
                            <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.14]">
                                Dampingi Prestasi & Karakter Mulia{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-purple-700 to-amber-600">
                                    Buah Hati Anda
                                </span>
                            </h1>

                            {/* Crisp Value Proposition */}
                            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                                Pendampingan belajar ramah, sabar, dan terarah. Membantu siswa memahami pelajaran secara mendalam, percaya diri, serta mencintai ilmu dan berakhlak mulia.
                            </p>

                            {/* CTA Actions */}
                            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                                <Button
                                    href="/pendaftaran"
                                    variant="primary"
                                    size="lg"
                                    iconRight={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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

                            {/* Minimalist Trust Ribbon */}
                            <div className="mt-10 pt-7 border-t border-slate-200/60 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-brand-primary">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span>Metode Personal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-brand-primary">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span>Tutor Teruji & Ramah</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span>Penguatan Adab Islami</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sleek Visual Card */}
                        <div className="relative lg:col-span-5 flex justify-center">
                            <div className="relative w-full max-w-md lg:max-w-none">
                                {/* Frame */}
                                <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-white/90 bg-gradient-to-br from-violet-100/80 via-white to-amber-50/50 shadow-xl">
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
                                    <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-violet-700 to-purple-900 p-8 text-center text-white">
                                        <div>
                                            <p className="font-display text-2xl font-bold">Ar Rayyan Learning Course</p>
                                            <p className="mt-2 text-xs text-violet-200">Bimbingan Belajar Berkarakter</p>
                                        </div>
                                    </div>
                                    {/* Bottom soft gradient */}
                                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
                                </div>

                                {/* Floating Micro-Badge Top Right */}
                                <div className="absolute right-2 xs:-right-2 sm:-right-4 top-4 xs:top-6 flex items-center gap-2 xs:gap-2.5 rounded-2xl border border-slate-100 bg-white/95 px-3 py-2 xs:px-3.5 xs:py-2.5 shadow-lg backdrop-blur-md">
                                    <span className="flex h-7 w-7 xs:h-8 xs:w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-xs xs:text-sm shrink-0">
                                        ⭐
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 leading-tight">4.9 / 5.0</p>
                                        <p className="text-[9px] xs:text-[10px] text-slate-500 font-medium">Kepuasan Siswa & Wali</p>
                                    </div>
                                </div>

                                {/* Floating Micro-Badge Bottom Left */}
                                <div className="absolute left-2 xs:-left-2 sm:-left-4 -bottom-3 flex items-center gap-2 xs:gap-2.5 rounded-2xl border border-slate-100 bg-white/95 px-3 py-2 xs:px-3.5 xs:py-2.5 shadow-lg backdrop-blur-md">
                                    <span className="flex h-7 w-7 xs:h-8 xs:w-8 items-center justify-center rounded-xl bg-violet-50 text-brand-primary text-xs xs:text-sm shrink-0">
                                        📖
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 leading-tight">Pra TK - SMA</p>
                                        <p className="text-[9px] xs:text-[10px] text-slate-500 font-medium">Privat & Kelompok</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 2. STATS BAR - Minimalist, Compact, High-Impact */}
            <section className="relative -mt-4 z-20">
                <Container>
                    <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 sm:py-6 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:divide-x md:divide-slate-100">
                            {statItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3.5 px-2 sm:px-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-brand-primary">
                                        {icons[item.icon] || icons.trophy}
                                    </div>
                                    <div>
                                        <span className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block leading-tight">
                                            {item.value}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-500 block">
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* 3. 3 CORE PILLARS (KEUNGGULAN ALC) - Crisp & Scannable */}
            <section className="py-16 sm:py-20 bg-white">
                <Container>
                    <SectionHeader
                        eyebrow="Keunggulan ALC"
                        title="Mengapa Memilih Kami?"
                        subtitle="Kombinasi bimbingan akademik teruji dengan lingkungan belajar yang hangat dan menanamkan akhlak."
                    />

                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {features.map((feature, idx) => {
                            const iconStyles = [
                                'bg-violet-50 text-brand-primary border-violet-100',
                                'bg-amber-50 text-amber-700 border-amber-100',
                                'bg-emerald-50 text-emerald-700 border-emerald-100',
                            ];
                            const style = iconStyles[idx % iconStyles.length];

                            return (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                                >
                                    <div>
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${style}`}>
                                            {icons[feature.icon] || icons.book}
                                        </div>
                                        <h3 className="mt-5 font-display text-lg font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* 4. MODERN BENTO GRID: TENTANG KAMI & KURIKULUM TERPADU */}
            <section id="profil" className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow="Tentang & Program"
                        title="Mengenal ALC & Jenjang Belajar"
                        subtitle="Pendekatan terpadu untuk membentuk generasi cerdas, beradab, dan siap menyongsong masa depan."
                        className="mb-10"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Bento Card 1: Large Visual with Vision Overlay */}
                        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 min-h-[340px] flex flex-col justify-end p-6 sm:p-8 text-white shadow-xs group">
                            <img
                                src={aboutImageUrl}
                                alt={aboutImageAlt}
                                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                            <div className="relative z-10">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/30 border border-violet-400/40 px-3 py-1 text-[11px] font-bold text-violet-200 backdrop-blur-md mb-3">
                                    Visi Kami
                                </span>
                                <p className="font-display text-lg sm:text-xl font-bold leading-snug text-white">
                                    "{vm.vision || 'Menjadi lembaga bimbingan belajar aman, terpercaya, dan berkarakter.'}"
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(about.values || ['Aman & Nyaman', 'Personal', 'Berkarakter']).map((v, i) => (
                                        <span
                                            key={i}
                                            className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-xs"
                                        >
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bento Column Right: Overview + Subjects */}
                        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
                            {/* Bento Card 2: Overview & 3 Highlights */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                                <h3 className="font-display text-lg font-bold text-slate-900">
                                    Pendampingan Holistik & Berkelanjutan
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {about.description ||
                                        'Ar Rayyan Learning Course menghadirkan bimbingan belajar personal yang memadukan penguasaan akademik terarah dengan pembiasaan adab dan akhlak mulia.'}
                                </p>

                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary text-xs">
                                            ✓
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700">Kurikulum Sinkron Sekolah</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary text-xs">
                                            ✓
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700">Privat & Kelompok Kecil</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary text-xs">
                                            ✓
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700">Laporan Progres Berkala</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bento Card 3: Jenjang & Mata Pelajaran Chips */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
                                        Jenjang & Bidang Studi
                                    </h4>
                                    <span className="text-[11px] font-semibold text-brand-primary bg-violet-50 px-2.5 py-0.5 rounded-full">
                                        Tersedia Offline & Online
                                    </span>
                                </div>

                                {/* Levels */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(levels.levels || ['Pra TK', 'TK', 'SD', 'SMP', 'SMA']).map((lvl, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                            <span>{lvl}</span>
                                        </span>
                                    ))}
                                </div>

                                {/* Subjects */}
                                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                                    {(subj.list || ['Calistung', 'Mengaji', 'Matematika', 'Bahasa Inggris', 'IPA', 'IPS']).map((s, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-lg bg-amber-50/70 border border-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-900"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 5. PROGRAM UNGGULAN - Focused 3 Cards */}
            <section id="program" className="py-16 sm:py-20 bg-white">
                <Container>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
                        <SectionHeader
                            align="left"
                            eyebrow="Program Pilihan"
                            title="Program Belajar Terfavorit"
                            subtitle="Pilihan paket bimbingan dirancang sistematis untuk hasil akademik optimal."
                            className="max-w-2xl"
                        />
                        <Button href="/program" variant="outline" size="sm" className="shrink-0">
                            Lihat Semua ({programSource.length})
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
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-xs text-slate-500">
                            Program bimbingan belajar akan segera diperbarui.
                        </div>
                    )}
                </Container>
            </section>

            {/* 6. FASILITAS SISWA: BANK SOAL & PUSAT OLIMPIADE - Clean Split Cards */}
            <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow="Fasilitas Siswa"
                        title="Dukungan Belajar & Pembinaan Prestasi"
                        subtitle="Akses ribuan bank soal ujian berkualitas dan pembinaan intensif ajang olimpiade."
                    />

                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Bank Soal Card */}
                        <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-7 shadow-xs hover:shadow-md transition">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <Badge variant="accent" size="xs">Bank Soal Terintegrasi</Badge>
                                    <span className="text-[11px] text-slate-400 font-medium">Khusus Siswa ALC</span>
                                </div>
                                <h3 className="font-display text-xl font-bold text-slate-900">
                                    {bank.title || 'Bank Soal & Latihan Ujian'}
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {bank.subtitle || 'Koleksi soal latihan terlengkap untuk ulangan harian, ANBK, dan persiapan ujian sekolah.'}
                                </p>

                                <div className="mt-5 flex items-center gap-4 text-xs text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Modul PDF Siap Cetak
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Simulasi Online
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleBankSoalClick('all')}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                    <span>Buka Bank Soal</span>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                                <Link href="/bank-soal" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                                    Lihat Katalog
                                </Link>
                            </div>
                        </div>

                        {/* Olimpiade Card */}
                        <div className="flex flex-col justify-between rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 p-7 shadow-xs hover:shadow-md transition">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <Badge variant="warning" size="xs">Pusat Prestasi</Badge>
                                    <span className="text-[11px] text-slate-400 font-medium">Terbuka & Berprestasi</span>
                                </div>
                                <h3 className="font-display text-xl font-bold text-slate-900">
                                    {olympiad.title || 'Informasi Olimpiade & Lomba'}
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {olympiad.subtitle || 'Dapatkan informasi kompetisi sains, matematika, dan bahasa tingkat kota hingga nasional.'}
                                </p>

                                <div className="mt-5 flex items-center gap-4 text-xs text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Kompetisi Gratis & Terpilih
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Mentoring OSN & KSM
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOlympiadClick('all')}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition"
                                >
                                    <span>Jelajahi Olimpiade</span>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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

            {/* 7. ALUR BELAJAR (LEARNING JOURNEY) - Modern Linear Stepper */}
            <section className="py-16 sm:py-20 bg-white border-t border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow="Alur Belajar"
                        title="4 Langkah Mudah Pendampingan"
                        subtitle="Proses terukur untuk memastikan setiap anak berkembang dengan bahagia dan percaya diri."
                    />

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {journeyItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs hover:border-violet-300 hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-display text-2xl font-extrabold text-violet-300">
                                            {item.step}
                                        </span>
                                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-primary">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h4 className="font-display text-sm font-bold text-slate-900">
                                        {item.title}
                                    </h4>
                                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* 8. GALERI KEGIATAN - Clean Carousel */}
            <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/60">
                <Container>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                        <SectionHeader
                            align="left"
                            eyebrow="Galeri Belajar"
                            title="Suasana Belajar di ALC"
                            subtitle="Dokumentasi interaksi siswa dan tutor dalam menciptakan suasana kelas yang menyenangkan."
                            className="max-w-2xl"
                        />
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => scrollGallery(-1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-violet-300 hover:text-brand-primary transition"
                                aria-label="Sebelumnya"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollGallery(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-violet-300 hover:text-brand-primary transition"
                                aria-label="Berikutnya"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div
                        ref={galleryRef}
                        className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-none"
                    >
                        {galleryItems.length > 0 ? (
                            galleryItems.map((item, index) => {
                                const src = item.url || item.path || item.src;
                                const alt = localizeField(item.alt, language) || `Galeri ALC ${index + 1}`;
                                if (!src) return null;
                                return (
                                    <div
                                        key={index}
                                        className="group relative min-w-[260px] sm:min-w-[300px] aspect-4/3 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs snap-start hover:shadow-md transition"
                                    >
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                                            <p className="text-xs font-semibold text-white">{alt}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            [1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="min-w-[260px] sm:min-w-[280px] aspect-4/3 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center justify-center text-center shadow-xs text-slate-400"
                                >
                                    <svg className="h-8 w-8 text-violet-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <p className="text-xs font-semibold text-slate-700">Momen Belajar ALC</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Suasana Interaktif & Hangat</p>
                                </div>
                            ))
                        )}
                    </div>
                </Container>
            </section>

            {/* 9. TESTIMONI - Compact Parent Stories */}
            <section className="py-16 sm:py-20 bg-white border-t border-slate-200/60">
                <Container>
                    <SectionHeader
                        eyebrow="Cerita Orang Tua"
                        title="Kepercayaan Keluarga ALC"
                        subtitle="Kisah nyata orang tua yang menyaksikan putra-putrinya berkembang lebih percaya diri."
                    />

                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {testimonialItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition"
                            >
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(item.rating || 5)].map((_, i) => (
                                            <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                            {item.highlight}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                                        "{item.quote}"
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="h-9 w-9 rounded-full object-cover ring-1 ring-violet-200"
                                    />
                                    <div>
                                        <h4 className="font-display text-xs font-bold text-slate-900 leading-tight">
                                            {item.name}
                                        </h4>
                                        <p className="text-[11px] text-brand-primary font-medium">
                                            {item.student}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* 10. FAQ RINGKAS - Clean Accordion */}
            <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/60">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <SectionHeader
                            eyebrow="Tanya Jawab"
                            title="Pertanyaan yang Sering Diajukan"
                            subtitle="Jawaban ringkas seputar kurikulum, jadwal, dan proses pendaftaran di ALC."
                            className="mb-8"
                        />

                        <Accordion items={faqItems} allowMultiple={false} />

                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-500 mb-3">
                                Masih punya pertanyaan seputar kurikulum dan jadwal anak?
                            </p>
                            <Button
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
                                iconLeft={icons.whatsapp}
                            >
                                Tanya Admin via WhatsApp
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 11. HIGH IMPACT CTA BANNER */}
            <section className="py-16 sm:py-20 bg-white border-t border-slate-200/60">
                <Container>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-brand-primary to-purple-800 px-6 py-12 sm:px-12 sm:py-16 text-white shadow-xl">
                        {/* Decorative background glows */}
                        <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

                        <div className="relative max-w-2xl">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-200 backdrop-blur-xs">
                                Mulai Bersama ALC
                            </span>
                            <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                                Wujudkan Potensi Terbaik Anak Sekarang
                            </h2>
                            <p className="mt-3 text-xs sm:text-sm text-violet-100 leading-relaxed max-w-xl">
                                Dapatkan konsultasi belajar dan pemetaan awal gratis bersama tim pengajar berpengalaman kami.
                            </p>

                            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Button
                                    href="/pendaftaran"
                                    variant="secondary"
                                    size="md"
                                    iconRight={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    }
                                >
                                    Daftar Siswa Baru
                                </Button>

                                <Button
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="white"
                                    size="md"
                                    iconLeft={icons.whatsapp}
                                >
                                    Konsultasi Gratis
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 12. KONTAK & LOKASI KANTOR */}
            <section id="kontak" className="py-14 sm:py-16 bg-slate-50/70 border-t border-slate-200/60">
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-violet-300 hover:shadow-xs transition"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-brand-primary group-hover:scale-105 transition-transform">
                                        {icon}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 text-xs">{label}</h4>
                                        <p className="text-[11px] text-slate-500 truncate">{value}</p>
                                    </div>
                                </a>
                            );
                        })}

                        {/* Jam Layanan */}
                        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                {icons.clock}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-xs">Jam Layanan</h4>
                                <p className="text-[11px] text-slate-500 truncate">{hours.weekday}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Banner */}
                    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 text-center sm:text-left">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-brand-primary">
                                {icons.mapPin}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Kantor Pembelajaran ALC</h4>
                                <p className="text-xs text-slate-500">{contactAddress.text}</p>
                            </div>
                        </div>

                        {contactAddress.mapLink && (
                            <Button
                                href={contactAddress.mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
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
        </div>
    );
}
