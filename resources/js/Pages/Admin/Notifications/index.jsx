import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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

const statusBadge = (status) => {
    const map = {
        sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        failed: 'border-red-200 bg-red-50 text-red-700',
        queued: 'border-amber-200 bg-amber-50 text-amber-700',
    };
    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || map.queued}`}>
            {status}
        </span>
    );
};

export default function Notifications() {
    const { logs, events = [], filters = {} } = usePage().props;
    const rows = logs?.data ?? [];
    const meta = logs?.meta ?? null;

    const [search, setSearch] = useState(filters.search ?? '');
    const [event, setEvent] = useState(filters.event ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [expanded, setExpanded] = useState(null);

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
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pusat Notifikasi</h1>
                    <p className="mt-1 text-sm text-slate-600">Jejak pesan WhatsApp yang dikirim sistem (termasuk yang gagal).</p>
                </div>

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
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Waktu</th>
                                    <th className="px-5 py-3 font-medium">Event</th>
                                    <th className="px-5 py-3 font-medium">Penerima</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Pesan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
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
                                                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                                                className="text-left hover:text-slate-900"
                                            >
                                                {expanded === log.id ? log.message : `${String(log.message || '').slice(0, 80)}${String(log.message || '').length > 80 ? '…' : ''}`}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Belum ada notifikasi.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={meta} onPage={(page) => fetchPage({ page })} />
                </div>
            </div>
        </>
    );
}
