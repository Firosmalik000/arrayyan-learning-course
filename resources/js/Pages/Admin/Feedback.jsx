import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FlashMessage, Modal, PageHeader, Pagination, SearchInput, StatusBadge } from '@/Components/Admin';

const replyFilterOptions = [
    { value: '', label: 'Semua Status Balasan' },
    { value: 'unreplied', label: 'Belum Dibalas' },
    { value: 'replied', label: 'Sudah Dibalas' },
];

const EyeIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const StarIcon = ({ filled = true, className = 'h-4 w-4' }) => (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} aria-hidden="true">
        <path d="m12 2.75 2.87 5.82 6.42.93-4.65 4.53 1.1 6.4L12 17.41l-5.74 3.02 1.1-6.4L2.71 9.5l6.42-.93L12 2.75Z" />
    </svg>
);

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
    </svg>
);

const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function Feedback() {
    const { submissions, stats = {}, categories = {}, filters = {}, flash, allowedActions = {} } = usePage().props;
    const rows = submissions?.data ?? [];
    const meta = submissions?.meta ?? null;
    const fromIndex = submissions?.from ?? ((submissions?.current_page ?? meta?.current_page ?? 1) - 1) * (submissions?.per_page ?? meta?.per_page ?? 10) + 1;

    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [rating, setRating] = useState(filters.rating ? String(filters.rating) : '');
    const [selected, setSelected] = useState(null);

    const replyForm = useForm({
        admin_reply: '',
        admin_notes: '',
    });
    const canEdit = (allowedActions['kritik-saran'] ?? []).includes('edit');

    const fetchPage = (overrides = {}) => {
        router.get('/admin/kritik-saran', {
            search,
            category,
            status,
            rating,
            page: meta?.current_page ?? submissions?.current_page ?? 1,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const timer = setTimeout(() => fetchPage({ page: 1 }), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category, status, rating]);

    const openDetail = (item) => {
        setSelected(item);
        replyForm.setData({
            admin_reply: item.admin_reply ?? '',
            admin_notes: item.admin_notes ?? '',
        });
        replyForm.clearErrors();
    };

    const closeDetail = () => {
        setSelected(null);
        replyForm.reset();
        replyForm.clearErrors();
    };

    const submitReply = (event) => {
        event.preventDefault();
        if (!selected) return;

        replyForm.patch(`/admin/kritik-saran/${selected.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeDetail();
            },
        });
    };

    const summary = [
        { label: 'Total Masukan', value: stats.total ?? 0, valueClass: 'text-slate-950' },
        { label: 'Belum Dibalas', value: stats.unreplied ?? 0, valueClass: 'text-amber-700' },
        { label: 'Sudah Dibalas', value: stats.replied ?? 0, valueClass: 'text-emerald-700' },
        { label: 'Rata-rata Rating', value: `${stats.average_rating ?? 0}/5`, valueClass: 'text-sky-700' },
    ];

    return (
        <>
            <Head title="Kritik & Saran" />

            <div className="space-y-6">
                <PageHeader title="Kritik & Saran" />
                <FlashMessage flash={flash} />

                {/* Ringkasan Statistik */}
                <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm sm:grid-cols-4">
                    {summary.map((item) => (
                        <div key={item.label} className="border-b border-slate-100 px-5 py-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                            <p className={`mt-1 text-2xl font-extrabold tabular-nums ${item.valueClass}`}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter & Pencarian */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
                        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, topik, atau isi saran..." />
                        <div className="grid flex-1 gap-2 sm:grid-cols-3 lg:flex lg:justify-end">
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-violet-400"
                            >
                                <option value="">Semua Kategori</option>
                                {Object.entries(categories).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-violet-400"
                            >
                                {replyFilterOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <select
                                value={rating}
                                onChange={(event) => setRating(event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-violet-400"
                            >
                                <option value="">Semua Rating</option>
                                {[5, 4, 3, 2, 1].map((val) => (
                                    <option key={val} value={val}>{val} Bintang</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tabel Kritik & Saran Ringkas */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="w-12 px-4 py-3 text-center font-semibold">No</th>
                                    <th className="px-5 py-3 font-semibold">Pengirim</th>
                                    <th className="px-5 py-3 font-semibold">Topik & Kategori</th>
                                    <th className="px-4 py-3 text-center font-semibold">Rating</th>
                                    <th className="px-5 py-3 font-semibold">Status Balasan</th>
                                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                                    <th className="w-28 px-4 py-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((item, idx) => {
                                    const rowNumber = fromIndex + idx;
                                    const isReplied = Boolean(item.admin_reply);

                                    return (
                                        <tr key={item.id} className="transition hover:bg-slate-50/80">
                                            {/* Nomor Index */}
                                            <td className="px-4 py-4 text-center font-semibold text-slate-400 tabular-nums">
                                                {rowNumber}
                                            </td>

                                            {/* Pengirim */}
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">{item.submitter_name}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {item.student?.name ? `Siswa: ${item.student.name}` : 'Masukan umum'}
                                                </p>
                                            </td>

                                            {/* Topik & Kategori */}
                                            <td className="max-w-xs px-5 py-4">
                                                <p className="truncate font-semibold text-slate-800" title={item.subject}>
                                                    {item.subject}
                                                </p>
                                                <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                                    {categories[item.category] || item.category}
                                                </span>
                                            </td>

                                            {/* Rating */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-amber-600 tabular-nums">
                                                    <StarIcon /> {item.rating}/5
                                                </span>
                                            </td>

                                            {/* Status Balasan Admin */}
                                            <td className="px-5 py-4">
                                                {isReplied ? (
                                                    <StatusBadge tone="emerald">Sudah Dibalas</StatusBadge>
                                                ) : (
                                                    <StatusBadge tone="amber">Belum Dibalas</StatusBadge>
                                                )}
                                            </td>

                                            {/* Tanggal Masuk */}
                                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                                                {formatDateTime(item.created_at)}
                                            </td>

                                            {/* Tombol Aksi */}
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetail(item)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                                                >
                                                    <EyeIcon />
                                                    <span>Detail</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-14 text-center">
                                            <p className="font-semibold text-slate-700">Tidak ada masukan kritik & saran yang sesuai.</p>
                                            <p className="mt-1 text-xs text-slate-400">Silakan ubah filter atau kata kunci pencarian.</p>
                                        </td>
                                    </tr>
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

            {/* Modal Detail & Balasan Admin */}
            <Modal
                isOpen={Boolean(selected)}
                onClose={closeDetail}
                title="Detail Kritik & Saran"
                size="lg"
            >
                {selected && (
                    <form onSubmit={submitReply} className="space-y-6">
                        {/* Informasi Pengirim & Siswa */}
                        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pengirim</p>
                                <p className="mt-1 font-bold text-slate-900">{selected.submitter_name}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {selected.submitter_email || selected.submitter_contact || 'Kontak tidak dicantumkan'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Terkait Siswa / Kategori</p>
                                <p className="mt-1 font-bold text-slate-900">{selected.student?.name || 'Masukan Umum'}</p>
                                <p className="mt-0.5 text-xs font-medium text-violet-700">
                                    {categories[selected.category] || selected.category}
                                </p>
                            </div>
                        </div>

                        {/* Isi Masukan / Kritik & Saran */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subjek Masukan</span>
                                    <h3 className="mt-0.5 text-base font-bold text-slate-900">{selected.subject}</h3>
                                </div>
                                <div className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 font-bold text-amber-700">
                                    <StarIcon />
                                    <span className="text-sm tabular-nums">{selected.rating} / 5</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Isi Pesan</span>
                                <p className="mt-1.5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                                    {selected.message}
                                </p>
                            </div>

                            <p className="mt-3 text-right text-xs text-slate-400">
                                Dikirim pada: {formatDateTime(selected.created_at)}
                            </p>
                        </div>

                        {/* Bagian Fitur Balasan Admin */}
                        <div className="space-y-4 border-t border-slate-100 pt-5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                                        <ChatIcon />
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Balasan dari Admin</h4>
                                        <p className="text-xs text-slate-500">Tanggapan ini akan dapat dibaca oleh pengirim / orang tua di portal.</p>
                                    </div>
                                </div>

                                {selected.replied_at && (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                        Terakhir dibalas: {formatDateTime(selected.replied_at)}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="admin_reply" className="sr-only">Tuliskan Balasan Admin</label>
                                <textarea
                                    id="admin_reply"
                                    rows={4}
                                    maxLength={3000}
                                    value={replyForm.data.admin_reply}
                                    onChange={(event) => replyForm.setData('admin_reply', event.target.value)}
                                    disabled={!canEdit}
                                    placeholder="Tuliskan pesan balasan atau tanggapan resmi dari admin di sini..."
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                                />
                                {replyForm.errors.admin_reply && (
                                    <p className="mt-1 text-xs text-red-600">{replyForm.errors.admin_reply}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="admin_notes" className="mb-1 block text-xs font-semibold text-slate-600">
                                    Catatan Internal Tim <span className="font-normal text-slate-400">(Hanya terlihat oleh admin)</span>
                                </label>
                                <textarea
                                    id="admin_notes"
                                    rows={2}
                                    maxLength={2000}
                                    value={replyForm.data.admin_notes}
                                    onChange={(event) => replyForm.setData('admin_notes', event.target.value)}
                                    disabled={!canEdit}
                                    placeholder="Tambahkan catatan khusus tindak lanjut operasional jika diperlukan..."
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                                />
                                {replyForm.errors.admin_notes && (
                                    <p className="mt-1 text-xs text-red-600">{replyForm.errors.admin_notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeDetail}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Tutup
                            </button>
                            {canEdit && (
                                <button
                                    type="submit"
                                    disabled={replyForm.processing}
                                    className="rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {replyForm.processing ? 'Menyimpan…' : 'Simpan Balasan'}
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}
