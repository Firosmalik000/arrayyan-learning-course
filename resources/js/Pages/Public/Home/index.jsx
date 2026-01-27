import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger, icons, toneStyles } from '@/data';
import { siteConfig, contactInfo, operatingHours, stats } from '@/data/content/site';
import { getLocalizedPackages, getLocalizedOlympiads } from '@/data/content/programs';

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
    sectionTitles,
    ctaButtons,
} from './data';
import { olympiadPasskey } from '../Olympiad/data';

export default function Home() {
    const { language } = useI18n();

    // State for Bank Soal passkey modal
    const [showBankSoalPasskey, setShowBankSoalPasskey] = useState(false);
    const [bankSoalTargetUrl, setBankSoalTargetUrl] = useState('');
    const [showOlympiadPasskey, setShowOlympiadPasskey] = useState(false);
    const [olympiadTargetUrl, setOlympiadTargetUrl] = useState('');

    // Handler for Bank Soal access
    const handleBankSoalClick = (format) => {
        // Check if already has access
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

    // Get localized content
    const t = sectionTitles[language] || sectionTitles.id;
    const cta = ctaButtons[language] || ctaButtons.id;
    const about = aboutContent[language] || aboutContent.id;
    const vm = visionMission[language] || visionMission.id;
    const levels = educationLevels[language] || educationLevels.id;
    const subj = subjects[language] || subjects.id;
    const bank = bankSoalContent[language] || bankSoalContent.id;
    const hours = operatingHours[language] || operatingHours.id;
    const badges = heroContent.badges[language] || heroContent.badges.id;
    const heroPanel = {
        left: heroContent.panels.left[language] || heroContent.panels.left.id,
        right: heroContent.panels.right[language] || heroContent.panels.right.id,
    };
    const features = featureCards[language] || featureCards.id;
    const statItems = stats[language] || stats.id;
    const packages = getLocalizedPackages(language);
    const olympiads = getLocalizedOlympiads(language);

    return (
        <>
            <Head>
                <title>Home</title>
                <meta
                    name="description"
                    content="Ar Rayyan Learning Course (ALC) adalah lembaga pendidikan islami yang ramah anak dengan program belajar fleksibel untuk berbagai jenjang."
                />
            </Head>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section">
                <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />

                <div className="alc-container grid max-w-6xl alc-gap-lg lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="flex flex-col alc-gap-md"
                    >
                        <motion.h1
                            variants={fadeUp}
                            className="font-display alc-hero-title font-semibold leading-snug text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-indigo-600 to-amber-500"
                        >
                            {siteConfig.name}
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="alc-hero-tagline font-semibold text-slate-700"
                        >
                            {t.hero.title}
                        </motion.p>
                        <motion.p
                            variants={fadeUp}
                            className="alc-body text-slate-600 max-w-xl"
                        >
                            {t.hero.description}
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row flex-wrap alc-gap-sm"
                        >
                            <Link
                                href="/pendaftaran"
                                className="inline-flex items-center justify-center alc-button bg-gradient-to-r from-violet-700 to-amber-400 alc-body-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-amber-500 min-h-[44px]"
                            >
                                {cta.primary}
                            </Link>
                            <Link
                                href="/#program"
                                className="inline-flex items-center justify-center alc-button border border-violet-200 bg-white alc-body-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800 min-h-[44px]"
                            >
                                {cta.secondary}
                            </Link>
                        </motion.div>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap alc-gap-sm alc-body-sm text-slate-600"
                        >
                            {badges.map((badge) => (
                                <div
                                    key={badge.title}
                                    className="flex items-center gap-1.5 sm:gap-2 alc-pill border border-white/60 bg-white/80 shadow-sm"
                                >
                                    <span className="alc-caption font-semibold text-violet-700">
                                        {badge.title}
                                    </span>
                                    <span className="alc-caption text-slate-500">
                                        {badge.detail}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="relative mt-6 lg:mt-0"
                    >
                        <div className="relative aspect-[4/5] sm:aspect-[4/4] lg:aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-violet-100/80 bg-white/90 shadow-xl sm:shadow-2xl">
                            <img
                                src="/images/hero-student.jpg"
                                alt="Siswa ALC"
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                    if (event.currentTarget.nextSibling) {
                                        event.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                }}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-violet-200/60 to-amber-200/60 text-sm font-semibold text-violet-700">
                                Foto kegiatan ALC
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-violet-900/20 to-transparent" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="absolute -left-2 sm:-left-6 bottom-4 sm:bottom-8 alc-panel border border-white/70 bg-white/90 alc-body-sm shadow-lg"
                        >
                            <p className="font-semibold text-slate-800">
                                {heroPanel.left.title}
                            </p>
                            <p className="alc-caption text-slate-500">
                                {heroPanel.left.subtitle}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.6 }}
                            className="absolute -right-2 sm:-right-8 top-4 sm:top-8 alc-panel border border-white/70 bg-white/90 alc-body-sm shadow-lg"
                        >
                            <p className="font-semibold text-slate-800">
                                {heroPanel.right.title}
                            </p>
                            <p className="alc-caption text-slate-500">
                                {heroPanel.right.subtitle}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Why ALC Section */}
            <section className="bg-white alc-section-tight">
                <div className="alc-container max-w-6xl">
                    <SectionTitle
                        eyebrow="ALC"
                        title={t.why.title}
                        subtitle={t.why.subtitle}
                        align="center"
                    />
                    <div className="mt-8 sm:mt-10 grid alc-gap-md md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const toneClass = toneStyles[feature.tone] || toneStyles.violet;

                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5 }}
                                    className="alc-card border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div className={`flex alc-icon-sm items-center justify-center ${toneClass}`}>
                                        {icons[feature.icon]}
                                    </div>
                                    <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1.5 sm:mt-2 alc-body-sm text-slate-600">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Profile Section */}
            <section id="profil" className="bg-white alc-section">
                <div className="alc-container max-w-6xl">
                    <SectionTitle
                        eyebrow="ALC"
                        title={t.profile.title}
                        subtitle={t.profile.subtitle}
                    />

                    <div className="mt-8 sm:mt-10 grid alc-gap-lg lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-violet-100/70 bg-white shadow-lg sm:shadow-xl">
                                <img
                                    src="/images/about-class.jpg"
                                    alt="Kelas ALC"
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                        if (event.currentTarget.nextSibling) {
                                            event.currentTarget.nextSibling.style.display = 'flex';
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-amber-200/60 to-violet-200/60 text-sm font-semibold text-violet-700">
                                    Foto kegiatan belajar
                                </div>
                            </div>
                            <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:left-6 alc-panel border border-white/70 bg-white/90 alc-body-sm shadow-lg">
                                <p className="font-semibold text-slate-800">
                                    {about.panelTitle}
                                </p>
                                <p className="alc-caption text-slate-500">
                                    {about.panelSubtitle}
                                </p>
                            </div>
                        </motion.div>

                        <div className="flex flex-col alc-gap-md mt-6 lg:mt-0">
                            <div className="alc-card border border-violet-100 bg-violet-50/60">
                                <h3 className="font-display alc-card-title font-semibold text-slate-800">
                                    {about.title}
                                </h3>
                                <p className="mt-2 sm:mt-3 alc-body-sm text-slate-600 whitespace-pre-line">
                                    {about.description}
                                </p>
                            </div>
                            <div className="grid alc-gap-sm grid-cols-1 sm:grid-cols-2">
                                <div className="alc-card border border-slate-100 bg-white shadow-sm">
                                    <p className="font-display alc-body-sm font-semibold text-slate-800">
                                        {about.valuesTitle}
                                    </p>
                                    <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 alc-body-sm text-slate-600">
                                        {about.values.map((value) => (
                                            <li key={value}>- {value}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="alc-card border border-slate-100 bg-white shadow-sm">
                                    <p className="font-display alc-body-sm font-semibold text-slate-800">
                                        {levels.title}
                                    </p>
                                    <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 alc-body-sm text-slate-600">
                                        {levels.levels.map((level) => (
                                            <li key={level}>- {level}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex flex-col alc-gap-sm alc-card border border-slate-100 bg-white shadow-sm">
                                <p className="font-display alc-body-sm font-semibold text-slate-800">
                                    {subj.title}
                                </p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {subj.list.map((subject) => (
                                        <span
                                            key={subject}
                                            className="alc-pill bg-amber-50 alc-caption font-semibold text-amber-700"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4 sm:mt-6 flex flex-col alc-gap-sm">
                                    <div className="alc-panel bg-slate-50">
                                        <p className="font-display alc-body-sm font-semibold text-slate-800">
                                            {vm.visionTitle}
                                        </p>
                                        <p className="mt-1.5 sm:mt-2 alc-body-sm text-slate-600">
                                            {vm.vision}
                                        </p>
                                    </div>
                                    <div className="alc-panel bg-slate-50">
                                        <p className="font-display alc-body-sm font-semibold text-slate-800">
                                            {vm.missionTitle}
                                        </p>
                                        <ul className="mt-1.5 sm:mt-2 space-y-1.5 alc-body-sm text-slate-600">
                                            {vm.missionList.map((item, index) => (
                                                <li key={index}>- {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Program Section */}
            <section id="program" className="bg-slate-50 alc-section">
                <div className="alc-container max-w-6xl">
                    <SectionTitle
                        eyebrow="Program"
                        title={t.program.title}
                        subtitle={t.program.subtitle}
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="mt-8 sm:mt-10 grid alc-gap-md md:grid-cols-3"
                    >
                        {packages.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={fadeUp}
                                whileHover={{ y: -6 }}
                                className="alc-card border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between alc-gap-sm">
                                    <h3 className="font-display alc-card-title font-semibold text-slate-800">
                                        {item.name}
                                    </h3>
                                    <span className="self-start sm:self-auto alc-pill bg-amber-100/70 alc-caption font-semibold text-amber-700">
                                        {item.mode}
                                    </span>
                                </div>
                                <p className="mt-3 sm:mt-4 alc-body-sm text-slate-600">
                                    {item.description}
                                </p>
                                <div className="mt-3 sm:mt-4 flex flex-col alc-gap-sm alc-body-sm text-slate-600 border-t border-slate-100 pt-3 sm:pt-4">
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            {language === 'en' ? 'Level:' : 'Jenjang:'}
                                        </span>{' '}
                                        {item.level}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            {language === 'en' ? 'Sessions:' : 'Pertemuan:'}
                                        </span>{' '}
                                        {item.sessions}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white alc-section-compact">
                <div className="alc-container max-w-6xl">
                    <div className="grid grid-cols-2 alc-gap-md alc-card-lg bg-gradient-to-r from-violet-700 to-amber-400 text-white shadow-lg md:grid-cols-4">
                        {statItems.map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="mx-auto flex alc-icon-sm items-center justify-center bg-white/15 text-white">
                                    {icons[item.icon]}
                                </div>
                                <p className="mt-2 sm:mt-3 alc-stat-value font-semibold">
                                    {item.value}
                                </p>
                                <p className="mt-0.5 sm:mt-1 alc-stat-label text-white/80">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bank Soal Section */}
            <section id="banksoal" className="bg-gradient-to-br from-slate-50 via-white to-violet-50 alc-section">
                <div className="alc-container max-w-6xl">
                    <SectionTitle
                        eyebrow="Fitur Unggulan"
                        title={bank.title}
                        subtitle={bank.subtitle}
                        align="center"
                    />

                    {/* Bank Soal Cards - Offline & Online */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="mt-8 sm:mt-10 grid alc-gap-md md:grid-cols-2"
                    >
                        {/* Offline Card */}
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ y: -6 }}
                            className="group alc-card border border-violet-100 bg-gradient-to-br from-violet-50 to-white shadow-sm transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex alc-icon-sm items-center justify-center bg-violet-100 text-violet-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <span className="alc-pill bg-violet-100 alc-caption font-medium text-violet-700">
                                    Offline
                                </span>
                            </div>
                            <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800">
                                {bank.offline.title}
                            </h3>
                            <p className="mt-2 sm:mt-3 alc-body-sm text-slate-600">
                                {bank.offline.description}
                            </p>
                            <div className="mt-4 sm:mt-5 pt-4 border-t border-violet-100">
                                <button
                                    type="button"
                                    onClick={() => handleBankSoalClick('offline')}
                                    className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-violet-600 to-violet-700 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-violet-700 hover:to-violet-800 min-h-[40px]"
                                >
                                    {bank.viewDetail}
                                    <svg
                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>

                        {/* Online Card */}
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ y: -6 }}
                            className="group alc-card border border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex alc-icon-sm items-center justify-center bg-amber-100 text-amber-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                    </svg>
                                </div>
                                <span className="alc-pill bg-amber-100 alc-caption font-medium text-amber-700">
                                    Online
                                </span>
                            </div>
                            <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800">
                                {bank.online.title}
                            </h3>
                            <p className="mt-2 sm:mt-3 alc-body-sm text-slate-600">
                                {bank.online.description}
                            </p>
                            <div className="mt-4 sm:mt-5 pt-4 border-t border-amber-100">
                                <button
                                    type="button"
                                    onClick={() => handleBankSoalClick('online')}
                                    className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-amber-500 to-amber-600 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-amber-600 hover:to-amber-700 min-h-[40px]"
                                >
                                    {bank.viewDetail}
                                    <svg
                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Olympiad Section */}
            <section className="bg-gradient-to-br from-white via-white to-amber-50 alc-section">
                <div className="alc-container max-w-6xl">
                    <SectionTitle
                        eyebrow="Prestasi"
                        title={t.olympiad.title}
                        subtitle={t.olympiad.subtitle}
                        align="center"
                    />

                    {/* Olympiad Cards - Gratis & Berbayar */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="mt-8 sm:mt-10 grid alc-gap-md md:grid-cols-2"
                    >
                        {/* Gratis Card */}
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ y: -6 }}
                            className="group alc-card border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex alc-icon-sm items-center justify-center bg-emerald-100 text-emerald-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                    </svg>
                                </div>
                                <span className="alc-pill bg-emerald-100 alc-caption font-medium text-emerald-700">
                                    {language === 'en' ? 'Free' : 'Gratis'}
                                </span>
                            </div>
                            <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800">
                                {language === 'en' ? 'Free Olympiad' : 'Olimpiade Gratis'}
                            </h3>
                            <p className="mt-2 sm:mt-3 alc-body-sm text-slate-600">
                                {language === 'en'
                                    ? 'National and international olympiad preparation programs without registration fees.'
                                    : 'Program persiapan olimpiade nasional dan internasional tanpa biaya pendaftaran.'}
                            </p>
                            <div className="mt-4 sm:mt-5 pt-4 border-t border-emerald-100">
                                <button
                                    type="button"
                                    onClick={() => handleOlympiadClick('gratis')}
                                    className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-emerald-500 to-emerald-600 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 min-h-[40px]"
                                >
                                    {cta.viewOlympiad}
                                    <svg
                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>

                        {/* Berbayar Card */}
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ y: -6 }}
                            className="group alc-card border border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex alc-icon-sm items-center justify-center bg-amber-100 text-amber-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                    </svg>
                                </div>
                                <span className="alc-pill bg-amber-100 alc-caption font-medium text-amber-700">
                                    {language === 'en' ? 'Paid' : 'Berbayar'}
                                </span>
                            </div>
                            <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800">
                                {language === 'en' ? 'Premium Olympiad' : 'Olimpiade Premium'}
                            </h3>
                            <p className="mt-2 sm:mt-3 alc-body-sm text-slate-600">
                                {language === 'en'
                                    ? 'Exclusive competition programs with intensive mentoring and comprehensive preparation materials.'
                                    : 'Program kompetisi eksklusif dengan mentoring intensif dan materi persiapan yang komprehensif.'}
                            </p>
                            <div className="mt-4 sm:mt-5 pt-4 border-t border-amber-100">
                                <button
                                    type="button"
                                    onClick={() => handleOlympiadClick('berbayar')}
                                    className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-amber-500 to-amber-600 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-amber-600 hover:to-amber-700 min-h-[40px]"
                                >
                                    {cta.viewOlympiad}
                                    <svg
                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Registration CTA Section */}
            <section className="bg-white alc-section-tight">
                <div className="alc-container grid max-w-6xl alc-gap-md md:grid-cols-[1.1fr_0.9fr] md:items-center">
                    <div className="flex flex-col alc-gap-sm">
                        <SectionTitle
                            eyebrow="Join Us"
                            title={t.register.title}
                            subtitle={t.register.subtitle}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap alc-gap-sm">
                        <Link
                            href="/pendaftaran"
                            className="inline-flex items-center justify-center alc-button bg-gradient-to-r from-violet-700 to-amber-400 alc-body-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-amber-500 min-h-[44px]"
                        >
                            {cta.studentRegister}
                        </Link>
                        <Link
                            href="/pendaftaran"
                            className="inline-flex items-center justify-center alc-button border border-violet-200 bg-white alc-body-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800 min-h-[44px]"
                        >
                            {cta.teacherRegister}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="kontak" className="bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-section">
                <div className="alc-container max-w-5xl">
                    <SectionTitle
                        eyebrow="Hubungi Kami"
                        title={t.contact.title}
                        subtitle={t.contact.subtitle}
                        align="center"
                    />

                    <div className="mt-8 sm:mt-10 grid alc-gap-md md:grid-cols-2 lg:grid-cols-4">
                        <motion.a
                            href={contactInfo.whatsapp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                            className="group flex flex-col items-center alc-card border border-green-100 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1 hover:border-green-200"
                        >
                            <div className="flex alc-icon items-center justify-center bg-green-50 text-green-600 transition group-hover:bg-green-100 group-hover:scale-110">
                                {icons.whatsapp}
                            </div>
                            <p className="mt-3 sm:mt-4 alc-card-title font-semibold text-slate-800">WhatsApp</p>
                            <p className="mt-1 alc-body-sm text-slate-500">{contactInfo.whatsapp.number}</p>
                        </motion.a>

                        <motion.a
                            href={contactInfo.instagram.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group flex flex-col items-center alc-card border border-pink-100 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1 hover:border-pink-200"
                        >
                            <div className="flex alc-icon items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 text-pink-600 transition group-hover:from-pink-100 group-hover:to-purple-100 group-hover:scale-110">
                                {icons.instagram}
                            </div>
                            <p className="mt-3 sm:mt-4 alc-card-title font-semibold text-slate-800">Instagram</p>
                            <p className="mt-1 alc-body-sm text-slate-500">{contactInfo.instagram.handle}</p>
                        </motion.a>

                        <motion.a
                            href={contactInfo.email.link}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group flex flex-col items-center alc-card border border-violet-100 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1 hover:border-violet-200"
                        >
                            <div className="flex alc-icon items-center justify-center bg-violet-50 text-violet-600 transition group-hover:bg-violet-100 group-hover:scale-110">
                                {icons.mail}
                            </div>
                            <p className="mt-3 sm:mt-4 alc-card-title font-semibold text-slate-800">Email</p>
                            <p className="mt-1 alc-body-sm text-slate-500">{contactInfo.email.address}</p>
                        </motion.a>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col items-center alc-card border border-amber-100 bg-white shadow-sm"
                        >
                            <div className="flex alc-icon items-center justify-center bg-amber-50 text-amber-600">
                                {icons.clock}
                            </div>
                            <p className="mt-3 sm:mt-4 alc-card-title font-semibold text-slate-800">
                                {language === 'en' ? 'Operating Hours' : 'Jam Operasional'}
                            </p>
                            <p className="mt-1 alc-body-sm text-slate-500 text-center">{hours.weekday}</p>
                            <p className="alc-body-sm text-slate-500">{hours.weekend}</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 sm:mt-10 alc-card border border-slate-100 bg-white shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-center alc-gap-md">
                            <div className="flex alc-icon items-center justify-center bg-violet-50 text-violet-600 flex-shrink-0">
                                {icons.mapPin}
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="alc-card-title font-semibold text-slate-800">
                                    {language === 'en' ? 'Office Address' : 'Alamat Kantor'}
                                </p>
                                <p className="mt-1 alc-body-sm text-slate-500">
                                    {contactInfo.address[language] || contactInfo.address.id}
                                </p>
                            </div>
                            <a
                                href={contactInfo.address.mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center alc-button border border-violet-200 bg-white alc-body-sm font-semibold text-violet-700 transition hover:bg-violet-50 hover:border-violet-300 min-h-[44px] flex-shrink-0"
                            >
                                {cta.viewMap}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bank Soal Passkey Modal */}
            <PasskeyModal
                isOpen={showBankSoalPasskey}
                onClose={() => {
                    setShowBankSoalPasskey(false);
                    setBankSoalTargetUrl('');
                }}
                targetUrl={bankSoalTargetUrl}
                correctPasskey={bankSoalPasskey}
                language={language}
                onSuccess={() => {
                    // Store global access for Bank Soal
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
