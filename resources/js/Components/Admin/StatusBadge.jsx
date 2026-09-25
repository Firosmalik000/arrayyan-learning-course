const tones = {
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-600',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function StatusBadge({ tone = 'slate', children, className = '' }) {
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone] || tones.slate} ${className}`}
        >
            {children}
        </span>
    );
}
