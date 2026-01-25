export default function SectionTitle({ eyebrow, title, subtitle, align = 'left' }) {
    const alignClass =
        align === 'center' ? 'text-center items-center' : 'text-left items-start';

    return (
        <div className={`flex flex-col gap-2.5 ${alignClass}`}>
            {eyebrow ? (
                <span className="alc-eyebrow font-semibold uppercase text-violet-600">
                    {eyebrow}
                </span>
            ) : null}
            <h2 className="font-display alc-section-title font-semibold text-slate-900">
                {title}
            </h2>
            {subtitle ? (
                <p className="max-w-2xl alc-subtitle text-slate-600">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
