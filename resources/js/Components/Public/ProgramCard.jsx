import { Link } from '@inertiajs/react';
import Badge from './Badge';

export default function ProgramCard({
    program,
    language = 'id',
    featured = false,
    className = '',
}) {
    if (!program) return null;

    const localize = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[language] || val.id || val.en || '';
    };

    const name = localize(program.name);
    const level = localize(program.level);
    const description = localize(program.description);
    const mode = localize(program.mode);
    const subjects = Array.isArray(program.subjects) ? program.subjects : [];
    const imageUrl = program.image_url || program.imageUrl;

    const modeVariant =
        mode?.toLowerCase() === 'online'
            ? 'accent'
            : mode?.toLowerCase() === 'offline'
            ? 'secondary'
            : 'primary';

    return (
        <div
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl ${
                featured ? 'ring-2 ring-violet-500/20 shadow-md' : ''
            } ${className}`}
        >
            {/* Top Image / Media Area */}
            <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-violet-100 via-amber-50 to-emerald-50">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-violet-400">
                        <svg
                            className="h-16 w-16 opacity-30"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                            />
                        </svg>
                    </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    {level && (
                        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                            {level}
                        </span>
                    )}
                    {mode && (
                        <Badge variant={modeVariant} size="xs" className="shadow-xs backdrop-blur-md bg-white/95">
                            {mode}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex-1">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                        <Link href={`/program/${program.id}`}>
                            {name}
                        </Link>
                    </h3>

                    {description && (
                        <p className="mt-2.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Subject Tags */}
                    {subjects.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {subjects.slice(0, 3).map((subj, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                                >
                                    {subj}
                                </span>
                            ))}
                            {subjects.length > 3 && (
                                <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                                    +{subjects.length - 3} lagi
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <Link
                        href={`/program/${program.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-brand-primary transition-colors inline-flex items-center gap-1"
                    >
                        <span>Selengkapnya</span>
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <Link
                        href={`/pendaftaran?program_id=${program.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95"
                    >
                        <span>Daftar</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
