import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import SeoHead from '@/Components/SeoHead';
import SectionTitle from '@/Components/SectionTitle';
import { useI18n } from '@/lib/i18n';
import { fadeUp, stagger } from '@/data';
import { programContent, sectionTitles } from '../Home/data';

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

const formatModeLabel = (value) => {
    if (!value) return null;
    const normalized = String(value).toLowerCase();
    if (normalized === 'online') return 'Online';
    if (normalized === 'offline') return 'Offline';
    return value;
};

export default function ProgramIndex() {
    const { language } = useI18n();
    const { props } = usePage();
    const shouldReduceMotion = useReducedMotion();

    const landing = mergeContent(
        {
            programContent,
            sectionTitles,
        },
        props.landingContent || {},
    );

    const titles = landing.sectionTitles[language] || landing.sectionTitles.id;
    const programText = landing.programContent[language] || landing.programContent.id;
    const eyebrow = titles?.program?.eyebrow || (language === 'en' ? 'Programs' : 'Program');
    const title = titles?.program?.title || (language === 'en' ? 'Learning Programs' : 'Program Belajar');
    const subtitle = titles?.program?.subtitle || (language === 'en'
        ? 'Flexible packages tailored to students and families.'
        : 'Paket belajar yang fleksibel untuk kebutuhan siswa dan keluarga.');

    const programs = (props.programs || []).map((item) => ({
        id: item.id,
        name: localizeField(item.name, language),
        level: localizeField(item.level, language),
        description: localizeField(item.description, language),
        subjects: Array.isArray(item.subjects) ? item.subjects : [],
        mode: localizeField(item.mode, language),
        imageUrl: item.image_url || null,
    }));

    const floatSlow = shouldReduceMotion ? undefined : { y: [0, -16, 0] };
    const floatFast = shouldReduceMotion ? undefined : { y: [0, -10, 0] };
    const floatSlowTransition = shouldReduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' };
    const floatFastTransition = shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 };

    return (
        <>
            <SeoHead title={title} description={subtitle} />

            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section-tight">
                <motion.div
                    aria-hidden
                    animate={floatSlow}
                    transition={floatSlowTransition}
                    className="absolute -left-24 top-10 h-32 w-32 rounded-full bg-violet-200/60 blur-3xl sm:h-52 sm:w-52"
                />
                <motion.div
                    aria-hidden
                    animate={floatFast}
                    transition={floatFastTransition}
                    className="absolute right-0 top-20 h-40 w-40 rounded-full bg-amber-200/70 blur-3xl sm:h-64 sm:w-64"
                />
                <div className="alc-container relative max-w-6xl">
                    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-violet-600 transition hover:text-violet-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {language === 'en' ? 'Back to Home' : 'Kembali ke Beranda'}
                    </Link>
                    <SectionTitle eyebrow={eyebrow} title={title} subtitle={subtitle} />
                </div>
            </section>

            <section className="bg-white alc-section">
                <div className="alc-container max-w-6xl">
                    {programs.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            variants={stagger}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {programs.map((item) => {
                                const description = item.description || programText.fallbackDescription;
                                const modeLabel = formatModeLabel(item.mode);
                                return (
                                    <motion.div
                                        key={item.id}
                                        variants={fadeUp}
                                        whileHover={{ y: -6 }}
                                        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 via-white to-amber-100 text-violet-600">
                                                    <span className="text-2xl font-semibold">
                                                        {item.name?.charAt(0) || 'A'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />
                                            <div className="absolute right-3 top-3 flex flex-wrap items-center gap-2">
                                                {modeLabel && (
                                                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                                                        {modeLabel}
                                                    </span>
                                                )}
                                                {item.level && (
                                                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                                                        {item.level}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex h-full flex-col gap-3 p-5">
                                            <div>
                                                <h3 className="font-display text-base font-semibold text-slate-800">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                                    {description}
                                                </p>
                                            </div>
                                            {Array.isArray(item.subjects) && item.subjects.length > 0 && (
                                                <div className="mt-auto flex flex-wrap gap-2">
                                                    {item.subjects.slice(0, 4).map((subject) => (
                                                        <span
                                                            key={`${item.id}-${subject}`}
                                                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                                        >
                                                            {subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <Link
                                                href={`/program/${item.id}`}
                                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
                                            >
                                                {language === 'en' ? 'View Detail' : 'Lihat Detail'}
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                            {language === 'en' ? 'Programs will be available soon.' : 'Program akan segera tersedia.'}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
