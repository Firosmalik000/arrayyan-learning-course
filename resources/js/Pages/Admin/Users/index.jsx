import { Head } from '@inertiajs/react';

const stats = [
    { label: 'Total User', value: '8', tone: 'violet' },
    { label: 'Admin Aktif', value: '4', tone: 'amber' },
    { label: 'Editor', value: '3', tone: 'rose' },
    { label: 'Pending Invite', value: '1', tone: 'emerald' },
];

const users = [
    {
        name: 'Super Admin',
        email: 'superadmin@alclearning.id',
        role: 'Super Admin',
        status: 'Aktif',
        lastLogin: 'Hari ini, 08:15',
    },
    {
        name: 'Admin ALC',
        email: 'admin@alclearning.id',
        role: 'Admin Konten',
        status: 'Aktif',
        lastLogin: 'Kemarin, 17:40',
    },
    {
        name: 'Koordinator Program',
        email: 'program@alclearning.id',
        role: 'Editor',
        status: 'Aktif',
        lastLogin: 'Kemarin, 11:02',
    },
    {
        name: 'Admin Event',
        email: 'event@alclearning.id',
        role: 'Admin Konten',
        status: 'Nonaktif',
        lastLogin: '15 Jan 2026',
    },
];

const invites = [
    {
        email: 'konten2@alclearning.id',
        role: 'Editor',
        status: 'Menunggu',
    },
    {
        email: 'admin2@alclearning.id',
        role: 'Admin Konten',
        status: 'Menunggu',
    },
];

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
};

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700',
    Nonaktif: 'bg-slate-100 text-slate-600',
    Menunggu: 'bg-amber-50 text-amber-700',
};

export default function Users() {
    return (
        <>
            <Head title="User Admin" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            User Administrator
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Kelola akun admin, role, dan status akses.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="hidden rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:inline-flex sm:px-4 sm:py-2"
                        >
                            Export User
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                        >
                            Tambah User
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
                                    toneStyles[item.tone] ??
                                    toneStyles.violet
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

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Daftar User
                                </p>
                                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                    Status akses admin terbaru.
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <select className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 sm:px-3 sm:py-1 sm:text-xs">
                                    <option>Semua role</option>
                                    <option>Super Admin</option>
                                    <option>Admin Konten</option>
                                    <option>Editor</option>
                                </select>
                                <select className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 sm:block">
                                    <option>Semua status</option>
                                    <option>Aktif</option>
                                    <option>Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:mt-5 sm:px-6">
                            <table className="min-w-full text-left text-xs text-slate-600 sm:text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs sm:tracking-[0.2em]">
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Nama</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 md:table-cell">Email</th>
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Role</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 lg:table-cell">Last Login</th>
                                        <th className="whitespace-nowrap pb-2 text-right sm:pb-3">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.email}
                                            className="border-t border-slate-100"
                                        >
                                            <td className="whitespace-nowrap py-2 pr-3 font-semibold text-slate-800 sm:py-3">
                                                {user.name}
                                            </td>
                                            <td className="hidden whitespace-nowrap py-3 pr-3 md:table-cell">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap py-2 pr-3 sm:py-3">
                                                {user.role}
                                            </td>
                                            <td className="hidden whitespace-nowrap py-3 pr-3 lg:table-cell">
                                                {user.lastLogin}
                                            </td>
                                            <td className="whitespace-nowrap py-2 text-right sm:py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                                        statusStyles[
                                                            user.status
                                                        ] ??
                                                        statusStyles.Aktif
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <form
                            onSubmit={(event) => event.preventDefault()}
                            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
                        >
                            <p className="text-sm font-semibold text-slate-800">
                                Tambah User
                            </p>
                            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                Undang admin baru (mockup).
                            </p>
                            <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
                                <input
                                    type="text"
                                    placeholder="Nama lengkap"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                                />
                                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4">
                                    <option>Pilih role</option>
                                    <option>Super Admin</option>
                                    <option>Admin Konten</option>
                                    <option>Editor</option>
                                </select>
                                <button
                                    type="button"
                                    className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-4 py-2 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-5"
                                >
                                    Kirim Undangan
                                </button>
                            </div>
                        </form>

                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                            <p className="text-sm font-semibold text-slate-800">
                                Pending Invite
                            </p>
                            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                Daftar undangan yang belum diterima.
                            </p>
                            <div className="mt-4 space-y-2 text-sm text-slate-600 sm:mt-5 sm:space-y-3">
                                {invites.map((invite) => (
                                    <div
                                        key={invite.email}
                                        className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3"
                                    >
                                        <p className="truncate font-semibold text-slate-800">
                                            {invite.email}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
                                            <span>{invite.role}</span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-semibold sm:px-3 sm:py-1 ${
                                                    statusStyles[
                                                        invite.status
                                                    ] ??
                                                    statusStyles.Menunggu
                                                }`}
                                            >
                                                {invite.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
