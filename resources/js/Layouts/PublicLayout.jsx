import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LanguageSelector from '../Components/LanguageSelector';
import { useI18n } from '../lib/i18n';

const localizeField = (value, lang) => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    const localized = value[lang] ?? value.id ?? value.en ?? '';
    if (localized && typeof localized === 'object') {
        return localized[lang] ?? localized.id ?? localized.en ?? '';
    }

    return localized;
};

export default function PublicLayout({ children }) {
    const { t, language } = useI18n();
    const { props } = usePage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logoSrc = props.appLogo || '/images/logo.jpeg';

    // Get contact info from SEO settings (centralized source)
    const seoContact = props.seoSettings?.contact || {};
    const socials = (seoContact.socials || []).map((social) => ({
        ...social,
        label: localizeField(social.label, language) || social.label || '',
        value: localizeField(social.value, language) || social.value || '',
        link: localizeField(social.link, language) || social.link || '',
    }));
    const phone = localizeField(seoContact.phone, language) || '';
    const email = localizeField(seoContact.email, language) || '';
    const address = localizeField(seoContact.address?.full, language) || '';

    // Helper to get social link by key
    const getSocial = (key) => socials.find((s) => s.key === key) || {};

    const navItems = [
        { href: '/', label: t('navHome') },
        { href: '/#profil', label: t('navProfile') },
        { href: '/#program', label: t('navPrograms') },
        { href: '/olimpiade', label: t('navOlympiad') },
        { href: '/pendaftaran', label: t('navRegister') },
        { href: '/#kontak', label: t('navContact') },
    ];

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="public-theme min-h-screen bg-brand-faint text-slate-900">
            <header className="sticky top-0 z-30 border-b border-brand-soft bg-white/95 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center">
                            <img
                                src={logoSrc}
                                alt="ALC logo"
                                className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                                onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                    if (event.currentTarget.nextSibling) {
                                        event.currentTarget.nextSibling.style.display = 'block';
                                    }
                                }}
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-full px-3 py-2 text-base font-medium text-slate-600 transition hover:bg-brand-faint hover:text-brand-primary"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSelector />
                        <Link
                            href="/pendaftaran"
                            className="hidden rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:opacity-90 sm:inline-flex"
                        >
                            Daftar
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-soft bg-white text-slate-600 transition hover:bg-brand-faint hover:text-brand-primary lg:hidden"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

            </header>

            {/* Mobile Navigation Overlay */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    onClick={closeMenu}
                />

                {/* Menu Panel */}
                <div
                    className={`absolute right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl transition-transform duration-300 ease-out ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Menu Header */}
                    <div className="flex items-center justify-between border-b border-brand-soft px-5 py-4">
                        <p className="font-display text-sm font-semibold text-slate-800">Menu</p>
                        <button
                            type="button"
                            onClick={closeMenu}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-brand-soft hover:text-brand-primary"
                            aria-label="Close menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="px-3 py-4">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-brand-faint hover:text-brand-primary"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Menu Footer */}
                    <div className="absolute bottom-0 left-0 right-0 border-t border-brand-soft bg-brand-faint p-4">
                        <Link
                            href="/pendaftaran"
                            onClick={closeMenu}
                            className="flex w-full items-center justify-center rounded-full bg-brand-primary px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            Daftar Sekarang
                        </Link>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            {getSocial('whatsapp').link && (
                                <a
                                    href={getSocial('whatsapp').link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 transition hover:bg-green-100"
                                    aria-label="WhatsApp"
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                </a>
                            )}
                            {getSocial('instagram').link && (
                                <a
                                    href={getSocial('instagram').link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition hover:bg-pink-100"
                                    aria-label="Instagram"
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            )}
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-faint text-brand-primary transition hover:bg-brand-soft"
                                    aria-label="Email"
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 6h16v12H4z" />
                                        <path d="m4 7 8 6 8-6" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main>{children}</main>

            <footer className="border-t border-brand-soft bg-brand-footer">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[1.3fr_1fr_1fr]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                <img
                                    src={logoSrc}
                                    alt="ALC logo"
                                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                        if (event.currentTarget.nextSibling) {
                                            event.currentTarget.nextSibling.style.display = 'block';
                                        }
                                    }}
                                />
                              
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Lembaga pendidikan yang mendampingi anak belajar
                            dengan pendekatan islami, hangat, dan profesional.
                        </p>
                        <div className="flex items-center gap-3">
                            {getSocial('whatsapp').link && (
                                <a
                                    href={getSocial('whatsapp').link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600 transition hover:bg-green-100"
                                    aria-label="WhatsApp"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                </a>
                            )}
                            {getSocial('instagram').link && (
                                <a
                                    href={getSocial('instagram').link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition hover:bg-pink-100"
                                    aria-label="Instagram"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            )}
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-faint text-brand-primary transition hover:bg-brand-soft"
                                    aria-label="Email"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 6h16v12H4z" />
                                        <path d="m4 7 8 6 8-6" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-base font-semibold text-slate-800">
                            Menu
                        </p>
                        <nav className="mt-3 grid gap-2 text-base text-slate-600">
                            {navItems.map((item) => (
                                <Link
                                    key={`footer-${item.href}`}
                                    href={item.href}
                                    className="transition hover:text-brand-primary"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Kontak
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                            {address && (
                                <p className="flex items-start gap-2">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 mt-0.5 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
                                        <circle cx="12" cy="11" r="2" />
                                    </svg>
                                    {address}
                                </p>
                            )}
                            {phone && (
                                <p className="flex items-center gap-2">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6.5 4.5h3l1 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1v3c0 1.1-.9 2-2 2-8.3 0-15-6.7-15-15 0-1.1.9-2 2-2Z" />
                                    </svg>
                                    {phone}
                                </p>
                            )}
                            {email && (
                                <p className="flex items-center gap-2">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 6h16v12H4z" />
                                        <path d="m4 7 8 6 8-6" />
                                    </svg>
                                    {email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t border-brand-soft py-4 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} Ar Rayyan Learning Course. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
