import Button from './Button';

export default function EmptyState({
    title = 'Tidak Ada Data',
    description = 'Belum ada item yang sesuai dengan kriteria filter atau pencarian Anda.',
    actionLabel = 'Reset Filter',
    onAction = null,
    icon = null,
    className = '',
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center shadow-xs backdrop-blur-sm ${className}`}
        >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-brand-primary shadow-xs">
                {icon || (
                    <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                )}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500 leading-relaxed">
                {description}
            </p>
            {onAction && actionLabel && (
                <div className="mt-6">
                    <Button variant="outline" size="sm" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
