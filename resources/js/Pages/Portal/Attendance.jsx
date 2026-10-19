import { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import PortalPagination from './components/PortalPagination';

const UNDERSTANDING_LABELS = {
    1: 'Sangat Kurang Paham',
    2: 'Kurang Paham',
    3: 'Cukup Paham',
    4: 'Paham dengan Baik',
    5: 'Sangat Baik & Mandiri',
};

const STATUS_CONFIG = {
    hadir: {
        label: 'Hadir',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
    },
    izin: {
        label: 'Izin',
        badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
    },
    sakit: {
        label: 'Sakit',
        badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
        dot: 'bg-sky-500',
    },
    alpa: {
        label: 'Alpa / Tidak Hadir',
        badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500',
    },
};

const formatDate = (value) => {
    if (!value) return '-';
    try {
        const d = new Date(value);
        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return value;
    }
};

const formatShortDate = (value) => {
    if (!value) return '-';
    try {
        const d = new Date(value);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return value;
    }
};

const formatMonth = (value) => {
    if (!value) return 'Semua Periode Bulan';
    try {
        return new Date(`${value}-01T00:00:00`).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return value;
    }
};

function StarRating({ score, size = 'sm' }) {
    if (!score) return <span className="text-xs text-slate-400 italic">Belum dinilai</span>;
    const num = Number(score);
    const starSizeClass = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';

    return (
        <div className="flex items-center gap-1" title={`${num} / 5 (${UNDERSTANDING_LABELS[num] || ''})`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    viewBox="0 0 24 24"
                    fill={star <= num ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`${starSizeClass} ${
                        star <= num ? 'text-amber-400' : 'text-slate-200'
                    }`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                </svg>
            ))}
            <span className="ml-1 text-xs font-bold text-slate-700">
                {num}.0
            </span>
        </div>
    );
}

