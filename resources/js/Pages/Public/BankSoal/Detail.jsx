import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger, icons, toneStyles } from '@/data';
import { contactInfo } from '@/data/content/site';

// Import data from Home
import { bankSoalItems, bankSoalPasskey } from '../Home/data';

const pageContent = {
    id: {
        backToList: 'Kembali ke Bank Soal',
        moduleInfo: 'Informasi Modul',
        category: 'Kategori',
        level: 'Jenjang',
        format: 'Format',
        totalQuestions: 'Jumlah Soal',
        questions: 'soal',
        description: 'Deskripsi',
        features: 'Fitur Modul',
        featuresList: [
            'Soal disusun oleh tim pengajar berpengalaman',
            'Dilengkapi pembahasan lengkap',
            'Dapat diakses kapan saja',
            'Cocok untuk latihan mandiri',
        ],
        startPractice: 'Mulai Latihan',
        contact: 'Hubungi Kami',
        contactDesc: 'Butuh informasi lebih lanjut? Hubungi kami melalui WhatsApp.',
        notFound: 'Modul tidak ditemukan',
        notFoundDesc: 'Maaf, modul yang Anda cari tidak tersedia.',
    },
    en: {
        backToList: 'Back to Question Bank',
        moduleInfo: 'Module Information',
        category: 'Category',
        level: 'Level',
        format: 'Format',
        totalQuestions: 'Total Questions',
        questions: 'questions',
        description: 'Description',
        features: 'Module Features',
        featuresList: [
            'Questions prepared by experienced teachers',
            'Complete with detailed explanations',
            'Accessible anytime',
            'Suitable for self-study',
        ],
        startPractice: 'Start Practice',
        contact: 'Contact Us',
        contactDesc: 'Need more information? Contact us via WhatsApp.',
        notFound: 'Module not found',
        notFoundDesc: 'Sorry, the module you are looking for is not available.',
    },
};

const passkeyContent = {
    id: {
        title: 'Masukkan Passkey',
        subtitle: 'Masukkan passkey untuk mengakses materi ini',
        placeholder: 'Masukkan passkey...',
        submit: 'Akses Materi',
        cancel: 'Kembali',
        error: 'Passkey salah. Silakan coba lagi.',
        noPasskey: 'Tidak punya passkey?',
        contact: 'Hubungi kami untuk mendapatkan akses.',
    },
    en: {
        title: 'Enter Passkey',
        subtitle: 'Enter the passkey to access this material',
        placeholder: 'Enter passkey...',
        submit: 'Access Material',
        cancel: 'Go Back',
        error: 'Wrong passkey. Please try again.',
        noPasskey: "Don't have a passkey?",
        contact: 'Contact us to get access.',
    },
};

