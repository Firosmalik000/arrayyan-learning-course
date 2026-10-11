import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ActionDropdown, Modal, PageHeader, Pagination, StatusBadge } from '@/Components/Admin';

const icons = {
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const formatDateTime = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return '-';
    }
};

const statusTone = (status) => {
    const map = { sent: 'emerald', failed: 'red', queued: 'amber' };
    return map[status] || 'amber';
};

const statusBadge = (status) => (
    <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
);

export default function Notifications() {
    const { logs, events = [], filters = {} } = usePage().props;
    const rows = logs?.data ?? [];
    const meta = logs?.meta ?? null;

    const [search, setSearch] = useState(filters.search ?? '');
    const [event, setEvent] = useState(filters.event ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchPage = (overrides = {}) => {
        router.get('/admin/notifikasi', {
            search, event, status,
            page: meta?.current_page ?? 1,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
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
    }, [search, event, status]);

    return (
        <>
            <Head title="Pusat Notifikasi" />

            <div className="space-y-6">
                <PageHeader
                    title="Pusat Notifikasi"
                    subtitle="Jejak pesan WhatsApp yang dikirim sistem (termasuk yang gagal)."
                />

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor / isi pesan..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:max-w-xs"
                        />
                        <div className="flex flex-wrap gap-2">
                            <select value={event} onChange={(e) => setEvent(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                <option value="">Semua Event</option>
                                {events.map((ev) => (
                                    <option key={ev} value={ev}>{ev}</option>
                                ))}
                            </select>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                <option value="">Semua Status</option>
                                <option value="sent">Terkirim</option>
                                <option value="failed">Gagal</option>
                                <option value="queued">Antre</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="w-12 px-4 py-3 text-center font-medium">No</th>
                                    <th className="w-14 px-4 py-3 text-center font-medium">Aksi</th>
                                    <th className="px-5 py-3 font-medium">Waktu</th>
                                    <th className="px-5 py-3 font-medium">Event</th>
                                    <th className="px-5 py-3 font-medium">Penerima</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Pesan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((log, idx) => {
                                    const rowNum = (meta?.from ?? 1) + idx;
                                    const actions = [
                                        {
                                            label: 'Detail Notifikasi',
                                            icon: icons.eye,
                                            onClick: () => setSelectedLog(log),
                                        },
                                    ];

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-center font-semibold text-slate-400">
                                                {rowNum}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <ActionDropdown actions={actions} />
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{formatDateTime(log.created_at)}</td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-700">{log.event}</td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-700">{log.recipient}</td>
                                            <td className="px-5 py-3">
                                                {statusBadge(log.status)}
                                                {log.status === 'failed' && log.error && (
                                                    <p className="mt-1 max-w-48 truncate text-xs text-red-500" title={log.error}>{log.error}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-600">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="text-left hover:text-slate-900 line-clamp-2"
                                                >
                                                    {log.message}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">Belum ada notifikasi.</td></tr>
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

            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Detail Pesan Notifikasi"
                size="md"
            >
                {selectedLog && (
                    <div className="space-y-3 text-sm text-slate-600">
                        <div>
                            <span className="text-xs text-slate-400">Waktu</span>
                            <p className="font-semibold text-slate-800">{formatDateTime(selectedLog.created_at)}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Penerima</span>
                            <p className="font-mono text-xs font-semibold text-slate-800">{selectedLog.recipient}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Event & Status</span>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-700">{selectedLog.event}</span>
                                {statusBadge(selectedLog.status)}
                            </div>
                        </div>
                        {selectedLog.error && (
                            <div>
                                <span className="text-xs text-slate-400">Error Info</span>
                                <p className="mt-1 rounded-xl bg-red-50 p-2 text-xs font-mono text-red-600">{selectedLog.error}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-xs text-slate-400">Isi Pesan</span>
                            <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs font-mono text-slate-800">{selectedLog.message}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
