import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import ActionDropdown from './components/ActionDropdown';
import PortalPagination from './components/PortalPagination';

const attendanceOptions = ['hadir', 'izin', 'sakit', 'alpa'];
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ClassDetail() {
    const { props } = usePage();
    const cls = props.class;
    const members = cls?.members ?? [];

    const [attDate, setAttDate] = useState(todayStr());
    const [attRows, setAttRows] = useState({});
    const [attPage, setAttPage] = useState(1);
    const [attPerPage, setAttPerPage] = useState(10);

    const [gradeSubject, setGradeSubject] = useState('');
    const [gradeTerm, setGradeTerm] = useState('');
    const [gradeRows, setGradeRows] = useState({});
    const [gradePage, setGradePage] = useState(1);
    const [gradePerPage, setGradePerPage] = useState(10);

    if (!cls) {
        return (
            <PortalLayout>
                <Head title="Kelas" />
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Kelas tidak ditemukan.</p>
                </div>
            </PortalLayout>
        );
    }

    const submitAttendance = () => {
        const rows = Object.entries(attRows).map(([student_id, status]) => ({
            student_id: Number(student_id),
            status,
        }));
        if (rows.length === 0) return;
        router.post(`/portal/kelas/${cls.id}/absensi`, { date: attDate, rows }, { preserveScroll: true });
    };

    const submitGrades = () => {
        if (!gradeSubject.trim() || !gradeTerm.trim()) return;
        const rows = Object.entries(gradeRows)
            .filter(([, score]) => score !== '' && score != null)
            .map(([student_id, score]) => ({ student_id: Number(student_id), score: Number(score) }));
        if (rows.length === 0) return;
        router.post(
            `/portal/kelas/${cls.id}/nilai`,
            {
                subject: gradeSubject.trim(),
                term: gradeTerm.trim(),
                rows,
            },
            { preserveScroll: true }
        );
    };

    // Attendance pagination
    const attStart = (attPage - 1) * attPerPage;
    const displayedAttMembers = members.slice(attStart, attStart + attPerPage);

    // Grades pagination
    const gradeStart = (gradePage - 1) * gradePerPage;
    const displayedGradeMembers = members.slice(gradeStart, gradeStart + gradePerPage);

    return (
        <PortalLayout>
            <Head title={cls.name} />

            <div className="mb-4">
                <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    {cls.name}
                </h1>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {cls.program} • {cls.filled}{cls.quota != null ? `/${cls.quota}` : ''} murid
                </p>

                {(cls.schedules ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {cls.schedules.map((s, i) => (
                            <span key={i} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                {s.day} {s.start_time}–{s.end_time}{s.room ? ` • Ruang ${s.room}` : ''}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Attendance Input Block */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-3.5 sm:p-4 bg-slate-50/40">
                    <div>
                        <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">Input Absensi Siswa</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pilih tanggal dan tentukan status kehadiran murid</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <input
                            type="date"
                            value={attDate}
                            max={todayStr()}
                            onChange={(e) => setAttDate(e.target.value)}
                            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs"
                        />
                        <button
                            type="button"
                            onClick={submitAttendance}
                            className="w-full sm:w-auto rounded-lg bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow-2xs hover:brightness-110 active:scale-95 transition cursor-pointer"
                        >
                            Simpan Absensi
                        </button>
                    </div>
                </div>

                {/* Mobile Student Attendance Cards (< md) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {displayedAttMembers.map((m, idx) => {
                        const rowNumber = attStart + idx + 1;
                        const currentStatus = attRows[m.student_id] || 'hadir';

                        return (
                            <div key={m.student_id} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-mono text-xs font-bold text-slate-400">
                                            #{rowNumber}
                                        </span>
                                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                            {m.student_name}
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Status: {currentStatus}
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5">
                                    {attendanceOptions.map((s) => {
                                        const isSelected = currentStatus === s;
                                        return (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() =>
                                                    setAttRows((prev) => ({
                                                        ...prev,
                                                        [m.student_id]: s,
                                                    }))
                                                }
                                                className={`rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition active:scale-95 text-center ${
                                                    isSelected
                                                        ? 'bg-brand-primary text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Attendance Datatable (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="w-12 px-4 py-3.5 text-center">No</th>
                                <th className="w-14 px-3 py-3.5 text-center">Aksi</th>
                                <th className="px-5 py-3.5">Nama Murid</th>
                                <th className="px-5 py-3.5 text-right">Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedAttMembers.map((m, idx) => {
                                const rowNumber = attStart + idx + 1;
                                const actionItems = attendanceOptions.map((opt) => ({
                                    label: `Set: ${opt.toUpperCase()}`,
                                    onClick: () =>
                                        setAttRows((prev) => ({
                                            ...prev,
                                            [m.student_id]: opt,
                                        })),
                                 }));

                                return (
                                    <tr key={m.student_id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                            {rowNumber}
                                        </td>
                                        <td className="w-14 px-3 py-3.5 text-center">
                                            <ActionDropdown items={actionItems} label={`Aksi murid ${m.student_name}`} />
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-slate-800">
                                            {m.student_name}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="inline-flex flex-wrap gap-1.5 justify-end">
                                                {attendanceOptions.map((s) => {
                                                    const isSelected = (attRows[m.student_id] || 'hadir') === s;
                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() =>
                                                                setAttRows((prev) => ({
                                                                    ...prev,
                                                                    [m.student_id]: s,
                                                                }))
                                                            }
                                                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition ${
                                                                isSelected
                                                                    ? 'bg-brand-primary text-white shadow-xs'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <PortalPagination
                    currentPage={attPage}
                    totalItems={members.length}
                    perPage={attPerPage}
                    onPageChange={(p) => setAttPage(p)}
                    onPerPageChange={(n) => {
                        setAttPerPage(n);
                        setAttPage(1);
                    }}
                />
            </div>

            {/* Grades Input Block */}
            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/40">
                    <div>
                        <h3 className="font-display text-base font-bold text-slate-900">Input Nilai Siswa</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tentukan mata pelajaran dan term untuk mengisi rapor</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            value={gradeSubject}
                            onChange={(e) => setGradeSubject(e.target.value)}
                            placeholder="Mata Pelajaran"
                            className="w-full sm:w-36 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs"
                        />
                        <input
                            type="text"
                            value={gradeTerm}
                            onChange={(e) => setGradeTerm(e.target.value)}
                            placeholder="Term / Periode"
                            className="w-full sm:w-32 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs"
                        />
                        <button
                            type="button"
                            onClick={submitGrades}
                            className="w-full sm:w-auto rounded-full bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 active:scale-95 transition"
                        >
                            Simpan Nilai
                        </button>
                    </div>
                </div>

                {/* Mobile Student Grade Cards (< md) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {displayedGradeMembers.map((m, idx) => {
                        const rowNumber = gradeStart + idx + 1;
                        return (
                            <div key={m.student_id} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs font-bold text-slate-400">
                                                #{rowNumber}
                                            </span>
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                                {m.student_name}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <label className="text-[11px] font-bold text-slate-500">Nilai:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={gradeRows[m.student_id] ?? ''}
                                            onChange={(e) =>
                                                setGradeRows((prev) => ({
                                                    ...prev,
                                                    [m.student_id]: e.target.value,
                                                }))
                                            }
                                            placeholder="0–100"
                                            className="w-20 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-sm font-extrabold text-slate-800 outline-none focus:border-violet-400 text-center shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Grades Datatable (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="w-12 px-4 py-3.5 text-center">No</th>
                                <th className="w-14 px-3 py-3.5 text-center">Aksi</th>
                                <th className="px-5 py-3.5">Nama Murid</th>
                                <th className="px-5 py-3.5 text-right">Nilai (0–100)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedGradeMembers.map((m, idx) => {
                                const rowNumber = gradeStart + idx + 1;
                                const actionItems = [
                                    {
                                        label: 'Set Nilai: 100',
                                        onClick: () =>
                                            setGradeRows((prev) => ({
                                                ...prev,
                                                [m.student_id]: 100,
                                            })),
                                    },
                                    {
                                        label: 'Set Nilai: 90',
                                        onClick: () =>
                                            setGradeRows((prev) => ({
                                                ...prev,
                                                [m.student_id]: 90,
                                            })),
                                    },
                                    {
                                        label: 'Set Nilai: 80',
                                        onClick: () =>
                                            setGradeRows((prev) => ({
                                                ...prev,
                                                [m.student_id]: 80,
                                            })),
                                    },
                                    {
                                        label: 'Kosongkan',
                                        danger: true,
                                        onClick: () =>
                                            setGradeRows((prev) => ({
                                                ...prev,
                                                [m.student_id]: '',
                                            })),
                                    },
                                ];

                                return (
                                    <tr key={m.student_id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                            {rowNumber}
                                        </td>
                                        <td className="w-14 px-3 py-3.5 text-center">
                                            <ActionDropdown items={actionItems} label={`Aksi murid ${m.student_name}`} />
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-slate-800">
                                            {m.student_name}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={gradeRows[m.student_id] ?? ''}
                                                onChange={(e) =>
                                                    setGradeRows((prev) => ({
                                                        ...prev,
                                                        [m.student_id]: e.target.value,
                                                    }))
                                                }
                                                placeholder="0–100"
                                                className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-violet-400 text-center shadow-2xs"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <PortalPagination
                    currentPage={gradePage}
                    totalItems={members.length}
                    perPage={gradePerPage}
                    onPageChange={(p) => setGradePage(p)}
                    onPerPageChange={(n) => {
                        setGradePerPage(n);
                        setGradePage(1);
                    }}
                />
            </div>
        </PortalLayout>
    );
}
