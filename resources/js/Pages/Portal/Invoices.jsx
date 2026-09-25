import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const statusMeta = {
    unpaid: { label: 'Belum Bayar', cls: 'bg-amber-100 text-amber-700' },
    pending: { label: 'Menunggu Verifikasi', cls: 'bg-violet-100 text-brand-primary' },
    paid: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-700' },
    expired: { label: 'Kedaluwarsa', cls: 'bg-slate-100 text-slate-500' },
    rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-600' },
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
            <h1 className="mb-4 font-display text-xl font-bold text-slate-900">Tagihan Saya</h1>
            {invoices.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Belum ada tagihan.
                </p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {invoices.map((inv) => {
                        const meta = statusMeta[inv.status] ?? statusMeta.unpaid;
                        return (
                            <div key={inv.invoice_no} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-mono text-xs font-bold text-slate-800">{inv.invoice_no}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">{inv.program}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.cls}`}>
                                        {meta.label}
                                    </span>
                                </div>
                                <p className="mt-3 font-display text-xl font-bold text-slate-900">
                                    Rp {Number(inv.amount ?? 0).toLocaleString('id-ID')}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Jatuh tempo {formatDate(inv.due_date)}
                                    {inv.paid_at ? ` • Lunas ${formatDate(inv.paid_at)}` : ''}
                                </p>
                                {inv.status !== 'paid' && (
                                    <a
                                        href={`/pembayaran?invoice=${encodeURIComponent(inv.invoice_no)}&phone=${encodeURIComponent(contact)}`}
                                        className="mt-3 block rounded-full bg-brand-primary px-4 py-2 text-center text-xs font-bold text-white transition hover:opacity-90"
                                    >
                                        Bayar / Unggah Bukti
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </PortalLayout>
    );
}
