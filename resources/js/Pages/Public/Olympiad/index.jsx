import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger, toneStyles } from '@/data';

// Page-specific data
import { pageContent, events, olympiadCategories, olympiadLevels, olympiadPasskey } from './data';

export default function Olympiad() {
    const { language } = useI18n();
    const { url } = usePage();

    // Get category from URL query
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialCategory = urlParams.get('category')?.toLowerCase() || null;

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [activeLevel, setActiveLevel] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);

    const text = pageContent[language] || pageContent.id;
    const categories = olympiadCategories[language] || olympiadCategories.id;
    const levels = olympiadLevels[language] || olympiadLevels.id;

    useEffect(() => {
        const access = sessionStorage.getItem('olympiad_access') === 'granted';
        setHasAccess(access);
        if (!access) {
            setShowPasskeyModal(true);
        }
    }, []);

    // Filter events
    const filteredEvents = events.filter((event) => {
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

        return matchCategory && matchLevel && matchSearch;
    });

    return (
        <>
            <Head>
                <title>{text.title}</title>
                <meta
                    name="description"
                    content="Informasi olimpiade dan lomba prestasi siswa ALC, termasuk jadwal, jenjang, dan biaya."
                />
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
                        {text.backToHome}
                    </Link>

                    <SectionTitle
                        eyebrow="Prestasi"
                        title={text.title}
                        subtitle={text.subtitle}
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
                                placeholder={text.searchPlaceholder}
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
                        {/* Category Filter */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="alc-body-sm font-medium text-slate-500 mr-1">
                                {language === 'en' ? 'Category:' : 'Kategori:'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveCategory(null)}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeCategory === null
                                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                }`}
                            >
                                {text.categoryAll}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('gratis')}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeCategory === 'gratis'
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                                }`}
                            >
                                {language === 'en' ? 'Free' : 'Gratis'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('berbayar')}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeCategory === 'berbayar'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'
                                }`}
                            >
                                {language === 'en' ? 'Paid' : 'Berbayar'}
                            </button>
                        </div>

                        {/* Level Filter */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="alc-body-sm font-medium text-slate-500 mr-1">
                                {language === 'en' ? 'Level:' : 'Jenjang:'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveLevel(null)}
                                className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                    activeLevel === null
                                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                }`}
                            >
                                {text.levelAll}
                            </button>
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setActiveLevel(level)}
                                    className={`alc-pill alc-body-sm font-semibold transition-all duration-200 ${
                                        activeLevel === level
                                            ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    {filteredEvents.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="grid alc-gap-md md:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredEvents.map((event) => {
                                const toneClass = toneStyles[event.tone] || toneStyles.violet;
                                const eventName = event.name[language] || event.name.id;
                                const eventLevel = event.level[language] || event.level.id;
                                const eventSchedule = event.schedule[language] || event.schedule.id;
                                const eventSelection = event.selection[language] || event.selection.id;
                                const eventCategory = event.category[language] || event.category.id;
                                const eventFee = event.fee ? (event.fee[language] || event.fee.id) : null;
                                const eventDesc = event.description[language] || event.description.id;

                                return (
                                    <motion.div
                                        key={event.id}
                                        variants={fadeUp}
                                        whileHover={{ y: -6 }}
                                        className="group alc-card border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-200"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={`flex alc-icon-sm items-center justify-center ${toneClass}`}>
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
                                            <span className={`alc-pill alc-caption font-medium ${
                                                eventCategory.toLowerCase() === 'gratis' || eventCategory.toLowerCase() === 'free'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {eventCategory}
                                            </span>
                                        </div>

                                        {/* Card Content */}
                                        <h3 className="mt-3 sm:mt-4 font-display alc-card-title font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                            {eventName}
                                        </h3>
                                        <p className="mt-1.5 sm:mt-2 alc-body-sm text-slate-600 line-clamp-2">
                                            {eventDesc}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="mt-3 sm:mt-4 space-y-1.5 alc-caption text-slate-600">
                                            <p>
                                                <span className="font-semibold text-slate-700">{text.labels.schedule}</span>{' '}
                                                {eventSchedule}
                                            </p>
                                            <p>
                                                <span className="font-semibold text-slate-700">
                                                    {language === 'en' ? 'Level:' : 'Jenjang:'}
                                                </span>{' '}
                                                {eventLevel}
                                            </p>
                                            {eventFee && (
                                                <p>
                                                    <span className="font-semibold text-slate-700">{text.labels.fee}</span>{' '}
                                                    {eventFee}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-100">
                                            <Link
                                                href={`/olimpiade/${event.slug}`}
                                                className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-violet-600 to-amber-500 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-violet-700 hover:to-amber-600 min-h-[40px]"
                                            >
                                                {text.viewDetail}
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
                onClose={() => {
                    if (!hasAccess) {
                        window.location.href = '/';
                    } else {
                        setShowPasskeyModal(false);
                    }
                }}
                targetUrl={url}
                correctPasskey={olympiadPasskey}
                language={language}
                onSuccess={() => {
                    sessionStorage.setItem('olympiad_access', 'granted');
                    setHasAccess(true);
                    setShowPasskeyModal(false);
                }}
            />
        </>
    );
}
