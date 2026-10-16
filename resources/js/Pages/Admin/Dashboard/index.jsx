import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const toneConfig = {
    violet: {
        badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
        bg: 'bg-gradient-to-br from-violet-50/70 via-white to-white border-violet-200/70',
        iconBg: 'bg-violet-100 text-violet-700',
        bar: 'from-violet-600 to-indigo-500',
    },
    amber: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
        bg: 'bg-gradient-to-br from-amber-50/70 via-white to-white border-amber-200/70',
        iconBg: 'bg-amber-100 text-amber-700',
        bar: 'from-amber-500 to-orange-400',
    },
    rose: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
        bg: 'bg-gradient-to-br from-rose-50/70 via-white to-white border-rose-200/70',
        iconBg: 'bg-rose-100 text-rose-700',
        bar: 'from-rose-500 to-pink-500',
    },
    emerald: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        bg: 'bg-gradient-to-br from-emerald-50/70 via-white to-white border-emerald-200/70',
        iconBg: 'bg-emerald-100 text-emerald-700',
        bar: 'from-emerald-500 to-teal-400',
    },
};

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Draft: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
    Disetujui: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Ditolak: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);
};

export default function Dashboard() {
    const {
        stats = [],
        contentSections = [],
        agenda = [],
        registrations = [],
        activities = [],
        registrationChart,
        monthlyTrends = [],
        financials = {},
        programDistribution = [],
        summaryCounts = {},
        allowedActions = {},
        auth = {},
    } = usePage().props;

    const [chartMode, setChartMode] = useState('monthly'); // 'monthly' | 'status'
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const chartData = registrationChart ?? {
        labels: ['Pending', 'Disetujui', 'Ditolak'],
        students: [0, 0, 0],
        teachers: [0, 0, 0],
    };

    const totalStudents = chartData.students.reduce((total, value) => total + value, 0);
    const totalTeachers = chartData.teachers.reduce((total, value) => total + value, 0);
    const totalRegistrations = totalStudents + totalTeachers;

    // Monthly Chart calculations
    const displayMonthly = useMemo(() => {
        if (monthlyTrends.length > 0) {
            return monthlyTrends;
        }
        // Fallback months if none returned
        return [
            { month: 'Mei', students: 0, teachers: 0, total: 0 },
            { month: 'Jun', students: 0, teachers: 0, total: 0 },
            { month: 'Jul', students: 0, teachers: 0, total: 0 },
            { month: 'Agu', students: 0, teachers: 0, total: 0 },
            { month: 'Sep', students: 0, teachers: 0, total: 0 },
            { month: 'Okt', students: totalStudents, teachers: totalTeachers, total: totalRegistrations },
        ];
    }, [monthlyTrends, totalStudents, totalTeachers, totalRegistrations]);

    const maxMonthlyValue = Math.max(
        ...displayMonthly.map((m) => Math.max(m.students || 0, m.teachers || 0)),
        4
    );

    // Status Chart calculations
    const chartTotals = chartData.labels.map((_, index) => {
        return (chartData.students[index] ?? 0) + (chartData.teachers[index] ?? 0);
    });
    const chartMax = Math.max(...chartTotals, 1);
    const chartRows = chartData.labels.map((label, index) => {
        const students = chartData.students[index] ?? 0;
        const teachers = chartData.teachers[index] ?? 0;
        const total = students + teachers;
        const totalWidth = (total / chartMax) * 100;
        const studentWidth = total ? (students / total) * 100 : 0;
        const teacherWidth = total ? (teachers / total) * 100 : 0;

        return {
            label,
            students,
            teachers,
            total,
            totalWidth,
            studentWidth,
            teacherWidth,
        };
    });

    // Program Distribution Donut Chart calculation
    const donutColors = ['#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#6366f1'];
    const totalProgramCount = useMemo(() => {
        return programDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
    }, [programDistribution]);

    const donutSegments = useMemo(() => {
        let accumulatedPercent = 0;
        const circumference = 2 * Math.PI * 38; // r = 38

        return programDistribution.map((prog, index) => {
            const percent = (prog.count || 0) / totalProgramCount;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return {
                ...prog,
                percent: Math.round(percent * 100),
                color: donutColors[index % donutColors.length],
                strokeDasharray,
                strokeDashoffset,
            };
        });
    }, [programDistribution, totalProgramCount]);

    // Financial Calculation
    const paidRev = financials.paidRevenue || 0;
    const pendingRev = financials.pendingRevenue || 0;
    const totalInv = financials.totalInvoiced || (paidRev + pendingRev) || 0;
    const paidPercent = totalInv > 0 ? Math.min(Math.round((paidRev / totalInv) * 100), 100) : 0;

    const canExport = (allowedActions.dashboard ?? []).includes('export');
    const adminName = auth?.user?.name || 'Administrator';

    const currentDateStr = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="space-y-4 sm:space-y-5">
                {/* Top Welcome & Executive Header */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200/70 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {currentDateStr}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                    ALC Learning Suite
                                </span>
                            </div>
                            <h1 className="mt-1.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                Halo, {adminName} 👋
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Ringkasan operasional bimbingan belajar, data pendaftaran murid, performa program, dan aktivitas terkini.
                            </p>
                        </div>

                        {/* Quick Action Shortcuts */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Link
                                href="/admin/pendaftaran"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-brand-primary shadow-2xs transition active:scale-95"
                            >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>Pendaftar</span>
                            </Link>

                            <Link
                                href="/admin/keuangan"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-300 hover:text-amber-700 shadow-2xs transition active:scale-95"
                            >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <line x1="2" y1="10" x2="22" y2="10" />
                                </svg>
                                <span>Keuangan</span>
                            </Link>

                            <Link
                                href="/"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs transition active:scale-95"
                            >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                <span>Website</span>
                            </Link>

                            {canExport && (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:brightness-110 transition active:scale-95 cursor-pointer"
                                >
                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Export</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4 Core Stat Cards (Guaranteed by tests) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item, idx) => {
                        const tone = toneConfig[item.tone] ?? toneConfig.violet;
                        return (
                            <div
                                key={item.label}
                                className={`rounded-xl border p-3.5 sm:p-4 shadow-2xs transition hover:shadow-xs hover:border-slate-300 ${tone.bg}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}
                                    >
                                        {item.label}
                                    </span>
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone.iconBg}`}>
                                        {idx === 0 && (
                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                            </svg>
                                        )}
                                        {idx === 1 && (
                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        )}
                                        {idx === 2 && (
                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                                <polyline points="2 17 12 22 22 17" />
                                                <polyline points="2 12 12 17 22 12" />
                                            </svg>
                                        )}
                                        {idx === 3 && (
                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                                <path d="M4 22h16" />
                                                <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
                                                <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
                                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                                        {item.value}
                                    </p>
                                    {idx === 1 && item.value > 0 && (
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                                            Perlu Tindakan
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-500 font-medium truncate">
                                    {item.meta}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Operational Quick Metrics Row */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 rounded-xl border border-slate-200/70 bg-white p-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 px-2 py-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-brand-primary text-xs font-bold">
                            👨‍🎓
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Siswa Terdaftar
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                                {summaryCounts.totalStudents ?? 0} Siswa
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-2 py-1 border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 text-xs font-bold">
                            👩‍🏫
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Pengajar Aktif
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                                {summaryCounts.totalTeachers ?? 0} Tentor
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-2 py-1 border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                            🏫
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Kelas Bimbingan
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                                {summaryCounts.totalClasses ?? 0} Kelas
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-2 py-1 border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 text-xs font-bold">
                            🏆
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Peserta Olimpiade
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                                {summaryCounts.olympiadParticipants ?? 0} Peserta
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visual Analytics & Charts Section */}
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
                    {/* Main Bar Chart: Tren Pendaftaran & Status */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs lg:col-span-2 flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-brand-primary">
                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="20" x2="18" y2="10" />
                                                <line x1="12" y1="20" x2="12" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="14" />
                                            </svg>
                                        </span>
                                        <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                            Grafik Pendaftaran & Konversi
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Perbandingan pendaftaran murid dan tentor pengajar
                                    </p>
                                </div>

                                {/* Mode Switcher & Stats Chips */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setChartMode('monthly')}
                                            className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                                                chartMode === 'monthly'
                                                    ? 'bg-white text-slate-900 shadow-2xs'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            Tren 6 Bulan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChartMode('status')}
                                            className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                                                chartMode === 'status'
                                                    ? 'bg-white text-slate-900 shadow-2xs'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            Status Pendaftar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Chart View Content */}
                            {chartMode === 'monthly' ? (
                                <div className="mt-4">
                                    {/* Monthly SVG Bar Chart */}
                                    <div className="relative h-56 w-full pt-4">
                                        <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                                            <defs>
                                                <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8b5cf6" />
                                                    <stop offset="100%" stopColor="#6d28d9" />
                                                </linearGradient>
                                                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f59e0b" />
                                                    <stop offset="100%" stopColor="#d97706" />
                                                </linearGradient>
                                            </defs>

                                            {/* Horizontal grid lines */}
                                            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                                                const y = 170 - ratio * 140;
                                                const val = Math.round(ratio * maxMonthlyValue);
                                                return (
                                                    <g key={ratio}>
                                                        <line
                                                            x1="35"
                                                            y1={y}
                                                            x2="590"
                                                            y2={y}
                                                            stroke="#f1f5f9"
                                                            strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                                                            strokeWidth="1"
                                                        />
                                                        <text x="5" y={y + 3} fill="#94a3b8" fontSize="10" fontWeight="600">
                                                            {val}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            {/* Monthly Grouped Bars */}
                                            {displayMonthly.map((m, index) => {
                                                const groupX = 60 + index * 90;
                                                const studentHeight = Math.max(((m.students || 0) / maxMonthlyValue) * 140, (m.students ? 4 : 0));
                                                const teacherHeight = Math.max(((m.teachers || 0) / maxMonthlyValue) * 140, (m.teachers ? 4 : 0));

                                                const sY = 170 - studentHeight;
                                                const tY = 170 - teacherHeight;

                                                const isHovered = hoveredPoint === index;

                                                return (
                                                    <g
                                                        key={index}
                                                        className="transition-opacity duration-150 cursor-pointer"
                                                        onMouseEnter={() => setHoveredPoint(index)}
                                                        onMouseLeave={() => setHoveredPoint(null)}
                                                    >
                                                        {/* Highlight column band */}
                                                        {isHovered && (
                                                            <rect
                                                                x={groupX - 10}
                                                                y="20"
                                                                width="70"
                                                                height="150"
                                                                fill="#f8fafc"
                                                                rx="6"
                                                            />
                                                        )}

                                                        {/* Student Bar */}
                                                        <rect
                                                            x={groupX}
                                                            y={sY}
                                                            width="22"
                                                            height={studentHeight}
                                                            fill="url(#violetGradient)"
                                                            rx="4"
                                                            className="transition-all duration-300"
                                                        />

                                                        {/* Teacher Bar */}
                                                        <rect
                                                            x={groupX + 26}
                                                            y={tY}
                                                            width="22"
                                                            height={teacherHeight}
                                                            fill="url(#amberGradient)"
                                                            rx="4"
                                                            className="transition-all duration-300"
                                                        />

                                                        {/* Month Label */}
                                                        <text
                                                            x={groupX + 24}
                                                            y="190"
                                                            textAnchor="middle"
                                                            fill={isHovered ? '#1e293b' : '#64748b'}
                                                            fontSize="11"
                                                            fontWeight={isHovered ? '700' : '600'}
                                                        >
                                                            {m.month}
                                                        </text>

                                                        {/* Tooltip on hover */}
                                                        {isHovered && (
                                                            <g>
                                                                <rect
                                                                    x={groupX - 25}
                                                                    y={Math.min(sY, tY) - 32}
                                                                    width="100"
                                                                    height="26"
                                                                    rx="6"
                                                                    fill="#0f172a"
                                                                />
                                                                <text
                                                                    x={groupX + 25}
                                                                    y={Math.min(sY, tY) - 15}
                                                                    textAnchor="middle"
                                                                    fill="#ffffff"
                                                                    fontSize="9.5"
                                                                    fontWeight="700"
                                                                >
                                                                    {m.students} Murid • {m.teachers} Guru
                                                                </text>
                                                            </g>
                                                        )}
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-2.5">
                                    {chartRows.map((row) => (
                                        <div
                                            key={row.label}
                                            className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 transition hover:bg-white hover:shadow-2xs"
                                        >
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{row.label}</span>
                                                    <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                        {row.total} Total
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-500">
                                                    <span className="text-violet-700 font-bold">{row.students}</span> murid •{' '}
                                                    <span className="text-amber-600 font-bold">{row.teachers}</span> pengajar
                                                </span>
                                            </div>

                                            <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden flex">
                                                <div
                                                    className="h-full bg-violet-600 transition-all duration-500"
                                                    style={{ width: `${row.total ? (row.students / row.total) * 100 : 0}%` }}
                                                    title={`${row.students} Murid`}
                                                />
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-500"
                                                    style={{ width: `${row.total ? (row.teachers / row.total) * 100 : 0}%` }}
                                                    title={`${row.teachers} Pengajar`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chart Legend & Summary Footer */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px]">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                                    <span className="font-semibold text-slate-600">Murid ({totalStudents})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                    <span className="font-semibold text-slate-600">Pengajar ({totalTeachers})</span>
                                </div>
                            </div>
                            <span className="font-bold text-slate-500">
                                Akumulasi Total: <strong className="text-slate-800">{totalRegistrations} Pendaftar</strong>
                            </span>
                        </div>
                    </div>

                    {/* Donut Chart: Distribusi Jenjang Program & Finansial */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 2a10 10 0 0 1 10 10h-10z" />
                                        </svg>
                                    </span>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Distribusi Program
                                    </h3>
                                </div>
                                <Link
                                    href="/admin/program"
                                    className="text-[11px] font-bold text-brand-primary hover:underline"
                                >
                                    Kelola
                                </Link>
                            </div>

                            {/* Donut Graphic */}
                            <div className="mt-3 flex items-center justify-center">
                                <div className="relative w-36 h-36">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {/* Background Track */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="38"
                                            fill="transparent"
                                            stroke="#f1f5f9"
                                            strokeWidth="12"
                                        />
                                        {/* Segments */}
                                        {donutSegments.length > 0 ? (
                                            donutSegments.map((seg, i) => (
                                                <circle
                                                    key={i}
                                                    cx="50"
                                                    cy="50"
                                                    r="38"
                                                    fill="transparent"
                                                    stroke={seg.color}
                                                    strokeWidth="12"
                                                    strokeDasharray={seg.strokeDasharray}
                                                    strokeDashoffset={seg.strokeDashoffset}
                                                    className="transition-all duration-700"
                                                />
                                            ))
                                        ) : (
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="38"
                                                fill="transparent"
                                                stroke="#7c3aed"
                                                strokeWidth="12"
                                                strokeDasharray="238 238"
                                            />
                                        )}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-xl font-black text-slate-900 leading-none">
                                            {programDistribution.reduce((acc, p) => acc + (p.count || 0), 0)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                            Program
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Segments Legend */}
                            <div className="mt-3 space-y-1.5">
                                {donutSegments.length > 0 ? (
                                    donutSegments.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className="h-2 w-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="truncate font-semibold text-slate-700">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="font-bold text-slate-900 shrink-0">
                                                {item.count} ({item.percent}%)
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-xs text-slate-400 py-1">Belum ada kategori program.</p>
                                )}
                            </div>
                        </div>

                        {/* Financial Micro Metric Card */}
                        <div className="mt-3.5 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">Omset Tagihan Masuk</span>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    {paidPercent}% Lunas
                                </span>
                            </div>
                            <p className="mt-1 text-sm font-black text-emerald-700">
                                {formatRupiah(paidRev)}
                            </p>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${paidPercent}%` }}
                                />
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                <span>Pending: {formatRupiah(pendingRev)}</span>
                                <Link href="/admin/keuangan" className="font-bold text-brand-primary hover:underline">
                                    Detail &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Grid: Pending Registrations Queue & Upcoming Events */}
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
                    {/* Antrian Pendaftaran Table (2 Columns) */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-brand-primary">
                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" />
                                        <line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Antrian Pendaftaran Terbaru
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Pendaftar baru yang menunggu persetujuan admin</p>
                                </div>
                            </div>
                            <Link
                                href="/admin/pendaftaran"
                                className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-violet-300 hover:text-brand-primary transition"
                            >
                                Lihat Semua ({registrations.length})
                            </Link>
                        </div>

                        <div className="mt-2.5 overflow-x-auto">
                            <table className="w-full min-w-[460px] text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="pb-2 pr-3">Pendaftar</th>
                                        <th className="pb-2 pr-3">Kategori</th>
                                        <th className="pb-2 pr-3">Program / Mapel</th>
                                        <th className="pb-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {registrations.map((item) => {
                                        const isStudent = item.type === 'Murid';
                                        const initials = (item.name || 'P')
                                            .split(' ')
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map((w) => w[0].toUpperCase())
                                            .join('');

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-2.5 pr-3">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                                                                isStudent
                                                                    ? 'bg-violet-100 text-brand-primary'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 pr-3">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            isStudent
                                                                ? 'bg-violet-50 text-brand-primary border border-violet-100'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        }`}
                                                    >
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-3 text-slate-600 truncate max-w-[160px]">
                                                    {item.program}
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                                            statusStyles[item.status] ?? statusStyles.Pending
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {registrations.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                                <span className="text-xl block mb-1">🎉</span>
                                                Semua pendaftaran telah diproses! Belum ada antrian pending.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Agenda & Olimpiade Minggu Ini */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </span>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Agenda Olimpiade
                                    </h3>
                                </div>
                                <Link
                                    href="/admin/olimpiade"
                                    className="text-[11px] font-bold text-brand-primary hover:underline"
                                >
                                    Semua
                                </Link>
                            </div>

                            <div className="mt-3 space-y-2">
                                {agenda.length > 0 ? (
                                    agenda.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 transition hover:bg-white hover:border-emerald-200"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 leading-tight">
                                                <span className="text-[9px] uppercase font-bold">JADWAL</span>
                                                <span className="text-xs font-black">★</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-xs text-slate-900 truncate">
                                                    {item.title}
                                                </p>
                                                <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                                                    <span>{item.time}</span>
                                                    <span className="rounded-full bg-white border border-slate-200 px-1.5 py-0.2 font-semibold text-slate-600">
                                                        {item.team}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                                        Belum ada jadwal olimpiade terdekat.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <Link
                                href="/admin/olimpiade/pendaftaran"
                                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                            >
                                <span>Verifikasi Pendaftar Lomba &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Konten Beranda & Aktivitas Log */}
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                    {/* Status Konten Landing Page */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-brand-primary">
                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M3 9h18" />
                                        <path d="M9 21V9" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Status Konten Beranda & Landing
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Kelengkapan materi di website utama</p>
                                </div>
                            </div>
                            <Link
                                href="/admin/landing"
                                className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-violet-300 hover:text-brand-primary transition"
                            >
                                Editor Landing
                            </Link>
                        </div>

                        <div className="mt-2.5 space-y-2">
                            {contentSections.map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs hover:bg-white hover:border-slate-200 transition"
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{item.title}</p>
                                        <p className="text-[11px] text-slate-500 truncate">
                                            {item.owner} • {item.note}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                            statusStyles[item.status] ?? statusStyles.Aktif
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Aktivitas Sistem Terbaru */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">
                                        Log & Aktivitas Terakhir
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Perubahan data dan pendaftaran terupdate</p>
                                </div>
                            </div>
                            <Link
                                href="/admin/aktivitas"
                                className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-amber-300 hover:text-amber-700 transition"
                            >
                                Semua Log
                            </Link>
                        </div>

                        <div className="mt-2.5 space-y-2">
                            {activities.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs hover:bg-white hover:border-slate-200 transition"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary text-xs">
                                            ⚡
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{item.detail}</p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                        {item.time}
                                    </span>
                                </div>
                            ))}

                            {activities.length === 0 && (
                                <p className="py-6 text-center text-xs text-slate-400">
                                    Belum ada aktivitas baru tercatat.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
