import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';
import { formatDate, parseDateValue } from '@/lib/formatDate';

// Shared data
import { fadeUp, stagger } from '@/data';

// Page-specific data
import { pageContent, olympiadLevels, olympiadPasskey } from './data';

const formatCurrency = (value, lang = 'id') => {
    if (!value || value === 0) return lang === 'en' ? 'Free' : 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const getMonth = (dateStr) => {
    if (!dateStr) return null;
    const date = parseDateValue(dateStr);
    if (!date) return null;
    return date.getMonth();
};

const monthNames = {
    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};

const dbToEvent = (item) => ({
    id: `db-${item.id}`,
    slug: item.slug,
    schedule_raw: item.schedule,
    image_url: item.image_url || null,
    name: { id: item.name, en: item.name },
    level: { id: item.level, en: item.level },
    schedule: { id: formatDate(item.schedule, 'id'), en: formatDate(item.schedule, 'en') },
    selection: { id: item.selection_system || '-', en: item.selection_system || '-' },
    category: {
        id: item.category === 'paid' ? 'Berbayar' : 'Gratis',
        en: item.category === 'paid' ? 'Paid' : 'Free',
    },
    fee: { id: formatCurrency(item.fee, 'id'), en: formatCurrency(item.fee, 'en') },
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
    const shouldReduceMotion = useReducedMotion();
    const floatSlow = shouldReduceMotion ? undefined : { y: [0, -16, 0] };
    const floatFast = shouldReduceMotion ? undefined : { y: [0, -10, 0] };
    const floatSlowTransition = shouldReduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' };
    const floatFastTransition = shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 };
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
            <SeoHead
                title={text.title}
                description={language === 'id'
                    ? 'Informasi olimpiade dan lomba prestasi siswa ALC, termasuk jadwal, jenjang, dan biaya.'
                    : 'Information about ALC student olympiads and competitions, including schedules, levels, and fees.'}
            />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section-tight">
                <motion.div
                    aria-hidden
                    animate={floatSlow}
                    transition={floatSlowTransition}
                    className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl"
                />
                <motion.div
                    aria-hidden
                    animate={floatFast}
                    transition={floatFastTransition}
                    className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl"
                />
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
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            variants={stagger}
                            className="grid alc-gap-md sm:grid-cols-2 xl:grid-cols-3"
                        >
                            {filteredEvents.map((event) => {
                                const eventName = event.name[language] || event.name.id;
                                const eventLevel = event.level[language] || event.level.id;
                                const eventSchedule = event.schedule[language] || event.schedule.id;
                                const eventCategory = event.category[language] || event.category.id;
                                const eventFee = event.fee ? (event.fee[language] || event.fee.id) : null;
                                const isFree = eventCategory.toLowerCase() === 'gratis' || eventCategory.toLowerCase() === 'free';

                                return (
                                    <motion.div
                                        key={event.id}
                                        variants={fadeUp}
                                        whileHover={{ y: -4 }}
                                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-200"
                                    >
                                        <div className="relative">
                                            {event.image_url ? (
                                                <img
                                                    src={event.image_url}
                                                    alt={eventName}
                                                    className="h-44 w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-44 items-center justify-center bg-slate-50 text-slate-300">
                                                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                                                isFree ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {eventCategory}
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col gap-3 p-5">
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                                    {eventName}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">{eventLevel}</p>
                                            </div>

                                            <div className="space-y-2 text-sm text-slate-600">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">{language === 'en' ? 'Schedule' : 'Jadwal'}</span>
                                                    <span className="font-medium text-slate-700">{eventSchedule}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">{language === 'en' ? 'Fee' : 'Biaya'}</span>
                                                    <span className="font-medium text-slate-700">{eventFee}</span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            {event.slug && (
                                                <div className="mt-auto pt-2">
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
                                        </div>
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
