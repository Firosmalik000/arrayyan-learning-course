import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import Badge from './Badge';

export default function ProgramCard({
    program,
    language = 'id',
    featured = false,
    className = '',
    showDescription = true,
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

    const price = useMemo(() => {
        const prices = [];
        if (program.price !== null && program.price !== undefined && program.price !== '') {
            const p = Number(program.price);
            if (!isNaN(p)) prices.push(p);
        }
        if (program.base_price !== null && program.base_price !== undefined && program.base_price !== '') {
            const bp = Number(program.base_price);
            if (!isNaN(bp)) prices.push(bp);
        }
        if (Array.isArray(program.packages)) {
            program.packages.forEach((pkg) => {
                if (pkg.price !== null && pkg.price !== undefined && pkg.price !== '') {
                    const pp = Number(pkg.price);
                    if (!isNaN(pp)) prices.push(pp);
                }
            });
        }
        if (prices.length > 0) {
            return Math.min(...prices);
        }
        return program.price;
    }, [program.price, program.base_price, program.packages]);

    const formatPrice = (amount) => {
        if (amount === null || amount === undefined || amount === '') {
            return language === 'en' ? 'Contact us' : 'Hubungi kami';
        }
        if (Number(amount) === 0) return language === 'en' ? 'Free' : 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const modeVariant =
        mode?.toLowerCase() === 'online'
            ? 'accent'
            : mode?.toLowerCase() === 'offline'
            ? 'secondary'
            : 'primary';

    return (
        <div
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-300 hover:shadow-xl ${
                featured ? 'ring-2 ring-violet-500/30 shadow-md' : ''
            } ${className}`}
        >
            {/* Top Media Banner */}
            <div className="relative aspect-16/10 w-full overflow-hidden bg-gradient-to-br from-violet-100 via-amber-50 to-slate-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-violet-400 bg-gradient-to-br from-violet-500/10 via-amber-500/5 to-purple-500/10">
                        <svg
                            className="h-12 w-12 text-violet-400 opacity-40 group-hover:scale-110 transition-transform"
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
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    {level && (
                        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
                            {level}
                        </span>
                    )}
                    {mode && (
                        <Badge variant={modeVariant} size="xs" className="shadow-xs backdrop-blur-md bg-white/95">
                            {mode}
                        </Badge>
                    )}
                </div>

                {/* Subtle bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
            </div>

            {/* Card Content */}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                        <Link href={`/program/${program.slug || program.id}`}>
                            {name}
                        </Link>
                    </h3>

                    {showDescription && description && (
                        <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Subjects preview */}
                    {subjects.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {subjects.slice(0, 3).map((subj, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center rounded-lg bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                                >
                                    {subj}
                                </span>
                            ))}
                            {subjects.length > 3 && (
                                <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                    +{subjects.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Price & Action Row */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                            {language === 'en' ? 'Starts from' : 'Mulai dari'}
                        </span>
                        <span className="font-display text-sm sm:text-base font-extrabold text-slate-900">
                            {formatPrice(price)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/program/${program.slug || program.id}`}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-brand-primary hover:bg-violet-50/50 transition-colors"
                        >
                            Detail
                        </Link>
                        <Link
                            href={`/pendaftaran?program_id=${program.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95"
                        >
                            <span>Daftar</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
