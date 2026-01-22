import { useI18n } from '../lib/i18n';

const options = [
    { value: 'id', label: 'Bahasa Indonesia' },
    { value: 'en', label: 'English' },
];

export default function LanguageSelector() {
    const { language, setLanguage, t } = useI18n();

    return (
        <label className="flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
            <span className="hidden text-[11px] text-slate-500 sm:inline">
                {t('languageLabel')}
            </span>
            <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="bg-transparent text-xs font-semibold text-emerald-700 outline-none"
                aria-label="Language selector"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
