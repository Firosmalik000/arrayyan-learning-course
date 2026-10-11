import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import {
    Badge,
    Button,
    Container,
    EmptyState,
    SectionHeader,
} from '@/Components/Public';

const statusMeta = {
    pending: { label: 'Diproses', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'rose' },
};

const invoiceMeta = {
    unpaid: { label: 'Belum Bayar', variant: 'warning' },
    pending: { label: 'Menunggu Verifikasi', variant: 'primary' },
    paid: { label: 'Lunas', variant: 'success' },
    expired: { label: 'Kedaluwarsa', variant: 'neutral' },
    rejected: { label: 'Ditolak', variant: 'rose' },
};

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

function Timeline({ result }) {
    const steps = [
        { label: 'Pendaftaran Diterima', date: result.created_at, done: true },
        {
            label: 'Verifikasi Admin',
            date: result.status === 'pending' ? null : result.approved_at || result.rejected_at,
            done: result.status !== 'pending',
        },
        {
            label: result.status === 'rejected' ? 'Ditolak' : 'Disetujui',
            date: result.approved_at || result.rejected_at,
            done: result.status !== 'pending',
            tone: result.status === 'rejected' ? 'red' : 'green',
        },
    ];

    return (
        <ol className="relative ml-2 space-y-6 border-l-2 border-slate-200 pl-6">
            {steps.map((step) => (
                <li key={step.label} className="relative">
                    <span
                        className={`absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                            step.done
                                ? step.tone === 'red'
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                                : 'bg-slate-300'
                        }`}
                    />
                    <p className="text-sm font-bold text-slate-900">{step.label}</p>
                    <p className="text-xs text-slate-500">
                        {step.date ? formatDate(step.date) : 'Menunggu'}
                    </p>
                </li>
            ))}
        </ol>
    );
}

export default function StatusCheck() {
    const { props } = usePage();
    const { language } = useI18n();
    const [ticket, setTicket] = useState(props.ticket ?? '');
    const [phone, setPhone] = useState(props.phone ?? '');

    const result = props.result ?? null;
    const searched = props.searched ?? false;
    const meta = result ? statusMeta[result.status] ?? statusMeta.pending : null;

    const handleSubmit = (event) => {
        event.preventDefault();
        router.get('/cek-status', { ticket, phone }, { preserveState: true, replace: true });
    };

    const inputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100';

    return (
        <>
            <SeoHead
                title={language === 'en' ? 'Check Registration Status' : 'Cek Status Pendaftaran'}
                description={
                    language === 'en'
                        ? 'Track your Ar Rayyan Learning Course registration status with your ticket number.'
                        : 'Lacak status pendaftaran Ar Rayyan Learning Course dengan nomor tiket Anda.'
                }
            />

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pb-12 pt-10">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="font-bold text-brand-primary">Cek Status</span>
                    </nav>
                    <SectionHeader
                        eyebrow="Lacak Pendaftaran"
                        title="Cek Status Pendaftaran"
                        subtitle="Masukkan nomor tiket dan nomor WhatsApp yang dipakai saat mendaftar."
                        align="center"
                    />
                </Container>
            </section>

            <section className="bg-slate-50/40 py-12 sm:py-16">
                <Container>
                    <div className="mx-auto max-w-2xl">
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl border border-slate-200/80 bg-white p-4.5 xs:p-6 sm:p-8 shadow-xs"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                        Nomor Tiket
                                    </label>
                                    <input
                                        type="text"
                                        value={ticket}
                                        onChange={(e) => setTicket(e.target.value.toUpperCase())}
                                        placeholder="ALC-2026-00001"
                                        className={`${inputClass} font-mono uppercase`}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                        No. WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="081234567890"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="primary" className="mt-5 w-full">
                                Lacak Status
                            </Button>
                        </form>

                        {result && (
                            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-4.5 xs:p-6 sm:p-8 shadow-xs">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {result.type_label} — {result.ticket}
                                        </p>
                                        <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                                            {result.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">{result.program || '-'}</p>
                                    </div>
                                    <Badge variant={meta.variant}>{meta.label}</Badge>
                                </div>

                                <div className="mt-6">
                                    <Timeline result={result} />
                                </div>

                                {result.status === 'rejected' && result.admin_note && (
                                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                        <p className="font-bold">Catatan Admin</p>
                                        <p className="mt-1">{result.admin_note}</p>
                                    </div>
                                )}

                                {result.status === 'pending' && (
                                    <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                                        Pendaftaran Anda sedang diverifikasi tim admin. Notifikasi WhatsApp akan dikirim otomatis saat ada keputusan.
                                    </p>
                                )}

                                {result.status === 'approved' && (
                                    <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                                        Selamat! Pendaftaran Anda disetujui. Tim kami akan menghubungi Anda via WhatsApp untuk langkah berikutnya.
                                    </p>
                                )}

                                {result.type === 'student' && result.invoices?.length > 0 && (
                                    <div className="mt-6 border-t border-slate-100 pt-6">
                                        <h4 className="text-sm font-bold text-slate-900">Tagihan Pembayaran</h4>
                                        <ul className="mt-3 space-y-2">
                                            {result.invoices.map((inv) => {
                                                const im = invoiceMeta[inv.status] ?? invoiceMeta.unpaid;
                                                return (
                                                    <li key={inv.invoice_no} className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 rounded-2xl bg-slate-50 p-3.5 xs:px-4 xs:py-3 text-xs">
                                                        <div>
                                                            <p className="font-mono font-bold text-slate-800">{inv.invoice_no}</p>
                                                            <p className="mt-0.5 text-slate-500">
                                                                Rp {Number(inv.amount ?? 0).toLocaleString('id-ID')} • Jatuh tempo {formatDate(inv.due_date)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 self-start xs:self-auto">
                                                            <Badge variant={im.variant}>{im.label}</Badge>
                                                            {inv.status !== 'paid' && (
                                                                <Link
                                                                    href="/portal/tagihan"
                                                                    className="rounded-full bg-brand-primary px-3 py-1.5 font-bold text-white transition hover:opacity-90"
                                                                >
                                                                    Bayar di Portal
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                            </div>
                        )}

                        {searched && !result && (
                            <div className="mt-8">
                                <EmptyState
                                    title="Data Tidak Ditemukan"
                                    description="Nomor tiket dan WhatsApp tidak cocok dengan data kami. Periksa kembali penulisan tiket (contoh: ALC-2026-00001)."
                                />
                                <div className="mt-4 text-center">
                                    <Link href="/pendaftaran" className="text-sm font-bold text-brand-primary hover:underline">
                                        Daftar baru
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
}
