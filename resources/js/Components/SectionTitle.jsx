export default function SectionTitle({ eyebrow, title, subtitle, align = 'left', highlight = false }) {
    const alignClass =
        align === 'center' ? 'text-center items-center' : 'text-left items-start';

    return (
        <div className={`flex flex-col gap-2.5 ${alignClass}`}>
            {eyebrow ? (
                <span className="alc-eyebrow font-semibold uppercase text-brand-primary">
                    {eyebrow}
                </span>
            ) : null}
            <h2 className="font-display alc-section-title font-semibold text-slate-900 uppercase">
                {highlight ? (
                    <span className="relative inline-block px-4 py-2">
                        <span className="relative z-10 text-brand-primary font-bold">{title}</span>
                        <span className="absolute inset-0 -z-0 -skew-x-2 -rotate-1 rounded-xl bg-gradient-to-r from-amber-300/80 via-yellow-200/80 to-amber-300/80 shadow-md" />
                        <span className="absolute -inset-1 -z-10 skew-x-1 rotate-[0.5deg] rounded-xl bg-violet-200/40" />
                    </span>
                ) : title}
            </h2>
            {subtitle ? (
                <p className="max-w-2xl alc-subtitle text-slate-600">
                    {highlight ? (
                        <span className="relative inline-block mt-2 px-3 py-1">
                            <span className="relative z-10 font-medium text-slate-700">{subtitle}</span>
                            <span className="absolute inset-0 -z-0 -skew-x-1 rounded-lg bg-gradient-to-r from-violet-100/80 via-amber-100/60 to-violet-100/80" />
                        </span>
                    ) : subtitle}
                </p>
            ) : null}
        </div>
    );
}
