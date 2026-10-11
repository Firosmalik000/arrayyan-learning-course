import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/Components/Admin';
import { todayStr } from './AttendanceModal';

const DAYS_ABBR = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function GenerateSessionsModal({
    show,
    onClose,
    selectedClass,
    onSubmit,
}) {
    const schedules = selectedClass?.schedules || [];

    // Distinct dates that ALREADY exist in this class (from attendances)
    const existingDates = useMemo(() => {
        const set = new Set();
        (selectedClass?.attendances || []).forEach((a) => {
            if (a.date) set.add(a.date.slice(0, 10));
        });
        return Array.from(set).sort();
    }, [selectedClass?.attendances]);

    // Map dates that have actual student attendances (hadir, izin, sakit, alpa)
    const attendedStatusMap = useMemo(() => {
        const map = {};
        (selectedClass?.attendances || []).forEach((a) => {
            const d = a.date ? a.date.slice(0, 10) : '';
            if (d && a.status && a.status !== 'belum_absen') {
                map[d] = a.status;
            }
        });
        return map;
    }, [selectedClass?.attendances]);

    const defaultCount = selectedClass?.total_sessions || Math.max(existingDates.length, 8);
    const defaultStart = existingDates.length > 0 ? existingDates[0] : todayStr();

    const [startDate, setStartDate] = useState(defaultStart);
    const [count, setCount] = useState(defaultCount);
    const [customDates, setCustomDates] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDateValue, setEditDateValue] = useState('');

    // Generate sessions helper starting from a given date, skipping any that are in existing
    const generateFromSchedule = (fromStart, targetTotal, existingArray = []) => {
        const scheduledDays = schedules.map((s) => Number(s.day_of_week));
        if (scheduledDays.length === 0) return existingArray;

        const result = [...existingArray];
        const dateSet = new Set(result);

        let cursor;
        if (result.length > 0) {
            const lastDate = result[result.length - 1];
            cursor = new Date(lastDate);
            cursor.setDate(cursor.getDate() + 1);
        } else {
            cursor = new Date(fromStart);
        }

        let safety = 0;
        while (result.length < targetTotal && safety < 365) {
            const jsDay = cursor.getDay();
            const isoDay = jsDay === 0 ? 7 : jsDay;
            if (scheduledDays.includes(isoDay)) {
                const y = cursor.getFullYear();
                const m = String(cursor.getMonth() + 1).padStart(2, '0');
                const d = String(cursor.getDate()).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;
                if (!dateSet.has(dateStr)) {
                    dateSet.add(dateStr);
                    result.push(dateStr);
                }
            }
            cursor.setDate(cursor.getDate() + 1);
            safety++;
        }
        return result.sort();
    };

    // When modal opens: initialize with existing class session dates if any, or generate fresh
    useEffect(() => {
        if (!show) return;

        const initialTargetCount = selectedClass?.total_sessions || Math.max(existingDates.length, 8);
        const initialStartDate = existingDates.length > 0 ? existingDates[0] : todayStr();

        setStartDate(initialStartDate);
        setCount(initialTargetCount);
        setEditingIndex(null);
        setEditDateValue('');

        if (existingDates.length > 0) {
            if (existingDates.length >= initialTargetCount) {
                setCustomDates([...existingDates]);
            } else {
                const filled = generateFromSchedule(initialStartDate, initialTargetCount, existingDates);
                setCustomDates(filled);
            }
        } else {
            const fresh = generateFromSchedule(initialStartDate, initialTargetCount, []);
            setCustomDates(fresh);
        }
    }, [show, selectedClass?.id, existingDates]);

    // When count input changes
    const handleCountChange = (newCountStr) => {
        setCount(newCountStr);
        const target = Math.min(50, Math.max(1, Number(newCountStr) || 8));

        if (customDates.length < target) {
            const updated = generateFromSchedule(startDate, target, customDates);
            setCustomDates(updated);
        } else if (customDates.length > target) {
            setCustomDates(customDates.slice(0, target));
        }
    };

    // Button to regenerate all sessions according to routine weekly schedule
    const handleRegenerateFromRoutine = () => {
        const target = Math.min(50, Math.max(1, Number(count) || 8));
        const attendedDates = existingDates.filter((d) => attendedStatusMap[d]);
        const fresh = generateFromSchedule(startDate, target, attendedDates);
        setCustomDates(fresh);
        setEditingIndex(null);
    };

    // Open edit mode for a specific pill
    const handleStartEdit = (index) => {
        setEditingIndex(index);
        setEditDateValue(customDates[index] || todayStr());
    };

    // Commit date change from the edit input
    const handleApplyEdit = (e) => {
        if (e) e.preventDefault();
        if (!editDateValue || editingIndex === null) return;

        const updated = [...customDates];
        updated[editingIndex] = editDateValue;
        updated.sort();
        setCustomDates(updated);
        setEditingIndex(null);
        setEditDateValue('');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(startDate, Number(count) || 8, customDates);
        onClose();
    };

    const formatPillDate = (isoStr) => {
        if (!isoStr) return { dateDisplay: '-', dayAbbr: '' };
        const parts = isoStr.split('-');
        if (parts.length !== 3) return { dateDisplay: isoStr, dayAbbr: '' };
        const dObj = new Date(isoStr);
        const jsDay = dObj.getDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;
        const dayAbbr = DAYS_ABBR[isoDay] || '';
        return {
            dateDisplay: `${parts[2]}/${parts[1]}/${parts[0]}`,
            dayAbbr,
        };
    };

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title="Kelola Jadwal Pertemuan Kelas"
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Info weekly schedules */}
                {schedules.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-violet-50/70 border border-violet-100 px-3 py-2 text-xs text-violet-800">
                        <span className="font-bold text-violet-900 mr-1">Jadwal:</span>
                        {schedules.map((s, idx) => (
                            <span key={s.id} className="inline-flex items-center gap-1 font-medium">
                                {idx > 0 && <span className="text-violet-300">•</span>}
                                <span>{s.day} ({s.start_time} - {s.end_time})</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl bg-rose-50 border border-rose-100 p-2.5 text-xs text-rose-700 font-semibold">
                        Kelas belum memiliki jadwal mingguan. Tambahkan jadwal mingguan terlebih dahulu.
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Jumlah Pertemuan
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={count}
                            onChange={(e) => handleCountChange(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-500 shadow-2xs"
                            required
                        />
                    </div>
                </div>

                {/* Live Preview of Generated Dates with Editable Pills */}
                {customDates.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">
                                {customDates.length} Sesi Pertemuan:
                            </span>
                            <button
                                type="button"
                                onClick={handleRegenerateFromRoutine}
                                className="text-[11px] font-semibold text-violet-700 hover:text-violet-900 transition cursor-pointer"
                            >
                                🔄 Hitung Ulang Rutin
                            </button>
                        </div>

                        {/* Interactive pills container */}
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                            {customDates.map((dateStr, i) => {
                                const { dateDisplay, dayAbbr } = formatPillDate(dateStr);
                                const isEditing = editingIndex === i;
                                const attendedStatus = attendedStatusMap[dateStr];

                                let statusBadge = null;
                                if (attendedStatus === 'hadir') {
                                    statusBadge = <span className="rounded bg-emerald-100 text-emerald-800 px-1 py-0.2 text-[9px] font-bold">H</span>;
                                } else if (attendedStatus === 'izin') {
                                    statusBadge = <span className="rounded bg-amber-100 text-amber-800 px-1 py-0.2 text-[9px] font-bold">I</span>;
                                } else if (attendedStatus === 'sakit') {
                                    statusBadge = <span className="rounded bg-sky-100 text-sky-800 px-1 py-0.2 text-[9px] font-bold">S</span>;
                                } else if (attendedStatus === 'alpa') {
                                    statusBadge = <span className="rounded bg-rose-100 text-rose-800 px-1 py-0.2 text-[9px] font-bold">A</span>;
                                }

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleStartEdit(i)}
                                        className={`group inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition cursor-pointer ${
                                            isEditing
                                                ? 'border-violet-600 bg-violet-100 text-violet-900 ring-2 ring-violet-500 shadow-xs'
                                                : 'border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-300 text-slate-700'
                                        }`}
                                        title={`Klik untuk ubah tanggal pertemuan ke-${i + 1}`}
                                    >
                                        <span className="font-extrabold text-violet-600">P{i + 1}:</span>
                                        <span className="font-mono font-semibold text-slate-800">{dateDisplay}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">({dayAbbr})</span>
                                        {statusBadge}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dedicated Date Editor Panel */}
                        {editingIndex !== null && (
                            <div className="rounded-xl border border-violet-200 bg-violet-50 p-2.5 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                                <span className="text-xs font-bold text-violet-900 shrink-0">
                                    Ubah P{editingIndex + 1}:
                                </span>
                                <div className="flex items-center gap-1.5 flex-1 justify-end">
                                    <input
                                        type="date"
                                        value={editDateValue}
                                        onChange={(e) => setEditDateValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleApplyEdit();
                                            }
                                        }}
                                        className="rounded-lg border border-violet-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-semibold shadow-xs outline-none focus:border-violet-600 cursor-pointer"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyEdit}
                                        className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingIndex(null)}
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={customDates.length === 0}
                        className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 disabled:opacity-50 transition cursor-pointer"
                    >
                        Simpan Jadwal Pertemuan
                    </button>
                </div>
            </form>
        </Modal>
    );
}
