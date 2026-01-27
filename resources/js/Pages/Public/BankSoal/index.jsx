import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger, icons, toneStyles } from '@/data';

// Import data from Home
import { bankSoalContent, bankSoalCategories, bankSoalItems, bankSoalPasskey } from '../Home/data';

const pageContent = {
    id: {
        title: 'Bank Soal',
        description: 'Koleksi lengkap soal latihan untuk semua jenjang pendidikan',
        searchPlaceholder: 'Cari soal...',
        noResults: 'Tidak ada soal yang ditemukan',
        backToHome: 'Kembali ke Beranda',
        formatAll: 'Semua Format',
        formatOffline: 'Offline',
        formatOnline: 'Online',
        formatHybrid: 'Hybrid',
    },
    en: {
        title: 'Question Bank',
        description: 'Complete collection of practice questions for all education levels',
        searchPlaceholder: 'Search questions...',
        noResults: 'No questions found',
        backToHome: 'Back to Home',
        formatAll: 'All Formats',
        formatOffline: 'Offline',
        formatOnline: 'Online',
        formatHybrid: 'Hybrid',
    },
};

export default function BankSoalIndex() {
    const { language } = useI18n();
    const { url } = usePage();

    // Get format from URL query
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialFormat = urlParams.get('format')?.toLowerCase() || null;

    const [activeCategory, setActiveCategory] = useState(null);
    const [activeFormat, setActiveFormat] = useState(initialFormat);
    const [searchQuery, setSearchQuery] = useState('');

    // Global access state
    const [hasAccess, setHasAccess] = useState(false);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);

    const t = pageContent[language] || pageContent.id;

    // Check for global access on mount
    useEffect(() => {
        const access = sessionStorage.getItem('banksoal_access') === 'granted';
        setHasAccess(access);
        if (!access) {
            setShowPasskeyModal(true);
        }
    }, []);
    const bank = bankSoalContent[language] || bankSoalContent.id;
    const categories = bankSoalCategories[language] || bankSoalCategories.id;

    // Filter items by category, format, and search query
    const filteredItems = bankSoalItems.filter((item) => {
        const matchCategory = !activeCategory || item.category[language] === activeCategory;
        const matchFormat = !activeFormat || item.format.toLowerCase() === activeFormat;
        const matchSearch =
            !searchQuery ||
            item.name[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.id?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchFormat && matchSearch;
    });

    return (
        <>
            <Head>
                <title>{t.title}</title>
                <meta name="description" content={t.description} />
            </Head>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section-tight">
                <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />

                <div className="alc-container max-w-6xl relative">
                    <Link
                        href="/"
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
                        {t.backToHome}
                    </Link>

                    <SectionTitle
                        eyebrow="ALC"
                        title={t.title}
                        subtitle={t.description}
                    />

                    {/* Search */}
                    <div className="mt-8 max-w-md">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchPlaceholder}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="bg-white alc-section">
                <div className="alc-container max-w-6xl">
                    {/* Filter Section */}
                    <div className="space-y-4 mb-8">
                        {/* Format Filter */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="alc-body-sm font-medium text-slate-500 mr-1">Format:</span>
                            <button
                                type="button"
                                onClick={() => setActiveFormat(null)}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeFormat === null
                                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                }`}
                            >
                                {t.formatAll}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveFormat('offline')}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeFormat === 'offline'
                                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                }`}
                            >
                                {t.formatOffline}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveFormat('online')}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeFormat === 'online'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'
                                }`}
                            >
                                {t.formatOnline}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveFormat('hybrid')}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeFormat === 'hybrid'
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                                }`}
                            >
                                {t.formatHybrid}
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="alc-body-sm font-medium text-slate-500 mr-1">Kategori:</span>
                            <button
                                type="button"
                                onClick={() => setActiveCategory(null)}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeCategory === null
                                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                }`}
                            >
                                {bank.filterAll}
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                        activeCategory === category
                                            ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    {filteredItems.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="grid alc-gap-md md:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredItems.map((item) => {
                                const toneClass = toneStyles[item.tone] || toneStyles.violet;

                                return (
                                    <motion.div
                                        key={item.id}
                                        variants={fadeUp}
                                        whileHover={{ y: -6 }}
                                        className="group alc-card border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-200"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={`flex alc-icon-sm items-center justify-center ${toneClass}`}>
                                                {icons.book}
                                            </div>
                                            <span className="alc-pill bg-slate-100 alc-caption font-medium text-slate-600">
                                                {item.format}
                                            </span>
                                        </div>

                                        {/* Card Content */}
                                        <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                            {item.name[language] || item.name.id}
                                        </h3>
                                        <p className="mt-1.5 sm:mt-2 alc-body-sm text-slate-600 line-clamp-2">
                                            {item.description[language] || item.description.id}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                                            <span className={`alc-pill alc-caption font-medium ${toneClass}`}>
                                                {item.category[language] || item.category.id}
                                            </span>
                                            <span className="alc-pill bg-amber-50 alc-caption font-medium text-amber-700">
                                                {item.level[language] || item.level.id}
                                            </span>
                                            <span className="alc-caption text-slate-500">
                                                {item.questions} {bank.questionCount}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-100">
                                            <Link
                                                href={`/bank-soal/${item.slug}`}
                                                className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-violet-600 to-amber-500 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-violet-700 hover:to-amber-600 min-h-[40px]"
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
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <svg
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-slate-500">{t.noResults}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Passkey Modal - for direct access to this page */}
            <PasskeyModal
                isOpen={showPasskeyModal}
                onClose={() => {
                    // Redirect to home if user cancels without entering passkey
                    if (!hasAccess) {
                        window.location.href = '/';
                    } else {
                        setShowPasskeyModal(false);
                    }
                }}
                targetUrl={url}
                correctPasskey={bankSoalPasskey}
                language={language}
                onSuccess={() => {
                    sessionStorage.setItem('banksoal_access', 'granted');
                    setHasAccess(true);
                    setShowPasskeyModal(false);
                }}
            />
        </>
    );
}
