import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger } from '@/data';

// Page-specific data
import { pageContent, olympiadLevels, olympiadPasskey } from './data';

const formatCurrency = (value) => {
    if (!value || value === 0) return null;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr, lang = 'id') => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getMonth = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.getMonth();
};

const monthNames = {
    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};

const dbToEvent = (item) => ({
    id: `db-${item.id}`,
    slug: item.slug,
    schedule_raw: item.schedule,
    name: { id: item.name, en: item.name },
    level: { id: item.level, en: item.level },
    schedule: { id: formatDate(item.schedule, 'id'), en: formatDate(item.schedule, 'en') },
    selection: { id: item.selection_system || '-', en: item.selection_system || '-' },
    category: {
        id: item.category === 'paid' ? 'Berbayar' : 'Gratis',
        en: item.category === 'paid' ? 'Paid' : 'Free',
    },
    fee: item.fee && item.fee > 0 ? { id: formatCurrency(item.fee), en: formatCurrency(item.fee) } : null,
    description: { id: item.notes || '', en: item.notes || '' },
});

const selectClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

export default function Olympiad() {
    const { language } = useI18n();
    const { url, props } = usePage();
    const allEvents = (props.olympiads || []).map(dbToEvent);

    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialCategory = urlParams.get('category')?.toLowerCase() || null;

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [activeLevel, setActiveLevel] = useState(null);
    const [activeMonth, setActiveMonth] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);

    const text = pageContent[language] || pageContent.id;
    const levels = olympiadLevels[language] || olympiadLevels.id;

    useEffect(() => {
        const access = sessionStorage.getItem('olympiad_access') === 'granted';
        setHasAccess(access);
        if (!access) setShowPasskeyModal(true);
    }, []);

    const filteredEvents = allEvents.filter((event) => {
        const eventCategory = event.category[language]?.toLowerCase() || event.category.id?.toLowerCase();
        const matchCategory = !activeCategory || eventCategory === activeCategory;
        const eventLevel = event.level[language] || event.level.id;
        const matchLevel = !activeLevel || eventLevel.includes(activeLevel);
        const eventName = event.name[language] || event.name.id;
        const eventDesc = event.description[language] || event.description.id;
        const matchSearch =
            !searchQuery ||
            eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            eventDesc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchMonth = activeMonth === null || getMonth(event.schedule_raw) === activeMonth;
        return matchCategory && matchLevel && matchMonth && matchSearch;
    });

    const hasActiveFilter = activeCategory || activeLevel || activeMonth !== null || searchQuery;

    const clearFilters = () => {
        setActiveCategory(null);
        setActiveLevel(null);
        setActiveMonth(null);
        setSearchQuery('');
    };

    return (
        <>
            <Head>
                <title>{text.title}</title>
                <meta name="description" content="Informasi olimpiade dan lomba prestasi siswa ALC, termasuk jadwal, jenjang, dan biaya." />
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
                        {text.backToHome}
                    </Link>
                    <SectionTitle eyebrow="Prestasi" title={text.title} subtitle={text.subtitle} />
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
                                    {text.searchPlaceholder}
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
                                        placeholder={text.searchPlaceholder}
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="sm:w-40">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {language === 'en' ? 'Category' : 'Kategori'}
                                </label>
                                <select value={activeCategory || ''} onChange={(e) => setActiveCategory(e.target.value || null)} className={selectClass}>
                                    <option value="">{text.categoryAll}</option>
                                    <option value="gratis">{language === 'en' ? 'Free' : 'Gratis'}</option>
                                    <option value="berbayar">{language === 'en' ? 'Paid' : 'Berbayar'}</option>
                                </select>
                            </div>

                            {/* Level */}
                            <div className="sm:w-40">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {language === 'en' ? 'Level' : 'Jenjang'}
                                </label>
                                <select value={activeLevel || ''} onChange={(e) => setActiveLevel(e.target.value || null)} className={selectClass}>
                                    <option value="">{text.levelAll}</option>
                                    {levels.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Month */}
                            <div className="sm:w-44">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {language === 'en' ? 'Month' : 'Bulan'}
                                </label>
                                <select value={activeMonth === null ? '' : activeMonth} onChange={(e) => setActiveMonth(e.target.value === '' ? null : parseInt(e.target.value))} className={selectClass}>
                                    <option value="">{language === 'en' ? 'All Months' : 'Semua Bulan'}</option>
                                    {(monthNames[language] || monthNames.id).map((month, index) => (
                                        <option key={month} value={index}>{month}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active filters info */}
                        {hasActiveFilter && (
                            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                                <p className="text-xs text-slate-500">
                                    {filteredEvents.length} {language === 'en' ? 'results found' : 'hasil ditemukan'}
                                </p>
                                <button type="button" onClick={clearFilters} className="text-xs font-medium text-violet-700 hover:text-violet-800 transition">
                                    {language === 'en' ? 'Clear filters' : 'Hapus filter'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Results Grid */}
                    {filteredEvents.length > 0 ? (
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid alc-gap-md md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map((event) => {
                                const eventName = event.name[language] || event.name.id;
                                const eventLevel = event.level[language] || event.level.id;
                                const eventSchedule = event.schedule[language] || event.schedule.id;
                                const eventSelection = event.selection[language] || event.selection.id;
                                const eventCategory = event.category[language] || event.category.id;
                                const eventFee = event.fee ? (event.fee[language] || event.fee.id) : null;
                                const eventDesc = event.description[language] || event.description.id;
                                const isFree = eventCategory.toLowerCase() === 'gratis' || eventCategory.toLowerCase() === 'free';

                                return (
                                    <motion.div
                                        key={event.id}
                                        variants={fadeUp}
                                        whileHover={{ y: -4 }}
                                        className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-200"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                                </svg>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                isFree ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {eventCategory}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <h3 className="mt-3 text-base font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                            {eventName}
                                        </h3>
                                        {eventDesc && (
                                            <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{eventDesc}</p>
                                        )}

                                        {/* Meta */}
                                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                                <span>{eventSchedule}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                                                </svg>
                                                <span>{eventLevel}</span>
                                            </div>
                                            {eventFee && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                                    </svg>
                                                    <span>{eventFee}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action */}
                                        {event.slug && (
                                            <div className="mt-auto pt-4">
                                                <Link
                                                    href={`/olimpiade/${event.slug}`}
                                                    className="inline-flex w-full items-center justify-center rounded-full bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-violet-800"
                                                >
                                                    {text.viewDetail}
                                                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                </svg>
                            </div>
                            <p className="text-slate-500">{text.noResults}</p>
                        </div>
                    )}
                </div>
            </section>

            <PasskeyModal
                isOpen={showPasskeyModal}
                onClose={() => { if (!hasAccess) { window.location.href = '/'; } else { setShowPasskeyModal(false); } }}
                targetUrl={url}
                correctPasskey={olympiadPasskey}
                language={language}
                onSuccess={() => { sessionStorage.setItem('olympiad_access', 'granted'); setHasAccess(true); setShowPasskeyModal(false); }}
            />
        </>
    );
}
