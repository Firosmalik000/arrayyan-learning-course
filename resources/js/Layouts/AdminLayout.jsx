import { Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

const getMenu = (pendingCounts, allowedMenus) => {
    const isAllowed = (menuId) => !allowedMenus || allowedMenus.includes(menuId);

    const menu = [
        { href: '/admin', label: 'Dashboard', icon: 'dashboard', menuId: 'dashboard' },
    {
        label: 'Content',
        icon: 'layout',
        children: [
            { href: '/admin/landing', label: 'Landing Page', icon: 'layout', menuId: 'landing' },
        ],
    },
    {
        label: 'Master Data',
        icon: 'database',
        children: [
            { href: '/admin/program', label: 'Program', icon: 'book', menuId: 'program' },
            { href: '/admin/bank-soal', label: 'Bank Soal', icon: 'layers', menuId: 'bank-soal' },
            { href: '/admin/olimpiade', label: 'Olimpiade', icon: 'trophy', menuId: 'olimpiade' },
            {
                href: '/admin/pendaftaran/pelajar',
                label: 'Pendaftaran Pelajar',
                icon: 'users',
                menuId: 'pendaftaran',
                badge: pendingCounts?.student > 0 ? String(pendingCounts.student) : null,
            },
            {
                href: '/admin/pendaftaran/pengajar',
                label: 'Pendaftaran Pengajar',
                icon: 'user',
                menuId: 'pendaftaran',
                badge: pendingCounts?.teacher > 0 ? String(pendingCounts.teacher) : null,
            },
            { href: '/admin/pelajar', label: 'Pelajar', icon: 'users', menuId: 'pelajar' },
            { href: '/admin/pengajar', label: 'Pengajar', icon: 'user', menuId: 'pengajar' },
        ],
    },
    {
        label: 'Administrator',
        icon: 'shield',
        children: [
            { href: '/admin/akses-menu', label: 'Akses Menu', icon: 'key', menuId: 'akses-menu' },
            { href: '/admin/roles', label: 'Role', icon: 'badge', menuId: 'roles' },
            { href: '/admin/users', label: 'User', icon: 'users', menuId: 'users' },
        ],
    },
        { href: '/admin/pengaturan', label: 'Pengaturan', icon: 'settings', menuId: 'pengaturan' },
    ];

    return menu.flatMap((item) => {
        if (!item.children) {
            return isAllowed(item.menuId) ? [item] : [];
        }

        const children = item.children.filter((child) => isAllowed(child.menuId));
        if (children.length === 0) {
            return [];
        }

        return [{ ...item, children }];
    });
};

const getFlatMenu = (menu) => menu.flatMap((item) =>
    item.children ? item.children : [item]
);

const icons = {
    dashboard: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 13h8V3H3v10Z" />
            <path d="M13 21h8v-6h-8v6Z" />
            <path d="M13 3h8v8h-8V3Z" />
            <path d="M3 21h8v-6H3v6Z" />
        </svg>
    ),
    book: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5H20v14H6.5A2.5 2.5 0 0 0 4 20V6.5Z" />
            <path d="M12 4v14" />
        </svg>
    ),
    layers: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m12 3 9 5-9 5-9-5 9-5Z" />
            <path d="m3 13 9 5 9-5" />
        </svg>
    ),
    trophy: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M8 5h8v4a4 4 0 0 1-8 0V5Z" />
            <path d="M6 6H4a2 2 0 0 0 2 2" />
            <path d="M18 6h2a2 2 0 0 1-2 2" />
            <path d="M12 13v3" />
            <path d="M8 20h8" />
        </svg>
    ),
    users: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M2 20a7 7 0 0 1 14 0" />
            <path d="M14.5 20a5 5 0 0 1 7 0" />
        </svg>
    ),
    user: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
    ),
    settings: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.86-.34 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.86.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.86l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.86-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .66.26 1.3.73 1.77.47.47 1.1.73 1.77.73H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
    ),
    shield: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    ),
    key: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="7.5" cy="12" r="3.5" />
            <path d="M11 12h9l-2 2 2 2-2 2" />
        </svg>
    ),
    badge: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <path d="M9 9h6" />
            <path d="M9 13h6" />
        </svg>
    ),
    layout: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
            <path d="M9 9h12" />
        </svg>
    ),
    database: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
    logout: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    bell: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    search: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    chevronDown: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),
    profile: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    help: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    menu: (
        <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    close: (
        <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    external: (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    ),
};

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const appLogo = props.appLogo;
    const pendingRegistrationCount = props.pendingRegistrationCount || 0;
    const pendingRegistrationCounts = props.pendingRegistrationCounts ?? {
        total: pendingRegistrationCount,
        student: pendingRegistrationCount,
        teacher: 0,
    };
    const allowedMenus = props.allowedMenus ?? null;
    const impersonation = props.impersonation ?? { active: false };
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);

    const user = props.auth?.user || { name: 'Admin ALC', email: 'admin@alclearning.id' };

    const menu = getMenu(pendingRegistrationCounts, allowedMenus);
    const flatMenu = getFlatMenu(menu);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleStopImpersonate = () => {
        router.post('/admin/impersonate/stop');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 text-slate-900">
            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <aside className="hidden w-72 flex-col border-r border-slate-200/50 bg-white/80 backdrop-blur-xl md:flex">
                    {/* Sidebar Header */}
                    <div className="border-b border-slate-100 px-5 py-5">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            {appLogo ? (
                                <img src={appLogo} alt="Logo" className="h-12 w-12 rounded-2xl object-contain shadow-lg shadow-violet-200 transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-200 transition-transform group-hover:scale-105">
                                    <span className="text-sm font-bold tracking-wide">ALC</span>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-slate-800">Admin Console</p>
                                <p className="text-xs font-medium text-violet-600">Ar Rayyan Learning</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-5">
                        <div className="space-y-6">
                            {menu.map((item) => {
                                if (!item.children) {
                                    const isActive = url === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md shadow-violet-200'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {icons[item.icon]}
                                                </span>
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </span>
                                            {item.badge && (
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                }

                                const isGroupActive = item.children.some((child) => child.href === url);

                                return (
                                    <div key={item.label}>
                                        <div className={`mb-3 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider ${
                                            isGroupActive ? 'text-violet-600' : 'text-slate-400'
                                        }`}>
                                            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${
                                                isGroupActive ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {icons[item.icon]}
                                            </span>
                                            {item.label}
                                        </div>
                                        <div className="space-y-1 pl-2">
                                            {item.children.map((child) => {
                                                const isActive = url === child.href;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                                                            isActive
                                                                ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md shadow-violet-200'
                                                                : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                                isActive
                                                                    ? 'bg-white/20 text-white'
                                                                    : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {icons[child.icon]}
                                                            </span>
                                                            <span className="text-sm font-medium">{child.label}</span>
                                                        </span>
                                                        {child.badge && (
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                                isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {child.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="border-t border-slate-100 p-4 space-y-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-600"
                        >
                            {icons.external}
                            Lihat Website
                        </a>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col">
                    {/* Header / Appbar */}
                    <header className="sticky top-0 z-30 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
                        {impersonation.active && (
                            <div className="border-b border-amber-100 bg-amber-50/80 text-[11px] text-amber-800 sm:text-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                                            Mode Impersonate
                                        </span>
                                        <span className="text-amber-700">
                                            Masuk sebagai <span className="font-semibold">{user.name}</span>
                                            {impersonation.impersonator?.name && (
                                                <span className="text-amber-600">
                                                    {' '}({impersonation.impersonator.name})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleStopImpersonate}
                                        className="rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-amber-700 sm:text-xs"
                                    >
                                        Keluar Impersonate
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                            {/* Left: Mobile menu + Title */}
                            <div className="flex items-center gap-4">
                                {/* Mobile Menu Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 md:hidden"
                                >
                                    {icons.menu}
                                </button>

                                {/* Breadcrumb / Title */}
                                <div className="hidden sm:block">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-400">Admin</span>
                                        <span className="text-slate-300">/</span>
                                        <span className="font-medium text-slate-700">
                                            {flatMenu.find((item) => item.href === url)?.label || 'Dashboard'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions + Profile */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Search Button */}
                                <button
                                    type="button"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                >
                                    {icons.search}
                                </button>

                                {/* Notification Button */}
                                <button
                                    type="button"
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                >
                                    {icons.bell}
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        3
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-amber-400 text-white">
                                            <span className="text-xs font-bold">
                                                {user.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </span>
                                        </div>
                                        <div className="hidden text-left sm:block">
                                            <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                        <span className={`hidden text-slate-400 transition-transform sm:block ${isProfileOpen ? 'rotate-180' : ''}`}>
                                            {icons.chevronDown}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                                            <div className="border-b border-slate-100 px-4 py-3 sm:hidden">
                                                <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                            <Link
                                                href="/admin/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                {icons.profile}
                                                Profil Saya
                                            </Link>
                                            <Link
                                                href="/admin/pengaturan"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                {icons.settings}
                                                Pengaturan
                                            </Link>
                                            <Link
                                                href="/admin/help"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                {icons.help}
                                                Bantuan
                                            </Link>
                                            <div className="my-2 border-t border-slate-100" />
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                            >
                                                {icons.logout}
                                                Keluar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Navigation Pills */}
                        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 md:hidden">
                            {flatMenu.map((item) => {
                                const isActive = url === item.href;
                                return (
                                    <Link
                                        key={`mobile-${item.href}`}
                                        href={item.href}
                                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                            isActive
                                                ? 'bg-violet-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {icons[item.icon]}
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Sidebar Panel */}
                <aside
                    className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-out ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    {/* Mobile Sidebar Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <Link href="/admin" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                            {appLogo ? (
                                <img src={appLogo} alt="Logo" className="h-10 w-10 rounded-xl object-contain shadow-lg" />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg">
                                    <span className="text-xs font-bold">ALC</span>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-slate-800">Admin</p>
                                <p className="text-xs text-violet-600">Ar Rayyan Learning</p>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            {icons.close}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-4">
                        <div className="space-y-5">
                            {menu.map((item) => {
                                if (!item.children) {
                                    const isActive = url === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                                                isActive
                                                    ? 'bg-violet-600 text-white'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                    isActive ? 'bg-white/20' : 'bg-slate-100'
                                                }`}>
                                                    {icons[item.icon]}
                                                </span>
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </span>
                                            {item.badge && (
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                    isActive ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                }

                                const isGroupActive = item.children.some((child) => child.href === url);

                                return (
                                    <div key={item.label}>
                                        <div className={`mb-2 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider ${
                                            isGroupActive ? 'text-violet-600' : 'text-slate-400'
                                        }`}>
                                            {item.label}
                                        </div>
                                        <div className="space-y-1">
                                            {item.children.map((child) => {
                                                const isActive = url === child.href;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                                                            isActive
                                                                ? 'bg-violet-600 text-white'
                                                                : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                                isActive ? 'bg-white/20' : 'bg-slate-100'
                                                            }`}>
                                                                {icons[child.icon]}
                                                            </span>
                                                            <span className="text-sm font-medium">{child.label}</span>
                                                        </span>
                                                        {child.badge && (
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                                isActive ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {child.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Mobile Sidebar Footer */}
                    <div className="border-t border-slate-100 p-4 space-y-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600"
                        >
                            {icons.external}
                            Lihat Website
                        </a>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                            {icons.logout}
                            Keluar
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
