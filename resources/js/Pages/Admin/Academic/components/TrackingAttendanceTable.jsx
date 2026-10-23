import { useEffect, useMemo, useState } from 'react';

const DAYS_ABBR = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const currentMonthValue = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function TrackingAttendanceTable({
    selectedClass,
    members = [],
    attendances = [],
    canEdit = true,
    onOpenAttendanceModal,
    onOpenGenerateModal,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(currentMonthValue());

    const allRecordedDates = useMemo(() => {
        const set = new Set();
        (attendances || []).forEach((a) => {
            if (a.date) set.add(a.date.slice(0, 10));
        });
        return Array.from(set).sort();
    }, [attendances]);

    const availableMonths = useMemo(
        () => Array.from(new Set(allRecordedDates.map((date) => date.slice(0, 7)))).sort(),
        [allRecordedDates],
    );

    useEffect(() => {
        const currentMonth = currentMonthValue();
        setSelectedMonth(
            availableMonths.includes(currentMonth)
                ? currentMonth
                : (availableMonths.at(-1) ?? currentMonth),
        );
        setSearchTerm('');
    }, [selectedClass?.id]);

    const visibleAttendances = useMemo(
        () => (attendances || []).filter((attendance) => attendance.date?.startsWith(`${selectedMonth}-`)),
        [attendances, selectedMonth],
    );

    const recordedDates = useMemo(
        () => allRecordedDates.filter((date) => date.startsWith(`${selectedMonth}-`)),
        [allRecordedDates, selectedMonth],
    );

    // Build the list of session columns:
    // If we have recorded dates, use them. If we have weekly schedules and total_sessions,
    // we can also project scheduled dates if recordedDates is empty.
    const sessionColumns = useMemo(() => {
        if (recordedDates.length > 0) {
            return recordedDates.map((dateStr, idx) => {
                const dateObj = new Date(dateStr);
                const jsDay = dateObj.getDay();
                const isoDay = jsDay === 0 ? 7 : jsDay;
                const dayAbbr = DAYS_ABBR[isoDay] || '';
                const parts = dateStr.split('-');
                const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;

                return {
                    index: idx + 1,
                    dateStr,
                    dayAbbr,
                    displayDate,
                    isRecorded: true,
                };
            });
        }

        const schedules = selectedClass?.schedules || [];
        if (schedules.length === 0) return [];

        const scheduledDays = schedules.map((s) => Number(s.day_of_week));
        const projected = [];
        const [year, month] = selectedMonth.split('-').map(Number);
        const cursor = new Date(year, month - 1, 1);

        while (cursor.getMonth() === month - 1) {
            const jsDay = cursor.getDay();
            const isoDay = jsDay === 0 ? 7 : jsDay;
            if (scheduledDays.includes(isoDay)) {
                const d = String(cursor.getDate()).padStart(2, '0');
                const dateStr = `${selectedMonth}-${d}`;
                projected.push({
                    index: projected.length + 1,
                    dateStr,
                    dayAbbr: DAYS_ABBR[isoDay] || '',
                    displayDate: `${d}/${String(month).padStart(2, '0')}`,
                    isRecorded: false,
                });
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        return projected;
    }, [recordedDates, selectedClass, selectedMonth]);

    // Build attendance matrix map: student_id -> dateStr -> status
    const attendanceMatrix = useMemo(() => {
        const matrix = {};
        visibleAttendances.forEach((a) => {
            const dateStr = a.date ? a.date.slice(0, 10) : '';
            if (!matrix[a.student_id]) {
                matrix[a.student_id] = {};
            }
            matrix[a.student_id][dateStr] = a.status;
        });
        return matrix;
    }, [visibleAttendances]);

    // Compute student stats
    const studentStats = useMemo(() => {
        const stats = {};
        members.forEach((m) => {
            const records = attendanceMatrix[m.student_id] || {};
            let hadir = 0;
            let izin = 0;
            let sakit = 0;
            let alpa = 0;

            Object.values(records).forEach((status) => {
                if (status === 'hadir') hadir++;
                else if (status === 'izin') izin++;
                else if (status === 'sakit') sakit++;
                else if (status === 'alpa') alpa++;
            });

            const total = hadir + izin + sakit + alpa;
            const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

            stats[m.student_id] = { hadir, izin, sakit, alpa, total, pct };
        });
        return stats;
    }, [members, attendanceMatrix]);

    // Filter members by search
    const filteredMembers = useMemo(() => {
        if (!searchTerm) return members;
        const q = searchTerm.toLowerCase();
        return members.filter((m) =>
            (m.student_name || '').toLowerCase().includes(q) ||
            (m.student?.school_name || '').toLowerCase().includes(q)
        );
    }, [members, searchTerm]);

    // Class aggregate stats
    const overallAttendanceRate = useMemo(() => {
        let totalHadir = 0;
        let totalRecords = 0;
        Object.values(studentStats).forEach((s) => {
            totalHadir += s.hadir;
            totalRecords += s.total;
        });
        return totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 0;
    }, [studentStats]);

    return (
        <div className="space-y-4">
            {/* Action Bar & Quick Stats */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>Tabel Tracking Absensi Kelas</span>
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                            {recordedDates.length} Pertemuan Tercatat
                            {selectedClass?.total_sessions ? ` / ${selectedClass.total_sessions} Target` : ''}
                        </span>
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {canEdit && (
                        <>
                            <button
                                type="button"
                                onClick={() => onOpenAttendanceModal('')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span>+ Catat Absensi</span>
                            </button>

                            <button
                                type="button"
                                onClick={onOpenGenerateModal}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 transition"
                                title="Buat tanggal pertemuan otomatis sesuai hari jadwal"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span>{recordedDates.length > 0 ? 'Kelola / Generate Sesi' : 'Generate Jadwal'}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="w-full sm:w-48">
                    <span className="mb-1 block text-xs font-bold text-slate-700">Filter Bulan</span>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none shadow-2xs focus:border-violet-500"
                        required
                    />
                </label>
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                    Kehadiran {overallAttendanceRate}%
                </div>
                {members.length > 5 && (
                    <div className="w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Cari murid dalam tabel..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-violet-500 shadow-2xs"
                        />
                    </div>
                )}
            </div>

            {/* Matrix Attendance Table */}
            <div className="space-y-1">
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs w-full max-w-full">
                    <table className="w-full min-w-[700px] text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                {/* Sticky Left: No */}
                                <th className="sticky left-0 z-20 w-12 px-3 py-3 text-center border-r border-slate-200 bg-slate-50 shrink-0">
                                    No
                                </th>
                                {/* Sticky Left: Nama Murid */}
                                <th className="sticky left-12 z-20 min-w-[170px] sm:min-w-[190px] px-4 py-3 border-r border-slate-200 bg-slate-50 shrink-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                                    Nama Murid
                                </th>

                                {/* Session Date Columns */}
                                {sessionColumns.map((col) => (
                                    <th
                                        key={col.dateStr}
                                        className="min-w-[72px] px-2 py-2 text-center border-r border-slate-100 hover:bg-violet-50/60 transition cursor-pointer group"
                                        onClick={() => canEdit && onOpenAttendanceModal(col.dateStr)}
                                        title={`Klik untuk catat / edit absensi tanggal ${col.dateStr}`}
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-mono font-extrabold text-violet-700 group-hover:underline">
                                                P{col.index}
                                            </span>
                                            <span className="text-[11px] font-extrabold text-slate-800">
                                                {col.displayDate}
                                            </span>
                                            <span className="text-[9px] font-medium text-slate-400">
                                                ({col.dayAbbr})
                                            </span>
                                        </div>
                                    </th>
                                ))}

                                {/* Summary Columns */}
                                <th className="w-12 px-2 py-3 text-center text-emerald-700 bg-emerald-50/50 border-r border-slate-100" title="Total Hadir">
                                    H
                                </th>
                                <th className="w-12 px-2 py-3 text-center text-amber-700 bg-amber-50/50 border-r border-slate-100" title="Total Izin">
                                    I
                                </th>
                                <th className="w-12 px-2 py-3 text-center text-sky-700 bg-sky-50/50 border-r border-slate-100" title="Total Sakit">
                                    S
                                </th>
                                <th className="w-12 px-2 py-3 text-center text-rose-700 bg-rose-50/50 border-r border-slate-100" title="Total Alpa">
                                    A
                                </th>
                                <th className="min-w-[90px] px-3 py-3 text-center bg-slate-50/90">
                                    Kehadiran
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.map((m, idx) => {
                                const stat = studentStats[m.student_id] || { hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0, pct: 0 };
                                const studentMatrix = attendanceMatrix[m.student_id] || {};

                                return (
                                    <tr key={m.student_id} className="hover:bg-slate-50/70 transition group">
                                        {/* No */}
                                        <td className="sticky left-0 z-10 w-12 px-3 py-2.5 text-center font-mono font-bold text-slate-400 border-r border-slate-200 bg-white group-hover:bg-slate-50">
                                            {idx + 1}
                                        </td>

                                        {/* Student Info */}
                                        <td className="sticky left-12 z-10 min-w-[170px] sm:min-w-[190px] px-4 py-2.5 border-r border-slate-200 bg-white group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                                            <div className="font-bold text-slate-900 truncate">
                                                {m.student_name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                                {m.student?.school_name && (
                                                    <span>{m.student.school_name}</span>
                                                )}
                                                {m.target_sessions != null && (
                                                    <span className={`font-semibold ${m.is_quota_reached ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                                        • {m.attended_sessions}/{m.target_sessions} sesi
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                    {/* Matrix Session Cells */}
                                    {sessionColumns.map((col) => {
                                        const status = studentMatrix[col.dateStr];

                                        let badge = null;
                                        if (status === 'hadir') {
                                            badge = (
                                                <span
                                                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-[10px] font-black text-white shadow-2xs"
                                                    title={`Hadir (${col.dateStr})`}
                                                >
                                                    H
                                                </span>
                                            );
                                        } else if (status === 'izin') {
                                            badge = (
                                                <span
                                                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-[10px] font-black text-white shadow-2xs"
                                                    title={`Izin (${col.dateStr})`}
                                                >
                                                    I
                                                </span>
                                            );
                                        } else if (status === 'sakit') {
                                            badge = (
                                                <span
                                                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500 text-[10px] font-black text-white shadow-2xs"
                                                    title={`Sakit (${col.dateStr})`}
                                                >
                                                    S
                                                </span>
                                            );
                                        } else if (status === 'alpa') {
                                            badge = (
                                                <span
                                                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-[10px] font-black text-white shadow-2xs"
                                                    title={`Alpa (${col.dateStr})`}
                                                >
                                                    A
                                                </span>
                                            );
                                        } else {
                                            badge = (
                                                <span
                                                    className="inline-flex h-6 w-6 items-center justify-center text-xs font-semibold text-slate-300"
                                                    title="Belum diabsen"
                                                >
                                                    -
                                                </span>
                                            );
                                        }

                                        return (
                                            <td
                                                key={col.dateStr}
                                                className="min-w-[72px] px-2 py-2 text-center border-r border-slate-100 hover:bg-slate-100/60 cursor-pointer"
                                                onClick={() => canEdit && onOpenAttendanceModal(col.dateStr)}
                                            >
                                                {badge}
                                            </td>
                                        );
                                    })}

                                    {/* Stats H / I / S / A */}
                                    <td className="w-12 px-2 py-2.5 text-center font-bold text-emerald-700 bg-emerald-50/20 border-r border-slate-100">
                                        {stat.hadir}
                                    </td>
                                    <td className="w-12 px-2 py-2.5 text-center font-bold text-amber-700 bg-amber-50/20 border-r border-slate-100">
                                        {stat.izin}
                                    </td>
                                    <td className="w-12 px-2 py-2.5 text-center font-bold text-sky-700 bg-sky-50/20 border-r border-slate-100">
                                        {stat.sakit}
                                    </td>
                                    <td className="w-12 px-2 py-2.5 text-center font-bold text-rose-700 bg-rose-50/20 border-r border-slate-100">
                                        {stat.alpa}
                                    </td>

                                    {/* Percentage Progress */}
                                    <td className="min-w-[90px] px-3 py-2.5 text-center font-bold">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className={stat.pct >= 75 ? 'text-emerald-700' : stat.pct >= 50 ? 'text-amber-700' : 'text-slate-600'}>
                                                {stat.pct}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredMembers.length === 0 && (
                            <tr>
                                <td
                                    colSpan={sessionColumns.length + 7}
                                    className="px-6 py-10 text-center text-xs text-slate-400"
                                >
                                    {members.length === 0
                                        ? 'Belum ada murid di kelas ini.'
                                        : 'Tidak ada murid yang sesuai dengan pencarian.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </div>

            {/* Legend & Guide Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-slate-500">Keterangan Status:</span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-md bg-emerald-500 font-black text-white text-[9px] flex items-center justify-center">H</span>
                        <span className="text-slate-600">Hadir</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-md bg-amber-500 font-black text-white text-[9px] flex items-center justify-center">I</span>
                        <span className="text-slate-600">Izin</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-md bg-sky-500 font-black text-white text-[9px] flex items-center justify-center">S</span>
                        <span className="text-slate-600">Sakit</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-md bg-rose-500 font-black text-white text-[9px] flex items-center justify-center">A</span>
                        <span className="text-slate-600">Alpa</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold">-</span>
                        <span className="text-slate-500">Belum Ada Sesi</span>
                    </span>
                </div>

            </div>
        </div>
    );
}
