export default function SectionHeader({
    eyebrow,
    title,
    subtitle,
    align = 'center',
    className = '',
    titleClassName = '',
    subtitleClassName = '',
    badgeColor = 'primary',
}) {
    const alignClass = {
        center: 'text-center items-center mx-auto',
        left: 'text-left items-start',
        right: 'text-right items-end ml-auto',
    }[align] || 'text-center items-center mx-auto';

    const badgeColorClasses = {
        primary: 'bg-violet-50 text-violet-700 border-violet-200/80',
        secondary: 'bg-amber-50 text-amber-800 border-amber-200/80',
        accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    }[badgeColor] || 'bg-violet-50 text-violet-700 border-violet-200/80';

    return (
        <div className={`flex flex-col max-w-3xl ${alignClass} ${className}`}>
            {eyebrow && (
                <div className="mb-3 inline-flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${badgeColorClasses}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {eyebrow}
                    </span>
                </div>
            )}
            {title && (
                <h2
                    className={`font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-[1.2] ${titleClassName}`}
                >
                    {title}
                </h2>
            )}
            {subtitle && (
                <p
                    className={`mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl ${subtitleClassName}`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
