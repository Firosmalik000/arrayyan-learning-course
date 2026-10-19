import { useState, useMemo } from 'react';
import { usePage, Head, Link, router, useForm } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import { ActionDropdown, ConfirmModal, StatusBadge } from '@/Components/Admin';
import AttendanceModal from '@/Pages/Admin/Academic/components/AttendanceModal';
import GenerateSessionsModal from '@/Pages/Admin/Academic/components/GenerateSessionsModal';
import GradeModal from '@/Pages/Admin/Academic/components/GradeModal';
import ScheduleModal from '@/Pages/Admin/Academic/components/ScheduleModal';
import TrackingAttendanceTable from '@/Pages/Admin/Academic/components/TrackingAttendanceTable';

const DAYS_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function Schedule() {
    const { props } = usePage();
    const rawSchedules = props.schedules ?? [];
    const classes = props.classes ?? [];
    const days = props.days ?? {
        1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Minggu'
    };
    const selectedStudent = props.selected_student ?? null;
    const accountType = props.account_type ?? 'parent';

    // State for selected class
    const [selectedClassId, setSelectedClassId] = useState(null);
    const selectedClass = useMemo(() => {
        if (!selectedClassId) return null;
        return classes.find((c) => c.id === selectedClassId) ?? null;
    }, [classes, selectedClassId]);

    // Teacher tabs: 'tracking' | 'members' | 'schedules' | 'grades'
    const [teacherTab, setTeacherTab] = useState('tracking');

    // Modals for Teacher
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [deleteScheduleModal, setDeleteScheduleModal] = useState(null);

    const scheduleForm = useForm({
        day_of_week: '',
        start_time: '',
        end_time: '',
    });

    // Month & Year state for Student/Parent Table View
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [filterClassId, setFilterClassId] = useState(null);
    const [filterDay, setFilterDay] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleCopy = (text) => {
        navigator.clipboard?.writeText(text);
        showToast('Info jadwal disalin ke clipboard');
    };

    // Month navigation
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const handleResetMonth = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    // TEACHER ACTIONS
    const handleOpenAttendanceModal = (dateStr = '') => {
        setAttendanceDate(dateStr);
        setShowAttendanceModal(true);
    };

    const handleSubmitAttendance = (date, subject, material, rows, callbacks = {}) => {
        if (!selectedClass) return;
        router.post(`/portal/kelas/${selectedClass.id}/absensi`, {
            date,
            subject,
            material,
            rows,
        }, {
            preserveScroll: true,
            ...callbacks,
            onSuccess: (...args) => {
                showToast('Absensi dan evaluasi berhasil disimpan.');
                callbacks.onSuccess?.(...args);
            },
        });
    };

    const handleGenerateSessions = (startDate, count, dates) => {
        if (!selectedClass) return;
        router.post(`/portal/kelas/${selectedClass.id}/generate-pertemuan`, {
            start_date: startDate,
            count: count,
            dates: dates,
        }, {
            preserveScroll: true,
            onSuccess: () => showToast('Jadwal pertemuan berhasil di-generate.'),
        });
    };

    const handleSubmitGrades = (subject, term, rows) => {
        if (!selectedClass) return;
        router.post(`/portal/kelas/${selectedClass.id}/nilai`, {
            subject,
            term,
            rows,
        }, {
            preserveScroll: true,
            onSuccess: () => showToast('Nilai berhasil disimpan.'),
        });
    };

    const handleOpenScheduleModal = (sch = null) => {
        setEditingSchedule(sch);
        scheduleForm.setData({
            day_of_week: sch ? String(sch.day_of_week) : '',
            start_time: sch ? sch.start_time : '',
            end_time: sch ? sch.end_time : '',
        });
        scheduleForm.clearErrors();
        setShowScheduleModal(true);
    };

    const handleSaveSchedule = (e) => {
        e.preventDefault();
        if (!selectedClass) return;

        scheduleForm.transform((data) => ({
            ...data,
            day_of_week: Number(data.day_of_week),
            ...(editingSchedule ? { _method: 'put' } : {}),
        }));

        const url = editingSchedule
            ? `/portal/jadwal/${editingSchedule.id}`
            : `/portal/kelas/${selectedClass.id}/jadwal`;

        scheduleForm.post(url, {
            preserveScroll: true,
            onSuccess: () => {
                setShowScheduleModal(false);
                showToast('Jadwal mingguan berhasil disimpan.');
            },
            onFinish: () => scheduleForm.transform((data) => data),
        });
    };

    const handleConfirmDeleteSchedule = () => {
        if (!deleteScheduleModal) return;
        router.delete(`/portal/jadwal/${deleteScheduleModal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteScheduleModal(null);
                showToast('Jadwal dihapus.');
            },
        });
    };

    // STUDENT / PARENT: Calculate monthly sessions for table
    const relevantClassesForStudent = useMemo(() => {
        if (!filterClassId || filterClassId === 'all') return classes;
        return classes.filter((c) => String(c.id) === String(filterClassId));
    }, [classes, filterClassId]);

    const studentMonthlySessions = useMemo(() => {
        if (relevantClassesForStudent.length === 0) return [];

        const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const sessions = [];

        relevantClassesForStudent.forEach((cls) => {
            const classSchedules = cls.schedules || [];
            const scheduledDays = new Map();
            classSchedules.forEach((s) => {
                scheduledDays.set(Number(s.day_of_week), s);
            });

            // Map attendances for this student & class
            const attendanceMap = new Map();
            const recordedDatesSet = new Set();
            (cls.attendances || []).forEach((att) => {
                const d = att.date ? att.date.slice(0, 10) : '';
                if (d) {
                    attendanceMap.set(d, att);
                    if (d.startsWith(monthPrefix)) {
                        recordedDatesSet.add(d);
                    }
                }
            });

            // If this class has recorded / generated sessions in this month, use only those dates
            if (recordedDatesSet.size > 0) {
                Array.from(recordedDatesSet).sort().forEach((dateStr) => {
                    const parts = dateStr.split('-');
                    const day = parseInt(parts[2], 10);
                    const dateObj = new Date(currentYear, currentMonth, day);
                    const jsDay = dateObj.getDay();
                    const isoDay = jsDay === 0 ? 7 : jsDay;
                    const sch = scheduledDays.get(isoDay) || classSchedules[0] || {
                        start_time: '08:00',
                        end_time: '09:30',
                        room: '-',
                    };
                    const dayName = DAYS_NAMES[isoDay] || sch.day || '';

                    if (filterDay && dayName !== filterDay) return;

                    const isPast = dateStr < todayStr;
                    const isTodayDate = dateStr === todayStr;
                    const attendance = attendanceMap.get(dateStr);

                    sessions.push({
                        dateStr,
                        dayNumber: day,
                        dayName,
                        formattedDate: `${dayName}, ${day} ${MONTH_NAMES[currentMonth]} ${currentYear}`,
                        startTime: sch.start_time,
                        endTime: sch.end_time,
                        room: sch.room,
                        classId: cls.id,
                        className: cls.name,
                        programName: cls.program_name,
                        level: cls.level,
                        teacherName: cls.teacher_name,
                        isToday: isTodayDate,
                        isPast,
                        attendance: attendance || null,
                    });
                });
            } else if (classSchedules.length > 0) {
                // If no sessions generated yet for this month, only project upcoming dates from today onwards
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    if (dateStr < todayStr) continue; // NEVER create phantom past sessions

                    const dateObj = new Date(currentYear, currentMonth, day);
                    const jsDay = dateObj.getDay();
                    const isoDay = jsDay === 0 ? 7 : jsDay;

                    if (scheduledDays.has(isoDay)) {
                        const sch = scheduledDays.get(isoDay);
                        const dayName = DAYS_NAMES[isoDay] || sch.day;

                        if (filterDay && dayName !== filterDay) continue;

                        sessions.push({
                            dateStr,
                            dayNumber: day,
                            dayName,
                            formattedDate: `${dayName}, ${day} ${MONTH_NAMES[currentMonth]} ${currentYear}`,
                            startTime: sch.start_time,
                            endTime: sch.end_time,
                            room: sch.room,
                            classId: cls.id,
                            className: cls.name,
                            programName: cls.program_name,
                            level: cls.level,
                            teacherName: cls.teacher_name,
                            isToday: dateStr === todayStr,
                            isPast: false,
                            attendance: null,
                        });
                    }
                }
            }
        });

        // Sort by date then start_time
        return sessions.sort((a, b) => a.dateStr.localeCompare(b.dateStr) || a.startTime.localeCompare(b.startTime));
    }, [relevantClassesForStudent, currentYear, currentMonth, filterDay]);

    // Student Calendar Grid
    const studentCalendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const grid = [];
        for (let i = 0; i < startOffset; i++) {
            grid.push({ day: null });
        }

        const mapByDay = {};
        studentMonthlySessions.forEach((s) => {
            if (!mapByDay[s.dayNumber]) mapByDay[s.dayNumber] = [];
            mapByDay[s.dayNumber].push(s);
        });

        for (let day = 1; day <= daysInMonth; day++) {
            grid.push({
                day,
                sessions: mapByDay[day] || [],
            });
        }

        return grid;
    }, [currentYear, currentMonth, studentMonthlySessions]);

    const activeStudentClass = useMemo(() => {
        if (!filterClassId || filterClassId === 'all') return null;
        return classes.find((c) => String(c.id) === String(filterClassId)) || null;
    }, [classes, filterClassId]);

    const todaySessionsCount = useMemo(() => {
        return studentMonthlySessions.filter((s) => s.isToday).length;
    }, [studentMonthlySessions]);

    const completedSessionsCount = useMemo(() => {
        return studentMonthlySessions.filter((s) => s.attendance?.status && s.attendance.status !== 'belum_absen').length;
    }, [studentMonthlySessions]);

    const upcomingSessionsCount = useMemo(() => {
        return studentMonthlySessions.filter((s) => !s.isPast && (!s.attendance || s.attendance.status === 'belum_absen')).length;
    }, [studentMonthlySessions]);

    return (
        <PortalLayout>
            <Head title="Jadwal Belajar" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {toastMessage}
                </div>
            )}

            {/* ========================================================================= */}
            {/* 1. PORTAL GURU (Teacher View - Mirip Admin Akademik tanpa edit/hapus kelas) */}
            {/* ========================================================================= */}
            {accountType === 'teacher' && (
                <div className="space-y-6">
                    {!selectedClass ? (
                        /* List of classes taught by teacher */
                        <div className="space-y-6">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                                        Akademik & Jadwal Pengajar
                                    </h1>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-700">
                                    <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                                    {classes.length} Kelas Diajar
                                </div>
                            </div>

                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Total Kelas
                                    </span>
                                    <span className="mt-0.5 text-xl font-extrabold text-slate-900">
                                        {classes.length}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600">
                                        Total Siswa Terdaftar
                                    </span>
                                    <span className="mt-0.5 text-xl font-extrabold text-violet-700">
                                        {classes.reduce((sum, c) => sum + (c.members_count || 0), 0)}
                                    </span>
                                </div>
                                <div className="col-span-2 sm:col-span-1 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                        Pertemuan Tercatat
                                    </span>
                                    <span className="mt-0.5 text-xl font-extrabold text-emerald-700">
                                        {classes.reduce((sum, c) => sum + (c.attendances?.length || 0), 0)} Sesi
                                    </span>
                                </div>
                            </div>

                            {/* Datatable & Mobile Cards List of Classes */}
                            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                                {/* Mobile Class Cards (< md) */}
                                <div className="block md:hidden divide-y divide-slate-100">
                                    {classes.map((cls, idx) => (
                                        <div key={cls.id} className="p-3 space-y-2 hover:bg-slate-50/50 transition">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-bold text-violet-700 mb-1">
                                                        {cls.program_name}
                                                    </span>
                                                    <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">
                                                        {cls.name}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {cls.level ? `Jenjang ${cls.level}` : ''} {cls.total_sessions ? `• ${cls.total_sessions} Pertemuan` : ''}
                                                    </p>
                                                </div>
                                                <StatusBadge tone="emerald">Aktif</StatusBadge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                {cls.schedules?.length > 0 ? (
                                                    cls.schedules.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700"
                                                        >
                                                            {s.day} {s.start_time}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">Belum ada jadwal</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                                                <span className="font-semibold text-slate-600 text-[11px]">
                                                    {cls.members_count} {cls.quota != null ? `/ ${cls.quota}` : ''} Siswa
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedClassId(cls.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-violet-700 transition active:scale-95"
                                                >
                                                    <span>Kelola Kelas</span>
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {classes.length === 0 && (
                                        <div className="p-6 text-center text-xs text-slate-400">
                                            Belum ada kelas yang Anda ampu saat ini.
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Datatable (>= md) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                <th className="w-10 px-3 py-2.5 text-center font-bold">No</th>
                                                <th className="w-20 px-2.5 py-2.5 text-center font-bold">Aksi</th>
                                                <th className="px-3.5 py-2.5 font-bold">Nama Kelas</th>
                                                <th className="px-3.5 py-2.5 font-bold">Program</th>
                                                <th className="px-3.5 py-2.5 font-bold">Jadwal Mingguan</th>
                                                <th className="px-3.5 py-2.5 font-bold text-center">Peserta / Kuota</th>
                                                <th className="px-3.5 py-2.5 font-bold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {classes.map((cls, idx) => {
                                                return (
                                                    <tr
                                                        key={cls.id}
                                                        onClick={() => setSelectedClassId(cls.id)}
                                                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                                                    >
                                                        <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                                            {idx + 1}
                                                        </td>
                                                        <td
                                                            className="w-24 px-3 py-3.5 text-center"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedClassId(cls.id)}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-violet-700 transition"
                                                            >
                                                                <span>Kelola</span>
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="font-bold text-slate-900 group-hover:text-violet-700 transition">
                                                                {cls.name}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                                                {cls.level && (
                                                                    <span className="font-semibold text-slate-600">
                                                                        Jenjang {cls.level}
                                                                    </span>
                                                                )}
                                                                {cls.total_sessions && (
                                                                    <span>• {cls.total_sessions} Pertemuan</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                                                                {cls.program_name}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            {cls.schedules?.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                    {cls.schedules.map((s) => (
                                                                        <span
                                                                            key={s.id}
                                                                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                                                                        >
                                                                            {s.day} {s.start_time}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">
                                                                    Belum ditentukan
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                                                            {cls.members_count} {cls.quota != null ? `/ ${cls.quota}` : 'murid'}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <StatusBadge tone="emerald">Aktif</StatusBadge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {classes.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400">
                                                        Belum ada kelas yang Anda ampu saat ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Detailed Class View for Teacher */
                        <div className="space-y-6 animate-in fade-in duration-150">
                            {/* Back button */}
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setSelectedClassId(null)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    <span>Kembali ke Daftar Kelas</span>
                                </button>
                            </div>

                            {/* Header Card (NO edit / delete buttons for teacher) */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-800">
                                                {selectedClass.program_name}
                                            </span>
                                            {selectedClass.level && (
                                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                                                    Jenjang {selectedClass.level}
                                                </span>
                                            )}
                                            <StatusBadge tone="emerald">Aktif</StatusBadge>
                                        </div>
                                        <h2 className="font-display text-2xl font-extrabold text-slate-900">
                                            {selectedClass.name}
                                        </h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-center">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Peserta Kelas
                                            </span>
                                            <span className="text-xs font-extrabold text-slate-800">
                                                {selectedClass.members_count} Siswa
                                            </span>
                                        </div>
                                        {selectedClass.total_sessions && (
                                            <div className="rounded-2xl bg-violet-50 border border-violet-100 px-3.5 py-2 text-center">
                                                <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600">
                                                    Target Sesi
                                                </span>
                                                <span className="text-xs font-extrabold text-violet-800">
                                                    {selectedClass.total_sessions} Pertemuan
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setTeacherTab('tracking')}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                                            teacherTab === 'tracking'
                                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Tracking Absensi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTeacherTab('members')}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                                            teacherTab === 'members'
                                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Anggota Murid ({selectedClass.members?.length || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTeacherTab('schedules')}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                                            teacherTab === 'schedules'
                                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Jadwal Mingguan ({selectedClass.schedules?.length || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTeacherTab('grades')}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                                            teacherTab === 'grades'
                                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Nilai & Perkembangan
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
                                {/* Tab: Tracking Absensi */}
                                {teacherTab === 'tracking' && (
                                    <TrackingAttendanceTable
                                        selectedClass={selectedClass}
                                        members={(selectedClass.members || []).filter((m) => m.status === 'active')}
                                        attendances={selectedClass.attendances ?? []}
                                        canEdit={true}
                                        onOpenAttendanceModal={handleOpenAttendanceModal}
                                        onOpenGenerateModal={() => setShowGenerateModal(true)}
                                    />
                                )}

                                {/* Tab: Anggota Murid */}
                                {teacherTab === 'members' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Daftar Murid di Kelas Ini
                                        </h3>
                                        {/* Mobile Card View (< md) */}
                                        <div className="block md:hidden space-y-2.5">
                                            {(selectedClass.members || []).map((m, idx) => {
                                                const contact = m.student?.parent_contact || '';
                                                const clean = contact.replace(/\D/g, '');
                                                const wa = clean.startsWith('0') ? '62' + clean.slice(1) : clean.startsWith('62') ? clean : clean ? '62' + clean : '';

                                                return (
                                                    <div
                                                        key={m.student_id}
                                                        className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs space-y-2.5"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-mono font-bold text-slate-500">
                                                                    #{idx + 1}
                                                                </span>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 text-sm">
                                                                        {m.student_name}
                                                                    </h4>
                                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                                        {m.student?.school_name || '-'} {m.student?.level ? `(${m.student.level})` : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <StatusBadge tone="emerald">Aktif</StatusBadge>
                                                        </div>

                                                        {contact && (
                                                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                                                                <span className="text-slate-500 font-medium">{contact}</span>
                                                                {wa && (
                                                                    <a
                                                                        href={`https://wa.me/${wa}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                                                    >
                                                                        <span>Hubungi WA</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {(selectedClass.members || []).length === 0 && (
                                                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                                                    Belum ada murid di kelas ini.
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Table View (>= md) */}
                                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
                                            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                        <th className="w-12 px-4 py-3 text-center">No</th>
                                                        <th className="px-5 py-3">Nama Murid</th>
                                                        <th className="px-5 py-3">Sekolah & Jenjang</th>
                                                        <th className="px-5 py-3">Kontak Wali Murid</th>
                                                        <th className="px-5 py-3 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {(selectedClass.members || []).map((m, idx) => {
                                                        const contact = m.student?.parent_contact || '';
                                                        const clean = contact.replace(/\D/g, '');
                                                        const wa = clean.startsWith('0') ? '62' + clean.slice(1) : clean.startsWith('62') ? clean : clean ? '62' + clean : '';

                                                        return (
                                                            <tr key={m.student_id} className="hover:bg-slate-50/70 transition">
                                                                <td className="w-12 px-4 py-3 text-center font-mono font-bold text-slate-400">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="px-5 py-3 font-bold text-slate-900">
                                                                    {m.student_name}
                                                                </td>
                                                                <td className="px-5 py-3 text-xs text-slate-500">
                                                                    {m.student?.school_name || '-'} {m.student?.level ? `(${m.student.level})` : ''}
                                                                </td>
                                                                <td className="px-5 py-3 text-xs text-slate-600">
                                                                    {contact ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{contact}</span>
                                                                            {wa && (
                                                                                <a
                                                                                    href={`https://wa.me/${wa}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                                                                >
                                                                                    WA
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    ) : '-'}
                                                                </td>
                                                                <td className="px-5 py-3 text-center">
                                                                    <StatusBadge tone="emerald">Aktif</StatusBadge>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Jadwal Mingguan (Guru BISA menentukan jadwal) */}
                                {teacherTab === 'schedules' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">
                                                    Jadwal Mingguan Kelas
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Tentukan hari dan jam bimbingan rutin kelas ini.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenScheduleModal(null)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                                            >
                                                + Tambah Jadwal
                                            </button>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {(selectedClass.schedules ?? []).map((sch) => (
                                                <div
                                                    key={sch.id}
                                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4"
                                                >
                                                    <div>
                                                        <h4 className="font-extrabold text-sm text-slate-900">
                                                            {sch.day}
                                                        </h4>
                                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                            {sch.start_time} - {sch.end_time} WIB
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenScheduleModal(sch)}
                                                            className="rounded-lg p-1.5 text-slate-500 hover:bg-violet-100 hover:text-violet-700 transition"
                                                            title="Edit Jadwal"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteScheduleModal(sch)}
                                                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-700 transition"
                                                            title="Hapus Jadwal"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {(selectedClass.schedules ?? []).length === 0 && (
                                                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                                                    Belum ada jadwal mingguan. Klik "+ Tambah Jadwal" untuk menentukan hari bimbingan.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Nilai & Perkembangan */}
                                {teacherTab === 'grades' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">
                                                    Nilai Murid
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Input nilai tugas, ujian, atau perkembangan murid.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowGradeModal(true)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                                            >
                                                + Input Nilai
                                            </button>
                                        </div>

                                        {/* Mobile Card View (< md) */}
                                        <div className="block md:hidden space-y-2.5">
                                            {(selectedClass.members || []).map((m, idx) => (
                                                <div
                                                    key={m.student_id}
                                                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-mono font-bold text-slate-500 shrink-0">
                                                            #{idx + 1}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-slate-900 text-sm truncate">
                                                                {m.student_name}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                                {m.student?.school_name || 'Murid'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge tone="emerald">Aktif</StatusBadge>
                                                </div>
                                            ))}

                                            {(selectedClass.members || []).length === 0 && (
                                                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                                                    Belum ada murid di kelas ini.
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Table View (>= md) */}
                                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
                                            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                        <th className="w-12 px-4 py-3 text-center">No</th>
                                                        <th className="px-5 py-3">Nama Murid</th>
                                                        <th className="px-5 py-3">Sekolah</th>
                                                        <th className="px-5 py-3 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {(selectedClass.members || []).map((m, idx) => (
                                                        <tr key={m.student_id} className="hover:bg-slate-50/70 transition">
                                                            <td className="w-12 px-4 py-3 text-center font-mono font-bold text-slate-400">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="px-5 py-3 font-bold text-slate-900">
                                                                {m.student_name}
                                                            </td>
                                                            <td className="px-5 py-3 text-xs text-slate-500">
                                                                {m.student?.school_name || '-'}
                                                            </td>
                                                            <td className="px-5 py-3 text-center">
                                                                <StatusBadge tone="emerald">Aktif</StatusBadge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Teacher Modals */}
                    {selectedClass && (
                        <>
                            <AttendanceModal
                                show={showAttendanceModal}
                                onClose={() => setShowAttendanceModal(false)}
                                selectedClass={selectedClass}
                                members={(selectedClass.members || []).filter((m) => m.status === 'active')}
                                initialDate={attendanceDate}
                                attendances={selectedClass.attendances ?? []}
                                onSubmit={handleSubmitAttendance}
                            />

                            <GenerateSessionsModal
                                show={showGenerateModal}
                                onClose={() => setShowGenerateModal(false)}
                                selectedClass={selectedClass}
                                onSubmit={handleGenerateSessions}
                            />

                            <GradeModal
                                show={showGradeModal}
                                onClose={() => setShowGradeModal(false)}
                                selectedClass={selectedClass}
                                members={(selectedClass.members || []).filter((m) => m.status === 'active')}
                                onSubmit={handleSubmitGrades}
                            />

                            <ScheduleModal
                                show={showScheduleModal}
                                onClose={() => setShowScheduleModal(false)}
                                editing={editingSchedule}
                                form={scheduleForm}
                                days={days}
                                onSubmit={handleSaveSchedule}
                            />

                            <ConfirmModal
                                isOpen={!!deleteScheduleModal}
                                onClose={() => setDeleteScheduleModal(null)}
                                title="Konfirmasi Hapus Jadwal"
                                message={`Hapus jadwal bimbingan ${deleteScheduleModal?.day} (${deleteScheduleModal?.start_time})?`}
                                onConfirm={handleConfirmDeleteSchedule}
                            />
                        </>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* 2. PORTAL PELAJAR / ORANG TUA (Tabel Kalender & Sesi Hari-Hari Terjadwal) */}
            {/* ========================================================================= */}
            {accountType !== 'teacher' && (
                <div className="space-y-6">
                    {/* ========================================================================= */}
                    {/* LEVEL 1: DAFTAR PROGRAM & KELAS BELAJAR (TAMPILAN UTAMA PERTAMA)         */}
                    {/* ========================================================================= */}
                    {filterClassId === null && (
                        <div className="space-y-6">
                            {/* Header Banner */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 mb-2 border border-violet-100">
                                            <span>📅</span>
                                            <span>Jadwal Belajar Siswa</span>
                                        </div>
                                        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                            Jadwal Program & Kelas
                                        </h1>
                                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
                                            {selectedStudent
                                                ? `Daftar kelas yang diikuti oleh ananda ${selectedStudent.name}. Pilih salah satu kelas di bawah untuk melihat jadwal rutin mingguan dan kalender pertemuan bulanan.`
                                                : 'Daftar program bimbingan belajar yang aktif diikuti.'}
                                        </p>
                                    </div>

                                    {/* Tombol Kalender Gabungan */}
                                    <button
                                        type="button"
                                        onClick={() => setFilterClassId('all')}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 active:scale-98 transition self-start sm:self-auto cursor-pointer"
                                    >
                                        <span>📅 Buka Kalender Gabungan Semua Kelas</span>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Ringkasan Statistik Bulanan Siswa */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Total Kelas Diikuti
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-slate-900">
                                            {classes.length}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">Kelas</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Program aktif bimbingan
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                        Total Sesi Bulan Ini
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-violet-700">
                                            {studentMonthlySessions.length}
                                        </span>
                                        <span className="text-xs text-violet-600 font-bold">Sesi</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-violet-600 font-medium">
                                        {MONTH_NAMES[currentMonth]} {currentYear}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                        Jadwal Hari Ini
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-emerald-700">
                                            {todaySessionsCount}
                                        </span>
                                        <span className="text-xs text-emerald-600 font-bold">Sesi</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                                        {todaySessionsCount > 0 ? 'Ada bimbingan hari ini' : 'Tidak ada jadwal hari ini'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 shadow-2xs">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-700">
                                        Sesi Mendatang
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-sky-700">
                                            {upcomingSessionsCount}
                                        </span>
                                        <span className="text-xs text-sky-600 font-medium">Agenda</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-sky-600 font-medium">
                                        Siap diikuti ananda
                                    </p>
                                </div>
                            </div>

                            {/* Section Header */}
                            <div className="pt-2">
                                <h2 className="font-display font-extrabold text-slate-900 text-lg">
                                    Pilih Kelas untuk Melihat Kalender & Sesi
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Setiap kelas memiliki jadwal hari dan jam sesi tersendiri.
                                </p>
                            </div>

                            {/* Cards Grid: Program & Kelas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {classes.map((cls) => {
                                    const classSessionsCount = studentMonthlySessions.filter((s) => String(s.classId) === String(cls.id)).length;
                                    return (
                                        <div
                                            key={`sch-cls-${cls.id}`}
                                            className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-violet-400 hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="inline-flex items-center rounded-xl bg-violet-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
                                                        {cls.program_name}
                                                    </span>
                                                    {cls.level && (
                                                        <span className="text-xs font-bold text-slate-400">
                                                            Jenjang {cls.level}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-violet-700 transition">
                                                        {cls.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                                                        <span>👨‍🏫</span>
                                                        <span>{cls.teacher_name ? `Kak ${cls.teacher_name}` : 'Pengajar belum ditentukan'}</span>
                                                    </p>
                                                </div>

                                                {/* Jadwal Rutin Mingguan */}
                                                <div className="space-y-2 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 text-xs">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Jadwal Rutin Mingguan
                                                    </span>
                                                    {cls.schedules?.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {cls.schedules.map((sch) => (
                                                                <div
                                                                    key={sch.id}
                                                                    className="flex items-center justify-between rounded-xl bg-white px-3 py-1.5 border border-slate-200/60 shadow-2xs font-semibold text-slate-700"
                                                                >
                                                                    <span>{sch.day}</span>
                                                                    <span className="font-bold text-violet-700">
                                                                        {sch.start_time} - {sch.end_time} WIB
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 italic text-xs">Jadwal mingguan belum diatur.</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                                                    <span>Sesi Bulan Ini:</span>
                                                    <strong className="text-slate-900 font-extrabold">{classSessionsCount} Sesi Terjadwal</strong>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setFilterClassId(String(cls.id))}
                                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 active:scale-98 transition cursor-pointer"
                                            >
                                                <span>Buka Kalender & Jadwal Sesi</span>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* LEVEL 2: DETAIL JADWAL & KALENDER SESI (KETIKA KELAS DIPILIH / GABUNGAN)   */}
                    {/* ========================================================================= */}
                    {filterClassId !== null && (
                        <div className="space-y-6">
                            {/* Navigation Bar: Back & Fast Switcher */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFilterClassId(null)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition self-start cursor-pointer group"
                                >
                                    <svg className="h-4 w-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    <span>← Kembali ke Daftar Program / Kelas</span>
                                </button>

                                {/* Fast Switcher */}
                                {classes.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                                            Ganti Kelas:
                                        </span>
                                        <select
                                            value={filterClassId}
                                            onChange={(e) => setFilterClassId(e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-violet-500 cursor-pointer"
                                        >
                                            <option value="all">Semua Program & Kelas (Gabungan)</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={String(c.id)}>
                                                    [{c.program_name}] {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Header Banner with Month Navigator */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="rounded-xl bg-violet-600 px-3 py-1 text-xs font-black uppercase text-white shadow-xs">
                                                {activeStudentClass ? activeStudentClass.program_name : 'Semua Program Belajar'}
                                            </span>
                                            {activeStudentClass?.level && (
                                                <span className="text-xs font-bold text-slate-400">
                                                    Jenjang {activeStudentClass.level}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                            {activeStudentClass ? activeStudentClass.name : 'Jadwal Seluruh Sesi Belajar'}
                                        </h1>
                                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                                            {activeStudentClass
                                                ? `Pengajar: Kak ${activeStudentClass.teacher_name || '-'} • Kalender dan jadwal bimbingan belajar bulanan.`
                                                : 'Kalender gabungan seluruh jadwal belajar ananda di Ar Rayyan Learning Course.'}
                                        </p>
                                    </div>

                                    {/* Month Navigator */}
                                    <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs self-start sm:self-auto shrink-0">
                                        <button
                                            type="button"
                                            onClick={handlePrevMonth}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                            title="Bulan Sebelumnya"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>

                                        <div className="px-3 text-center">
                                            <span className="block text-xs font-extrabold text-slate-900">
                                                {MONTH_NAMES[currentMonth]} {currentYear}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleNextMonth}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                            title="Bulan Berikutnya"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleResetMonth}
                                            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                        >
                                            Bulan Ini
                                        </button>
                                    </div>
                                </div>
                            </div>

                    {/* Monthly Summary Stat Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Total Sesi Bulan Ini
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-slate-900">
                                    {studentMonthlySessions.length}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">Sesi</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 truncate">
                                {MONTH_NAMES[currentMonth]} {currentYear}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                Jadwal Hari Ini
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-violet-700">
                                    {todaySessionsCount}
                                </span>
                                <span className="text-xs text-violet-600 font-bold">Sesi</span>
                            </div>
                            <p className="mt-1 text-[11px] text-violet-600 font-medium truncate">
                                {todaySessionsCount > 0 ? 'Ada jadwal belajar hari ini!' : 'Tidak ada jadwal hari ini'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Sesi Terlaksana / Hadir
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-emerald-700">
                                    {completedSessionsCount}
                                </span>
                                <span className="text-xs text-emerald-600 font-bold">Selesai</span>
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-600 font-medium truncate">
                                Pertemuan sudah berlangsung
                            </p>
                        </div>

                        <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-700">
                                Sesi Mendatang
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-sky-700">
                                    {upcomingSessionsCount}
                                </span>
                                <span className="text-xs text-sky-600 font-medium">Agenda</span>
                            </div>
                            <p className="mt-1 text-[11px] text-sky-600 font-medium truncate">
                                Siap diikuti ananda
                            </p>
                        </div>
                    </div>

                    {/* Filter bar & View Mode */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            {/* Day filter */}
                            <select
                                value={filterDay}
                                onChange={(e) => setFilterDay(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                            >
                                <option value="">Semua Hari</option>
                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            {filterDay && (
                                <button
                                    type="button"
                                    onClick={() => setFilterDay('')}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                    Reset Hari
                                </button>
                            )}
                        </div>

                        {/* View toggle */}
                        <div className="flex w-full sm:w-auto rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex-1 sm:flex-initial text-center justify-center rounded-lg px-3.5 py-1.5 transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Tabel Jadwal Sesi
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('calendar')}
                                className={`flex-1 sm:flex-initial text-center justify-center rounded-lg px-3.5 py-1.5 transition cursor-pointer ${
                                    viewMode === 'calendar'
                                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Kalender Matriks
                            </button>
                        </div>
                    </div>

                    {/* View 1: TABEL JADWAL SESI */}
                    {viewMode === 'table' && (
                        <div className="space-y-3">
                            {/* Mobile Card List (< md) */}
                            <div className="block md:hidden space-y-3">
                                {studentMonthlySessions.map((session, idx) => {
                                    let statusBadge = null;
                                    if (session.attendance && session.attendance.status && session.attendance.status !== 'belum_absen') {
                                        const st = session.attendance.status;
                                        const tone =
                                            st === 'hadir'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : st === 'izin'
                                                ? 'bg-amber-100 text-amber-800'
                                                : st === 'sakit'
                                                ? 'bg-sky-100 text-sky-800'
                                                : 'bg-rose-100 text-rose-800';
                                        statusBadge = (
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tone}`}>
                                                {st}
                                            </span>
                                        );
                                    } else if (session.isToday) {
                                        statusBadge = (
                                            <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs animate-pulse">
                                                Hari Ini
                                            </span>
                                        );
                                    } else {
                                        statusBadge = (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                                                Terjadwal
                                            </span>
                                        );
                                    }

                                    return (
                                        <div
                                            key={`mob-${session.classId}-${session.dateStr}-${session.startTime}`}
                                            className={`rounded-2xl border p-4 shadow-2xs space-y-3 transition ${
                                                session.isToday
                                                    ? 'border-violet-300 bg-violet-50/40 ring-1 ring-violet-200'
                                                    : 'border-slate-200/80 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase text-violet-700 border border-violet-100">
                                                            {session.programName}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-700">
                                                            {session.className}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-sm">
                                                        {session.formattedDate}
                                                    </h3>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
                                                        Sesi #{idx + 1} • {session.dayName}
                                                    </span>
                                                </div>
                                                {statusBadge}
                                            </div>

                                            <div className="space-y-1.5 border-t border-slate-100 pt-2.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Kelas / Program:</span>
                                                    <span className="font-bold text-slate-800 text-right">
                                                        {session.className} ({session.programName})
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Waktu & Ruang:</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {session.startTime} - {session.endTime} WIB {session.room ? `• Ruang ${session.room}` : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Pengajar:</span>
                                                    <span className="font-semibold text-slate-800">
                                                        {session.teacherName ? `Kak ${session.teacherName}` : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 pt-2.5 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`${session.className} - ${session.formattedDate} (${session.startTime}-${session.endTime} WIB)`)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                                                >
                                                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                                    </svg>
                                                    <span>Salin Info Sesi</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {studentMonthlySessions.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                                        Tidak ada jadwal kelas pada bulan {MONTH_NAMES[currentMonth]} {currentYear}.
                                    </div>
                                )}
                            </div>

                            {/* Desktop Table View (>= md) */}
                            <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <th className="w-12 px-4 py-3.5 text-center font-bold">No</th>
                                                <th className="px-5 py-3.5 font-bold">Hari & Tanggal</th>
                                                <th className="px-5 py-3.5 font-bold">Waktu</th>
                                                <th className="px-5 py-3.5 font-bold">Program & Kelas</th>
                                                <th className="px-5 py-3.5 font-bold">Pengajar</th>
                                                <th className="px-5 py-3.5 font-bold text-center">Status Sesi</th>
                                                <th className="w-20 px-4 py-3.5 text-center font-bold">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {studentMonthlySessions.map((session, idx) => {
                                                let statusBadge = null;
                                                if (session.attendance && session.attendance.status && session.attendance.status !== 'belum_absen') {
                                                    const st = session.attendance.status;
                                                    const tone =
                                                        st === 'hadir'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : st === 'izin'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : st === 'sakit'
                                                            ? 'bg-sky-100 text-sky-800'
                                                            : 'bg-rose-100 text-rose-800';
                                                    statusBadge = (
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tone}`}>
                                                            {st}
                                                        </span>
                                                    );
                                                } else if (session.isToday) {
                                                    statusBadge = (
                                                        <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs animate-pulse">
                                                            Hari Ini
                                                        </span>
                                                    );
                                                } else {
                                                    statusBadge = (
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                                                            Terjadwal
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <tr
                                                        key={`${session.classId}-${session.dateStr}-${session.startTime}`}
                                                        className={`hover:bg-slate-50/80 transition ${session.isToday ? 'bg-violet-50/30' : ''}`}
                                                    >
                                                        <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                                            #{idx + 1}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="font-bold text-slate-900">
                                                                {session.formattedDate}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400">
                                                                {session.dayName}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 font-semibold text-slate-700">
                                                            {session.startTime} - {session.endTime} WIB
                                                            {session.room && (
                                                                <span className="text-[11px] text-slate-400 block font-normal">
                                                                    Ruang {session.room}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="font-bold text-slate-900">
                                                                {session.className}
                                                            </div>
                                                            <div className="text-[11px] text-violet-700 font-semibold">
                                                                {session.programName} {session.level ? `• ${session.level}` : ''}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                            {session.teacherName ? `Kak ${session.teacherName}` : '-'}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            {statusBadge}
                                                        </td>
                                                        <td className="w-20 px-4 py-3.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(`${session.className} - ${session.formattedDate} (${session.startTime}-${session.endTime} WIB)`)}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                                                                title="Salin Jadwal Sesi"
                                                            >
                                                                Salin
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {studentMonthlySessions.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400">
                                                        Tidak ada jadwal kelas pada bulan {MONTH_NAMES[currentMonth]} {currentYear}.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View 2: KALENDER MATRIKS HARI TERJADWAL */}
                    {viewMode === 'calendar' && (
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
                            <div className="block sm:hidden text-center text-[11px] text-slate-400 pb-2">
                                👈 Geser ke samping untuk melihat kalender utuh 👉
                            </div>
                            <div className="overflow-x-auto">
                                <div className="min-w-[620px] sm:min-w-0">
                                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-3 border-b border-slate-100">
                                        <div>Sen</div>
                                        <div>Sel</div>
                                        <div>Rab</div>
                                        <div>Kam</div>
                                        <div>Jum</div>
                                        <div>Sab</div>
                                        <div>Min</div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1.5 pt-3">
                                        {studentCalendarGrid.map((item, idx) => {
                                            if (!item.day) {
                                                return (
                                                    <div
                                                        key={`empty-${idx}`}
                                                        className="min-h-[76px] rounded-2xl bg-slate-50/50 p-1"
                                                    />
                                                );
                                            }

                                            const isToday =
                                                today.getDate() === item.day &&
                                                today.getMonth() === currentMonth &&
                                                today.getFullYear() === currentYear;

                                            const daySessions = item.sessions || [];

                                            return (
                                                <div
                                                    key={`cal-${item.day}`}
                                                    className={`min-h-[76px] rounded-2xl p-1.5 transition flex flex-col justify-between ${
                                                        daySessions.length > 0
                                                            ? isToday
                                                                ? 'border-2 border-violet-500 bg-violet-50/70 shadow-xs'
                                                                : 'border border-violet-200 bg-violet-50/20'
                                                            : isToday
                                                            ? 'border border-slate-400 bg-slate-50'
                                                            : 'border border-slate-100 hover:bg-slate-50/70'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                            isToday
                                                                ? 'bg-violet-600 text-white font-extrabold'
                                                                : 'text-slate-700'
                                                        }`}>
                                                            {item.day}
                                                        </span>

                                                        {daySessions.length > 0 && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                                                        )}
                                                    </div>

                                                    {daySessions.length > 0 && (
                                                        <div className="mt-1 space-y-1">
                                                            {daySessions.map((s, sIdx) => (
                                                                <div
                                                                    key={sIdx}
                                                                    className="rounded-xl bg-white p-1.5 text-[10px] shadow-2xs border border-violet-100 space-y-0.5"
                                                                >
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <span className="font-extrabold text-violet-900 truncate">
                                                                            {s.startTime}
                                                                        </span>
                                                                        {s.programName && (
                                                                            <span className="text-[8px] font-black uppercase text-violet-700 bg-violet-50 px-1 py-0.5 rounded truncate max-w-[70px]">
                                                                                {s.programName}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-slate-700 truncate font-bold text-[10px]">
                                                                        {s.className}
                                                                    </p>
                                                                    {s.attendance && s.attendance.status && s.attendance.status !== 'belum_absen' ? (
                                                                        <span className="inline-block font-extrabold text-emerald-600 capitalize text-[9px]">
                                                                            ● {s.attendance.status}
                                                                        </span>
                                                                    ) : s.isToday ? (
                                                                        <span className="inline-block font-extrabold text-violet-600 text-[9px] animate-pulse">
                                                                            ● Hari Ini
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-block font-medium text-slate-400 text-[9px]">
                                                                            Terjadwal
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )}
</PortalLayout>
);
}
