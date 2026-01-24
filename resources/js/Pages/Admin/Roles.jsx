import { Head, Link } from '@inertiajs/react';

const stats = [
    { label: 'Total Role', value: '3', tone: 'violet' },
    { label: 'Full Access', value: '1', tone: 'emerald' },
    { label: 'Custom Role', value: '2', tone: 'amber' },
    { label: 'Role Aktif', value: '3', tone: 'rose' },
];

const roles = [
    {
        name: 'Super Admin',
        description: 'Akses penuh ke seluruh modul dan pengaturan.',
        group: 'Manajemen',
        users: '2',
        tag: 'Full Access',
        tone: 'violet',
    },
    {
        name: 'Admin Konten',
        description: 'Kelola konten publik dan pendaftaran.',
        group: 'Konten',
        users: '3',
        tag: 'Content',
        tone: 'amber',
    },
    {
        name: 'Editor',
        description: 'Edit copy dan jadwal konten.',
        group: 'Konten',
        users: '2',
        tag: 'Limited',
        tone: 'rose',
    },
];

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
};

export default function Roles() {
    return (
        <>
            <Head title="Role Admin" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            Role Administrator
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Buat role baru untuk grouping admin. Akses menu
                            diatur di halaman Akses Menu.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                        <Link
                            href="/admin/akses-menu"
                            className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:px-4 sm:py-2"
                        >
                            Atur Akses Menu
                        </Link>
                        <button
                            type="button"
                            className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                        >
                            Tambah Role
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5"
                        >
                            <div
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                    toneStyles[item.tone] ?? toneStyles.violet
                                }`}
                            >
                                {item.label}
                            </div>
                            <p className="mt-2 text-xl font-semibold text-slate-800 sm:mt-3 sm:text-2xl">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-3 sm:space-y-4">
                        {roles.map((role) => (
                            <div
                                key={role.name}
                                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
                            >
                                <div className="flex items-start justify-between gap-2 sm:gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-semibold text-slate-800 sm:text-lg">
                                            {role.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                                            {role.description}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                            toneStyles[role.tone] ??
                                            toneStyles.violet
                                        }`}
                                    >
                                        {role.tag}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 sm:mt-4">
                                    <span>Grup: {role.group}</span>
                                    <span>{role.users} admin</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={(event) => event.preventDefault()}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
                    >
                        <p className="text-sm font-semibold text-slate-800">
                            Buat Role Baru
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Role dibuat di sini, akses ditentukan di Akses Menu.
                        </p>
                        <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
                            <input
                                type="text"
                                placeholder="Nama role"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <textarea
                                rows="3"
                                placeholder="Deskripsi singkat"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4">
                                <option>Pilih grup role</option>
                                <option>Manajemen</option>
                                <option>Konten</option>
                                <option>Akademik</option>
                                <option>Custom</option>
                            </select>
                            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4">
                                <option>Tipe akses default</option>
                                <option>Full Access</option>
                                <option>Content</option>
                                <option>Limited</option>
                                <option>Custom</option>
                            </select>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
                            <button
                                type="button"
                                className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-4 py-2 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-5"
                            >
                                Simpan Role
                            </button>
                            <Link
                                href="/admin/akses-menu"
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                            >
                                Lanjut Atur Akses
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
