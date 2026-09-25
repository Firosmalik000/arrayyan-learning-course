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
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rejected: 'border-red-200 bg-red-50 text-red-700',
    };
    const labelMap = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' };
    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || map.pending}`}>
            {labelMap[status] || status}
        </span>
    );
};

const feeBadge = (feeStatus) => {
    const map = {
        free: 'bg-slate-100 text-slate-600',
        unpaid: 'bg-amber-100 text-amber-700',
        paid: 'bg-emerald-100 text-emerald-700',
    };
    const labelMap = { free: 'Gratis', unpaid: 'Belum Bayar', paid: 'Lunas' };
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[feeStatus] || map.free}`}>
            {labelMap[feeStatus] || feeStatus}
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

export default function OlympiadRegistrations() {
    const {
        registrations,
        stats = { total: 0, pending: 0, approved: 0, rejected: 0 },
        olympiads = [],
        filters = {},
        flash,
        allowedActions = {},
    } = usePage().props;

    const rows = registrations?.data ?? [];
    const meta = registrations?.meta ?? null;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'pending');
    const [olympiadId, setOlympiadId] = useState(filters.olympiad_id ? String(filters.olympiad_id) : '');
    const [rejectModal, setRejectModal] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);

    const can = (action) => (allowedActions.olimpiade ?? []).includes(action);
    const canApprove = can('approve');
    const canReject = can('reject');
    const canDelete = can('delete');

    const fetchPage = (overrides = {}) => {
        router.get('/admin/olimpiade/pendaftaran', {
            search,
            status,
            olympiad_id: olympiadId || null,
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
        const timer = setTimeout(() => fetchPage({ page: 1 }), 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status, olympiadId]);

    const handleApprove = (id) => {
        router.post(`/admin/olimpiade/pendaftaran/${id}/approve`, {}, { preserveScroll: true });
    };

    const confirmReject = () => {
        if (!rejectModal) return;
        router.post(`/admin/olimpiade/pendaftaran/${rejectModal.id}/reject`, {
            admin_note: adminNote,
        }, {
            preserveScroll: true,
            onSuccess: () => { setRejectModal(null); setAdminNote(''); },
        });
    };

    const handleFeePaid = (id) => {
        router.post(`/admin/olimpiade/pendaftaran/${id}/fee-paid`, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deleteModal) return;
        router.delete(`/admin/olimpiade/pendaftaran/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal(null),
        });
    };

    const statCards = [
        { label: 'Total', value: stats.total ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Pending', value: stats.pending ?? 0, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Disetujui', value: stats.approved ?? 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Ditolak', value: stats.rejected ?? 0, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    return (
        <>
            <Head title="Pendaftar Lomba" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pendaftar Lomba</h1>
                    <p className="mt-1 text-sm text-slate-600">Kelola peserta olimpiade yang mendaftar.</p>
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
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama / tiket / sekolah..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select value={olympiadId} onChange={(e) => setOlympiadId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                <option value="">Semua Lomba</option>
                                {olympiads.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Tiket</th>
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Lomba</th>
                                    <th className="px-5 py-3 font-medium">Kontak</th>
                                    <th className="px-5 py-3 font-medium">Biaya</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-800">{item.ticket_no}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.school || '-'} • {item.level || '-'}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{item.olympiad}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.contact}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {feeBadge(item.fee_status)}
                                                {item.fee_status === 'unpaid' && canApprove && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFeePaid(item.id)}
                                                        className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 underline hover:bg-emerald-50"
                                                        title="Tandai lunas"
                                                    >
                                                        Lunas?
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">{statusBadge(item.status)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                {item.status === 'pending' && canApprove && (
                                                    <button type="button" onClick={() => handleApprove(item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-100 hover:text-emerald-600" title="Setujui">
                                                        {icons.check}
                                                    </button>
                                                )}
                                                {item.status === 'pending' && canReject && (
                                                    <button type="button" onClick={() => { setRejectModal(item); setAdminNote(''); }} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-600" title="Tolak">
                                                        {icons.x}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button type="button" onClick={() => setDeleteModal(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Hapus">
                                                        {icons.trash}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={meta} onPage={(page) => fetchPage({ page })} />
                </div>
            </div>

            {/* Reject Modal */}
            <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Tolak Peserta" size="md">
                {rejectModal && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Tolak <span className="font-semibold text-slate-800">{rejectModal.name}</span>{' '}
                            <span className="font-mono text-xs">({rejectModal.ticket_no})</span>?
                        </p>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Alasan (opsional)
                            </label>
                            <textarea
                                rows="3"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => setRejectModal(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                Batal
                            </button>
                            <button type="button" onClick={confirmReject} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                {icons.x} Ya, Tolak
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Konfirmasi Hapus" size="sm">
                <div className="text-center">
                    <p className="text-slate-600">
                        Hapus <span className="font-semibold text-slate-800">{deleteModal?.name}</span>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setDeleteModal(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={handleDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
