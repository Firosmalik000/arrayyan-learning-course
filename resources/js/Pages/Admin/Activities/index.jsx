import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { PageHeader, Pagination } from '@/Components/Admin';

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

export default function Activities() {
    const { logs, events = [], filters = {} } = usePage().props;
    const rows = logs?.data ?? [];
    const meta = logs?.meta ?? null;

    const [search, setSearch] = useState(filters.search ?? '');
    const [event, setEvent] = useState(filters.event ?? '');

    const fetchPage = (overrides = {}) => {
        router.get('/admin/aktivitas', {
            search, event,
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
    }, [search, event]);

    return (
        <>
            <Head title="Log Aktivitas" />

            <div className="space-y-6">
                <PageHeader
                    title="Log Aktivitas"
                    subtitle="Siapa melakukan apa dan kapan — jejak audit aksi admin."
                />

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari aksi / pelaku..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:max-w-xs"
                        />
                        <select value={event} onChange={(e) => setEvent(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                            <option value="">Semua Event</option>
                            {events.map((ev) => (
                                <option key={ev} value={ev}>{ev}</option>
                            ))}
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Waktu</th>
                                    <th className="px-5 py-3 font-medium">Event</th>
                                    <th className="px-5 py-3 font-medium">Deskripsi</th>
                                    <th className="px-5 py-3 font-medium">Pelaku</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{formatDateTime(log.created_at)}</td>
                                        <td className="px-5 py-3 font-mono text-xs text-slate-700">{log.event}</td>
                                        <td className="px-5 py-3 text-slate-700">{log.description}</td>
                                        <td className="px-5 py-3 text-slate-600">{log.caused_by_name || '-'}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">Belum ada aktivitas tercatat.</td></tr>
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
