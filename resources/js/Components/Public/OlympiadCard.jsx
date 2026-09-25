import { Link } from '@inertiajs/react';
import Badge from './Badge';

export default function OlympiadCard({
    olympiad,
    language = 'id',
    className = '',
}) {
    if (!olympiad) return null;

    const localize = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[language] || val.id || val.en || '';
    };

    const name = localize(olympiad.name);
    const level = localize(olympiad.level);
    const schedule = localize(olympiad.schedule);
    const selection = localize(olympiad.selection || olympiad.selection_system);
    const category = localize(olympiad.category);
    const fee = localize(olympiad.fee);
    const notes = localize(olympiad.notes || olympiad.description);
    const imageUrl = olympiad.image_url;

    const isPaid =
        String(category).toLowerCase() === 'berbayar' ||
        String(category).toLowerCase() === 'paid';

    return (
        <div
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl ${className}`}
        >
            {/* Top Media / Header */}
            <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-violet-50">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-amber-500">
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
                                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.982-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.25h13.5v1.986m-13.5 0A23.515 23.515 0 0112 3.75c2.617 0 5.12.395 7.5 1.125m-1.125.361c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.396 4.972m2.48-5.492V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.01 6.01 0 01-4.75 0"
                            />
                        </svg>
                    </div>
                )}

                {/* Floating Tags */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <Badge variant={isPaid ? 'warning' : 'accent'} size="xs" className="shadow-xs backdrop-blur-md bg-white/95">
                        {isPaid ? (fee || 'Berbayar') : 'Gratis'}
                    </Badge>
                    {level && (
                        <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                            {level}
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex-1">
                    {/* Schedule Date Badge */}
                    {schedule && (
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{schedule}</span>
                        </div>
                    )}

                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        <Link href={`/olimpiade/${olympiad.slug}`}>
                            {name}
                        </Link>
                    </h3>

                    {notes && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {notes}
                        </p>
                    )}

                    {selection && selection !== '-' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-400">Sistem Seleksi:</span>
                            <span className="font-semibold text-slate-700">{selection}</span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <Link
                        href={`/olimpiade/${olympiad.slug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors inline-flex items-center gap-1"
                    >
                        <span>Info Lomba</span>
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <Link
                        href={`/olimpiade/${olympiad.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95"
                    >
                        <span>Daftar / Detail</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
