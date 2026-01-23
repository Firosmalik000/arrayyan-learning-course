import { Link, usePage } from '@inertiajs/react';

const menu = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/program', label: 'Program' },
    { href: '/admin/bank-soal', label: 'Bank Soal' },
    { href: '/admin/olimpiade', label: 'Olimpiade' },
    { href: '/admin/pendaftaran', label: 'Pendaftaran' },
    { href: '/admin/pengajar', label: 'Pengajar' },
    { href: '/admin/pengaturan', label: 'Pengaturan' },
];

export default function AdminLayout({ children }) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex min-h-screen">
                <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
                    <Link href="/admin" className="flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-700 text-white shadow">
                            <span className="text-sm font-bold">ALC</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Admin Panel
                            </p>
                            <p className="text-xs text-violet-600">
                                Ar Rayyan LC
                            </p>
                        </div>
                    </Link>
                    <div className="mt-8 space-y-2 text-sm font-medium text-slate-600">
                        {menu.map((item) => {
                            const isActive = url === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${
                                        isActive
                                            ? 'bg-violet-50 text-violet-700'
                                            : 'hover:bg-slate-100'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Admin
                            </p>
                            <h1 className="text-lg font-semibold text-slate-800">
                                Panel Manajemen
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold">
                                    Admin ALC
                                </p>
                                <p className="text-xs text-slate-500">
                                    admin@alclearning.id
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-amber-200" />
                        </div>
                    </header>

                    <main className="flex-1 px-6 py-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
