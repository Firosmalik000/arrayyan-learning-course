import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import ToastContainer from '@/Components/Toast';

const parentMenuItems = [
    {
        href: '/portal',
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: '/portal/jadwal',
        label: 'Jadwal Belajar',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        href: '/portal/absensi',
        label: 'Rekap Absensi',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        href: '/portal/nilai',
        label: 'Laporan Nilai',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
        ),
    },
    {
        href: '/portal/tagihan',
        label: 'Tagihan & Biaya',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),
    },
    {
        href: '/portal/profil',
        label: 'Profil Akun',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

const teacherMenuItems = [
    {
        href: '/portal',
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: '/portal/jadwal',
        label: 'Jadwal Mengajar',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        href: '/portal/profil',
        label: 'Profil Pengajar',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function PortalLayout({ children }) {
    const { props, url } = usePage();
    const portalAuth = props.portalAuth ?? null;
    const isTeacher = portalAuth?.type === 'teacher' || props.account_type === 'teacher';
    const typeLabel = isTeacher ? 'Pengajar' : 'Orang Tua';
    const menuItems = isTeacher ? teacherMenuItems : parentMenuItems;
    const path = url.split('?')[0];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    const logout = () => {
        router.post('/portal/logout');
    };

    const handleSwitchStudent = (studentId) => {
        setIsSwitching(true);
        router.post(
            `/portal/pilih-anak/${studentId}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsSwitching(false),
            }
        );
    };

    const students = portalAuth?.students ?? [];
    const selectedStudentId = portalAuth?.selected_student_id ?? students[0]?.id;
    const activeStudent = students.find((s) => s.id === Number(selectedStudentId)) || students[0];

    const userName = portalAuth?.name || (isTeacher ? 'Pengajar' : 'Orang Tua Murid');
    const userContact = portalAuth?.contact || portalAuth?.email || '';
    const userInitials = userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || (isTeacher ? 'PG' : 'OT');

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex antialiased selection:bg-violet-100 selection:text-brand-primary">
            {/* Desktop Sidebar (Mirip AdminLayout) */}
            <aside className="hidden w-64 md:w-72 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl md:flex h-screen sticky top-0 shrink-0">
                {/* Brand / Logo Header */}
                <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                    <Link href="/portal" className="flex items-center gap-3 group">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 font-display text-base font-black text-white shadow-brand transition-transform group-hover:scale-105">
                            ALC
                        </div>
                        <div className="leading-tight">
                            <span className="block font-display font-extrabold text-slate-900 text-sm tracking-tight">
                                Ar Rayyan LC
                            </span>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        isTeacher
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-violet-100 text-brand-primary'
                                    }`}
                                >
                                    Portal {typeLabel}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Menu Utama
                    </div>
                    {menuItems.map((item) => {
                        const isActive = path === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-brand-primary text-white shadow-xs font-bold'
                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                }`}
                            >
                                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Sidebar Bottom: User Card & Logout */}
                <div className="shrink-0 border-t border-slate-100 p-3.5 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-brand-primary">
                                {userInitials}
                            </div>
                            <div className="min-w-0 leading-tight">
                                <p className="truncate text-xs font-bold text-slate-900" title={userName}>
                                    {userName}
                                </p>
                                <p className="truncate text-[10px] text-slate-500 font-medium" title={userContact}>
                                    {userContact}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            title="Keluar dari Akun"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer (Layar HP / Tablet) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 shadow-xl">
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-display text-sm font-black text-white">
                                    ALC
                                </div>
                                <div>
                                    <span className="font-display font-bold text-slate-900 text-sm">
                                        Portal {typeLabel}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                            {menuItems.map((item) => {
                                const isActive = path === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                                            isActive
                                                ? 'bg-brand-primary text-white font-bold'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-brand-primary">
                                    {userInitials}
                                </div>
                                <div className="min-w-0 leading-tight">
                                    <p className="truncate text-xs font-bold text-slate-900" title={userName}>
                                        {userName}
                                    </p>
                                    <p className="truncate text-[10px] text-slate-500 font-medium" title={userContact}>
                                        {userContact}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                            >
                                Keluar dari Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Wrapper */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Modern Top Header */}
                <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-3 xs:px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left: Mobile Toggle & Page Indicator */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 md:hidden shrink-0 cursor-pointer"
                            aria-label="Buka menu navigasi"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="hidden sm:block truncate">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                                {isTeacher ? 'Portal Pengajar' : 'Portal Orang Tua'}
                            </p>
                        </div>
                    </div>

                    {/* Right / Center: Child Switcher for Parents */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {!isTeacher && students.length > 0 && (
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-violet-200/80 bg-violet-50/70 px-2 sm:px-3 py-1 sm:py-1.5 shadow-2xs max-w-[210px] xs:max-w-[280px] sm:max-w-none">
                                <span className="text-xs sm:text-sm shrink-0">🎓</span>
                                <span className="text-[11px] sm:text-xs font-bold text-violet-900 hidden sm:inline shrink-0">
                                    Anak:
                                </span>
                                {students.length === 1 ? (
                                    <span className="text-[11px] sm:text-xs font-extrabold text-brand-primary truncate">
                                        {students[0].name} {students[0].level ? `(${students[0].level})` : ''}
                                    </span>
                                ) : (
                                    <div className="relative inline-flex items-center min-w-0">
                                        <select
                                            value={activeStudent?.id ?? ''}
                                            onChange={(e) => handleSwitchStudent(e.target.value)}
                                            disabled={isSwitching}
                                            className="max-w-[120px] xs:max-w-[170px] sm:max-w-xs truncate rounded-lg border border-violet-200 bg-white py-0.5 sm:py-1 pl-2 pr-7 text-[11px] sm:text-xs font-extrabold text-brand-primary shadow-2xs outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-50 cursor-pointer"
                                        >
                                            {students.map((child) => (
                                                <option key={child.id} value={child.id}>
                                                    {child.name} {child.level ? `(${child.level})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {isSwitching && (
                                            <span className="ml-1.5 text-[10px] text-violet-600 animate-pulse font-bold shrink-0">
                                                Ganti...
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <Link
                            href="/"
                            target="_blank"
                            className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-brand-primary transition shrink-0"
                        >
                            <span>Website ALC</span>
                            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="flex-1 p-3.5 xs:p-4 sm:p-6 lg:p-8 2xl:p-10 max-w-7xl 2xl:max-w-[96rem] w-full mx-auto">
                    {children}
                </main>
            </div>

            <ToastContainer />
        </div>
    );
}
