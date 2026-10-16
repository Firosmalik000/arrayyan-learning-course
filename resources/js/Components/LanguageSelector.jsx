import { useI18n } from '../lib/i18n';

export default function LanguageSelector({ className = '', variant = 'light' }) {
    const { language, setLanguage } = useI18n();

    if (variant === 'topbar' || variant === 'dark') {
        return (
            <div
                className={`inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 ${className}`}
                role="group"
                aria-label="Pilih Bahasa"
            >
                <button
                    type="button"
                    onClick={() => setLanguage('id')}
                    className={`rounded px-1.5 py-0.5 transition cursor-pointer ${
                        language === 'id'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                    aria-label="Bahasa Indonesia"
                >
                    ID
                </button>
                <span className="text-slate-600">/</span>
                <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`rounded px-1.5 py-0.5 transition cursor-pointer ${
                        language === 'en'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                    aria-label="English"
                >
                    EN
                </button>
            </div>
        );
    }

    return (
        <div
            className={`inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/80 p-0.5 text-[11px] font-bold shadow-2xs backdrop-blur-xs transition ${className}`}
            role="group"
            aria-label="Pilih Bahasa"
        >
            <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`rounded-full px-2 py-0.5 transition-all duration-150 cursor-pointer ${
                    language === 'id'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-label="Bahasa Indonesia"
            >
                ID
            </button>
            <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-full px-2 py-0.5 transition-all duration-150 cursor-pointer ${
                    language === 'en'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-label="English"
            >
                EN
            </button>
        </div>
    );
}
