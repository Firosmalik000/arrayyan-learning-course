import { useI18n } from '../lib/i18n';

export default function LanguageSelector() {
    const { language, setLanguage } = useI18n();

    return (
        <div className="flex items-center rounded-full border border-violet-200/70 bg-white/90 p-0.5 text-xs font-semibold shadow-sm backdrop-blur">
            <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`rounded-full px-2.5 py-1 transition ${
                    language === 'id'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-violet-700'
                }`}
                aria-label="Bahasa Indonesia"
            >
                ID
            </button>
            <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-full px-2.5 py-1 transition ${
                    language === 'en'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-violet-700'
                }`}
                aria-label="English"
            >
                EN
            </button>
        </div>
    );
}
