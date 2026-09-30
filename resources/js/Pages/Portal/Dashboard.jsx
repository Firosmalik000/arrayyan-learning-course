import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

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
        <div className={`rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 transition hover:border-violet-200 hover:shadow-sm ${className}`}>
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold text-slate-900">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function StudentDashboard({ summary }) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            {/* Tagihan Card */}
            <Card
                title="Tagihan Aktif"
                action={
                    <Link href="/portal/tagihan" className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                        Detail
                    </Link>
                }
            >
                {summary.unpaid_count > 0 ? (
                    <div>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600">
                            {formatRupiah(summary.unpaid_total)}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="rounded-full bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                {summary.unpaid_count} Tagihan
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 py-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            ✓
                        </span>
                        <p className="text-sm font-bold text-emerald-800">Semua Lunas</p>
                    </div>
                )}
            </Card>

            {/* Kelas Card */}
            <Card
                title="Kelas Terdaftar"
                action={
                    <Link href="/portal/jadwal" className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                        Jadwal
                    </Link>
                }
            >
                {summary.classes.length > 0 ? (
                    <ul className="space-y-2">
                        {summary.classes.map((c) => (
                            <li key={c.id} className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800">
                                <span>{c.name}</span>
                                <span className="rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                    Aktif
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="py-2 text-xs text-slate-400">Belum ada kelas.</p>
                )}
            </Card>

            {/* Absensi Card */}
            <Card
                title="Absensi Terakhir"
                action={
                    <Link href="/portal/absensi" className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                        Semua
                    </Link>
                }
            >
                {summary.recent_attendance.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                        {summary.recent_attendance.map((a, i) => {
                            const isHadir = a.status === 'hadir';
                            return (
                                <li key={i} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50/80 px-3.5 py-2.5">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{a.class}</p>
                                        <p className="text-[11px] text-slate-400">{formatDate(a.date)}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
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
                    <p className="py-2 text-xs text-slate-400">Belum ada absensi.</p>
                )}
            </Card>

            {/* Nilai Card */}
            <Card
                title="Nilai Terakhir"
                action={
                    <Link href="/portal/nilai" className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-brand-primary hover:bg-violet-100 transition">
                        Semua
                    </Link>
                }
            >
                {summary.recent_grades.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                        {summary.recent_grades.map((g, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50/80 px-3.5 py-2.5">
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{g.subject}</p>
                                    <p className="text-[11px] text-slate-400">{g.term}</p>
                                </div>
                                <span className="font-display text-sm font-extrabold text-slate-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl">
                                    {g.score}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="py-2 text-xs text-slate-400">Belum ada nilai.</p>
                )}
            </Card>
        </div>
    );
}

function TeacherDashboard({ summary }) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            {summary.classes.length === 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-400 sm:col-span-2">
                    Belum ada kelas yang diampu.
                </div>
            )}
            {summary.classes.map((c) => (
                <div key={c.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:border-violet-200 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-display text-base font-bold text-slate-900">{c.name}</h3>
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                {c.program} • {c.filled}{c.quota != null ? `/${c.quota}` : ''} murid
                            </p>
                        </div>
                        <Link
                            href={`/portal/kelas/${c.id}`}
                            className="rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95"
                        >
                            Kelola
                        </Link>
                    </div>

                    {c.schedules.length > 0 ? (
                        <ul className="mt-4 space-y-2 text-xs">
                            {c.schedules.map((s, i) => (
                                <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                                    <span className="font-bold">{s.day}</span>
                                    <span className="font-semibold text-slate-500">{s.start_time}–{s.end_time}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-xs text-slate-400">Belum ada jadwal.</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const { props } = usePage();
    const type = props.account_type || 'student';
    const summary = props.summary || {};

    return (
        <PortalLayout>
            <Head title="Dashboard Portal" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                        Halo, {props.portalAuth?.name || 'ALC'}
                    </h1>
                </div>
            </div>
            {type === 'teacher' ? (
                <TeacherDashboard summary={summary} />
            ) : (
                <StudentDashboard summary={summary} />
            )}
        </PortalLayout>
    );
}
