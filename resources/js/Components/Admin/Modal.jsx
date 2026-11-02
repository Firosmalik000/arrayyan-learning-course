export default function Modal({ isOpen, onClose, title, footer, children, size = 'md', maxWidth, bodyClassName = 'p-5' }) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
    };

    const widthClass = maxWidth || sizeClasses[size] || sizeClasses.md;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 overflow-hidden">
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={`relative w-full ${widthClass} max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0 bg-white">
                    <div className="min-w-0 flex flex-col gap-1 pr-2">
                        <h3 className="text-base font-bold text-slate-800 xs:text-lg">{title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer shrink-0"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className={`overflow-y-auto flex-1 min-h-0 ${bodyClassName}`}>
                    {children}
                </div>
                {footer && <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div>}
            </div>
        </div>
    );
}
