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
        primary: 'bg-violet-50/80 text-violet-700 border-violet-200/70',
        secondary: 'bg-amber-50/80 text-amber-800 border-amber-200/70',
        accent: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70',
        neutral: 'bg-slate-100/80 text-slate-700 border-slate-200/80',
    }[badgeColor] || 'bg-violet-50/80 text-violet-700 border-violet-200/70';

    return (
        <div className={`flex flex-col max-w-3xl ${alignClass} ${className}`}>
            {eyebrow && (
                <div className="mb-3.5 inline-flex items-center">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs ${badgeColorClasses}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {eyebrow}
                    </span>
                </div>
            )}
            {title && (
                <h2
                    className={`font-display text-2xl sm:text-3xl md:text-[2.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.2] ${titleClassName}`}
                >
                    {title}
                </h2>
            )}
            {subtitle && (
                <p
                    className={`mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl ${subtitleClassName}`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
