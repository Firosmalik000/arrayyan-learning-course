import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
};

const fallbackLevelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'];

export default function Students() {
    const { students: studentsData = [] } = usePage().props;
    const normalizedStudents = studentsData.map((student) => ({
        id: student.id,
        name: student.name ?? '',
        level: student.level ?? '',
        program: student.program ?? '',
        package: student.package ?? '',
        parent_contact: student.parent_contact ?? '',
        is_active: student.is_active ?? true,
        created_at: student.created_at ?? null,
    }));

    const [students] = useState(normalizedStudents);
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const levelOptions = Array.from(new Set(students.map((s) => s.level).filter(Boolean)));
    const resolvedLevelOptions = levelOptions.length > 0 ? levelOptions : fallbackLevelOptions;

    const filteredStudents = students.filter((student) => {
        const matchSearch = student.name.toLowerCase().includes(search.toLowerCase());
        const matchLevel = !filterLevel || student.level === filterLevel;
        const statusLabel = student.is_active ? 'Aktif' : 'Nonaktif';
        const matchStatus = !filterStatus || statusLabel === filterStatus;
        return matchSearch && matchLevel && matchStatus;
    });

    const stats = [
        { label: 'Total Pelajar', value: students.length, tone: 'violet' },
        { label: 'Aktif', value: students.filter((s) => s.is_active).length, tone: 'emerald' },
        { label: 'Nonaktif', value: students.filter((s) => !s.is_active).length, tone: 'slate' },
    ];

    const toneStyles = {
        violet: 'bg-violet-50 text-violet-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        slate: 'bg-slate-100 text-slate-600',
    };

    return (
        <>
            <Head title="Pelajar" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pelajar</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Data siswa aktif yang terdaftar di ALC
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[stat.tone]}`}>
                                {stat.label}
                            </span>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-xs">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari pelajar..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                            >
                                <option value="">Semua Jenjang</option>
                                {resolvedLevelOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Jenjang</th>
                                    <th className="px-5 py-3 font-medium">Program</th>
                                    <th className="px-5 py-3 font-medium">Paket</th>
                                    <th className="px-5 py-3 font-medium">Kontak Ortu</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => {
                                    const statusLabel = student.is_active ? 'Aktif' : 'Nonaktif';
                                    return (
                                        <tr key={student.id} className="transition hover:bg-slate-50">
                                            <td className="px-5 py-4 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.level || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.program || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.package || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.parent_contact || '-'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {student.created_at ? new Date(student.created_at).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada data pelajar yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
