import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
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

function Card({ title, children, action, className = '' }) {
    return (
        <div className={`rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-violet-200 hover:shadow-xs ${className}`}>
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function ParentDashboard({ summary, selectedStudent, availablePrograms = [] }) {
    const [showAddProgramModal, setShowAddProgramModal] = useState(false);

    return (
        <div className="space-y-3.5 sm:space-y-4">
            {selectedStudent && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-3.5 sm:p-4 text-white shadow-2xs">
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-violet-200 uppercase tracking-wider">
                            Memantau Perkembangan
                        </p>
                        <h2 className="font-display text-base sm:text-lg font-bold tracking-tight">
                            {selectedStudent.name}
                        </h2>
                        {selectedStudent.level && (
                            <p className="text-xs text-violet-200">
                                Jenjang: {selectedStudent.level}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setShowAddProgramModal(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-violet-700 shadow-2xs hover:bg-violet-50 transition active:scale-95 cursor-pointer"
                        >
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Tambah Program</span>
                        </button>
                    </div>
                </div>
            )}

            {summary.pending_registrations && summary.pending_registrations.length > 0 && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                                ⏳
                            </span>
                            <h4 className="font-display text-xs sm:text-sm font-bold text-amber-900">
                                Pendaftaran Program Sedang Diverifikasi Admin
                            </h4>
                        </div>
                        <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-900 shrink-0">
                            {summary.pending_registrations.length} Pengajuan
                        </span>
                    </div>
                    <div className="space-y-2">
                        {summary.pending_registrations.map((p) => (
                            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white border border-amber-200/80 p-3 text-xs shadow-2xs">
                                <div>
                                    <span className="font-bold text-slate-800">{p.program}</span>
                                    {p.subjects && <span className="text-slate-600"> • Mapel: <strong className="text-violet-700">{p.subjects}</strong></span>}
                                    {p.package && <span className="text-slate-500"> • {p.package}</span>}
                                    {p.preferred_mode && <span className="text-slate-400"> • {p.preferred_mode}</span>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">
                                        {p.ticket}
                                    </span>
                                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800 text-[10px]">
                                        Menunggu Admin
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4">
                {/* Tagihan Card */}
                <Card
                    title="Tagihan Belajar"
                    action={
                        <Link href="/portal/tagihan" className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                            Detail
                        </Link>
                    }
                >
                    {summary.unpaid_count > 0 ? (
                        <div>
                            <p className="font-display text-xl sm:text-2xl font-black text-amber-600">
                                {formatRupiah(summary.unpaid_total)}
                            </p>
                            <div className="mt-2.5 flex items-center gap-2">
                                <span className="rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                    {summary.unpaid_count} Tagihan Aktif
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                ✓
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-emerald-800">Semua Tagihan Lunas</p>
                        </div>
                    )}
                </Card>

                {/* Kelas Card */}
                <Card
                    title="Kelas Terdaftar"
                    action={
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowAddProgramModal(true)}
                                className="rounded-md bg-violet-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-violet-700 transition cursor-pointer"
                            >
                                + Tambah
                            </button>
                            <Link href="/portal/jadwal" className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-brand-primary hover:bg-violet-100 transition">
                                Jadwal
                            </Link>
                        </div>
                    }
                >
                    {summary.classes && summary.classes.length > 0 ? (
                        <ul className="space-y-1.5">
                            {summary.classes.map((c) => (
                                <li key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50/80 px-2.5 py-1.5 text-xs font-bold text-slate-800">
                                    <span className="truncate">{c.name}</span>
                                    <span className="shrink-0 rounded-md bg-white border border-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                        Aktif
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-1 text-xs text-slate-400">Belum ada kelas terdaftar.</p>
                    )}
                </Card>

                {/* Absensi Card */}
                <Card
                    title="Absensi Terakhir"
                    action={
                        <Link href="/portal/absensi" className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                            Semua
                        </Link>
                    }
                >
                    {summary.recent_attendance && summary.recent_attendance.length > 0 ? (
                        <ul className="space-y-1.5 text-xs">
                            {summary.recent_attendance.map((a, i) => {
                                const isHadir = a.status === 'hadir';
                                return (
                                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-2.5 py-1.5">
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 truncate">{a.class}</p>
                                            <p className="text-[10px] text-slate-400">{formatDate(a.date)}</p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                isHadir
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : a.status === 'alpa'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {a.status}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="py-1 text-xs text-slate-400">Belum ada catatan absensi.</p>
                    )}
                </Card>

                {/* Nilai Card */}
                <Card
                    title="Nilai Terakhir"
                    action={
                        <Link href="/portal/nilai" className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                            Semua
                        </Link>
                    }
                >
                    {summary.recent_grades && summary.recent_grades.length > 0 ? (
                        <ul className="space-y-1.5 text-xs">
                            {summary.recent_grades.map((g, i) => (
                                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-2.5 py-1.5">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{g.subject}</p>
                                        <p className="text-[10px] text-slate-400">{g.term}</p>
                                    </div>
                                    <span className="font-display text-xs font-black text-slate-900 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shrink-0">
                                        {g.score}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-1 text-xs text-slate-400">Belum ada nilai tercatat.</p>
                    )}
                </Card>
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
    return (
        <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
            {summary.classes.length === 0 && (
                <div className="rounded-xl border border-slate-200/80 bg-white p-6 text-center text-xs text-slate-400 sm:col-span-2 2xl:col-span-3">
                    Belum ada kelas yang diampu.
                </div>
            )}
            {summary.classes.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-violet-200 hover:shadow-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                            <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">{c.name}</h3>
                            <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                                {c.program} • {c.filled}{c.quota != null ? `/${c.quota}` : ''} murid
                            </p>
                        </div>
                        <Link
                            href={`/portal/kelas/${c.id}`}
                            className="rounded-lg bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow-2xs transition hover:brightness-110 active:scale-95"
                        >
                            Kelola
                        </Link>
                    </div>

                    {c.schedules.length > 0 ? (
                        <ul className="mt-3 space-y-1.5 text-xs">
                            {c.schedules.map((s, i) => (
                                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-700">
                                    <span className="font-bold text-xs">{s.day}</span>
                                    <span className="font-semibold text-slate-500 text-[11px]">{s.start_time}–{s.end_time}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-xs text-slate-400">Belum ada jadwal.</p>
                    )}
                </div>
            ))}
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
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <div className="min-w-0">
                    <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 truncate">
                        Halo, {props.portalAuth?.name || 'Bapak/Ibu'}
                    </h1>
                    <p className="text-xs text-slate-500">
                        {type === 'teacher'
                            ? 'Pantau aktivitas mengajar dan kelola absensi serta nilai kelas.'
                            : 'Selamat datang di Portal Orang Tua Ar Rayyan Learning Course.'}
                    </p>
                </div>
            </div>
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
