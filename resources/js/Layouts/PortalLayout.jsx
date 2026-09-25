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
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link href="/portal" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary font-display text-sm font-bold text-white">
                            ALC
                        </span>
                        <span className="leading-tight">
                            <span className="block text-sm font-bold text-slate-900">Portal {type === 'teacher' ? 'Pengajar' : 'Murid'}</span>
                            <span className="block text-xs text-slate-500">{portalAuth?.name || ''}</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800 sm:inline">
                            Website
                        </Link>
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
                <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
                    {links.map((link) => {
                        const active = path === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                    active
                                        ? 'bg-brand-primary text-white shadow'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                {props.flash?.success && (
                    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {props.flash.success}
                    </div>
                )}
                {props.flash?.error && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {props.flash.error}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
