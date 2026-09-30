import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const formatDate = (v) => {
    if (!v) return '-';
    try {
        return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '-';
    }
};

export default function Attendance() {
    const { props } = usePage();
    const records = props.records ?? [];
    const rate = props.rate;

    return (
        <PortalLayout>
            <Head title="Absensi Saya" />
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Absensi Saya
                </h1>
                {rate != null && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
                        Kehadiran {rate}%
                    </span>
                )}
            </div>

            {records.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Belum ada data absensi.</p>
                    <Link href="/portal" className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition">
                        Dashboard
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Kelas</th>
                                    <th className="px-5 py-3.5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((r, i) => {
                                    const isHadir = r.status === 'hadir';
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-slate-500">{formatDate(r.date)}</td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">{r.class}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                                        isHadir
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : r.status === 'alpa'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
