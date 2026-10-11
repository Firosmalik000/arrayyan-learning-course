import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ActionDropdown,
    FlashMessage,
    Modal,
    PageHeader,
    Pagination,
    SearchInput,
    StatCards,
    StatusBadge,
    showToast,
} from '@/Components/Admin';

const icons = {
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
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    copy: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
    ),
    external: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
    ),
};

const statusTone = (status) => {
    const map = {
        unpaid: 'amber',
        pending: 'violet',
        paid: 'emerald',
        expired: 'slate',
        rejected: 'red',
    };
    return map[status] || 'amber';
};

const statusLabel = (status) => {
    const map = {
        unpaid: 'Belum Bayar',
        pending: 'Menunggu Konfirmasi',
        paid: 'Lunas',
        expired: 'Kedaluwarsa',
        rejected: 'Ditolak',
    };
    return map[status] || status;
};

const statusBadge = (status) => (
    <StatusBadge tone={statusTone(status)}>{statusLabel(status)}</StatusBadge>
);

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
    const [detailModal, setDetailModal] = useState(null);
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
        if (!verifyModal) return;
        router.post(`/admin/keuangan/invoice/${verifyModal.id}/confirm`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setVerifyModal(null);
                setDetailModal(null);
            },
        });
    };

    const confirmReject = () => {
        if (!rejectModal) return;
        router.post(`/admin/keuangan/invoice/${rejectModal.id}/decline`, {
            note: adminNote,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModal(null);
                setDetailModal(null);
                setAdminNote('');
            },
        });
    };

    const statCards = [
        { label: 'Total Tagihan', value: stats.total ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Belum Bayar', value: stats.unpaid ?? 0, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Menunggu Konfirmasi', value: stats.pending ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Lunas', value: stats.paid ?? 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ];

    return (
        <>
            <Head title="Keuangan" />

            <div className="space-y-6">
                <PageHeader
                    title="Keuangan"
                    subtitle={`Kelola tagihan dan verifikasi pembayaran — total lunas ${formatRupiah(stats.paid_total)}`}
                    actions={canExport && (
                        <a
                            href={`/admin/keuangan/export${status ? `?status=${status}` : ''}`}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                        >
                            Export CSV
                        </a>
                    )}
                />
                <p className="-mt-3 text-xs text-slate-500">Export mengikuti filter status yang aktif.</p>

                <FlashMessage flash={flash} />

                <StatCards items={statCards} />

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Cari no. tagihan / nama..."
                        />
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                            <option value="">Semua Status</option>
                            <option value="unpaid">Belum Bayar</option>
                            <option value="pending">Menunggu Konfirmasi</option>
                            <option value="paid">Lunas</option>
                            <option value="expired">Kedaluwarsa</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="w-12 px-4 py-3 text-center font-medium">No</th>
                                    <th className="w-14 px-4 py-3 text-center font-medium">Aksi</th>
                                    <th className="px-5 py-3 font-medium">No. Tagihan</th>
                                    <th className="px-5 py-3 font-medium">Siswa</th>
                                    <th className="px-5 py-3 font-medium">Program</th>
                                    <th className="px-5 py-3 font-medium">Nominal</th>
                                    <th className="px-5 py-3 font-medium">Bukti</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Jatuh Tempo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((item, idx) => {
                                    const rowNum = (meta?.from ?? 1) + idx;

                                    const actions = [
                                        {
                                            label: 'Detail Tagihan',
                                            icon: icons.eye,
                                            onClick: () => setDetailModal(item),
                                        },
                                        item.proof_url && {
                                            label: `Lihat Bukti Bayar${item.payments_count > 1 ? ` (${item.payments_count})` : ''}`,
                                            icon: icons.external,
                                            href: item.proof_url,
                                            external: true,
                                        },
                                        item.status !== 'paid' && canVerify && {
                                            label: 'Konfirmasi Tagihan',
                                            icon: icons.check,
                                            onClick: () => setVerifyModal(item),
                                        },
                                        item.status === 'pending' && canReject && {
                                            label: 'Tolak Pembayaran',
                                            icon: icons.x,
                                            danger: true,
                                            onClick: () => {
                                                setRejectModal(item);
                                                setAdminNote('');
                                            },
                                        },
                                        {
                                            label: 'Salin No. Tagihan',
                                            icon: icons.copy,
                                            onClick: () => {
                                                navigator.clipboard.writeText(item.invoice_no);
                                                showToast.success(`No. tagihan ${item.invoice_no} berhasil disalin.`);
                                            },
                                        },
                                    ].filter(Boolean);

                                    return (
                                        <tr key={item.id} className="transition hover:bg-slate-50">
                                            <td className="px-4 py-4 text-center font-semibold text-slate-400">
                                                {rowNum}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <ActionDropdown actions={actions} />
                                            </td>
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
                                        </tr>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        meta={meta}
                        perPage={filters.per_page ?? 10}
                        onPage={(page) => fetchPage({ page })}
                        onPerPageChange={(per_page) => fetchPage({ per_page, page: 1 })}
                    />
                </div>
            </div>

            {/* Verify Modal */}
            <Modal isOpen={!!verifyModal} onClose={() => setVerifyModal(null)} title="Konfirmasi Tagihan" size="sm">
                {verifyModal && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Tandai tagihan <span className="font-mono font-semibold text-slate-800">{verifyModal.invoice_no}</span> ({formatRupiah(verifyModal.amount)}) sebagai <span className="font-semibold text-emerald-700">LUNAS</span>?
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
                                {icons.check} Ya, Konfirmasi Lunas
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
                            Tolak bukti tagihan <span className="font-mono font-semibold text-slate-800">{rejectModal.invoice_no}</span>? Wali murid akan menerima pemberitahuan untuk mengunggah ulang.
                        </p>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Alasan Penolakan (opsional, terlihat wali murid)
                            </label>
                            <textarea
                                rows="3"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Contoh: Nominal transfer tidak sesuai, bukti buram atau terpotong."
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

            {/* Detail Modal */}
            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Tagihan" size="md">
                {detailModal && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                            <div>
                                <p className="text-xs text-slate-500">Nomor Tagihan</p>
                                <p className="font-mono text-sm font-bold text-slate-900">{detailModal.invoice_no}</p>
                            </div>
                            <div>
                                {statusBadge(detailModal.status)}
                            </div>
                        </div>

                        <div className="space-y-2.5 text-xs text-slate-600 divide-y divide-slate-100">
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Siswa</span>
                                <span className="font-semibold text-slate-800">{detailModal.student_name}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Kontak Orang Tua / Siswa</span>
                                <span className="font-semibold text-slate-800">{detailModal.contact}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Program</span>
                                <span className="font-semibold text-slate-800">{detailModal.program}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Nominal Tagihan</span>
                                <span className="font-bold text-base text-slate-900">{formatRupiah(detailModal.amount)}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-400">Jatuh Tempo</span>
                                <span className="font-semibold text-slate-800">
                                    {detailModal.due_date ? new Date(detailModal.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            {detailModal.paid_at && (
                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-400">Tanggal Lunas</span>
                                    <span className="font-semibold text-emerald-700">
                                        {new Date(detailModal.paid_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            )}
                            <div className="pt-2">
                                <p className="text-slate-500 font-semibold mb-2">Bukti Pembayaran</p>
                                {detailModal.proof_url ? (
                                    <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-violet-900">Dokumen Bukti</span>
                                            <a
                                                href={detailModal.proof_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700 transition"
                                            >
                                                {icons.external} Buka Dokumen Bukti
                                            </a>
                                        </div>
                                        {detailModal.proof_note && (
                                            <p className="text-xs text-slate-600 bg-white/80 rounded-lg p-2 border border-violet-100">
                                                <span className="font-semibold text-slate-700">Catatan Pembayar:</span> {detailModal.proof_note}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-400 italic">Belum ada bukti pembayaran yang diunggah.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(detailModal.invoice_no);
                                    showToast.success(`No. tagihan ${detailModal.invoice_no} berhasil disalin.`);
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1.5"
                            >
                                {icons.copy} Salin No. Tagihan
                            </button>
                            <div className="flex items-center gap-2">
                                {detailModal.status === 'pending' && canReject && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const target = detailModal;
                                            setDetailModal(null);
                                            setRejectModal(target);
                                            setAdminNote('');
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                    >
                                        {icons.x} Tolak
                                    </button>
                                )}
                                {detailModal.status !== 'paid' && canVerify && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const target = detailModal;
                                            setDetailModal(null);
                                            setVerifyModal(target);
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
                                    >
                                        {icons.check} Konfirmasi Tagihan
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setDetailModal(null)}
                                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
