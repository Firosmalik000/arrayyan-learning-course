import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const statusMeta = {
    unpaid: { label: 'Belum Bayar', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    pending: { label: 'Menunggu Verifikasi', cls: 'bg-violet-100 text-brand-primary border-violet-200' },
    paid: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    expired: { label: 'Kedaluwarsa', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    rejected: { label: 'Ditolak', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const formatDate = (v) => {
    if (!v) return '-';
    try {
        return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '-';
    }
};

export default function Invoices() {
    const { props } = usePage();
    const invoices = props.invoices ?? [];
    const contact = props.contact ?? '';

    return (
        <PortalLayout>
            <Head title="Tagihan Saya" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Tagihan Saya
                </h1>
            </div>

            {invoices.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Belum ada tagihan.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {invoices.map((inv) => {
                        const meta = statusMeta[inv.status] ?? statusMeta.unpaid;
                        return (
                            <div
                                key={inv.invoice_no}
                                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:border-violet-200 hover:shadow-sm"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                        <div>
                                            <p className="font-mono text-xs font-extrabold text-slate-900">
                                                {inv.invoice_no}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500 font-medium">{inv.program}</p>
                                        </div>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>
                                            {meta.label}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <p className="font-display text-2xl font-extrabold text-slate-900">
                                            Rp {Number(inv.amount ?? 0).toLocaleString('id-ID')}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                            <span>Jatuh tempo: <strong className="text-slate-700">{formatDate(inv.due_date)}</strong></span>
                                            {inv.paid_at && (
                                                <span>• Lunas: <strong className="text-emerald-700">{formatDate(inv.paid_at)}</strong></span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {inv.status !== 'paid' && (
                                    <div className="mt-5 pt-3 border-t border-slate-100">
                                        <a
                                            href={`/pembayaran?invoice=${encodeURIComponent(inv.invoice_no)}&phone=${encodeURIComponent(contact)}`}
                                            className="block w-full rounded-full bg-brand-primary px-4 py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95"
                                        >
                                            Bayar / Unggah Bukti
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </PortalLayout>
    );
}
