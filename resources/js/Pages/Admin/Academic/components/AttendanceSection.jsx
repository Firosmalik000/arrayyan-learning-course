import { useMemo, useState } from 'react';
import { ActionDropdown, Modal, Pagination } from '@/Components/Admin';

const attendanceOptions = [
    { value: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-600 text-white shadow-sm' },
    { value: 'izin', label: 'Izin', activeClass: 'bg-amber-500 text-white shadow-sm' },
    { value: 'sakit', label: 'Sakit', activeClass: 'bg-sky-500 text-white shadow-sm' },
    { value: 'alpa', label: 'Alpa', activeClass: 'bg-rose-500 text-white shadow-sm' },
];

export const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceSection({
    selectedClass,
    members = [],
    attDate,
    setAttDate,
    attRows = {},
    setAttRows,
    attendances = [],
    onSubmit,
    onGenerateSessions,
    canGenerate = false,
}) {
    const [activeTab, setActiveTab] = useState('input'); // 'input' | 'history'
    const [historyPage, setHistoryPage] = useState(1);
    const [historyPerPage, setHistoryPerPage] = useState(10);

    // Modal Generate Pertemuan
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [genStartDate, setGenStartDate] = useState(todayStr());
    const [genCount, setGenCount] = useState(selectedClass?.total_sessions || 8);

    // Group existing attendances by date for history
    const sessions = useMemo(() => {
        const groups = {};
        attendances.forEach((a) => {
            if (!groups[a.date]) {
                groups[a.date] = { date: a.date, hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0 };
            }
            if (groups[a.date][a.status] !== undefined) {
                groups[a.date][a.status]++;
            }
            groups[a.date].total++;
        });

        return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    }, [attendances]);

    const paginatedSessions = useMemo(() => {
        const start = (historyPage - 1) * historyPerPage;
        return sessions.slice(start, start + historyPerPage);
    }, [sessions, historyPage, historyPerPage]);

    // Live counts for the current input
    const counts = useMemo(() => {
        const res = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
        members.forEach((m) => {
            const status = attRows[m.student_id] || 'hadir';
            if (res[status] !== undefined) res[status]++;
        });
        return res;
    }, [members, attRows]);

    const setAllPresent = () => {
        const updated = {};
        members.forEach((m) => {
            // Don't auto-present members whose quota is already reached on new dates
            if (!isDateRecorded && m.is_quota_reached) return;
            updated[m.student_id] = 'hadir';
        });
        setAttRows((prev) => ({ ...prev, ...updated }));
    };

    const handleInspectSession = (date) => {
        setAttDate(date);
        setActiveTab('input');
    };

    const isDateRecorded = sessions.some((s) => s.date === attDate);

    const handleConfirmGenerate = (e) => {
        e.preventDefault();
        if (onGenerateSessions) {
            onGenerateSessions(genStartDate, Number(genCount) || 8);
        }
        setShowGenerateModal(false);
    };

    return (
        <div className="space-y-4">
            {/* Header & Tabs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Absensi Kelas</h3>
                        {selectedClass?.total_sessions ? (
                            <p className="text-xs text-slate-500">
                                Target: {selectedClass.total_sessions} Pertemuan
                                {selectedClass.level ? ` (${selectedClass.level})` : ''}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setActiveTab('input')}
                            className={`rounded-md px-3 py-1 transition ${
                                activeTab === 'input'
                                    ? 'bg-white text-slate-800 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Form Absensi
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                                activeTab === 'history'
                                    ? 'bg-white text-slate-800 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span>Riwayat Pertemuan</span>
                            <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                                {sessions.length}{selectedClass?.total_sessions ? `/${selectedClass.total_sessions}` : ''}
                            </span>
                        </button>
                    </div>

                    {canGenerate && (
                        <button
                            type="button"
                            onClick={() => {
                                setGenCount(selectedClass?.total_sessions || 8);
                                setShowGenerateModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            Generate Jadwal Pertemuan
                        </button>
                    )}
                </div>

                {activeTab === 'input' && (
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={attDate}
                            onChange={(e) => setAttDate(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-violet-400"
                        />
                        <button
                            type="button"
                            onClick={setAllPresent}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Semua Hadir
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {isDateRecorded ? 'Perbarui Absensi' : 'Simpan Absensi'}
                        </button>
                    </div>
                )}
            </div>

            {/* Content Tab 1: Input Absensi */}
            {activeTab === 'input' && (
                <div className="space-y-3">
                    {/* Live Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">
                                Tanggal: {attDate}
                            </span>
                            {isDateRecorded ? (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                    Sudah Terabsen
                                </span>
                            ) : (
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                    Pertemuan Baru
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">
                                Hadir: {counts.hadir}
                            </span>
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">
                                Izin: {counts.izin}
                            </span>
                            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 font-semibold text-sky-700">
                                Sakit: {counts.sakit}
                            </span>
                            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 font-semibold text-rose-700">
                                Alpa: {counts.alpa}
                            </span>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full min-w-[550px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-4 py-2.5 font-medium">Nama Murid & Progres Pertemuan</th>
                                    <th className="px-4 py-2.5 font-medium text-right">Status Kehadiran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((m) => {
                                    const current = attRows[m.student_id] || 'hadir';
                                    const student = m.student || {};
                                    const isBlocked = !isDateRecorded && m.is_quota_reached;

                                    return (
                                        <tr key={m.student_id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-2.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-slate-800">{m.student_name}</span>
                                                    {m.target_sessions != null && (
                                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            m.is_quota_reached
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-violet-100 text-violet-700'
                                                        }`}>
                                                            {m.is_quota_reached
                                                                ? `Kuota Pertemuan Penuh (${m.attended_sessions}/${m.target_sessions})`
                                                                : `Sesi ${m.attended_sessions}/${m.target_sessions}`}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                    {student.level && <span className="font-medium text-slate-500">Jenjang: {student.level}</span>}
                                                    {student.package && <span>• {student.package}</span>}
                                                    {student.school_name && <span>• {student.school_name}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {isBlocked ? (
                                                    <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                                                        Batas Kuota Pertemuan Habis
                                                    </span>
                                                ) : (
                                                    <div className="inline-flex flex-wrap justify-end gap-1">
                                                        {attendanceOptions.map((opt) => {
                                                            const isSelected = current === opt.value;
                                                            return (
                                                                <button
                                                                    key={opt.value}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setAttRows((prev) => ({
                                                                            ...prev,
                                                                            [m.student_id]: opt.value,
                                                                        }))
                                                                    }
                                                                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                                                                        isSelected
                                                                            ? opt.activeClass
                                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                                    }`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-xs text-slate-500">
                                            Belum ada murid di kelas ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Content Tab 2: Riwayat Pertemuan */}
            {activeTab === 'history' && (
                <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full min-w-[550px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="w-12 px-4 py-2.5 text-center font-medium">Sesi</th>
                                    <th className="w-14 px-3 py-2.5 text-center font-medium">Aksi</th>
                                    <th className="px-4 py-2.5 font-medium">Tanggal Pertemuan</th>
                                    <th className="px-4 py-2.5 font-medium">Rekapitulasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedSessions.map((s, idx) => {
                                    const rowNumber = (historyPage - 1) * historyPerPage + idx + 1;
                                    const percent = s.total > 0 ? Math.round((s.hadir / s.total) * 100) : 0;
                                    const actionItems = [
                                        {
                                            label: 'Lihat / Edit',
                                            onClick: () => handleInspectSession(s.date),
                                        },
                                    ];

                                    return (
                                        <tr key={s.date} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3 text-center font-semibold text-slate-500">
                                                #{rowNumber}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <ActionDropdown items={actionItems} />
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {s.date}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                                                        {s.hadir} Hadir
                                                    </span>
                                                    {s.izin > 0 && (
                                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                                                            {s.izin} Izin
                                                        </span>
                                                    )}
                                                    {s.sakit > 0 && (
                                                        <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                                                            {s.sakit} Sakit
                                                        </span>
                                                    )}
                                                    {s.alpa > 0 && (
                                                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                                                            {s.alpa} Alpa
                                                        </span>
                                                    )}
                                                    <span className="text-slate-400 font-mono text-[11px]">
                                                        ({percent}%)
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {sessions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">
                                            Belum ada riwayat pertemuan absensi. Klik “Generate Jadwal Pertemuan” untuk membuat otomatis.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {sessions.length > historyPerPage && (
                        <Pagination
                            currentPage={historyPage}
                            totalPages={Math.ceil(sessions.length / historyPerPage)}
                            onPageChange={setHistoryPage}
                        />
                    )}
                </div>
            )}

            {/* Modal Generate Jadwal Pertemuan */}
            <Modal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                title="Generate Otomatis Pertemuan Absensi"
            >
                <form onSubmit={handleConfirmGenerate} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Sistem akan membuat tanggal pertemuan absensi secara otomatis berdasarkan <strong>jadwal mingguan</strong> kelas ini sampai target jumlah pertemuan terpenuhi.
                    </p>

                    <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-xs">
                        <span className="font-semibold text-violet-800">Jadwal Mingguan Kelas:</span>
                        <p className="mt-1 text-slate-700">
                            {(selectedClass?.schedules ?? []).length > 0
                                ? (selectedClass.schedules ?? []).map((s) => `${s.day} (${s.start_time}-${s.end_time})`).join(', ')
                                : 'Belum ada jadwal mingguan. Harap tambahkan jadwal mingguan terlebih dahulu.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Mulai Tanggal
                            </label>
                            <input
                                type="date"
                                value={genStartDate}
                                onChange={(e) => setGenStartDate(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-violet-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Jumlah Pertemuan
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={genCount}
                                onChange={(e) => setGenCount(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-violet-400"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowGenerateModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={(selectedClass?.schedules ?? []).length === 0}
                            className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                        >
                            Generate Sekarang
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
