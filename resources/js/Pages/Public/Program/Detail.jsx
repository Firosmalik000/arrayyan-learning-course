import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import SeoHead from '@/Components/SeoHead';
import SectionTitle from '@/Components/SectionTitle';
import { useI18n } from '@/lib/i18n';
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

export default function ProgramDetail() {
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
    const eyebrow = titles?.program?.eyebrow || (language === 'en' ? 'Program' : 'Program');
    const listLabel = language === 'en' ? 'Back to Programs' : 'Kembali ke Program';

    const program = props.program
        ? {
            id: props.program.id,
            name: localizeField(props.program.name, language),
            level: localizeField(props.program.level, language),
            description: localizeField(props.program.description, language),
            subjects: Array.isArray(props.program.subjects) ? props.program.subjects : [],
            mode: localizeField(props.program.mode, language),
            imageUrl: props.program.image_url || null,
        }
        : null;

    const modeLabel = formatModeLabel(program?.mode);
    const description = program?.description || programText.fallbackDescription;

    const floatSlow = shouldReduceMotion ? undefined : { y: [0, -16, 0] };
    const floatFast = shouldReduceMotion ? undefined : { y: [0, -10, 0] };
    const floatSlowTransition = shouldReduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' };
    const floatFastTransition = shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 };

    return (
        <>
            <SeoHead
                title={program?.name || (language === 'en' ? 'Program Detail' : 'Detail Program')}
                description={description}
            />

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
                <div className="alc-container relative max-w-5xl">
                    <Link href="/program" className="mb-6 inline-flex items-center gap-2 text-sm text-violet-600 transition hover:text-violet-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {listLabel}
                    </Link>
                    <SectionTitle
                        eyebrow={eyebrow}
                        title={program?.name || (language === 'en' ? 'Program Detail' : 'Detail Program')}
                        subtitle={description}
                    />
                    {program && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            {modeLabel && (
                                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                                    {modeLabel}
                                </span>
                            )}
                            {program.level && (
                                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                                    {programText.levelLabel}: {program.level}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white alc-section">
                <div className="alc-container max-w-5xl">
                    {!program ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                            {language === 'en' ? 'Program not found.' : 'Program tidak ditemukan.'}
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                {program.imageUrl ? (
                                    <img
                                        src={program.imageUrl}
                                        alt={program.name}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full min-h-[240px] items-center justify-center bg-gradient-to-br from-violet-100 via-white to-amber-100 text-violet-600">
                                        <span className="text-4xl font-semibold">
                                            {program.name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold text-slate-800">
                                    {language === 'en' ? 'Program Overview' : 'Ringkasan Program'}
                                </p>
                                <p className="mt-2 text-sm text-slate-600">
                                    {description}
                                </p>

                                {Array.isArray(program.subjects) && program.subjects.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            {language === 'en' ? 'Highlights' : 'Keunggulan'}
                                        </p>
                                        <div className="mt-3 grid gap-2 text-sm text-slate-600">
                                            {program.subjects.map((item) => (
                                                <div key={item} className="flex items-start gap-2">
                                                    <span className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
