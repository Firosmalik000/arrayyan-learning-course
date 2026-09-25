import { Link, router, useForm, usePage } from '@inertiajs/react';
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
    unpaid: { label: 'Belum Bayar', variant: 'warning' },
    pending: { label: 'Menunggu Verifikasi', variant: 'primary' },
    paid: { label: 'Lunas', variant: 'success' },
    expired: { label: 'Kedaluwarsa', variant: 'neutral' },
    rejected: { label: 'Ditolak', variant: 'rose' },
};

const formatRupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

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

export default function Payment() {
    const { props } = usePage();
    const { language } = useI18n();
    const [invoice, setInvoice] = useState(props.invoice ?? '');
    const [phone, setPhone] = useState(props.phone ?? '');

    const result = props.result ?? null;
    const searched = props.searched ?? false;
    const flashSuccess = props.flash?.success;
    const flashError = props.flash?.error;
    const meta = result ? statusMeta[result.status] ?? statusMeta.unpaid : null;
    const canUpload = result && result.status !== 'paid';

    const uploadForm = useForm({ proof: null, note: '' });

    const handleLookup = (event) => {
        event.preventDefault();
        router.get('/pembayaran', { invoice, phone }, { preserveState: true, replace: true });
    };

    const handleUpload = (event) => {
        event.preventDefault();
        uploadForm.transform((data) => ({
            ...data,
            phone,
        }));
        uploadForm.post(`/bayar/${result.id}/upload`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => uploadForm.reset(),
        });
    };

    const inputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100';

    return (
        <>
            <SeoHead
                title={language === 'en' ? 'Payment' : 'Pembayaran'}
                description={
                    language === 'en'
                        ? 'Pay your Ar Rayyan Learning Course invoice and upload the proof.'
                        : 'Bayar tagihan Ar Rayyan Learning Course dan unggah bukti pembayaran.'
                }
            />

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pb-12 pt-10">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="font-bold text-brand-primary">Pembayaran</span>
                    </nav>
                    <SectionHeader
                        eyebrow="Tagihan & Bukti Bayar"
                        title="Pembayaran Tagihan"
                        subtitle="Masukkan nomor tagihan dan nomor WhatsApp untuk melihat tagihan dan mengunggah bukti bayar."
                        align="center"
                    />
                </Container>
            </section>

            <section className="bg-slate-50/40 py-12 sm:py-16">
                <Container>
                    <div className="mx-auto max-w-2xl">
                        {flashSuccess && (
                            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                {flashSuccess}
                            </div>
                        )}
                        {flashError && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {flashError}
                            </div>
                        )}

                        <form
                            onSubmit={handleLookup}
                            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                        Nomor Tagihan
                                    </label>
                                    <input
                                        type="text"
                                        value={invoice}
                                        onChange={(e) => setInvoice(e.target.value.toUpperCase())}
                                        placeholder="INV-2026-00001"
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
                                Lihat Tagihan
                            </Button>
                        </form>

                        {result && (
                            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {result.invoice_no}
                                        </p>
                                        <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                                            {result.student_name}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">{result.program}</p>
                                    </div>
                                    <Badge variant={meta.variant}>{meta.label}</Badge>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">Nominal</p>
                                        <p className="mt-1 font-display text-lg font-bold text-slate-900">
                                            {formatRupiah(result.amount)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">Jatuh Tempo</p>
                                        <p className="mt-1 font-display text-lg font-bold text-slate-900">
                                            {formatDate(result.due_date)}
                                        </p>
                                    </div>
                                </div>

                                {result.status === 'rejected' && result.admin_note && (
                                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                        <p className="font-bold">Catatan Admin</p>
                                        <p className="mt-1">{result.admin_note}</p>
                                    </div>
                                )}

                                {canUpload && (
                                    <form onSubmit={handleUpload} className="mt-6 border-t border-slate-100 pt-6">
                                        <h4 className="text-sm font-bold text-slate-900">Unggah Bukti Pembayaran</h4>
                                        <div className="mt-3 space-y-3">
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                onChange={(e) => uploadForm.setData('proof', e.target.files[0])}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2 text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-violet-200"
                                            />
                                            {uploadForm.errors.proof && (
                                                <p className="text-xs text-rose-500">{uploadForm.errors.proof}</p>
                                            )}
                                            <input
                                                type="text"
                                                value={uploadForm.data.note}
                                                onChange={(e) => uploadForm.setData('note', e.target.value)}
                                                placeholder="Catatan (opsional: nama pengirim, bank, tanggal transfer)"
                                                className={inputClass}
                                            />
                                            <Button
                                                type="submit"
                                                variant="accent"
                                                className="w-full"
                                                loading={uploadForm.processing}
                                            >
                                                Kirim Bukti Bayar
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {result.payments?.length > 0 && (
                                    <div className="mt-6 border-t border-slate-100 pt-6">
                                        <h4 className="text-sm font-bold text-slate-900">Riwayat Bukti ({result.payments.length})</h4>
                                        <ul className="mt-3 space-y-2">
                                            {result.payments.map((p) => (
                                                <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
                                                    <div>
                                                        <a href={p.proof_url} target="_blank" rel="noreferrer" className="font-bold text-brand-primary hover:underline">
                                                            Lihat Bukti
                                                        </a>
                                                        {p.note && <p className="mt-0.5 text-slate-500">{p.note}</p>}
                                                    </div>
                                                    <span className="shrink-0 text-slate-500">{formatDate(p.created_at)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {searched && !result && (
                            <div className="mt-8">
                                <EmptyState
                                    title="Tagihan Tidak Ditemukan"
                                    description="Nomor tagihan dan WhatsApp tidak cocok dengan data kami."
                                />
                            </div>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
}
