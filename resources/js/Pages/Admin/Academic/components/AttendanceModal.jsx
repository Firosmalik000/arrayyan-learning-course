import { useState, useEffect } from 'react';
import { Modal } from '@/Components/Admin';

const attendanceOptions = [
    { value: 'hadir', label: 'Hadir', badgeClass: 'bg-emerald-600 text-white shadow-xs' },
    { value: 'izin', label: 'Izin', badgeClass: 'bg-amber-500 text-white shadow-xs' },
    { value: 'sakit', label: 'Sakit', badgeClass: 'bg-sky-500 text-white shadow-xs' },
    { value: 'alpa', label: 'Alpa', badgeClass: 'bg-rose-500 text-white shadow-xs' },
];

export const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceModal({
    show,
    onClose,
    selectedClass,
    members = [],
    initialDate = '',
    attendances = [],
    onSubmit,
}) {
    const [date, setDate] = useState(initialDate || todayStr());
    const [rows, setRows] = useState({});
    const [notes, setNotes] = useState({});
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!show) return;
        const targetDate = initialDate || todayStr();
        setDate(targetDate);

        // Load existing attendances for targetDate if available
        const dateRecords = (attendances || []).filter((a) => a.date === targetDate);
        const map = {};
        const noteMap = {};
        dateRecords.forEach((a) => {
            map[a.student_id] = a.status;
            if (a.note) noteMap[a.student_id] = a.note;
        });

        const initRows = {};
        members.forEach((m) => {
            const st = map[m.student_id];
            initRows[m.student_id] = (st && st !== 'belum_absen') ? st : 'hadir';
        });
        setRows(initRows);
        setNotes(noteMap);
    }, [show, initialDate, attendances, members]);

    // When date changes inside modal, reload records for that date
    const handleDateChange = (newDate) => {
        setDate(newDate);
        const dateRecords = (attendances || []).filter((a) => a.date === newDate);
        const map = {};
        const noteMap = {};
        dateRecords.forEach((a) => {
            map[a.student_id] = a.status;
            if (a.note) noteMap[a.student_id] = a.note;
        });

        const updatedRows = {};
        members.forEach((m) => {
            const st = map[m.student_id];
            updatedRows[m.student_id] = (st && st !== 'belum_absen') ? st : 'hadir';
        });
        setRows(updatedRows);
        setNotes(noteMap);
    };

    const setAllStatus = (status = 'hadir') => {
        const updated = {};
        members.forEach((m) => {
            updated[m.student_id] = status;
        });
        setRows((prev) => ({ ...prev, ...updated }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!date) return;
        const payload = Object.entries(rows).map(([student_id, status]) => ({
            student_id: Number(student_id),
            status,
            note: notes[student_id] || null,
        }));
        onSubmit(date, payload);
        onClose();
    };

    const filteredMembers = members.filter((m) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (m.student_name || '').toLowerCase().includes(q) ||
            (m.student?.school_name || '').toLowerCase().includes(q)
        );
    });

    const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    Object.values(rows).forEach((st) => {
        if (counts[st] !== undefined) counts[st]++;
    });

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={`Catat Absensi — ${selectedClass?.name ?? 'Kelas'}`}
            maxWidth="max-w-3xl"
        >
            <form onSubmit={handleSave} className="space-y-4">
                {/* Date selection & quick controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-slate-50 p-3 sm:p-3.5 border border-slate-100">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 shrink-0">
                            Tanggal Pertemuan:
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full xs:w-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                                required
                            />

                            {/* Optional quick select from existing session dates */}
                            {attendances && attendances.length > 0 && (
                                <select
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="w-full xs:w-auto rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                                >
                                    <option value={date}>Tanggal Dipilih ({date})</option>
                                    {Array.from(new Set(attendances.map((a) => a.date?.slice(0, 10)).filter(Boolean)))
                                        .sort()
                                        .map((d, i) => (
                                            <option key={d} value={d}>
                                                Sesi #{i + 1} ({d})
                                            </option>
                                        ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end sm:justify-start border-t xs:border-t-0 border-slate-200/60 pt-2 xs:pt-0">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Cepat:</span>
                        <button
                            type="button"
                            onClick={() => setAllStatus('hadir')}
                            className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200 transition"
                        >
                            Semua Hadir
                        </button>
                        <button
                            type="button"
                            onClick={() => setAllStatus('izin')}
                            className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-200 transition"
                        >
                            Semua Izin
                        </button>
                    </div>
                </div>

                {/* Summary badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                    <div className="flex items-center gap-2 text-slate-500">
                        <span>Total Siswa: <strong className="text-slate-800">{members.length}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            Hadir: {counts.hadir}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                            Izin: {counts.izin}
                        </span>
                        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                            Sakit: {counts.sakit}
                        </span>
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                            Alpa: {counts.alpa}
                        </span>
                    </div>
                </div>

                {/* Search in modal if many students */}
                {members.length > 5 && (
                    <div>
                        <input
                            type="text"
                            placeholder="Cari murid..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-violet-500"
                        />
                    </div>
                )}

                {/* Students list */}
                <div className="max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {filteredMembers.map((m, idx) => {
                        const currentStatus = rows[m.student_id] || 'hadir';

                        return (
                            <div
                                key={m.student_id}
                                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition"
                            >
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-slate-400">
                                            #{idx + 1}
                                        </span>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            {m.student_name}
                                        </h4>
                                        {m.is_quota_reached && (
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                Kuota Penuh
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 pl-5">
                                        {m.student?.school_name ? `${m.student.school_name} • ` : ''}
                                        {m.target_sessions != null ? `Sesi ${m.attended_sessions}/${m.target_sessions}` : 'Paket Reguler'}
                                    </p>
                                </div>

                                {/* Status segmented pills */}
                                <div className="grid grid-cols-4 gap-1 w-full sm:flex sm:w-auto pl-5 sm:pl-0">
                                    {attendanceOptions.map((opt) => {
                                        const isSelected = currentStatus === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    setRows((prev) => ({
                                                        ...prev,
                                                        [m.student_id]: opt.value,
                                                    }))
                                                }
                                                className={`rounded-lg py-1.5 sm:py-1 px-1 sm:px-2.5 text-center text-[11px] sm:text-xs font-bold transition ${
                                                    isSelected
                                                        ? opt.badgeClass
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {filteredMembers.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">
                            Tidak ada murid yang ditemukan.
                        </div>
                    )}
                </div>

                {/* Modal action buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                    >
                        Simpan Absensi
                    </button>
                </div>
            </form>
        </Modal>
    );
}
