import { useState } from 'react';
import { router } from '@inertiajs/react';

const content = {
    id: {
        title: 'Masukkan Passkey',
        subtitle: 'Masukkan passkey untuk mengakses materi ini',
        placeholder: 'Masukkan passkey...',
        submit: 'Akses Materi',
        cancel: 'Batal',
        error: 'Passkey salah. Silakan coba lagi.',
        noPasskey: 'Tidak punya passkey?',
        contact: 'Hubungi kami untuk mendapatkan akses.',
    },
    en: {
        title: 'Enter Passkey',
        subtitle: 'Enter the passkey to access this material',
        placeholder: 'Enter passkey...',
        submit: 'Access Material',
        cancel: 'Cancel',
        error: 'Wrong passkey. Please try again.',
        noPasskey: "Don't have a passkey?",
        contact: 'Contact us to get access.',
    },
};

export default function PasskeyModal({ isOpen, onClose, targetUrl, correctPasskey, language = 'id', onSuccess }) {
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const t = content[language] || content.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        // Check passkey
        if (passkey === correctPasskey) {
            // Call onSuccess callback if provided (for global access storage)
            if (onSuccess) {
                onSuccess();
                // If onSuccess is provided, let it handle the navigation
                // Only navigate if we need to go to a different page
                if (targetUrl && !window.location.href.includes(targetUrl.split('?')[0])) {
                    router.visit(targetUrl);
                }
            } else {
                router.visit(targetUrl);
            }
        } else {
            setError(true);
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPasskey('');
        setError(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{t.title}</h3>
                                <p className="text-sm text-slate-500">{t.subtitle}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            {/* Passkey Input */}
                            <div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                            />
                                        </svg>
                                    </span>
                                    <input
                                        type="password"
                                        value={passkey}
                                        onChange={(e) => {
                                            setPasskey(e.target.value);
                                            setError(false);
                                        }}
                                        placeholder={t.placeholder}
                                        className={`w-full rounded-xl border ${
                                            error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                                        } bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:ring-2`}
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                        </svg>
                                        {t.error}
                                    </p>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                                <p className="text-sm font-medium text-amber-800">{t.noPasskey}</p>
                                <p className="mt-1 text-sm text-amber-700">{t.contact}</p>
                                <a
                                    href="https://wa.me/6281234567890"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={!passkey || isLoading}
                                className="flex-1 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Loading...
                                    </span>
                                ) : (
                                    t.submit
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
