export default function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    className = '',
    icon = null,
}) {
    const variantClasses = {
        primary: 'bg-violet-50 text-violet-700 border-violet-200/80',
        secondary: 'bg-amber-50 text-amber-800 border-amber-200/80',
        accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
        rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
        sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200/70',
        outline: 'bg-white text-slate-700 border-slate-300',
        dark: 'bg-slate-900 text-white border-slate-800',
    };

    const sizeClasses = {
        xs: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
        sm: 'px-2.5 py-0.5 text-xs font-semibold',
        md: 'px-3 py-1 text-xs font-semibold',
        lg: 'px-3.5 py-1.5 text-sm font-semibold',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${
                variantClasses[variant] || variantClasses.neutral
            } ${sizeClasses[size] || sizeClasses.md} ${className}`}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
        </span>
    );
}
