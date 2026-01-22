export default function SectionTitle({ eyebrow, title, subtitle, align = 'left' }) {
    const alignClass =
        align === 'center' ? 'text-center items-center' : 'text-left items-start';

    return (
        <div className={`flex flex-col gap-3 ${alignClass}`}>
            {eyebrow ? (
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                    {eyebrow}
                </span>
            ) : null}
            <h2 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                {title}
            </h2>
            {subtitle ? (
                <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
