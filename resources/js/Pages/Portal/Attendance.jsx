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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-display text-xl font-bold text-slate-900">Absensi Saya</h1>
                {rate != null && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Kehadiran {rate}%
                    </span>
                )}
            </div>
            {records.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-sm text-slate-500">Belum ada data absensi.</p>
                    <Link href="/portal" className="mt-2 inline-block text-xs font-bold text-brand-primary hover:underline">
                        Kembali ke dashboard
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                <th className="px-4 py-3 font-medium">Tanggal</th>
                                <th className="px-4 py-3 font-medium">Kelas</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {records.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{r.class}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${r.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : r.status === 'alpa' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PortalLayout>
    );
}
