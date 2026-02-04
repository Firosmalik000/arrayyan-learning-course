import { Head, usePage } from '@inertiajs/react';

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
};

const cardStyles = {
    violet: 'border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-white',
    amber: 'border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-white',
    rose: 'border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-white',
    emerald: 'border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white',
};

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    Draft: 'bg-amber-50 text-amber-700',
    Nonaktif: 'bg-slate-100 text-slate-600',
};

export default function Dashboard() {
    const {
        stats = [],
        contentSections = [],
        agenda = [],
        registrations = [],
        activities = [],
        registrationChart,
        allowedActions = {},
    } = usePage().props;
    const chartData = registrationChart ?? {
        labels: ['Pending', 'Disetujui', 'Ditolak'],
        students: [0, 0, 0],
        teachers: [0, 0, 0],
    };
    const totalStudents = chartData.students.reduce(
        (total, value) => total + value,
        0
    );
    const totalTeachers = chartData.teachers.reduce(
        (total, value) => total + value,
        0
    );
    const totalRegistrations = totalStudents + totalTeachers;
    const chartTotals = chartData.labels.map((_, index) => {
        return (chartData.students[index] ?? 0) + (chartData.teachers[index] ?? 0);
    });
    const chartMax = Math.max(...chartTotals, 1);
    const chartRows = chartData.labels.map((label, index) => {
        const students = chartData.students[index] ?? 0;
        const teachers = chartData.teachers[index] ?? 0;
        const total = students + teachers;
        const totalWidth = (total / chartMax) * 100;
        const studentWidth = total ? (students / total) * 100 : 0;
        const teacherWidth = total ? (teachers / total) * 100 : 0;

        return {
            label,
            students,
            teachers,
            total,
            totalWidth,
            studentWidth,
            teacherWidth,
        };
    });

    const canExport = (allowedActions.dashboard ?? []).includes('export');

    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="space-y-6 rounded-3xl bg-gradient-to-br from-violet-50/40 via-white to-amber-50/40 p-4 shadow-sm sm:space-y-8 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            Dashboard Konten
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Ringkasan aktivitas konten, pendaftaran, dan agenda
                            tim ALC.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="hidden rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:inline-flex sm:px-4 sm:py-2"
                        >
                            Preview Website
                        </button>
                        {canExport && (
                            <button
                                type="button"
                                className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                            >
                                Export Laporan
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-2xl border p-3 shadow-sm sm:rounded-3xl sm:p-5 ${
                                cardStyles[item.tone] ?? cardStyles.violet
                            }`}
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
                            <p className="mt-1 text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
                                {item.meta}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="relative rounded-2xl border border-violet-100/80 bg-gradient-to-br from-white via-white to-violet-50/60 p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.6)] sm:rounded-3xl sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                                Grafik Pendaftaran
                            </p>
                            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                Perbandingan status pendaftar murid dan pengajar.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold sm:text-xs">
                            <span className="rounded-full bg-white/80 px-3 py-1 text-slate-600 shadow-sm">
                                Total {totalRegistrations}
                            </span>
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-600 shadow-sm">
                                Murid {totalStudents}
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-600 shadow-sm">
                                Pengajar {totalTeachers}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:mt-5">
                        {chartRows.map((row) => (
                            <div
                                key={row.label}
                                className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.6)]"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-700">
                                            {row.label}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                                            {row.total} total
                                        </span>
                                    </div>
                                    <span className="text-slate-500">
                                        {row.students} murid - {row.teachers} pengajar
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <div className="h-3 w-full rounded-full bg-slate-100/80">
                                        <div
                                            className="h-full rounded-full bg-slate-200"
                                            style={{ width: `${row.totalWidth}%` }}
                                        >
                                            <div className="flex h-full w-full overflow-hidden rounded-full">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400"
                                                    style={{ width: `${row.studentWidth}%` }}
                                                />
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-rose-400"
                                                    style={{ width: `${row.teacherWidth}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>{row.students} murid</span>
                                        <span>{row.teachers} pengajar</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Konten Beranda
                                </p>
                                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                    Pantau status konten utama website ALC.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-3 sm:py-1 sm:text-xs"
                            >
                                Kelola konten
                            </button>
                        </div>
                        <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
                            {contentSections.length > 0 ? (
                                contentSections.map((item) => (
                                    <div
                                        key={item.title}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {item.title}
                                            </p>
                                            <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                                                {item.owner} - {item.note}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                                statusStyles[item.status] ??
                                                statusStyles.Aktif
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
                                    Belum ada data konten yang tersedia.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Agenda Minggu Ini
                            </p>
                            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                Jadwal kerja yang perlu diselesaikan.
                            </p>
                        </div>
                        <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                            {agenda.length > 0 ? (
                                agenda.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm sm:rounded-2xl sm:px-4 sm:py-3"
                                    >
                                        <p className="text-sm font-semibold text-slate-800">
                                            {item.title}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
                                            <span>{item.time}</span>
                                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600 sm:px-2 sm:py-1">
                                                {item.team}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
                                    Belum ada agenda yang dijadwalkan.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Antrian Pendaftaran
                                </p>
                                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                    Data terbaru pendaftar murid dan pengajar.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-3 sm:py-1 sm:text-xs"
                            >
                                Lihat semua
                            </button>
                        </div>
                        <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:mt-5 sm:px-6">
                            <table className="min-w-full text-left text-xs text-slate-600 sm:text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs sm:tracking-[0.2em]">
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Nama</th>
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Tipe</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 sm:table-cell">Program</th>
                                        <th className="whitespace-nowrap pb-2 text-right sm:pb-3">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-100"
                                        >
                                            <td className="whitespace-nowrap py-2 pr-3 font-semibold text-slate-800 sm:py-3">
                                                {item.name}
                                            </td>
                                            <td className="whitespace-nowrap py-2 pr-3 sm:py-3">{item.type}</td>
                                            <td className="hidden whitespace-nowrap py-3 pr-3 sm:table-cell">
                                                {item.program}
                                            </td>
                                            <td className="whitespace-nowrap py-2 text-right sm:py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                                        statusStyles[
                                                            item.status
                                                        ] ??
                                                        statusStyles.Aktif
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {registrations.length === 0 && (
                                        <tr className="border-t border-slate-100">
                                            <td
                                                colSpan={4}
                                                className="py-6 text-center text-xs text-slate-500 sm:text-sm"
                                            >
                                                Belum ada pendaftaran pending.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Aktivitas Terbaru
                            </p>
                            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                Pembaruan konten dari tim admin.
                            </p>
                        </div>
                        <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                            {activities.length > 0 ? (
                                activities.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3"
                                    >
                                        <p className="text-sm font-semibold text-slate-800">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                            {item.detail}
                                        </p>
                                        <p className="mt-1 text-[10px] font-semibold text-violet-600 sm:mt-2 sm:text-xs">
                                            {item.time}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
                                    Belum ada aktivitas terbaru.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
