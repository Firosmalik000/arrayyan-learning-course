import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePage, router } from '@inertiajs/react';

// Global helper to trigger toasts imperatively from anywhere
export const showToast = {
    success: (message, title = 'Berhasil') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:toast', {
                detail: { type: 'success', message, title },
            }));
        }
    },
    error: (message, title = 'Terjadi Kesalahan') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:toast', {
                detail: { type: 'error', message, title },
            }));
        }
    },
    info: (message, title = 'Informasi') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:toast', {
                detail: { type: 'info', message, title },
            }));
        }
    },
    warning: (message, title = 'Peringatan') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:toast', {
                detail: { type: 'warning', message, title },
            }));
        }
    },
};

const toastIcons = {
    success: (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
    ),
    error: (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/60">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
    ),
    warning: (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
    ),
    info: (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-200/60">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    ),
};

const toastBorders = {
    success: 'border-emerald-200/80 bg-white shadow-emerald-950/5',
    error: 'border-rose-200/80 bg-white shadow-rose-950/5',
    warning: 'border-amber-200/80 bg-white shadow-amber-950/5',
    info: 'border-violet-200/80 bg-white shadow-violet-950/5',
};

function ToastItem({ toast, onDismiss }) {
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef(null);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(toast.id);
        }, 200);
    };

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            handleDismiss();
        }, toast.duration || 4500);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const pauseTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const resumeTimer = () => {
        timerRef.current = setTimeout(() => {
            handleDismiss();
        }, 2500);
    };

    return (
        <div
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3.5 rounded-2xl border p-4 shadow-xl ring-1 ring-black/5 transition-all duration-200 ${
                toastBorders[toast.type] || toastBorders.info
            } ${
                isExiting
                    ? 'translate-x-full opacity-0'
                    : 'translate-x-0 opacity-100 animate-in fade-in slide-in-from-top-3'
            }`}
            role="alert"
        >
            {toastIcons[toast.type] || toastIcons.info}

            <div className="min-w-0 flex-1 pt-0.5">
                {toast.title && (
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                        {toast.title}
                    </h4>
                )}
                <p className="mt-0.5 text-xs font-medium text-slate-600 leading-relaxed break-words">
                    {toast.message}
                </p>
            </div>

            <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup notifikasi"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const { flash, errors } = usePage().props;
    const [toasts, setToasts] = useState([]);
    const lastFlashRef = useRef({ success: null, error: null });

    // Listen to Inertia flash props changes
    useEffect(() => {
        if (!flash) return;

        if (flash.success && flash.success !== lastFlashRef.current.success) {
            lastFlashRef.current.success = flash.success;
            addToast({
                type: 'success',
                title: 'Berhasil',
                message: flash.success,
            });
        }

        if (flash.error && flash.error !== lastFlashRef.current.error) {
            lastFlashRef.current.error = flash.error;
            addToast({
                type: 'error',
                title: 'Gagal',
                message: flash.error,
            });
        }
    }, [flash]);

    // Listen to general Inertia validation errors if flash error is absent
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0 && !flash?.error) {
            const firstErrorKey = Object.keys(errors)[0];
            const errorMessage = errors[firstErrorKey];
            if (typeof errorMessage === 'string') {
                addToast({
                    type: 'error',
                    title: 'Validasi Gagal',
                    message: errorMessage,
                });
            }
        }
    }, [errors]);

    // Listen to custom imperative toast events
    useEffect(() => {
        function handleCustomToast(event) {
            const { type, message, title, duration } = event.detail || {};
            if (message) {
                addToast({ type, message, title, duration });
            }
        }

        window.addEventListener('app:toast', handleCustomToast);
        return () => window.removeEventListener('app:toast', handleCustomToast);
    }, []);

    // Listen to global Inertia request errors (network / 500)
    useEffect(() => {
        const removeErrorListener = router.on('error', (event) => {
            const errorKeys = Object.keys(event.detail?.errors || {});
            if (errorKeys.length > 0) {
                const firstMsg = event.detail.errors[errorKeys[0]];
                if (typeof firstMsg === 'string') {
                    addToast({
                        type: 'error',
                        title: 'Terjadi Kesalahan',
                        message: firstMsg,
                    });
                }
            }
        });

        const removeExceptionListener = router.on('exception', () => {
            addToast({
                type: 'error',
                title: 'Koneksi Terganggu',
                message: 'Gagal menghubungi server. Silakan coba beberapa saat lagi.',
            });
        });

        return () => {
            removeErrorListener();
            removeExceptionListener();
        };
    }, []);

    const addToast = ({ type = 'info', message, title, duration }) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { id, type, message, title, duration }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0 || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed top-5 right-5 z-[99999] flex w-full max-w-sm flex-col gap-2.5 pointer-events-none px-4 sm:px-0"
            aria-live="polite"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>,
        document.body,
    );
}
