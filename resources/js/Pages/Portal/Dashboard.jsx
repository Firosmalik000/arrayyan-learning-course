import { Link, usePage, router, Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import PortalLayout from '@/Layouts/PortalLayout';
import AddProgramModal from './components/AddProgramModal';

const formatRupiah = (v) => `Rp ${Number(v ?? 0).toLocaleString('id-ID')}`;

const formatDate = (v) => {
    if (!v) return '-';
    try {
        return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '-';
    }
};

const getIndonesianDate = () => {
    try {
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date());
    } catch {
        return new Date().toLocaleDateString('id-ID');
    }
};

const getStatusBadge = (status, date = null) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    if (date && date.slice(0, 10) > todayIso) {
        return { label: 'Terjadwal', bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
    }
    switch (status) {
        case 'terjadwal':
            return { label: 'Terjadwal', bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
        case 'hadir':
            return { label: 'Hadir', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' };
        case 'izin':
            return { label: 'Izin', bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500' };
        case 'sakit':
            return { label: 'Sakit', bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' };
        case 'alpa':
            return { label: 'Alpa', bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' };
        default:
            return { label: status || 'Belum Absen', bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
    }
};

const formatUnderstanding = (score) => {
    if (score == null) return null;
    const num = Number(score);
    if (num <= 5) {
        if (num >= 4.5) return { rating: `${num}/5`, label: 'Sangat Memahami', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
        if (num >= 3.5) return { rating: `${num}/5`, label: 'Memahami Baik', color: 'text-violet-700 bg-violet-50 border-violet-200' };
        if (num >= 2.5) return { rating: `${num}/5`, label: 'Cukup Memahami', color: 'text-amber-700 bg-amber-50 border-amber-200' };
        return { rating: `${num}/5`, label: 'Perlu Pendampingan', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
    if (num >= 85) return { rating: `${num}/100`, label: 'Sangat Memuaskan', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (num >= 75) return { rating: `${num}/100`, label: 'Memuaskan', color: 'text-violet-700 bg-violet-50 border-violet-200' };
    if (num >= 65) return { rating: `${num}/100`, label: 'Cukup', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { rating: `${num}/100`, label: 'Perlu Latihan', color: 'text-rose-700 bg-rose-50 border-rose-200' };
};

function StatCard({ title, value, subtitle, icon, badge, trend, highlightColor = 'violet', actionLink, actionText }) {
    const colorStyles = {
        violet: {
            bgIcon: 'bg-violet-100 text-violet-700',
            border: 'hover:border-violet-300',
            text: 'text-violet-950',
            glow: 'from-violet-500/10 to-transparent',
        },
        emerald: {
            bgIcon: 'bg-emerald-100 text-emerald-700',
            border: 'hover:border-emerald-300',
            text: 'text-emerald-950',
            glow: 'from-emerald-500/10 to-transparent',
        },
        amber: {
            bgIcon: 'bg-amber-100 text-amber-700',
            border: 'hover:border-amber-300',
            text: 'text-amber-950',
            glow: 'from-amber-500/10 to-transparent',
        },
        indigo: {
            bgIcon: 'bg-indigo-100 text-indigo-700',
            border: 'hover:border-indigo-300',
            text: 'text-indigo-950',
            glow: 'from-indigo-500/10 to-transparent',
        },
    }[highlightColor] || {
        bgIcon: 'bg-slate-100 text-slate-700',
        border: 'hover:border-slate-300',
        text: 'text-slate-900',
        glow: 'from-slate-500/10 to-transparent',
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md ${colorStyles.border} group`}>
            <div className={`absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gradient-to-br ${colorStyles.glow} opacity-60 pointer-events-none`} />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {title}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                        <span className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${colorStyles.text}`}>
                            {value}
                        </span>
                        {badge && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="mt-2.5">
                            {trend}
                        </div>
                    )}
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorStyles.bgIcon} shadow-2xs group-hover:scale-110 transition-transform duration-200`}>
                    {icon}
                </div>
            </div>
            {actionLink && actionText && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <Link
                        href={actionLink}
                        className="text-[11px] font-bold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                        <span>{actionText}</span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}

function ParentDashboard({ summary, selectedStudent, availablePrograms = [] }) {
    const { props } = usePage();
    const portalAuth = props.portalAuth ?? {};
    const students = portalAuth?.students ?? [];
    const [showAddProgramModal, setShowAddProgramModal] = useState(false);
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'grades' | 'classes'

    const stats = summary?.stats ?? {};
    const upcomingSchedules = summary?.upcoming_schedules ?? [];
    const latestEval = summary?.latest_evaluation ?? null;
    const attendanceTrend = summary?.attendance_trend ?? [];
    const detailedClasses = summary?.classes_detailed ?? [];
    const nextClass = upcomingSchedules[0] ?? null;

    const attendanceRate = stats.attendance_rate;
    const displayRate = attendanceRate !== null && attendanceRate !== undefined ? `${attendanceRate}%` : (summary?.classes?.length ? '100%' : '-');

    const handleSwitchChild = (childId) => {
        router.post(`/portal/pilih-anak/${childId}`, {}, { preserveScroll: true });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 p-5 sm:p-7 text-white shadow-md">
                {/* Decorative background glows */}
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-20 h-48 w-48 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-violet-100 backdrop-blur-md border border-white/15 mb-2.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{getIndonesianDate()}</span>
                            <span className="opacity-40">•</span>
                            <span>Portal Pemantauan Belajar</span>
                        </div>
                        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                            Memantau Prestasi Ananda,{' '}
                            <span className="text-amber-300">
                                {selectedStudent?.name || 'Siswa ALC'}
                            </span>
                        </h1>
                    </div>

                    {/* Right side: Student Switcher & Add Program Action */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                        {students.length > 1 && (
                            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex items-center gap-2">
                                <span className="text-xs px-2 text-violet-200 font-semibold hidden sm:inline">Pilih Anak:</span>
                                <div className="flex flex-wrap gap-1">
                                    {students.map((child) => {
                                        const isSelected = child.id === selectedStudent?.id;
                                        return (
                                            <button
                                                key={child.id}
                                                type="button"
                                                onClick={() => handleSwitchChild(child.id)}
                                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white text-violet-900 shadow-sm'
                                                        : 'text-violet-100 hover:bg-white/15'
                                                }`}
                                            >
                                                {child.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowAddProgramModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-amber-950 shadow-sm hover:bg-amber-300 transition active:scale-95 cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Daftar Program Baru</span>
                        </button>
                    </div>
                </div>

                {/* Selected Student Meta Bar */}
                {selectedStudent && (
                    <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-violet-100">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                                <span className="text-sm">🎓</span>
                                <span>Jenjang: <strong className="text-white">{selectedStudent.level || 'Reguler'}</strong></span>
                            </span>
                            {selectedStudent.program && (
                                <span className="inline-flex items-center gap-1.5 font-semibold">
                                    <span className="text-sm">📚</span>
                                    <span>Program: <strong className="text-white">{selectedStudent.program}</strong></span>
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                                <span className="text-sm">🏫</span>
                                <span>Total Kelas Aktif: <strong className="text-white">{summary?.classes?.length || 0}</strong></span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pending Registration Alert */}
            {summary.pending_registrations && summary.pending_registrations.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-200/70 pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-200 text-amber-900 text-sm font-bold shadow-2xs">
                                ⏳
                            </span>
                            <div>
                                <h4 className="font-display text-xs sm:text-sm font-bold text-amber-900">
                                    Pendaftaran Program Sedang Diverifikasi Admin
                                </h4>
                            </div>
                        </div>
                        <span className="rounded-full bg-amber-200 px-3 py-1 text-[11px] font-bold text-amber-900 shrink-0">
                            {summary.pending_registrations.length} Pengajuan
                        </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {summary.pending_registrations.map((p) => (
                            <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-white border border-amber-200/80 p-3 text-xs shadow-2xs">
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{p.program}</p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        Mapel: <strong className="text-violet-700">{p.subjects || '-'}</strong> • {p.preferred_mode || 'Offline'}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="font-mono text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100 block">
                                        {p.ticket}
                                    </span>
                                    <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">Menunggu Admin</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4 Stat Metric Cards (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* 1. Kehadiran Card */}
                <StatCard
                    title="Tingkat Kehadiran"
                    value={displayRate}
                    subtitle={`${stats.hadir_count || 0} hadir dari ${stats.total_recorded_meetings || 0} pertemuan`}
                    highlightColor="emerald"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    badge={stats.attendance_rate >= 80 ? 'Sangat Rajin' : 'Perlu Ditingkatkan'}
                    trend={
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {stats.hadir_count || 0} H
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                                {stats.izin_count || 0} I
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                {stats.sakit_count || 0} S
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                {stats.alpa_count || 0} A
                            </span>
                        </div>
                    }
                    actionLink="/portal/absensi"
                    actionText="Rekap Absensi Detail"
                />

                {/* 2. Pemahaman & Nilai Card */}
                <StatCard
                    title="Pemahaman & Nilai"
                    value={
                        stats.average_understanding
                            ? `${stats.average_understanding} / 5`
                            : stats.average_score
                            ? `${stats.average_score}`
                            : 'Bagus'
                    }
                    subtitle={
                        stats.highest_score
                            ? `Nilai Tertinggi: ${stats.highest_score}`
                            : 'Berdasarkan evaluasi tutor'
                    }
                    highlightColor="violet"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    }
                    badge={
                        stats.average_understanding >= 4.5
                            ? 'Sangat Baik'
                            : stats.average_score >= 85
                            ? 'Predikat A'
                            : 'Aktif Belajar'
                    }
                    actionLink="/portal/nilai"
                    actionText="Lihat Buku Nilai"
                />

                {/* 3. Progres Sesi Pertemuan Card */}
                <StatCard
                    title="Progres Pertemuan"
                    value={`${stats.completed_sessions || 0} Sesi`}
                    subtitle={`Target paket: ${stats.total_sessions_target || 8} pertemuan`}
                    highlightColor="indigo"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    badge={`${stats.progress_percent || 0}% Selesai`}
                    trend={
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                            <div
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, stats.progress_percent || 0)}%` }}
                            />
                        </div>
                    }
                    actionLink="/portal/jadwal"
                    actionText="Jadwal & Agenda"
                />

                {/* 4. Tagihan & Administrasi Card */}
                <StatCard
                    title="Tagihan Belajar"
                    value={summary.unpaid_count > 0 ? formatRupiah(summary.unpaid_total) : 'Lunas'}
                    subtitle={
                        summary.unpaid_count > 0
                            ? `${summary.unpaid_count} tagihan menunggu pembayaran`
                            : 'Semua tagihan telah lunas'
                    }
                    highlightColor={summary.unpaid_count > 0 ? 'amber' : 'emerald'}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    }
                    badge={summary.unpaid_count > 0 ? 'Perlu Dibayar' : '✓ Bebas Tunggakan'}
                    actionLink="/portal/tagihan"
                    actionText={summary.unpaid_count > 0 ? 'Unggah Bukti Bayar' : 'Riwayat Pembayaran'}
                />
            </div>

            {/* Middle Section: Upcoming Schedule Banner + Latest Tutor Evaluation Highlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Upcoming Schedule Card (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-sm">
                                    🗓️
                                </span>
                                <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                    Jadwal Belajar Terdekat
                                </h3>
                            </div>
                            <Link href="/portal/jadwal" className="text-xs font-bold text-violet-700 hover:text-violet-900">
                                Kalender →
                            </Link>
                        </div>

                        {nextClass ? (
                            <div className="mt-3.5">
                                <div className={`rounded-xl p-3.5 border ${nextClass.is_today ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                            nextClass.is_today
                                                ? 'bg-rose-500 text-white animate-pulse'
                                                : nextClass.days_until === 1
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-violet-100 text-violet-800'
                                        }`}>
                                            {nextClass.is_today ? 'Hari Ini!' : nextClass.days_until === 1 ? 'Besok' : `${nextClass.days_until} hari lagi`}
                                        </span>
                                        <span className="font-mono font-bold text-xs text-slate-700">
                                            {nextClass.day}, {nextClass.start_time} - {nextClass.end_time}
                                        </span>
                                    </div>

                                    <h4 className="mt-2.5 font-display text-sm font-extrabold text-slate-900">
                                        {nextClass.class_name}
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Program: <strong className="text-violet-700">{nextClass.program_name}</strong>
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                                        <span>Tutor: <strong>{nextClass.teacher_name}</strong></span>
                                        {nextClass.room && <span>Ruang: <strong>{nextClass.room}</strong></span>}
                                    </div>
                                </div>

                                {upcomingSchedules.length > 1 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Sesi Berikutnya Pekan Ini:
                                        </p>
                                        {upcomingSchedules.slice(1, 3).map((sch, i) => (
                                            <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs border border-slate-100">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 truncate">{sch.class_name}</p>
                                                    <p className="text-[10px] text-slate-500">{sch.day} • {sch.start_time}-{sch.end_time}</p>
                                                </div>
                                                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                    {sch.teacher_name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-slate-400">
                                Belum ada jadwal kelas aktif pekan ini.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                            href="/portal/jadwal"
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 py-2 text-xs font-bold transition"
                        >
                            <span>Buka Jadwal Belajar Lengkap</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Latest Tutor Evaluation / Qualitative Review Card (7 cols) */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                                    📝
                                </span>
                                <div>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Catatan & Evaluasi Perkembangan Terkini
                                    </h3>
                                </div>
                            </div>
                            <Link href="/portal/absensi" className="text-xs font-bold text-violet-700 hover:text-violet-900">
                                Riwayat →
                            </Link>
                        </div>

                        {latestEval ? (
                            <div className="mt-3.5 space-y-3">
                                <div className="rounded-2xl bg-gradient-to-br from-violet-50/60 to-purple-50/40 border border-violet-100 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-white px-2 py-0.5 rounded-md border border-violet-200/80">
                                                {latestEval.class_name}
                                            </span>
                                            <h4 className="mt-1.5 font-display text-sm font-extrabold text-slate-900">
                                                {latestEval.subject}
                                            </h4>
                                            {latestEval.material && (
                                                <p className="text-xs text-slate-600 mt-0.5">
                                                    Materi: <strong className="text-slate-800">{latestEval.material}</strong>
                                                </p>
                                            )}
                                        </div>
                                        {latestEval.understanding_score != null && (
                                            <div className="text-right shrink-0">
                                                {(() => {
                                                    const u = formatUnderstanding(latestEval.understanding_score);
                                                    return (
                                                        <span className={`inline-flex flex-col items-end px-2.5 py-1 rounded-xl border text-xs font-bold ${u?.color || 'bg-white text-slate-800'}`}>
                                                            <span>Skor: {u?.rating}</span>
                                                            <span className="text-[9px] font-semibold opacity-80">{u?.label}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    {latestEval.evaluation ? (
                                        <div className="mt-3 rounded-xl bg-white/80 p-3 border border-violet-100/80 text-xs text-slate-700 leading-relaxed italic relative">
                                            <span className="text-violet-400 font-serif text-lg leading-none select-none">“</span>
                                            <span className="font-medium text-slate-800">{latestEval.evaluation}</span>
                                            <span className="text-violet-400 font-serif text-lg leading-none select-none">”</span>
                                        </div>
                                    ) : null}

                                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-violet-200/50">
                                        <span>Tutor: <strong className="text-slate-800">{latestEval.teacher_name}</strong></span>
                                        <span>Tanggal: {latestEval.formatted_date || formatDate(latestEval.date)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-slate-400">
                                Belum ada catatan evaluasi terbaru dari tutor.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs">
                        <Link
                            href="/portal/kritik-saran"
                            className="font-bold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1"
                        >
                            <span>Kirim Saran / Konsultasi</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Tabs Section: Kemajuan Kelas, Absensi, Nilai */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('classes')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === 'classes'
                                    ? 'bg-white text-violet-800 shadow-xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            📚 Kelas Belajar ({detailedClasses.length || summary?.classes?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('attendance')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === 'attendance'
                                    ? 'bg-white text-violet-800 shadow-xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            ✅ Riwayat Absensi Terakhir
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('grades')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                                activeTab === 'grades'
                                    ? 'bg-white text-violet-800 shadow-xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            📊 Laporan Nilai Evaluasi
                        </button>
                    </div>

                    <div className="text-right">
                        {activeTab === 'classes' && (
                            <Link href="/portal/jadwal" className="text-xs font-bold text-violet-700 hover:text-violet-900">
                                Buka Jadwal Lengkap →
                            </Link>
                        )}
                        {activeTab === 'attendance' && (
                            <Link href="/portal/absensi" className="text-xs font-bold text-violet-700 hover:text-violet-900">
                                Rekap Absensi Seluruhnya →
                            </Link>
                        )}
                        {activeTab === 'grades' && (
                            <Link href="/portal/nilai" className="text-xs font-bold text-violet-700 hover:text-violet-900">
                                Buka Semua Kartu Nilai →
                            </Link>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    {/* Tab 1: Detailed Classes */}
                    {activeTab === 'classes' && (
                        <div>
                            {detailedClasses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {detailedClasses.map((c) => (
                                        <div key={c.id} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-violet-300 transition duration-150">
                                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                                                        {c.program_name}
                                                    </span>
                                                    <h4 className="mt-1 font-display text-sm font-bold text-slate-900">
                                                        {c.name}
                                                    </h4>
                                                </div>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                                    c.is_active
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-200 bg-slate-100 text-slate-600'
                                                }`}>
                                                    {c.is_active ? 'Aktif' : 'Selesai / Nonaktif'}
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-2 text-xs">
                                                <div className="flex items-center justify-between text-slate-600">
                                                    <span>Progres Sesi:</span>
                                                    <span className="font-bold text-slate-900">
                                                        {c.attended_sessions} / {c.total_sessions} Sesi
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-brand-primary h-1.5 rounded-full"
                                                        style={{ width: `${c.progress_percent || 0}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-slate-600 pt-1">
                                                    <span>Tutor:</span>
                                                    <span className="font-semibold text-slate-800">{c.teacher_name || '-'}</span>
                                                </div>

                                                {c.schedules && c.schedules.length > 0 && (
                                                    <div className="pt-2 border-t border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Jadwal:</p>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {c.schedules.map((s, idx) => (
                                                                <span key={idx} className="bg-slate-50 border border-slate-200/80 rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                                                    {s.day} {s.start_time}-{s.end_time}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    Belum ada kelas aktif yang terdaftar untuk ananda.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Attendance Feed */}
                    {activeTab === 'attendance' && (
                        <div>
                            {summary.recent_attendance && summary.recent_attendance.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                                <th className="pb-2.5">Tanggal</th>
                                                <th className="pb-2.5">Kelas / Program</th>
                                                <th className="pb-2.5">Mata Pelajaran & Materi</th>
                                                <th className="pb-2.5">Pemahaman</th>
                                                <th className="pb-2.5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {summary.recent_attendance.map((a, i) => {
                                                const badge = getStatusBadge(a.status, a.date);
                                                const u = formatUnderstanding(a.understanding_score);
                                                return (
                                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-3 font-semibold text-slate-700 whitespace-nowrap">
                                                            {formatDate(a.date)}
                                                        </td>
                                                        <td className="py-3 font-bold text-slate-900">
                                                            {a.class}
                                                        </td>
                                                        <td className="py-3 text-slate-600">
                                                            <span className="font-semibold text-slate-800">{a.subject || '-'}</span>
                                                            {a.material && (
                                                                <span className="block text-[11px] text-slate-500 truncate max-w-xs">{a.material}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3">
                                                            {u ? (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${u.color}`}>
                                                                    {u.rating} • {u.label}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                                <span>{badge.label}</span>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="py-8 text-center text-xs text-slate-400">Belum ada data catatan absensi.</p>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Grades Feed */}
                    {activeTab === 'grades' && (
                        <div>
                            {summary.recent_grades && summary.recent_grades.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {summary.recent_grades.map((g, i) => (
                                        <div key={i} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{g.term || 'Evaluasi'}</span>
                                                <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                    {g.subject}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 truncate">{g.class}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-display text-lg font-black text-violet-900 bg-white border border-violet-200 px-3 py-1 rounded-xl shadow-2xs">
                                                    {g.score}
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-700 mt-1">
                                                    {Number(g.score) >= 80 ? 'Kompeten' : 'Perlu Latihan'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-8 text-center text-xs text-slate-400">Belum ada rekaman nilai ujian / evaluasi berkala.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddProgramModal
                isOpen={showAddProgramModal}
                onClose={() => setShowAddProgramModal(false)}
                selectedStudent={selectedStudent}
                availablePrograms={availablePrograms}
            />
        </div>
    );
}

function TeacherDashboard({ summary }) {
    const { props } = usePage();
    const classes = summary?.classes ?? [];
    const stats = summary?.stats ?? {};
    const todayAgenda = summary?.today_agenda ?? [];
    const weeklySchedule = summary?.weekly_schedule ?? [];
    const recentActivities = summary?.recent_activities ?? [];
    const detailedClasses = summary?.classes_detailed ?? [];

    const nowJakartaDay = useMemo(() => {
        const d = new Date().getDay();
        return d === 0 ? 7 : d;
    }, []);

    const [selectedDay, setSelectedDay] = useState(nowJakartaDay);

    const activeDaySchedule = useMemo(() => {
        return weeklySchedule.find((w) => w.day_of_week === selectedDay);
    }, [weeklySchedule, selectedDay]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Teacher Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-7 text-white shadow-md border border-slate-800">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-20 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-violet-200 backdrop-blur-md border border-white/15 mb-2.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{getIndonesianDate()}</span>
                            <span className="opacity-40">•</span>
                            <span>Portal Pengajar Ar Rayyan</span>
                        </div>
                        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                            Selamat Datang,{' '}
                            <span className="text-violet-300">
                                {props.portalAuth?.name || 'Ustadz / Ustadzah'}
                            </span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <Link
                            href="/portal/jadwal"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500 transition active:scale-95"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Jadwal & Presensi</span>
                        </Link>
                        <Link
                            href="/portal/profil"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white px-3.5 py-2 text-xs font-bold transition border border-white/15"
                        >
                            <span>Profil Akun</span>
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                    <div className="flex flex-wrap items-center gap-4">
                        <span>Total Kelas: <strong className="text-white">{stats.total_classes || classes.length}</strong></span>
                        <span>Total Siswa Bimbingan: <strong className="text-white">{stats.total_students || 0} Siswa</strong></span>
                        <span>Sesi Mengajar Hari Ini: <strong className="text-amber-300">{stats.today_sessions_count || todayAgenda.length} Sesi</strong></span>
                    </div>
                </div>
            </div>

            {/* 4 KPI Cards for Teachers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* 1. Sesi Hari Ini */}
                <StatCard
                    title="Jadwal Hari Ini"
                    value={`${stats.today_sessions_count || todayAgenda.length} Sesi`}
                    subtitle={todayAgenda.length > 0 ? 'Siap mengajar hari ini' : 'Tidak ada jadwal hari ini'}
                    highlightColor={todayAgenda.length > 0 ? 'amber' : 'slate'}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    badge={todayAgenda.length > 0 ? 'Agenda Aktif' : 'Istirahat'}
                    actionLink="/portal/jadwal"
                    actionText="Lihat Agenda Hari Ini"
                />

                {/* 2. Total Murid Bimbingan */}
                <StatCard
                    title="Total Murid Aktif"
                    value={`${stats.total_students || 0} Siswa`}
                    subtitle={`Tersebar di ${stats.total_classes || classes.length} kelas bimbingan`}
                    highlightColor="indigo"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    badge="Murid Terdaftar"
                    actionLink="/portal/jadwal"
                    actionText="Daftar Siswa Kelas"
                />

                {/* 3. Tingkat Kehadiran Murid */}
                <StatCard
                    title="Kehadiran Murid"
                    value={stats.overall_attendance_rate != null ? `${stats.overall_attendance_rate}%` : '100%'}
                    subtitle={`${stats.total_sessions_recorded || 0} presensi telah diisi`}
                    highlightColor="emerald"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    badge="Rata-rata Kehadiran"
                    actionLink="/portal/jadwal"
                    actionText="Kelola Presensi"
                />

                {/* 4. Total Sesi Terlaksana / Tertunda */}
                <StatCard
                    title="Kelas Diampu"
                    value={`${stats.total_classes || classes.length} Kelas`}
                    subtitle={
                        stats.total_sessions_pending > 0
                            ? `${stats.total_sessions_pending} sesi terjadwal`
                            : 'Semua kelas terkelola rapi'
                    }
                    highlightColor="violet"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    }
                    badge="Aktif Berjalan"
                    actionLink="/portal/jadwal"
                    actionText="Lihat Semua Kelas"
                />
            </div>

            {/* Today's Teaching Agenda & Weekly Schedule Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Agenda Hari Ini (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700 text-sm">
                                    ⏰
                                </span>
                                <div>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Agenda Mengajar Hari Ini
                                    </h3>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                                {todayAgenda.length} Sesi
                            </span>
                        </div>

                        {todayAgenda.length > 0 ? (
                            <div className="mt-3.5 space-y-2.5">
                                {todayAgenda.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/70 hover:bg-white hover:border-violet-300 transition duration-150 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-xs font-black text-violet-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {item.start_time} - {item.end_time}
                                            </span>
                                            {item.has_attendance_today ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    ✓ Absensi Terisi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                                    ⏳ Belum Absen
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className="font-display text-sm font-extrabold text-slate-900 truncate">
                                                {item.class_name}
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                {item.program_name} {item.level ? `(${item.level})` : ''} • {item.student_count} murid
                                                {item.room ? ` • Ruang ${item.room}` : ''}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                            <Link
                                                href={`/portal/kelas/${item.class_id}`}
                                                className="text-[11px] font-bold text-slate-600 hover:text-slate-900"
                                            >
                                                Detail Kelas
                                            </Link>
                                            <Link
                                                href={`/portal/kelas/${item.class_id}`}
                                                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition ${
                                                    item.has_attendance_today
                                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-2xs'
                                                }`}
                                            >
                                                {item.has_attendance_today ? 'Edit Absensi' : 'Input Absensi Sekarang'}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <span className="text-3xl block mb-2">☕</span>
                                <p className="text-xs font-bold text-slate-700">Tidak ada jadwal kelas untuk hari ini</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                            href="/portal/jadwal"
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 py-2 text-xs font-bold transition"
                        >
                            <span>Buka Manajemen Jadwal & Absensi Lengkap</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Matriks Jadwal Mingguan (7 cols) */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-sm">
                                    📅
                                </span>
                                <div>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Matriks Jadwal Mingguan
                                    </h3>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Senin – Minggu</span>
                        </div>

                        {/* Day selector tabs */}
                        <div className="mt-3.5 grid grid-cols-7 gap-1 sm:gap-1.5">
                            {weeklySchedule.map((w) => {
                                const isSelected = w.day_of_week === selectedDay;
                                const isToday = w.is_today;
                                return (
                                    <button
                                        key={w.day_of_week}
                                        type="button"
                                        onClick={() => setSelectedDay(w.day_of_week)}
                                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition cursor-pointer relative ${
                                            isSelected
                                                ? 'bg-violet-600 text-white font-bold shadow-xs'
                                                : isToday
                                                ? 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold hover:bg-amber-100'
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold uppercase">{w.day.slice(0, 3)}</span>
                                        <span className={`text-[11px] font-black mt-0.5 ${isSelected ? 'text-white' : w.count > 0 ? 'text-violet-700' : 'text-slate-400'}`}>
                                            {w.count}
                                        </span>
                                        {isToday && !isSelected && (
                                            <span className="h-1 w-1 rounded-full bg-amber-500 absolute bottom-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected day classes display */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                                <span>Jadwal Hari {activeDaySchedule?.day || 'Terpilih'}:</span>
                                <span className="text-[11px] text-slate-500">
                                    {activeDaySchedule?.schedules?.length || 0} Kelas Terjadwal
                                </span>
                            </div>

                            {activeDaySchedule && activeDaySchedule.schedules.length > 0 ? (
                                <div className="space-y-2">
                                    {activeDaySchedule.schedules.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/90 border border-slate-200 p-3 text-xs hover:border-violet-300 transition"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{item.class_name}</span>
                                                    <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100">
                                                        {item.program}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {item.student_count} murid{item.room ? ` • Ruang ${item.room}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                    {item.start_time} - {item.end_time}
                                                </span>
                                                <Link
                                                    href={`/portal/kelas/${item.class_id}`}
                                                    className="rounded-lg bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white hover:brightness-110 transition"
                                                >
                                                    Kelola
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                    Tidak ada jadwal mengajar pada hari {activeDaySchedule?.day}.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs">
                        <Link href="/portal/jadwal" className="font-bold text-violet-700 hover:text-violet-900">
                            Atur Jadwal di Sini →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Detailed Class Cards Grid */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                    <div>
                        <h3 className="font-display text-sm font-bold text-slate-900">
                            Daftar Kelas yang Anda Ampu ({classes.length})
                        </h3>
                    </div>
                    <Link href="/portal/jadwal" className="text-xs font-bold text-violet-700 hover:text-violet-900">
                        Buka Manajemen Akademik →
                    </Link>
                </div>

                {detailedClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {detailedClasses.map((c) => (
                            <div key={c.id} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-violet-300 transition duration-150 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                                                {c.program} {c.level ? `• ${c.level}` : ''}
                                            </span>
                                            <h4 className="mt-1 font-display text-sm font-bold text-slate-900">
                                                {c.name}
                                            </h4>
                                        </div>
                                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shrink-0">
                                            {c.filled}{c.quota != null ? `/${c.quota}` : ''} Murid
                                        </span>
                                    </div>

                                    {/* Class metrics */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Pertemuan</span>
                                            <span className="font-bold text-slate-800">
                                                {c.sessions_held || 0} / {c.total_sessions || 8} Selesai
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Kehadiran</span>
                                            <span className="font-bold text-emerald-700">
                                                {c.attendance_rate != null ? `${c.attendance_rate}%` : '100%'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Weekly schedule pills */}
                                    {c.schedules && c.schedules.length > 0 && (
                                        <div className="mt-2.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Jadwal:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {c.schedules.map((s, idx) => (
                                                    <span key={idx} className="bg-slate-50 border border-slate-200/80 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                                                        {s.day} {s.start_time}-{s.end_time}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                                    <Link
                                        href={`/portal/kelas/${c.id}`}
                                        className="flex-1 text-center rounded-lg bg-violet-600 hover:bg-violet-700 text-white py-1.5 text-xs font-bold shadow-2xs transition active:scale-95"
                                    >
                                        Input Absensi
                                    </Link>
                                    <Link
                                        href={`/portal/kelas/${c.id}`}
                                        className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold transition"
                                    >
                                        Beri Nilai
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-xs text-slate-400">
                        Belum ada kelas yang diampu. Hubungi administrator untuk penugasan kelas mengajar.
                    </div>
                )}
            </div>

            {/* Recent Teaching Activity Feed */}
            {recentActivities.length > 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                                📝
                            </span>
                            <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                Aktivitas Pengajaran Terakhir
                            </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">Log Pengajaran</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                    <th className="pb-2">Tanggal</th>
                                    <th className="pb-2">Kelas</th>
                                    <th className="pb-2">Mata Pelajaran & Materi</th>
                                    <th className="pb-2 text-right">Kehadiran Murid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentActivities.map((act, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                                            {act.formatted_date || act.date}
                                        </td>
                                        <td className="py-2.5 font-bold text-slate-900">
                                            {act.class_name}
                                        </td>
                                        <td className="py-2.5 text-slate-600">
                                            <span className="font-semibold text-slate-800">{act.subject}</span>
                                            {act.material && (
                                                <span className="block text-[11px] text-slate-500 truncate max-w-sm">{act.material}</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {act.present_count} / {act.total_count} Murid Hadir
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { props } = usePage();
    const type = props.account_type || 'parent';
    const summary = props.summary || {};
    const selectedStudent = props.selected_student || null;
    const availablePrograms = props.available_programs || [];

    return (
        <PortalLayout>
            <Head title={`Dashboard Portal ${type === 'teacher' ? 'Pengajar' : 'Orang Tua'}`} />
            {type === 'teacher' ? (
                <TeacherDashboard summary={summary} />
            ) : (
                <ParentDashboard
                    summary={summary}
                    selectedStudent={selectedStudent}
                    availablePrograms={availablePrograms}
                />
            )}
        </PortalLayout>
    );
}
