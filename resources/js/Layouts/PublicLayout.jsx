import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import LanguageSelector from '../Components/LanguageSelector';
import { useI18n } from '../lib/i18n';

const localizeField = (value, lang) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const localized = value[lang] ?? value.id ?? value.en ?? '';
    if (localized && typeof localized === 'object') {
        return localized[lang] ?? localized.id ?? localized.en ?? '';
    }
    return localized;
};

export default function PublicLayout({ children }) {
    const { t, language } = useI18n();
    const { props, url } = usePage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const logoSrc = props.appLogo || '/images/logo.jpeg';

    // Get contact info from SEO settings
    const seoContact = props.seoSettings?.contact || {};
    const socials = (seoContact.socials || []).map((social) => ({
        ...social,
        label: localizeField(social.label, language) || social.label || '',
        value: localizeField(social.value, language) || social.value || '',
        link: localizeField(social.link, language) || social.link || '',
    }));
    const phone = localizeField(seoContact.phone, language) || '+62 812-3456-7890';
    const email = localizeField(seoContact.email, language) || 'info@alclearning.id';
    const address =
        localizeField(seoContact.address?.full, language) ||
        'Jl. Pendidikan Islami No. 8, Bandung, Jawa Barat 40123';
    const mapLink = seoContact.address?.mapLink || 'https://maps.google.com';

    // Helper to get social link by key
    const getSocial = (key) => socials.find((s) => s.key === key) || {};
    const waLink =
        getSocial('whatsapp').link ||
        `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;

    // Auth status
    const authUser = props.auth?.user;
    const authPortal = props.auth?.portal;
    const isLoggedIn = !!(authUser || authPortal);
    const dashboardLink = authUser ? '/admin' : '/portal';
    const dashboardLabel = authUser
        ? t('navAdmin', 'Dashboard')
        : authPortal?.type === 'teacher'
        ? 'Portal Guru'
        : t('navPortal', 'Portal Siswa');

    // Focused, essential primary navigation links
    const primaryNavItems = [
        { href: '/', label: t('navHome', 'Beranda') },
        { href: '/program', label: t('navPrograms', 'Program Belajar') },
        { href: '/bank-soal', label: t('navBankSoal', 'Bank Soal') },
        { href: '/olimpiade', label: t('navOlympiad', 'Olimpiade') },
    ];

    // Sub-items grouped into "Tentang ALC" dropdown
    const aboutSubItems = [
        {
            href: '/#profil',
            label: t('navProfile', 'Profil Lembaga'),
            desc: 'Visi, misi, metode & keunggulan bimbingan ALC',
            badge: null,
            icon: (
                <svg className="h-4.5 w-4.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.583V21h15z" />
                </svg>
            ),
        },
        {
            href: '/#kontak',
            label: t('navContact', 'Kontak & Lokasi'),
            desc: 'Alamat kantor cabang, kontak hotline & konsultasi',
            badge: null,
            icon: (
                <svg className="h-4.5 w-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
            ),
        },
        {
            href: '/faq',
            label: t('navFaq', 'Tanya Jawab (FAQ)'),
            desc: 'Informasi kurikulum, pendaftaran & sistem belajar',
            badge: null,
            icon: (
                <svg className="h-4.5 w-4.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
            ),
        },
        {
            href: '/cek-status',
            label: t('navStatus', 'Cek Status Pendaftaran'),
            desc: 'Lacak berkas tiket formulir murid atau pengajar baru',
            badge: 'Online',
            icon: (
                <svg className="h-4.5 w-4.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            href: '/blog',
            label: 'Blog & Edukasi',
            desc: 'Tips belajar, strategi ujian & berita kegiatan ALC',
            badge: null,
            icon: (
                <svg className="h-4.5 w-4.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            ),
        },
    ];

    const isActiveRoute = (href) => {
        if (href === '/') return url === '/';
        if (href.startsWith('/#')) return false;
        return url.startsWith(href);
    };

    const isAboutActive = url.startsWith('/faq') || url.startsWith('/blog') || url.startsWith('/cek-status');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu and dropdown on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setAboutDropdownOpen(false);
    }, [url]);

    // Close dropdown on click outside or escape key
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setAboutDropdownOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setAboutDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col antialiased selection:bg-violet-100 selection:text-brand-primary">
            {/* Top Announcement Bar - Clean & Informative */}
            <div className="bg-slate-900 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4">
                <div className="max-w-7xl 2xl:max-w-[92rem] mx-auto flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 shrink-0">
                            TERBARU
                        </span>
                        <span className="text-slate-300 truncate">
                            Pendaftaran Siswa Baru Periode 2026/2027 Telah Dibuka!
                        </span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-slate-300 shrink-0 text-xs">
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition"
                        >
                            <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>Konsultasi Hotline</span>
                        </a>
                        <span className="hidden sm:inline text-slate-700">•</span>
                        <Link
                            href="/cek-status"
                            className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition"
                        >
                            <svg className="h-3.5 w-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Cek Status</span>
                        </Link>
                        <span className="hidden sm:inline text-slate-700">•</span>
                        <LanguageSelector variant="topbar" />
                    </div>
                </div>
            </div>

            {/* Main Sticky Header */}
            <header
                className={`sticky top-0 z-40 w-full transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2 sm:py-2.5'
                        : 'bg-white/90 backdrop-blur-sm border-b border-slate-100 py-2.5 xs:py-3 sm:py-4'
                }`}
            >
                <div className="max-w-7xl 2xl:max-w-[92rem] mx-auto px-3.5 xs:px-4 sm:px-6 lg:px-8 2xl:px-10 flex items-center justify-between gap-3 sm:gap-4">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-violet-50 overflow-hidden border border-slate-200/60 p-1 shadow-xs transition-transform group-hover:scale-105">
                            <img
                                src={logoSrc}
                                alt="ALC Logo"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                        e.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                }}
                            />
                            <div className="hidden h-full w-full items-center justify-center bg-brand-primary font-bold text-white text-xs rounded-xl">
                                ALC
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-extrabold tracking-tight text-slate-900 text-base sm:text-lg leading-tight group-hover:text-brand-primary transition-colors">
                                Ar Rayyan
                            </span>
                            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                                Learning Course
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Clean, Minimalist & Focused */}
                    <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
                        {primaryNavItems.map((item) => {
                            const active = isActiveRoute(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                                        active
                                            ? 'text-brand-primary font-bold'
                                            : 'text-slate-600 hover:text-brand-primary'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {active && (
                                        <span className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-brand-primary" />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Dropdown "Tentang ALC" for Institutional & Auxiliary Pages */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                                className={`relative inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                                    aboutDropdownOpen || isAboutActive
                                        ? 'text-brand-primary font-bold'
                                        : 'text-slate-600 hover:text-brand-primary'
                                }`}
                                aria-expanded={aboutDropdownOpen}
                            >
                                <span>{t('navAbout', 'Tentang ALC')}</span>
                                <svg
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                        aboutDropdownOpen ? 'rotate-180 text-brand-primary' : 'text-slate-400'
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                                {isAboutActive && (
                                    <span className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-brand-primary" />
                                )}
                            </button>

                            {/* Dropdown Menu Popover */}
                            {aboutDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-84 rounded-2xl border border-slate-200/80 bg-white/98 p-2 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                                        Informasi Lembaga & Layanan
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        {aboutSubItems.map((sub) => (
                                            <Link
                                                key={sub.href}
                                                href={sub.href}
                                                onClick={() => setAboutDropdownOpen(false)}
                                                className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-violet-50/80 transition-colors group"
                                            >
                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-violet-200 group-hover:shadow-xs transition-all">
                                                    {sub.icon}
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                                                            {sub.label}
                                                        </span>
                                                        {sub.badge && (
                                                            <span className="rounded-full bg-sky-50 px-1.5 py-0.2 text-[9px] font-bold text-sky-600 border border-sky-200/60">
                                                                {sub.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                                                        {sub.desc}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Right Header Controls - Clean & Minimalist */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Action: Login / Dashboard as clean text link */}
                        {isLoggedIn ? (
                            <Link
                                href={dashboardLink}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-brand-primary hover:text-violet-800 transition-colors"
                                title="Buka Dashboard Akun"
                            >
                                <svg className="h-4 w-4 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                                <span>{dashboardLabel}</span>
                                <span aria-hidden="true">&rarr;</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-primary transition-colors"
                                title="Masuk ke Akun Portal / Admin"
                            >
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                <span>{t('navLogin', 'Masuk')}</span>
                            </Link>
                        )}

                        {/* Primary Action: Single Filled CTA Button */}
                        <Link
                            href="/pendaftaran"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-brand-primary to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow-md hover:shadow-violet-500/25 active:scale-95 transition-all"
                        >
                            <span>{t('navRegisterCta', 'Daftar Sekarang')}</span>
                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                            aria-label="Menu"
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

                {/* Mobile Drawer / Dropdown */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 shadow-xl transition-all">
                        {/* Mobile Primary Nav */}
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                            Menu Utama
                        </div>
                        <nav className="flex flex-col gap-1 mt-1">
                            {primaryNavItems.map((item) => {
                                const active = isActiveRoute(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-violet-50 text-brand-primary font-bold'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {active && (
                                            <span className="h-2 w-2 rounded-full bg-brand-primary" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile Secondary / Institutional Links */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                                Informasi & Layanan
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                                {aboutSubItems.map((sub) => (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition"
                                    >
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/70">
                                            {sub.icon}
                                        </div>
                                        <span>{sub.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons for Mobile */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                            {/* Primary Action Button */}
                            <Link
                                href="/pendaftaran"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-indigo-600 py-3 text-sm font-bold text-white shadow-xs hover:brightness-105 transition"
                            >
                                <span>{t('navRegisterCta', 'Daftar Sekarang')}</span>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>

                            {/* Login Button on Mobile */}
                            {isLoggedIn ? (
                                <Link
                                    href={dashboardLink}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-3 text-sm font-bold text-brand-primary hover:bg-violet-100 transition"
                                >
                                    <span>Buka {dashboardLabel}</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 py-3 text-sm font-bold text-slate-800 hover:bg-violet-50 hover:text-brand-primary hover:border-violet-200 transition"
                                >
                                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    <span>Masuk ke Akun / Portal</span>
                                </Link>
                            )}

                            {/* WhatsApp Direct Action */}
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 py-2.5 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-100/80 transition"
                            >
                                <svg className="h-4 w-4 fill-emerald-600" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                <span>Konsultasi WhatsApp Admin</span>
                            </a>

                            {/* Mobile Language Selector */}
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-xs text-slate-600">
                                <span className="font-medium">Bahasa / Language:</span>
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Floating WhatsApp Quick Action Button */}
            <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 sm:gap-2.5 rounded-full bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-3 text-white shadow-xl hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                aria-label="Konsultasi WhatsApp"
            >
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden sm:inline text-xs font-bold tracking-wide">
                    Konsultasi Belajar
                </span>
            </a>

            {/* Premium Educational Institution Footer */}
            <footer className="mt-auto border-t border-slate-200/80 bg-white pt-12 sm:pt-16 pb-10 sm:pb-12 text-slate-600">
                <div className="max-w-7xl 2xl:max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
                    <div className="grid grid-cols-1 gap-8 xs:grid-cols-2 lg:grid-cols-4 lg:gap-12 2xl:gap-16">
                        {/* Col 1: Brand & Profile */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 p-1 border border-slate-200/80">
                                    <img src={logoSrc} alt="ALC Logo" className="h-full w-full object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display font-extrabold text-slate-900 text-base leading-tight">
                                        Ar Rayyan
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Learning Course
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500">
                                Lembaga bimbingan belajar terpercaya yang mendampingi tumbuh kembang akademik anak secara personal dengan fondasi adab dan karakter islami.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                {getSocial('whatsapp').link && (
                                    <a
                                        href={getSocial('whatsapp').link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition"
                                        aria-label="WhatsApp"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                    </a>
                                )}
                                {getSocial('instagram').link && (
                                    <a
                                        href={getSocial('instagram').link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                                        aria-label="Instagram"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                    </a>
                                )}
                                {email && (
                                    <a
                                        href={`mailto:${email}`}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-brand-primary transition"
                                        aria-label="Email"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 6h16v12H4z" />
                                            <path d="m4 7 8 6 8-6" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Col 2: Program Belajar */}
                        <div className="space-y-3">
                            <h4 className="font-display text-sm font-bold tracking-tight text-slate-900 uppercase">
                                Program Belajar
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/program" className="hover:text-brand-primary transition">
                                        Program Bimbingan TK & Calistung
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/program" className="hover:text-brand-primary transition">
                                        Bimbel Reguler SD (Kelas 1-6)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/program" className="hover:text-brand-primary transition">
                                        Bimbel Terpadu SMP (Kelas 7-9)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/program" className="hover:text-brand-primary transition">
                                        Persiapan UTBK & SMA (Kelas 10-12)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/program" className="hover:text-brand-primary transition">
                                        Bimbingan Intensif Privat
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Layanan & Akses */}
                        <div className="space-y-3">
                            <h4 className="font-display text-sm font-bold tracking-tight text-slate-900 uppercase">
                                Layanan & Akses
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/bank-soal" className="hover:text-brand-primary transition">
                                        Bank Soal & Latihan Ujian
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/olimpiade" className="hover:text-brand-primary transition">
                                        Pusat Lomba & Olimpiade
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pendaftaran" className="hover:text-brand-primary transition">
                                        Formulir Pendaftaran Siswa
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pendaftaran" className="hover:text-brand-primary transition">
                                        Perekrutan Guru / Pengajar ALC
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin/login" className="hover:text-brand-primary transition">
                                        Portal Staf / Admin
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4: Hubungi Kami */}
                        <div className="space-y-3">
                            <h4 className="font-display text-sm font-bold tracking-tight text-slate-900 uppercase">
                                Lokasi & Kontak
                            </h4>
                            <div className="space-y-2.5 text-sm text-slate-500">
                                <div className="flex items-start gap-2.5">
                                    <svg className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    <a
                                        href={mapLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-slate-900 transition"
                                    >
                                        {address}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition font-medium">
                                        {phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="h-5 w-5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    <a href={`mailto:${email}`} className="hover:text-slate-900 transition">
                                        {email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                        <p>© {new Date().getFullYear()} Ar Rayyan Learning Course. Hak Cipta Dilindungi Undang-Undang.</p>
                        <p className="flex items-center gap-1 text-slate-400">
                            Bimbingan Belajar Berkualitas • Berkarakter & Terpercaya
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