export default function BankSoalDetail({ slug }) {
    const { language } = useI18n();
    const t = pageContent[language] || pageContent.id;
    const pk = passkeyContent[language] || passkeyContent.id;

    // Find the item by slug
    const item = bankSoalItems.find((i) => i.slug === slug);

    // Passkey state
    const [hasAccess, setHasAccess] = useState(false);
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Check sessionStorage for global access
    useEffect(() => {
        const accessKey = sessionStorage.getItem('banksoal_access');
        if (accessKey === 'granted') {
            setHasAccess(true);
        }
        setIsChecking(false);
    }, []);

    // Handle passkey submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        if (passkey === bankSoalPasskey) {
            sessionStorage.setItem('banksoal_access', 'granted');
            setHasAccess(true);
        } else {
            setError(true);
        }
        setIsLoading(false);
    };

    // Not found
    if (!item) {
        return (
            <>
                <Head>
                    <title>{t.notFound}</title>
                </Head>
                <section className="bg-gradient-to-br from-violet-50 via-white to-amber-50 min-h-screen flex items-center justify-center">
                    <div className="alc-container text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <svg
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t.notFound}</h1>
                        <p className="text-slate-600 mb-6">{t.notFoundDesc}</p>
                        <Link
                            href="/bank-soal"
                            className="inline-flex items-center gap-2 alc-button bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {t.backToList}
                        </Link>
                    </div>
                </section>
            </>
        );
    }

    // Still checking access
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
        );
    }

    // Show passkey form if no access
    if (!hasAccess) {
        return (
            <>
                <Head>
                    <title>{pk.title}</title>
                </Head>
                <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 min-h-screen flex items-center justify-center alc-pattern">
                    <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                    <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />

                    <div className="alc-container max-w-md relative">
                        <div className="alc-card border border-slate-100 bg-white shadow-xl">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">{pk.title}</h1>
                                    <p className="text-sm text-slate-500">{pk.subtitle}</p>
                                </div>
                            </div>

                            {/* Module Info */}
                            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="alc-body-sm font-semibold text-slate-800">
                                    {item.name[language] || item.name.id}
                                </p>
                                <p className="alc-caption text-slate-500 mt-1">
                                    {item.category[language] || item.category.id} • {item.level[language] || item.level.id}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                                    />
                                                </svg>
                                            </span>
                                            <input
                                                type="password"
                                                value={passkey}
                                                onChange={(e) => {
                                                    setPasskey(e.target.value);
                                                    setError(false);
                                                }}
                                                placeholder={pk.placeholder}
                                                className={`w-full rounded-xl border ${
                                                    error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                                                } bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:ring-2`}
                                                autoFocus
                                            />
                                        </div>
                                        {error && (
                                            <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                                {pk.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                                        <p className="text-sm font-medium text-amber-800">{pk.noPasskey}</p>
                                        <p className="mt-1 text-sm text-amber-700">{pk.contact}</p>
                                        <a
                                            href={contactInfo.whatsapp.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            WhatsApp
                                        </a>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex gap-3">
                                    <Link
                                        href="/"
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 text-center"
                                    >
                                        {pk.cancel}
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={!passkey || isLoading}
                                        className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : (
                                            pk.submit
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    // Has access - show content
    const toneClass = toneStyles[item.tone] || toneStyles.violet;

    return (
        <>
            <Head>
                <title>{item.name[language] || item.name.id}</title>
                <meta name="description" content={item.description[language] || item.description.id} />
            </Head>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section">
                <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />

                <div className="alc-container max-w-6xl relative">
                    <Link
                        href="/bank-soal"
                        className="inline-flex items-center gap-2 alc-body-sm text-violet-600 hover:text-violet-700 transition mb-6"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {t.backToList}
                    </Link>

                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] alc-gap-lg items-start">
                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className={`alc-pill alc-caption font-medium ${toneClass}`}>
                                    {item.category[language] || item.category.id}
                                </span>
                                <span className="alc-pill bg-amber-50 alc-caption font-medium text-amber-700">
                                    {item.level[language] || item.level.id}
                                </span>
                                <span className="alc-pill bg-slate-100 alc-caption font-medium text-slate-600">
                                    {item.format}
                                </span>
                            </div>

                            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                                {item.name[language] || item.name.id}
                            </h1>

                            <p className="mt-4 alc-body text-slate-600 max-w-2xl">
                                {item.description[language] || item.description.id}
                            </p>

                            {/* Stats */}
                            <div className="mt-6 flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                        {icons.list}
                                    </div>
                                    <div>
                                        <p className="alc-caption text-slate-500">{t.totalQuestions}</p>
                                        <p className="font-semibold text-slate-800">
                                            {item.questions} {t.questions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="alc-card border border-slate-100 bg-white shadow-lg"
                        >
                            <div className={`flex alc-icon items-center justify-center ${toneClass} mb-4`}>
                                {icons.book}
                            </div>

                            <h3 className="font-display alc-card-title font-semibold text-slate-800 text-center">
                                {t.moduleInfo}
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="alc-body-sm text-slate-500">{t.category}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">
                                        {item.category[language] || item.category.id}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="alc-body-sm text-slate-500">{t.level}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">
                                        {item.level[language] || item.level.id}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="alc-body-sm text-slate-500">{t.format}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">{item.format}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="alc-body-sm text-slate-500">{t.totalQuestions}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">
                                        {item.questions} {t.questions}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <a
                                    href={contactInfo.whatsapp.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-violet-600 to-amber-500 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-violet-700 hover:to-amber-600 min-h-[44px]"
                                >
                                    {t.startPractice}
                                    <svg
                                        className="ml-2 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                                <a
                                    href={contactInfo.whatsapp.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center alc-button border border-green-200 bg-white alc-body-sm font-semibold text-green-700 transition hover:bg-green-50 hover:border-green-300 min-h-[44px]"
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <span className="ml-2">{t.contact}</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white alc-section">
                <div className="alc-container max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="grid md:grid-cols-2 alc-gap-lg"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                                {t.features}
                            </h2>
                            <ul className="space-y-3">
                                {t.featuresList.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 alc-body-sm text-slate-600"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0 mt-0.5">
                                            {icons.check}
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="alc-card border border-violet-100 bg-gradient-to-br from-violet-50 to-white"
                        >
                            <h3 className="font-display alc-card-title font-semibold text-slate-800 mb-3">
                                {t.contact}
                            </h3>
                            <p className="alc-body-sm text-slate-600 mb-4">{t.contactDesc}</p>
                            <a
                                href={contactInfo.whatsapp.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 alc-body-sm font-semibold text-green-700 hover:text-green-800 transition"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                <span>{contactInfo.whatsapp.number}</span>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
