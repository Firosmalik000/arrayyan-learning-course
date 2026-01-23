import { Link } from '@inertiajs/react';
import LanguageSelector from '../Components/LanguageSelector';
import { useI18n } from '../lib/i18n';

export default function PublicLayout({ children }) {
    const { t } = useI18n();

    const navItems = [
        { href: '/', label: t('navHome') },
        { href: '/#profil', label: t('navProfile') },
        { href: '/#program', label: t('navPrograms') },
        { href: '/#banksoal', label: t('navBankSoal') },
        { href: '/olimpiade', label: t('navOlympiad') },
        { href: '/pendaftaran', label: t('navRegister') },
        { href: '/#kontak', label: t('navContact') },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-30 border-b border-violet-100/70 bg-white/90 shadow-sm backdrop-blur">
                <div className="h-1 w-full bg-gradient-to-r from-violet-700 via-purple-700 to-amber-400" />
                <div className="mx-auto flex w-full w-uull items-center justify-between px-14 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-violet-200/70">
                            <img
                                src="/images/alc-logo.png"
                                alt="ALC logo"
                                className="h-8 w-8 object-contain"
                                onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                    if (event.currentTarget.nextSibling) {
                                        event.currentTarget.nextSibling.style.display =
                                            'block';
                                    }
                                }}
                            />
                            <span className="hidden text-[10px] font-bold text-violet-700">
                                ALC
                            </span>
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-display text-sm font-semibold">
                                Ar Rayyan Learning Course
                            </p>
                            <p className="text-xs text-violet-600">
                                Membimbing dengan Hati
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="transition hover:text-violet-700"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <Link
                            href="/pendaftaran"
                            className="hidden rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-violet-800 hover:to-amber-500 sm:inline-flex"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>

                <details className="border-t border-violet-100/70 bg-white/95 px-6 py-3 md:hidden">
                    <summary className="cursor-pointer text-sm font-semibold text-violet-700">
                        Menu
                    </summary>
                    <div className="mt-3 grid gap-2 text-sm font-medium text-slate-700">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-lg px-2 py-1 transition hover:bg-violet-50 hover:text-violet-700"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </details>
            </header>

            <main>{children}</main>

            <footer className="border-t border-violet-100 bg-gradient-to-br from-white via-white to-violet-50">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-violet-200/70">
                                <img
                                    src="/images/alc-logo.png"
                                    alt="ALC logo"
                                    className="h-9 w-9 object-contain"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                        if (event.currentTarget.nextSibling) {
                                            event.currentTarget.nextSibling.style.display =
                                                'block';
                                        }
                                    }}
                                />
                                <span className="hidden text-[10px] font-bold text-violet-700">
                                    ALC
                                </span>
                            </div>
                            <div>
                                <p className="font-display text-base font-semibold">
                                    Ar Rayyan Learning Course
                                </p>
                                <p className="text-xs text-violet-600">
                                    Membimbing dengan Hati, Mencetak Generasi
                                    Berprestasi
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600">
                            Lembaga pendidikan yang mendampingi anak belajar
                            dengan pendekatan islami, hangat, dan profesional.
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Quick Links
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600">
                            {navItems.map((item) => (
                                <Link
                                    key={`footer-${item.href}`}
                                    href={item.href}
                                    className="transition hover:text-violet-700"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Kontak
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>Jl. Pendidikan Islami No. 8, Bandung</p>
                            <p>WhatsApp: +62 812-3456-7890</p>
                            <p>Email: info@alclearning.id</p>
                            <p>IG: @alclearningcourse</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-violet-100 py-4 text-center text-xs text-slate-500">
                    Copyright (c) {new Date().getFullYear()} ALC. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
