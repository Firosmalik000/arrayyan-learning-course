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

function Card({ title, children, action }) {
    return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function StudentDashboard({ summary }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Card
                title="Tagihan Aktif"
                action={<Link href="/portal/tagihan" className="text-xs font-bold text-brand-primary hover:underline">Lihat</Link>}
            >
                {summary.unpaid_count > 0 ? (
                    <div>
                        <p className="font-display text-2xl font-bold text-amber-600">{formatRupiah(summary.unpaid_total)}</p>
                        <p className="mt-1 text-xs text-slate-500">{summary.unpaid_count} tagihan menunggu pembayaran</p>
                    </div>
                ) : (
                    <p className="text-sm text-emerald-700">Tidak ada tagihan aktif. Semua lunas.</p>
                )}
            </Card>

            <Card
                title="Kelas Saya"
                action={<Link href="/portal/jadwal" className="text-xs font-bold text-brand-primary hover:underline">Jadwal</Link>}
            >
                {summary.classes.length > 0 ? (
                    <ul className="space-y-1.5">
                        {summary.classes.map((c) => (
                            <li key={c.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                                {c.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">Belum masuk kelas mana pun.</p>
                )}
            </Card>

            <Card title="Absensi Terakhir">
                {summary.recent_attendance.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                        {summary.recent_attendance.map((a, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                                <span className="font-medium text-slate-700">{a.class} • {formatDate(a.date)}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {a.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">Belum ada data absensi.</p>
                )}
            </Card>

            <Card
                title="Nilai Terakhir"
                action={<Link href="/portal/nilai" className="text-xs font-bold text-brand-primary hover:underline">Semua</Link>}
            >
                {summary.recent_grades.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                        {summary.recent_grades.map((g, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                                <span className="font-medium text-slate-700">{g.subject} • {g.term}</span>
                                <span className="font-display font-bold text-slate-900">{g.score}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">Belum ada nilai.</p>
                )}
            </Card>
        </div>
    );
}

function TeacherDashboard({ summary }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {summary.classes.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 sm:col-span-2">
                    Belum ada kelas yang Anda ampu.
                </p>
            )}
            {summary.classes.map((c) => (
                <div key={c.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-display text-base font-bold text-slate-900">{c.name}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">{c.program} • {c.filled}{c.quota != null ? `/${c.quota}` : ''} murid</p>
                        </div>
                        <Link href={`/portal/kelas/${c.id}`} className="rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90">
                            Kelola
                        </Link>
                    </div>
                    {c.schedules.length > 0 ? (
                        <ul className="mt-3 space-y-1.5 text-xs">
                            {c.schedules.map((s, i) => (
                                <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                                    <span className="font-semibold">{s.day}</span>
                                    <span>{s.start_time}–{s.end_time}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-xs text-slate-500">Belum ada jadwal.</p>
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
            <h1 className="mb-4 font-display text-xl font-bold text-slate-900 sm:text-2xl">
                Halo, {props.portalAuth?.name || 'ALC'}
            </h1>
            {type === 'teacher'
                ? <TeacherDashboard summary={summary} />
                : <StudentDashboard summary={summary} />}
        </PortalLayout>
    );
}
