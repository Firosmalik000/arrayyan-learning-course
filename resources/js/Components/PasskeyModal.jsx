import { useState } from 'react';
import { router } from '@inertiajs/react';

const content = {
    id: {
        title: 'Akses Materi Khusus',
        subtitle: 'Materi ini didedikasikan untuk siswa dan pengajar terdaftar Ar Rayyan Learning Course.',
        placeholder: 'Masukkan 4-6 digit Passkey...',
        submit: 'Buka Materi Sekarang',
        cancel: 'Tutup',
        error: 'Passkey yang Anda masukkan tidak sesuai. Silakan coba kembali atau hubungi admin.',
        noPasskey: 'Belum memiliki passkey?',
        contact: 'Hubungi WhatsApp Admin ALC untuk verifikasi siswa.',
    },
    en: {
        title: 'Exclusive Material Access',
        subtitle: 'This material is dedicated to registered students and tutors of Ar Rayyan Learning Course.',
        placeholder: 'Enter Passkey...',
        submit: 'Unlock Material Now',
        cancel: 'Close',
        error: 'The passkey entered is incorrect. Please try again or contact the administrator.',
        noPasskey: "Don't have a passkey?",
        contact: 'Contact ALC Admin via WhatsApp for student verification.',
    },
};

export default function PasskeyModal({
    isOpen,
    onClose,
    targetUrl,
    correctPasskey,
    language = 'id',
    onSuccess,
}) {
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPlain, setShowPlain] = useState(false);

    const t = content[language] || content.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        const cleanInput = passkey.trim();
        const cleanCorrect = String(correctPasskey || '').trim();

        if (cleanInput === cleanCorrect) {
            sessionStorage.setItem('banksoal_access', 'granted');
            sessionStorage.setItem('olympiad_access', 'granted');

            if (onSuccess) {
                onSuccess();
            }

            if (targetUrl && !window.location.href.includes(targetUrl.split('?')[0])) {
                router.visit(targetUrl);
            }

            handleClose();
        } else {
            setError(true);
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPasskey('');
        setError(false);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-3 xs:p-4 sm:p-6">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal Window */}
                <div className="relative w-full max-w-md rounded-3xl bg-white p-5 xs:p-6 sm:p-8 shadow-2xl transition-all">
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        aria-label="Tutup"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Icon & Title */}
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-brand-primary shadow-xs">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{t.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t.subtitle}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="relative">
                            <input
                                type={showPlain ? 'text' : 'password'}
                                value={passkey}
                                onChange={(e) => {
                                    setPasskey(e.target.value);
                                    if (error) setError(false);
                                }}
                                placeholder={t.placeholder}
                                autoFocus
                                className={`w-full rounded-2xl border px-4 py-3.5 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 ${
                                    error
                                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200'
                                        : 'border-slate-200 bg-slate-50/50 focus:border-violet-500 focus:bg-white focus:ring-violet-200'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPlain(!showPlain)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                aria-label="Toggle password view"
                            >
                                {showPlain ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                                <svg className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t.error}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={!passkey.trim() || isLoading}
                                className="w-full rounded-2xl bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Memverifikasi...' : t.submit}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full rounded-2xl py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </form>

                    {/* Footer Helpline */}
                    <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                        <p className="text-xs text-slate-500">{t.noPasskey}</p>
                        <a
                            href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20ingin%20meminta%20Passkey%20untuk%20mengakses%20materi%20belajar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                        >
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>Minta Passkey via WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
