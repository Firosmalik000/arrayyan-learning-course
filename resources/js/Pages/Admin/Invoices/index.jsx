import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const icons = {
    search: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    check: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    x: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    close: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

const statusBadge = (status) => {
    const map = {
        unpaid: 'border-amber-200 bg-amber-50 text-amber-700',
        pending: 'border-violet-200 bg-violet-50 text-violet-700',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        expired: 'border-slate-200 bg-slate-100 text-slate-600',
        rejected: 'border-red-200 bg-red-50 text-red-700',
    };
    const labelMap = {
        unpaid: 'Belum Bayar',
        pending: 'Menunggu Verifikasi',
        paid: 'Lunas',
        expired: 'Kedaluwarsa',
        rejected: 'Ditolak',
    };
    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || map.unpaid}`}>
            {labelMap[status] || status}
        </span>
    );
};

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;
    const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-2xl`}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            {icons.close}
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

function Pagination({ meta, onPage }) {
    if (!meta || meta.last_page <= 1) return null;
    const btnClass = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50';
    return (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
                Hal {meta.current_page} dari {meta.last_page} — {meta.total} data
            </p>
            <div className="flex gap-2">
                <button type="button" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)} className={btnClass}>
                    Sebelumnya
                </button>
                <button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)} className={btnClass}>
                    Berikutnya
                </button>
            </div>
        </div>
    );
}

const formatRupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

export default function Invoices() {
    const {
        invoices,
        stats = { total: 0, unpaid: 0, pending: 0, paid: 0, expired: 0, rejected: 0, paid_total: 0 },
        filters = {},
        flash,
        allowedActions = {},
    } = usePage().props;

    const rows = invoices?.data ?? [];
    const meta = invoices?.meta ?? null;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [verifyModal, setVerifyModal] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    const can = (action) => (allowedActions.keuangan ?? []).includes(action);
    const canVerify = can('approve');
    const canReject = can('reject');
    const canExport = can('export');

    const fetchPage = (overrides = {}) => {
        router.get('/admin/keuangan', {
            search,
            status,
            page: meta?.current_page ?? 1,
            ...overrides,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchPage({ page: 1 });
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status]);

    const confirmVerify = () => {
        if (!verifyModal?.latest_payment) return;
        router.post(`/admin/keuangan/payment/${verifyModal.latest_payment.id}/verify`, {}, {
            preserveScroll: true,
            onSuccess: () => setVerifyModal(null),
        });
    };

    const confirmReject = () => {
        if (!rejectModal?.latest_payment) return;
        router.post(`/admin/keuangan/payment/${rejectModal.latest_payment.id}/decline`, {
            note: adminNote,
        }, {
            preserveScroll: true,
            onSuccess: () => { setRejectModal(null); setAdminNote(''); },
        });
    };

    const statCards = [
        { label: 'Total Tagihan', value: stats.total ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Belum Bayar', value: stats.unpaid ?? 0, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Menunggu Verifikasi', value: stats.pending ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Lunas', value: stats.paid ?? 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ];

    return (
        <>
            <Head title="Keuangan" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Keuangan</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Kelola tagihan dan verifikasi pembayaran — total lunas {formatRupiah(stats.paid_total)}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">Export mengikuti filter status yang aktif.</p>
                    {canExport && (
                        <a
                            href={`/admin/keuangan/export${status ? `?status=${status}` : ''}`}
                            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                        >
                            Export CSV
                        </a>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statCards.map((stat) => (
                        <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
                            <p className="text-sm font-medium">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari no. tagihan / nama..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                            <option value="">Semua Status</option>
                            <option value="unpaid">Belum Bayar</option>
                            <option value="pending">Menunggu Verifikasi</option>
                            <option value="paid">Lunas</option>
                            <option value="expired">Kedaluwarsa</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">No. Tagihan</th>
                                    <th className="px-5 py-3 font-medium">Siswa</th>
                                    <th className="px-5 py-3 font-medium">Program</th>
                                    <th className="px-5 py-3 font-medium">Nominal</th>
                                    <th className="px-5 py-3 font-medium">Bukti</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Jatuh Tempo</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-800">{item.invoice_no}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">{item.student_name}</p>
                                            <p className="text-xs text-slate-500">{item.contact}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{item.program}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">{formatRupiah(item.amount)}</td>
                                        <td className="px-5 py-4">
                                            {item.proof_url ? (
                                                <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-violet-600 underline hover:text-violet-800">
                                                    Lihat{item.payments_count > 1 ? ` (${item.payments_count})` : ''}
                                                </a>
                                            ) : <span className="text-slate-400">-</span>}
                                        </td>
                                        <td className="px-5 py-4">{statusBadge(item.status)}</td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {item.due_date ? new Date(item.due_date).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                {item.status === 'pending' && item.latest_payment?.status === 'pending' && canVerify && (
                                                    <button type="button" onClick={() => setVerifyModal(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-100 hover:text-emerald-600" title="Verifikasi Lunas">
                                                        {icons.check}
                                                    </button>
                                                )}
                                                {item.status === 'pending' && item.latest_payment?.status === 'pending' && canReject && (
                                                    <button type="button" onClick={() => { setRejectModal(item); setAdminNote(''); }} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-600" title="Tolak">
                                                        {icons.x}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={meta} onPage={(page) => fetchPage({ page })} />
                </div>
            </div>

            {/* Verify Modal */}
            <Modal isOpen={!!verifyModal} onClose={() => setVerifyModal(null)} title="Verifikasi Pelunasan" size="sm">
                {verifyModal && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Tandai <span className="font-mono font-semibold text-slate-800">{verifyModal.invoice_no}</span> ({formatRupiah(verifyModal.amount)}) sebagai <span className="font-semibold text-emerald-700">LUNAS</span>?
                        </p>
                        {verifyModal.proof_url && (
                            <a href={verifyModal.proof_url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-sm font-semibold text-violet-600 hover:underline">
                                Lihat Bukti Pembayaran
                            </a>
                        )}
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => setVerifyModal(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                                Batal
                            </button>
                            <button type="button" onClick={confirmVerify} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                {icons.check} Ya, Lunas
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Tolak Bukti Pembayaran" size="md">
                {rejectModal && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Tolak bukti <span className="font-mono font-semibold text-slate-800">{rejectModal.invoice_no}</span>? Pendaftar bisa mengunggah ulang.
                        </p>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Alasan (opsional, terlihat pendaftar)
                            </label>
                            <textarea
                                rows="3"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Contoh: Nominal transfer tidak sesuai, bukti buram."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => setRejectModal(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                                Batal
                            </button>
                            <button type="button" onClick={confirmReject} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                                {icons.x} Ya, Tolak
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
