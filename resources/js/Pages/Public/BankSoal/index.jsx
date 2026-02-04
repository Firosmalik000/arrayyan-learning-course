import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger, icons } from '@/data';

// Import passkey and UI content from Home (not items)
import { bankSoalContent, bankSoalPasskey, bankSoalPageContent } from '../Home/data';

const selectClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

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
    return value[lang] || value.id || value.en || '';
};

export default function BankSoalIndex() {
    const { language } = useI18n();
    const { url, props } = usePage();
    const dbItems = (props.bankSoalItems || []).map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name || { id: '', en: '' },
        category: item.category || { id: '', en: '' },
        level: item.level || { id: '', en: '' },
        format: item.format || '',
        questions: item.questions || 0,
        description: item.description || { id: '', en: '' },
        tone: item.tone || 'violet',
    }));

    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialFormat = urlParams.get('format')?.toLowerCase() || null;

    const [activeCategory, setActiveCategory] = useState(null);
    const [activeFormat, setActiveFormat] = useState(initialFormat);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);

    const landing = mergeContent(
        {
            bankSoalContent,
            bankSoalPasskey,
            bankSoalPageContent,
        },
        props.landingContent || {},
    );

    const t = landing.bankSoalPageContent[language] || landing.bankSoalPageContent.id;
    const bank = landing.bankSoalContent[language] || landing.bankSoalContent.id;
    const categories = Array.from(new Set(dbItems
        .map((item) => localizeField(item.category, language))
        .filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        const access = sessionStorage.getItem('banksoal_access') === 'granted';
        setHasAccess(access);
        if (!access) setShowPasskeyModal(true);
    }, []);

    const filteredItems = dbItems.filter((item) => {
        const matchCategory = !activeCategory || localizeField(item.category, language) === activeCategory;
        const matchFormat = !activeFormat || item.format.toLowerCase() === activeFormat;
        const matchSearch =
            !searchQuery ||
            item.name[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.id?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchFormat && matchSearch;
    });

    const hasActiveFilter = activeCategory || activeFormat || searchQuery;

    const clearFilters = () => {
        setActiveCategory(null);
        setActiveFormat(null);
        setSearchQuery('');
    };

    return (
        <>
            <Head>
                <title>{t.title}</title>
                <meta name="description" content={t.description} />
            </Head>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section-tight">
                <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />
                <div className="alc-container max-w-6xl relative">
                    <Link href="/" className="inline-flex items-center gap-2 alc-body-sm text-violet-600 hover:text-violet-700 transition mb-6">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {t.backToHome}
                    </Link>
                    <SectionTitle eyebrow="ALC" title={t.title} subtitle={t.description} />
                </div>
            </section>

            {/* Content */}
            <section className="bg-white alc-section">
                <div className="alc-container max-w-6xl">
                    {/* Filter Card */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            {/* Search */}
                            <div className="flex-1">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {t.searchPlaceholder}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t.searchPlaceholder}
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>
                            </div>

                            {/* Format */}
                            <div className="sm:w-40">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Format
                                </label>
                                <select value={activeFormat || ''} onChange={(e) => setActiveFormat(e.target.value || null)} className={selectClass}>
                                    <option value="">{t.formatAll}</option>
                                    <option value="offline">Offline</option>
                                    <option value="online">Online</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div className="sm:w-44">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {language === 'en' ? 'Category' : 'Kategori'}
                                </label>
                                <select value={activeCategory || ''} onChange={(e) => setActiveCategory(e.target.value || null)} className={selectClass}>
                                    <option value="">{t.categoryAll}</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {hasActiveFilter && (
                            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                                <p className="text-xs text-slate-500">
                                    {filteredItems.length} {language === 'en' ? 'results found' : 'hasil ditemukan'}
                                </p>
                                <button type="button" onClick={clearFilters} className="text-xs font-medium text-violet-700 hover:text-violet-800 transition">
                                    {language === 'en' ? 'Clear filters' : 'Hapus filter'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Results Grid */}
                    {filteredItems.length > 0 ? (
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid alc-gap-md md:grid-cols-2 lg:grid-cols-3">
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={fadeUp}
                                    whileHover={{ y: -4 }}
                                    className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-200"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                            {icons.book}
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                            {item.format}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="mt-3 text-base font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                        {item.name[language] || item.name.id}
                                    </h3>
                                    <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
                                        {item.description[language] || item.description.id}
                                    </p>

                                    {/* Meta */}
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                                            {item.category[language] || item.category.id}
                                        </span>
                                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                            {item.level[language] || item.level.id}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {item.questions} {bank.questionCount}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-auto pt-4">
                                        <Link
                                            href={`/bank-soal/${item.slug}`}
                                            className="inline-flex w-full items-center justify-center rounded-full bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-violet-800"
                                        >
                                            {bank.viewDetail}
                                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-500">{t.noResults}</p>
                        </div>
                    )}
                </div>
            </section>

            <PasskeyModal
                isOpen={showPasskeyModal}
                onClose={() => { if (!hasAccess) { window.location.href = '/'; } else { setShowPasskeyModal(false); } }}
                targetUrl={url}
                correctPasskey={landing.bankSoalPasskey}
                language={language}
                onSuccess={() => { sessionStorage.setItem('banksoal_access', 'granted'); setHasAccess(true); setShowPasskeyModal(false); }}
            />
        </>
    );
}