export default function Attendance() {
    const { props } = usePage();
    const records = props.records ?? [];
    const classes = props.classes ?? [];
    const selectedStudent = props.selected_student ?? null;

    // View State:
    // If null => Show list of programs & classes first!
    // If id or 'all' => Show detailed attendance for that class or all classes
    const [selectedClassId, setSelectedClassId] = useState(null);

    // Filter states within detailed view
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDetailRecord, setActiveDetailRecord] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Active class object if a specific class is selected
    const activeClass = useMemo(() => {
        if (!selectedClassId || selectedClassId === 'all') return null;
        return classes.find((c) => String(c.id) === String(selectedClassId)) ?? null;
    }, [classes, selectedClassId]);

    // Available months from records
    const availableMonths = useMemo(() => {
        const sourceRecords = selectedClassId && selectedClassId !== 'all'
            ? records.filter((r) => String(r.class_group_id) === String(selectedClassId))
            : records;

        return Array.from(
            new Set(sourceRecords.map((r) => r.date?.slice(0, 7)).filter(Boolean))
        )
            .sort()
            .reverse();
    }, [records, selectedClassId]);

    // Filtered records for detail view
    const filteredRecords = useMemo(() => {
        if (selectedClassId === null) return [];

        return records.filter((r) => {
            if (selectedClassId !== 'all' && String(r.class_group_id) !== String(selectedClassId)) {
                return false;
            }
            if (selectedMonth && !r.date?.startsWith(selectedMonth)) {
                return false;
            }
            if (selectedStatus && r.status !== selectedStatus) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchSubject = r.subject?.toLowerCase().includes(q);
                const matchMaterial = r.material?.toLowerCase().includes(q);
                const matchClass = r.class?.toLowerCase().includes(q);
                const matchProgram = r.program_name?.toLowerCase().includes(q);
                const matchTeacher = r.teacher?.toLowerCase().includes(q);
                const matchEval = r.evaluation?.toLowerCase().includes(q);
                if (!matchSubject && !matchMaterial && !matchClass && !matchProgram && !matchTeacher && !matchEval) {
                    return false;
                }
            }
            return true;
        });
    }, [records, selectedClassId, selectedMonth, selectedStatus, searchQuery]);

    // Statistics based on filtered records
    const totalRecords = filteredRecords.length;
    const hadirCount = filteredRecords.filter((r) => r.status === 'hadir').length;
    const izinCount = filteredRecords.filter((r) => r.status === 'izin').length;
    const sakitCount = filteredRecords.filter((r) => r.status === 'sakit').length;
    const alpaCount = filteredRecords.filter((r) => r.status === 'alpa').length;
    const attendanceRate = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : null;

    const scoredRecords = filteredRecords.filter((r) => r.understanding_score);
    const averageScore = scoredRecords.length > 0
        ? (scoredRecords.reduce((sum, r) => sum + Number(r.understanding_score), 0) / scoredRecords.length).toFixed(1)
        : null;

    // Overall summary for Level 1 (Catalog View)
    const overallHadirCount = records.filter((r) => r.status === 'hadir').length;
    const overallRate = records.length > 0 ? Math.round((overallHadirCount / records.length) * 100) : null;
    const overallScored = records.filter((r) => r.understanding_score);
    const overallAvgScore = overallScored.length > 0
        ? (overallScored.reduce((sum, r) => sum + Number(r.understanding_score), 0) / overallScored.length).toFixed(1)
        : null;

    // Paginated records
    const startIndex = (currentPage - 1) * perPage;
    const displayedRecords = filteredRecords.slice(startIndex, startIndex + perPage);

    const handleSelectClass = (classId) => {
        setSelectedClassId(classId);
        setSelectedMonth('');
        setSelectedStatus('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleBackToList = () => {
        setSelectedClassId(null);
        setSelectedMonth('');
        setSelectedStatus('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSelectedMonth('');
        setSelectedStatus('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const hasActiveFilters = Boolean(selectedMonth || selectedStatus || searchQuery);

    return (
        <PortalLayout>
            <Head title="Rekap Absensi & Perkembangan Siswa" />

            {/* ========================================================================= */}
            {/* TAMPILAN 1: DAFTAR PROGRAM & KELAS YANG DIIKUTI (LEVEL 1 / KATALOG KELAS) */}
            {/* ========================================================================= */}
            {selectedClassId === null && (
                <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 mb-2 border border-violet-100">
                                    <span>🎓</span>
                                    <span>Portal Akademik Siswa</span>
                                </div>
                                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                    Program & Kelas Belajar
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
                                    {selectedStudent
                                        ? `Berikut adalah program bimbingan belajar yang sedang diikuti oleh ananda ${selectedStudent.name}. Pilih salah satu kelas di bawah untuk melihat rekap absensi, materi, dan evaluasi pengajar.`
                                        : 'Daftar program bimbingan belajar yang sedang aktif diikuti.'}
                                </p>
                            </div>

                            {selectedStudent && (
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 self-start sm:self-auto shrink-0">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 text-sm font-black text-white shadow-brand">
                                        {selectedStudent.name
                                            .split(' ')
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map((w) => w[0].toUpperCase())
                                            .join('')}
                                    </div>
                                    <div className="min-w-0 leading-tight">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Siswa Aktif
                                        </p>
                                        <p className="truncate text-sm font-extrabold text-slate-900" title={selectedStudent.name}>
                                            {selectedStudent.name}
                                        </p>
                                        <p className="text-[11px] font-semibold text-violet-700">
                                            {selectedStudent.level || 'Jenjang Umum'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ringkasan Keseluruhan Siswa */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Total Program Diikuti
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-slate-900">
                                    {classes.length}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">Program</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Aktif bimbingan di ALC
                            </p>
                        </div>

                        <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                Total Sesi Tercatat
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-violet-700">
                                    {records.length}
                                </span>
                                <span className="text-xs text-violet-600 font-medium">Pertemuan</span>
                            </div>
                            <p className="mt-1 text-[11px] text-violet-600 font-medium">
                                Dari semua program belajar
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Tingkat Kehadiran
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-emerald-700">
                                    {overallRate != null ? `${overallRate}%` : '—'}
                                </span>
                                <span className="text-xs text-emerald-600 font-bold">
                                    ({overallHadirCount}/{records.length})
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                                Keseluruhan kehadiran
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                Rata-Rata Pemahaman
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-amber-700">
                                    {overallAvgScore != null ? overallAvgScore : '—'}
                                </span>
                                <span className="text-xs text-amber-600 font-bold">
                                    / 5.0
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-amber-600 font-medium">
                                {overallAvgScore ? UNDERSTANDING_LABELS[Math.round(Number(overallAvgScore))] : 'Belum dinilai'}
                            </p>
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className="flex items-center justify-between pt-2">
                        <div>
                            <h2 className="font-display font-extrabold text-slate-900 text-lg">
                                Pilih Program atau Kelas Ananda
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Klik salah satu kartu kelas di bawah untuk membuka rekap absensi dan catatan perkembangan guru.
                            </p>
                        </div>

                        {records.length > 0 && (
                            <button
                                type="button"
                                onClick={() => handleSelectClass('all')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-800 transition cursor-pointer"
                            >
                                <span>Lihat Semua Sesi Gabungan</span>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Cards Grid: Daftar Program / Kelas */}
                    {classes.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                                📚
                            </div>
                            <h3 className="font-display text-base font-bold text-slate-900">
                                Belum Ada Kelas Terdaftar
                            </h3>
                            <p className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                                Ananda belum terdaftar di kelas bimbingan aktif manapun. Silakan hubungi admin Ar Rayyan Learning Course untuk konfirmasi pendaftaran.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {classes.map((cls) => {
                                const progressPercent = cls.total_sessions
                                    ? Math.min(100, Math.round(((cls.total_recorded || 0) / cls.total_sessions) * 100))
                                    : null;

                                return (
                                    <div
                                        key={`card-${cls.id}`}
                                        className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-violet-400 hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
                                    >
                                        <div className="space-y-4">
                                            {/* Top badges: Program & Level */}
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="inline-flex items-center rounded-xl bg-violet-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
                                                    {cls.program_name}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Aktif
                                                </span>
                                            </div>

                                            {/* Class Name & Teacher */}
                                            <div>
                                                <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-violet-700 transition">
                                                    {cls.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                                                    <span>👨‍🏫</span>
                                                    <span>{cls.teacher_name ? `Kak ${cls.teacher_name}` : 'Pengajar belum ditentukan'}</span>
                                                    {cls.level && <span className="text-slate-400">• Jenjang {cls.level}</span>}
                                                </p>
                                            </div>

                                            {/* Sesi & Progress Bar */}
                                            <div className="space-y-1.5 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">Progres Bimbingan</span>
                                                    <span className="font-extrabold text-slate-900">
                                                        {cls.total_recorded || 0}
                                                        {cls.total_sessions ? ` / ${cls.total_sessions} Pertemuan` : ' Sesi'}
                                                    </span>
                                                </div>
                                                {progressPercent != null && (
                                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500"
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Metrik Kehadiran & Pemahaman */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Kehadiran
                                                    </span>
                                                    <span className="font-extrabold text-emerald-700 text-sm mt-0.5 block">
                                                        {cls.attendance_rate != null ? `${cls.attendance_rate}%` : '—'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {cls.hadir_count || 0} Sesi Hadir
                                                    </span>
                                                </div>

                                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Pemahaman
                                                    </span>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className="text-amber-500 text-xs">⭐</span>
                                                        <span className="font-extrabold text-slate-800 text-sm">
                                                            {cls.average_score != null ? `${cls.average_score} / 5` : '—'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 truncate block">
                                                        {cls.average_score ? UNDERSTANDING_LABELS[Math.round(Number(cls.average_score))] : 'Belum dinilai'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Sesi Terakhir (jika ada) */}
                                            {cls.last_date && (
                                                <div className="rounded-xl bg-violet-50/50 p-2.5 text-[11px] border border-violet-100/70">
                                                    <span className="text-violet-700 font-bold block">
                                                        Sesi Terakhir: {formatShortDate(cls.last_date)}
                                                    </span>
                                                    <p className="text-slate-600 truncate mt-0.5 font-medium">
                                                        {cls.last_subject ? `${cls.last_subject}` : ''}
                                                        {cls.last_material ? ` • ${cls.last_material}` : ''}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button: Buka Rekap Kelas Ini */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectClass(String(cls.id))}
                                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 active:scale-98 transition cursor-pointer"
                                        >
                                            <span>Buka Rekap Absensi & Evaluasi</span>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAMPILAN 2: DETAIL REKAP ABSENSI KELAS TERPILIH (LEVEL 2 / DETAIL SESI)   */}
            {/* ========================================================================= */}
            {selectedClassId !== null && (
                <div className="space-y-6">
                    {/* Navigation Top Bar: Back to List & Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleBackToList}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition self-start cursor-pointer group"
                        >
                            <svg className="h-4 w-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            <span>← Kembali ke Daftar Program / Kelas</span>
                        </button>

                        {/* Fast Class Switcher Dropdown */}
                        {classes.length > 1 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                                    Ganti Kelas:
                                </span>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => handleSelectClass(e.target.value)}
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

                    {/* Class Detail Focus Banner */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="rounded-xl bg-violet-600 px-3 py-1 text-xs font-black uppercase text-white shadow-xs">
                                        {activeClass ? activeClass.program_name : 'Semua Program Belajar'}
                                    </span>
                                    {activeClass?.level && (
                                        <span className="text-xs font-bold text-slate-400">
                                            Jenjang {activeClass.level}
                                        </span>
                                    )}
                                </div>
                                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                    {activeClass ? activeClass.name : 'Rekap Seluruh Sesi Belajar'}
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                                    {activeClass
                                        ? `Pengajar: Kak ${activeClass.teacher_name || '-'} • Riwayat sesi kehadiran dan evaluasi ananda ${selectedStudent?.name || ''}.`
                                        : `Menampilkan seluruh riwayat sesi kehadiran ananda ${selectedStudent?.name || ''} dari seluruh kelas.`}
                                </p>
                            </div>

                            {activeClass?.total_sessions && (
                                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5 self-start sm:self-auto shrink-0 min-w-[200px]">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-violet-700 font-bold">Target Sesi</span>
                                        <span className="font-black text-slate-900">
                                            {activeClass.total_recorded || 0} / {activeClass.total_sessions}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-violet-200/60">
                                        <div
                                            className="h-full rounded-full bg-violet-600 transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, Math.round(((activeClass.total_recorded || 0) / activeClass.total_sessions) * 100))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4 Metric Cards Kelas Terpilih */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Total Sesi Tercatat
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-slate-900">
                                    {totalRecords}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">Sesi</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Pertemuan di kelas ini
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Kehadiran Kelas
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-emerald-700">
                                    {attendanceRate != null ? `${attendanceRate}%` : '—'}
                                </span>
                                <span className="text-xs text-emerald-600 font-bold">
                                    ({hadirCount}/{totalRecords})
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-600 font-medium truncate">
                                {izinCount > 0 ? `${izinCount} Izin` : ''}
                                {sakitCount > 0 ? ` • ${sakitCount} Sakit` : ''}
                                {alpaCount > 0 ? ` • ${alpaCount} Alpa` : ''}
                                {!izinCount && !sakitCount && !alpaCount && totalRecords > 0 ? 'Kehadiran 100%' : ''}
                                {totalRecords === 0 ? 'Belum ada absensi' : ''}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                Rata-Rata Pemahaman
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-violet-700">
                                    {averageScore != null ? averageScore : '—'}
                                </span>
                                <span className="text-xs text-violet-600 font-bold">
                                    / 5.0
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-violet-600 font-medium truncate">
                                {averageScore ? UNDERSTANDING_LABELS[Math.round(Number(averageScore))] : 'Belum dinilai'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 shadow-2xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                Materi Tuntas
                            </span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-amber-700">
                                    {filteredRecords.filter((r) => r.material).length}
                                </span>
                                <span className="text-xs text-amber-600 font-medium">Topik</span>
                            </div>
                            <p className="mt-1 text-[11px] text-amber-600 font-medium truncate">
                                Diajarkan oleh pengajar
                            </p>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Periode Bulan */}
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs outline-none focus:border-violet-500 cursor-pointer"
                                >
                                    <option value="">Semua Periode Bulan</option>
                                    {availableMonths.map((m) => (
                                        <option key={m} value={m}>
                                            {formatMonth(m)}
                                        </option>
                                    ))}
                                </select>

                                {/* Status Kehadiran */}
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs outline-none focus:border-violet-500 cursor-pointer"
                                >
                                    <option value="">Semua Status Kehadiran</option>
                                    <option value="hadir">Hadir</option>
                                    <option value="izin">Izin</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="alpa">Alpa</option>
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 transition cursor-pointer"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Reset Filter
                                    </button>
                                )}
                            </div>

                            {/* Pencarian Materi / Catatan */}
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari materi, mapel, atau evaluasi..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white shadow-2xs transition"
                                />
                                <svg
                                    className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Sesi Table & Mobile Cards */}
                    {filteredRecords.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                                📋
                            </div>
                            <h3 className="font-display text-base font-bold text-slate-900">
                                Tidak Ada Data Absensi
                            </h3>
                            <p className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                                {hasActiveFilters
                                    ? 'Tidak ada pertemuan yang sesuai dengan filter yang Anda tentukan. Coba reset filter.'
                                    : 'Belum ada absensi yang dicatat untuk kelas ini.'}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-violet-700 transition cursor-pointer"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                                <div>
                                    <h2 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                                        Riwayat Pertemuan & Evaluasi Belajar
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Menampilkan {filteredRecords.length} sesi pertemuan tercatat
                                        {selectedMonth ? ` pada ${formatMonth(selectedMonth)}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Cards List (< md) */}
                            <div className="block md:hidden divide-y divide-slate-100">
                                {displayedRecords.map((record, index) => {
                                    const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.hadir;
                                    return (
                                        <article
                                            key={`mob-${record.class}-${record.date}-${index}`}
                                            className="p-4 space-y-3 hover:bg-slate-50/40 transition"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase text-violet-700 border border-violet-100">
                                                            {record.program_name || 'Program'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-600">
                                                            {record.class}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-display font-bold text-sm text-slate-900">
                                                        Pertemuan #{record.meeting_number} • {record.subject || 'Mata Pelajaran'}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {formatDate(record.date)} • Pengajar: {record.teacher}
                                                    </p>
                                                </div>

                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${statusCfg.badge}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                                                    {statusCfg.label}
                                                </span>
                                            </div>

                                            <div className="space-y-2 rounded-2xl bg-slate-50/80 p-3.5 text-xs">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Materi Pembelajaran
                                                    </span>
                                                    <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">
                                                        {record.material || 'Materi belum dicatat oleh pengajar.'}
                                                    </p>
                                                </div>

                                                {record.understanding_score && (
                                                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Pemahaman Siswa
                                                        </span>
                                                        <StarRating score={record.understanding_score} />
                                                    </div>
                                                )}

                                                {record.evaluation && (
                                                    <div className="pt-2 border-t border-slate-200/60">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                            Evaluasi Guru
                                                        </span>
                                                        <p className="text-slate-700 italic mt-0.5 leading-relaxed text-[11px]">
                                                            "{record.evaluation}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveDetailRecord(record)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-800 cursor-pointer"
                                                >
                                                    <span>Lihat Detail Lengkap</span>
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Desktop Table View (>= md) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="w-48 px-5 py-3.5 font-bold">Pertemuan & Waktu</th>
                                            <th className="w-56 px-5 py-3.5 font-bold">Kelas & Program</th>
                                            <th className="min-w-64 px-5 py-3.5 font-bold">Mata Pelajaran & Materi</th>
                                            <th className="w-32 px-5 py-3.5 text-center font-bold">Status</th>
                                            <th className="w-44 px-5 py-3.5 font-bold">Pemahaman</th>
                                            <th className="min-w-60 px-5 py-3.5 font-bold">Evaluasi Guru</th>
                                            <th className="w-16 px-4 py-3.5 text-center font-bold">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displayedRecords.map((record, index) => {
                                            const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.hadir;
                                            return (
                                                <tr
                                                    key={`tbl-${record.class}-${record.date}-${index}`}
                                                    className="hover:bg-slate-50/80 transition align-top"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-black text-violet-700">
                                                            Pertemuan #{record.meeting_number}
                                                        </div>
                                                        <p className="font-bold text-slate-900 mt-1.5 text-xs">
                                                            {formatDate(record.date)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 mb-1">
                                                            {record.program_name || 'Program Belajar'}
                                                        </span>
                                                        <p className="font-bold text-slate-900 text-xs">
                                                            {record.class}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                            {record.teacher ? `Kak ${record.teacher}` : '-'}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-slate-900 text-xs">
                                                            {record.subject || 'Mata Pelajaran Umum'}
                                                        </p>
                                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                            {record.material || <span className="text-slate-400 italic">Materi belum dicatat</span>}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase border ${statusCfg.badge}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                                                            {statusCfg.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StarRating score={record.understanding_score} />
                                                        {record.understanding_score && (
                                                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                                                {UNDERSTANDING_LABELS[record.understanding_score]}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {record.evaluation ? (
                                                            <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-100">
                                                                <p className="italic font-medium">"{record.evaluation}"</p>
                                                                {record.note && (
                                                                    <p className="text-[11px] text-violet-700 font-bold mt-1.5 pt-1.5 border-t border-slate-200/60">
                                                                        Catatan: {record.note}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">
                                                                Evaluasi belum tersedia
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveDetailRecord(record)}
                                                            title="Lihat Rincian Sesi Lengkap"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition cursor-pointer"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <PortalPagination
                                currentPage={currentPage}
                                totalItems={filteredRecords.length}
                                perPage={perPage}
                                onPageChange={setCurrentPage}
                                onPerPageChange={(newPerPage) => {
                                    setPerPage(newPerPage);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* Modal Detail Evaluasi Sesi                                                */}
            {/* ========================================================================= */}
            {activeDetailRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setActiveDetailRecord(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                            <div>
                                <span className="inline-flex items-center rounded-md bg-violet-100 px-2.5 py-0.5 text-xs font-black text-violet-800 mb-1">
                                    Pertemuan #{activeDetailRecord.meeting_number} • {activeDetailRecord.program_name}
                                </span>
                                <h3 className="font-display text-lg font-extrabold text-slate-900">
                                    {activeDetailRecord.class}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {formatDate(activeDetailRecord.date)} • Pengajar: {activeDetailRecord.teacher}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveDetailRecord(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Status Kehadiran
                                    </span>
                                    <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase border ${
                                        (STATUS_CONFIG[activeDetailRecord.status] || STATUS_CONFIG.hadir).badge
                                    }`}>
                                        {(STATUS_CONFIG[activeDetailRecord.status] || STATUS_CONFIG.hadir).label}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Mata Pelajaran
                                    </span>
                                    <p className="mt-1 font-extrabold text-slate-900 text-sm">
                                        {activeDetailRecord.subject || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Materi yang Diajarkan
                                </span>
                                <p className="text-slate-800 text-sm font-semibold leading-relaxed">
                                    {activeDetailRecord.material || 'Materi belum dicatat oleh pengajar.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3.5 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                                    Skala Pemahaman Siswa
                                </span>
                                <div className="flex items-center justify-between">
                                    <StarRating score={activeDetailRecord.understanding_score} size="lg" />
                                    <span className="text-xs font-extrabold text-violet-800">
                                        {UNDERSTANDING_LABELS[activeDetailRecord.understanding_score] || ''}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-1.5 shadow-2xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Catatan Evaluasi Guru
                                </span>
                                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed italic">
                                    "{activeDetailRecord.evaluation || 'Belum ada evaluasi tertulis.'}"
                                </p>
                            </div>

                            {activeDetailRecord.note && (
                                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                                        Catatan Khusus untuk Orang Tua
                                    </span>
                                    <p className="text-slate-800 text-xs leading-relaxed">
                                        {activeDetailRecord.note}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveDetailRecord(null)}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
