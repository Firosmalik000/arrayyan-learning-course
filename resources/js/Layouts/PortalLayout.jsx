import { Link, router, usePage } from '@inertiajs/react';

const studentLinks = [
    { href: '/portal', label: 'Dashboard' },
    { href: '/portal/jadwal', label: 'Jadwal' },
    { href: '/portal/absensi', label: 'Absensi' },
    { href: '/portal/nilai', label: 'Nilai' },
    { href: '/portal/tagihan', label: 'Tagihan' },
    { href: '/portal/profil', label: 'Profil' },
];

const teacherLinks = [
    { href: '/portal', label: 'Dashboard' },
    { href: '/portal/jadwal', label: 'Jadwal' },
    { href: '/portal/profil', label: 'Profil' },
];

export default function PortalLayout({ children }) {
    const { props, url } = usePage();
    const portalAuth = props.portalAuth ?? null;
    const type = portalAuth?.type || props.account_type || 'student';
    const links = type === 'teacher' ? teacherLinks : studentLinks;
    const path = url.split('?')[0];

    const logout = () => {
        router.post('/portal/logout');
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col antialiased selection:bg-violet-100 selection:text-brand-primary">
            {/* Sticky Modern Portal Header */}
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    {/* Brand & User Info */}
                    <Link href="/portal" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 font-display text-sm font-extrabold text-white shadow-xs group-hover:scale-105 transition-transform">
                            ALC
                        </div>
                        <div className="leading-tight">
                            <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-slate-900 text-sm sm:text-base">
                                    Portal
                                </span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        type === 'teacher'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-violet-100 text-brand-primary'
                                    }`}
                                >
                                    {type === 'teacher' ? 'Pengajar' : 'Murid'}
                                </span>
                            </div>
                            <span className="block text-xs text-slate-500 font-medium truncate max-w-[180px] sm:max-w-xs">
                                {portalAuth?.name || ''}
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="hidden rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-brand-primary sm:inline"
                        >
                            Website
                        </Link>
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                            Keluar
                        </button>
                    </div>
                </div>

                {/* Sub Navigation Bar */}
                <div className="border-t border-slate-100 bg-slate-50/60">
                    <nav className="mx-auto flex max-w-5xl gap-1.5 overflow-x-auto px-4 py-2 sm:px-6 scrollbar-none">
                        {links.map((link) => {
                            const active = path === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                                        active
                                            ? 'bg-brand-primary text-white shadow-xs'
                                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                {props.flash?.success && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800 shadow-2xs">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs">
                            ✓
                        </span>
                        <span>{props.flash.success}</span>
                    </div>
                )}
                {props.flash?.error && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-800 shadow-2xs">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs">
                            !
                        </span>
                        <span>{props.flash.error}</span>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
