import { Head } from '@inertiajs/react';

const stats = [
    {
        label: 'Program aktif',
        value: '6',
        meta: '+2 program baru bulan ini',
        tone: 'violet',
    },
    {
        label: 'Pendaftar baru',
        value: '24',
        meta: '8 butuh follow up',
        tone: 'amber',
    },
    {
        label: 'Konten terjadwal',
        value: '4',
        meta: '2 konten butuh review',
        tone: 'rose',
    },
    {
        label: 'Olimpiade berjalan',
        value: '3',
        meta: '1 event ditutup',
        tone: 'emerald',
    },
];

const contentSections = [
    {
        title: 'Hero Beranda',
        owner: 'Tim Konten',
        status: 'Aktif',
        note: 'CTA utama: Daftar Sekarang',
    },
    {
        title: 'Program & Paket',
        owner: 'Admin Program',
        status: 'Review',
        note: '3 paket perlu update harga',
    },
    {
        title: 'Bank Soal Unggulan',
        owner: 'Koordinator Akademik',
        status: 'Draft',
        note: 'Tambahkan modul try out',
    },
    {
        title: 'Info Olimpiade',
        owner: 'Admin Event',
        status: 'Terjadwal',
        note: 'Update jadwal Agustus',
    },
];

const agenda = [
    {
        title: 'Review konten program SD',
        time: '09:00 - 10:00',
        team: 'Program',
    },
    {
        title: 'Publikasi olimpiade baru',
        time: '11:30 - 12:00',
        team: 'Event',
    },
    {
        title: 'Follow up 4 pendaftar',
        time: '14:00 - 15:30',
        team: 'Admin',
    },
];

const registrations = [
    {
        name: 'Rafi Ahmad',
        type: 'Murid',
        program: 'Reguler SD',
        status: 'Kontak Ulang',
    },
    {
        name: 'Salsa Nur',
        type: 'Pengajar',
        program: 'Matematika',
        status: 'Seleksi',
    },
    {
        name: 'Nadia Azzahra',
        type: 'Murid',
        program: 'Privat SMP',
        status: 'Baru',
    },
    {
        name: 'Fahri Hakim',
        type: 'Murid',
        program: 'Persiapan Olimpiade',
        status: 'Terjadwal',
    },
];

const activities = [
    {
        title: 'Update hero beranda',
        detail: 'CTA diganti menjadi Konsultasi Cepat',
        time: '20 menit lalu',
    },
    {
        title: 'Tambah modul bank soal',
        detail: 'Paket matematika SD level 2',
        time: '2 jam lalu',
    },
    {
        title: 'Rekap pendaftaran',
        detail: 'Total 8 pendaftar baru',
        time: 'Kemarin',
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
    Draft: 'bg-amber-50 text-amber-700',
    Review: 'bg-rose-50 text-rose-700',
    Terjadwal: 'bg-violet-50 text-violet-700',
    Baru: 'bg-amber-50 text-amber-700',
    Seleksi: 'bg-violet-50 text-violet-700',
    'Kontak Ulang': 'bg-rose-50 text-rose-700',
};

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="space-y-6 sm:space-y-8">
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
                        <button
                            type="button"
                            className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                        >
                            Export Laporan
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
                            <p className="mt-1 text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
                                {item.meta}
                            </p>
                        </div>
                    ))}
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
                            {contentSections.map((item) => (
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
                            ))}
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
                            {agenda.map((item) => (
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
                            ))}
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
                                            key={item.name}
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
                            {activities.map((item) => (
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
