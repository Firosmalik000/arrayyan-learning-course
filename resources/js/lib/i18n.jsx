import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const translations = {
    id: {
        languageLabel: 'Bahasa',
        navHome: 'Beranda',
        navProfile: 'Profil',
        navPrograms: 'Program',
        navBankSoal: 'Bank Soal',
        navOlympiad: 'Olimpiade',
        navRegister: 'Pendaftaran',
        navContact: 'Kontak',
    },
    en: {
        languageLabel: 'Language',
        navHome: 'Home',
        navProfile: 'Profile',
        navPrograms: 'Programs',
        navBankSoal: 'Question Bank',
        navOlympiad: 'Olympiad',
        navRegister: 'Registration',
        navContact: 'Contact',
    },
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('id');

    useEffect(() => {
        const saved = window.localStorage.getItem('alc_language');
        if (saved) {
            setLanguage(saved);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('alc_language', language);
    }, [language]);

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t: (key, fallback) =>
                translations[language]?.[key] ??
                translations.id?.[key] ??
                fallback ??
                key,
        }),
        [language]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useI18n must be used inside LanguageProvider');
    }
    return context;
}
