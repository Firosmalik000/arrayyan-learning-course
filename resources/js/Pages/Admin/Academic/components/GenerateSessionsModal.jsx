import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/Components/Admin';
import { todayStr } from './AttendanceModal';

const DAYS_ABBR = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const dateParts = (isoDate) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return { year, month, day };
};

const monthEndDate = (monthValue) => {
    const [year, month] = monthValue.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return `${monthValue}-${String(lastDay).padStart(2, '0')}`;
};

const shiftMonth = (monthValue, offset) => {
    const [year, month] = monthValue.split('-').map(Number);
    const shifted = new Date(year, month - 1 + offset, 1);

    return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
};

export default function GenerateSessionsModal({ show, onClose, selectedClass, onSubmit }) {
    const schedules = useMemo(() => selectedClass?.schedules ?? [], [selectedClass?.schedules]);
    const allExistingDates = useMemo(() => {
        const dates = new Set();

        (selectedClass?.attendances ?? []).forEach((attendance) => {
            if (attendance.date) dates.add(attendance.date.slice(0, 10));
        });

        return Array.from(dates).sort();
    }, [selectedClass?.attendances]);

    const attendedStatusMap = useMemo(() => {
        const statuses = {};

        (selectedClass?.attendances ?? []).forEach((attendance) => {
            const date = attendance.date?.slice(0, 10);
            if (date && attendance.status && attendance.status !== 'belum_absen') {
                statuses[date] = attendance.status;
            }
        });

        return statuses;
    }, [selectedClass?.attendances]);

    const currentMonth = todayStr().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [customDates, setCustomDates] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDateValue, setEditDateValue] = useState('');
    const [newDateValue, setNewDateValue] = useState('');
    const [pendingDateForAnotherMonth, setPendingDateForAnotherMonth] = useState('');
    const [validationMessage, setValidationMessage] = useState('');

    const existingDatesInMonth = useMemo(
        () => allExistingDates.filter((date) => date.startsWith(`${selectedMonth}-`)),
        [allExistingDates, selectedMonth],
    );

    const generateDatesForMonth = (monthValue) => {
        const scheduledDays = new Set(schedules.map((schedule) => Number(schedule.day_of_week)));
        if (scheduledDays.size === 0) return [];

        const [year, month] = monthValue.split('-').map(Number);
        const cursor = new Date(year, month - 1, 1);
        const dates = [];

        while (cursor.getMonth() === month - 1) {
            const isoDay = cursor.getDay() === 0 ? 7 : cursor.getDay();
            if (scheduledDays.has(isoDay)) {
                dates.push(
                    `${year}-${String(month).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`,
                );
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        return dates;
    };

    useEffect(() => {
        if (!show) return;

        const hasCurrentMonthSchedule = allExistingDates.some((date) => date.startsWith(`${currentMonth}-`));
        const nextScheduledDate = allExistingDates.find((date) => date >= todayStr());
        const initialMonth = hasCurrentMonthSchedule
            ? currentMonth
            : (nextScheduledDate?.slice(0, 7) ?? currentMonth);

        setSelectedMonth(initialMonth);
    }, [show, selectedClass?.id]);

    useEffect(() => {
        if (!show || !selectedMonth) return;

        const existing = allExistingDates.filter((date) => date.startsWith(`${selectedMonth}-`));
        const initialDates = existing.length > 0 ? existing : generateDatesForMonth(selectedMonth);
        const pendingDate = pendingDateForAnotherMonth.startsWith(`${selectedMonth}-`)
            ? pendingDateForAnotherMonth
            : '';
        const dates = pendingDate
            ? Array.from(new Set([...initialDates, pendingDate])).sort()
            : initialDates;

        setCustomDates(dates);
        setEditingIndex(null);
        setEditDateValue('');
        setNewDateValue(pendingDate || `${selectedMonth}-01`);
        if (pendingDate) setPendingDateForAnotherMonth('');
        setValidationMessage('');
    }, [show, selectedClass?.id, selectedMonth, allExistingDates, schedules]);

    const handleRegenerateFromRoutine = () => {
        const recordedDates = existingDatesInMonth.filter((date) => attendedStatusMap[date]);
        const routineDates = generateDatesForMonth(selectedMonth);

        setCustomDates(Array.from(new Set([...routineDates, ...recordedDates])).sort());
        setEditingIndex(null);
        setValidationMessage('');
    };

    const handleStartEdit = (index) => {
        const date = customDates[index];
        if (attendedStatusMap[date]) return;

        setEditingIndex(index);
        setEditDateValue(date);
        setValidationMessage('');
    };

    const validateDate = (date, ignoredIndex = null) => {
        if (!date.startsWith(`${selectedMonth}-`)) {
            return 'Tanggal harus berada pada bulan yang sedang dikelola.';
        }

        if (customDates.some((existingDate, index) => existingDate === date && index !== ignoredIndex)) {
            return 'Tanggal tersebut sudah ada di daftar pertemuan.';
        }

        return '';
    };

    const handleApplyEdit = () => {
        if (!editDateValue || editingIndex === null) return;

        const message = validateDate(editDateValue, editingIndex);
        if (message) {
            setValidationMessage(message);
            return;
        }

        const updatedDates = [...customDates];
        updatedDates[editingIndex] = editDateValue;
        setCustomDates(updatedDates.sort());
        setEditingIndex(null);
        setEditDateValue('');
        setValidationMessage('');
    };

    const handleAddDate = () => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(newDateValue)) {
            setValidationMessage('Pilih tanggal yang ingin ditambahkan.');
            return;
        }

        const targetMonth = newDateValue.slice(0, 7);
        if (targetMonth !== selectedMonth) {
            setPendingDateForAnotherMonth(newDateValue);
            setSelectedMonth(targetMonth);
            return;
        }

        const message = validateDate(newDateValue);
        if (message) {
            setValidationMessage(message);
            return;
        }

        setCustomDates([...customDates, newDateValue].sort());
        setValidationMessage('');
    };

    const handleRemoveDate = (date) => {
        if (attendedStatusMap[date]) return;

        setCustomDates(customDates.filter((existingDate) => existingDate !== date));
        setEditingIndex(null);
        setValidationMessage('');
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        onSubmit(selectedMonth, customDates, { onSuccess: onClose });
    };

    const formatPillDate = (isoDate) => {
        const { year, month, day } = dateParts(isoDate);
        const date = new Date(year, month - 1, day);
        const isoDay = date.getDay() === 0 ? 7 : date.getDay();

        return {
            dateDisplay: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
            dayAbbr: DAYS_ABBR[isoDay] ?? '',
        };
    };

    return (
        <Modal isOpen={show} onClose={onClose} title="Kelola Jadwal Pertemuan Bulanan" maxWidth="max-w-2xl">
            <form onSubmit={handleFormSubmit} className="space-y-4">
                {schedules.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-xs text-violet-800">
                        <span className="mr-1 font-bold text-violet-900">Jadwal mingguan:</span>
                        {schedules.map((schedule, index) => (
                            <span key={schedule.id} className="inline-flex items-center gap-1 font-medium">
                                {index > 0 && <span className="text-violet-300">•</span>}
                                <span>{schedule.day} ({schedule.start_time} - {schedule.end_time})</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800">
                        Kelas belum memiliki jadwal mingguan. Anda masih dapat menambahkan tanggal secara manual.
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700">Bulan yang Dikelola</label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-violet-700"
                                title="Bulan sebelumnya"
                                aria-label="Bulan sebelumnya"
                            >
                                ←
                            </button>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(event) => setSelectedMonth(event.target.value)}
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 shadow-2xs outline-none focus:border-violet-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-violet-700"
                                title="Bulan berikutnya"
                                aria-label="Bulan berikutnya"
                            >
                                →
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRegenerateFromRoutine}
                        disabled={schedules.length === 0}
                        className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Isi Sesuai Jadwal Mingguan
                    </button>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-xs font-bold text-slate-700">{customDates.length} pertemuan pada bulan ini</p>
                        </div>
                        {existingDatesInMonth.length > 0 && (
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700">Mode edit jadwal</span>
                        )}
                    </div>

                    {customDates.length > 0 ? (
                        <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs">
                            {customDates.map((date, index) => {
                                const { dateDisplay, dayAbbr } = formatPillDate(date);
                                const isRecorded = Boolean(attendedStatusMap[date]);
                                const isEditing = editingIndex === index;

                                return (
                                    <div
                                        key={date}
                                        className={`inline-flex items-center overflow-hidden rounded-lg border text-xs transition ${
                                            isRecorded
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : isEditing
                                                    ? 'border-violet-500 bg-violet-100 ring-2 ring-violet-200'
                                                    : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(index)}
                                            disabled={isRecorded}
                                            className="inline-flex items-center gap-1 px-2 py-1.5 disabled:cursor-not-allowed"
                                            title={isRecorded ? 'Absensi sudah terisi dan harus diedit dari tabel tracking' : `Ubah pertemuan ke-${index + 1}`}
                                        >
                                            <span className="font-extrabold text-violet-600">P{index + 1}</span>
                                            <span className="font-mono font-semibold text-slate-800">{dateDisplay}</span>
                                            <span className="text-[10px] font-medium text-slate-400">({dayAbbr})</span>
                                            {isRecorded && <span className="rounded bg-emerald-100 px-1 text-[9px] font-bold text-emerald-700">Terisi</span>}
                                        </button>
                                        {!isRecorded && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDate(date)}
                                                className="border-l border-slate-200 px-2 py-1.5 font-bold text-slate-500 transition hover:text-rose-600"
                                                title="Hapus tanggal ini"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
                            Belum ada pertemuan pada bulan ini.
                        </div>
                    )}

                    {editingIndex !== null && (
                        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-violet-200 bg-violet-50 p-2.5">
                            <div className="min-w-48 flex-1">
                                <label className="mb-1 block text-xs font-bold text-violet-900">Ubah tanggal pertemuan</label>
                                <input
                                    type="date"
                                    min={`${selectedMonth}-01`}
                                    max={monthEndDate(selectedMonth)}
                                    value={editDateValue}
                                    onChange={(event) => setEditDateValue(event.target.value)}
                                    className="w-full rounded-lg border border-violet-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-600"
                                    autoFocus
                                />
                            </div>
                            <button type="button" onClick={handleApplyEdit} className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700">Terapkan</button>
                            <button type="button" onClick={() => setEditingIndex(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-end gap-2 border-t border-slate-200 pt-3">
                        <div className="min-w-48 flex-1">
                            <label className="mb-1 block text-xs font-bold text-slate-700">Tambah tanggal manual</label>
                            <input
                                type="date"
                                value={newDateValue}
                                onChange={(event) => setNewDateValue(event.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500"
                            />
                        </div>
                        <button type="button" onClick={handleAddDate} className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50">+ Tambah Tanggal</button>
                    </div>

                    {validationMessage && <p className="text-xs font-semibold text-rose-600">{validationMessage}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50">Batal</button>
                    <button type="submit" className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700">
                        {existingDatesInMonth.length > 0 ? 'Simpan Perubahan Bulan Ini' : 'Buat Jadwal Bulan Ini'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
