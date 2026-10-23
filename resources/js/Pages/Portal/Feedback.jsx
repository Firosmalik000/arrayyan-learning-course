import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FlashMessage, Modal, Pagination, SearchInput, StatusBadge } from '@/Components/Admin';
import PortalLayout from '@/Layouts/PortalLayout';

const replyFilterOptions = [
    { value: '', label: 'Semua Status Balasan' },
    { value: 'unreplied', label: 'Menunggu Tanggapan' },
    { value: 'replied', label: 'Sudah Dibalas' },
];

const StarIcon = ({ filled = true, className = 'h-4 w-4' }) => (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.6} aria-hidden="true">
        <path d="m12 2.75 2.87 5.82 6.42.93-4.65 4.53 1.1 6.4L12 17.41l-5.74 3.02 1.1-6.4L2.71 9.5l6.42-.93L12 2.75Z" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
);

const EyeIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const ChatBubbleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
    </svg>
);

const SparkleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

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
    const {
        submissions,
        students = [],
        selectedStudentId,
        categories = {},
        stats = {},
        filters = {},
        myReview = null,
        publicReviews = [],
        defaultTab = 'feedback',
        flash,
    } = usePage().props;

    const rows = submissions?.data ?? [];
    const meta = submissions?.meta ?? null;
    const fromIndex = submissions?.from ?? ((submissions?.current_page ?? meta?.current_page ?? 1) - 1) * (submissions?.per_page ?? meta?.per_page ?? 10) + 1;

    // Active tab: 'feedback' | 'testimonial'
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Filter states for Feedback datatable
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [studentFilter, setStudentFilter] = useState(filters.student_id ?? '');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Feedback Submission Form
    const feedbackForm = useForm({
        student_id: selectedStudentId || '',
        category: '',
        rating: 0,
        subject: '',
        message: '',
    });

    // Public Review Form (For Landing Page Kepercayaan Keluarga ALC)
    const reviewForm = useForm({
        student_id: myReview?.student_id ?? selectedStudentId ?? '',
        student_name: myReview?.student_name ?? '',
        rating: myReview?.rating ?? 5,
        highlight: myReview?.highlight ?? 'Keluarga ALC',
        message: myReview?.message ?? '',
    });

    const fetchFeedbackPage = (overrides = {}) => {
        router.get('/portal/kritik-saran', {
            tab: 'feedback',
            search,
            category,
            status,
            student_id: studentFilter,
            page: meta?.current_page ?? submissions?.current_page ?? 1,
            per_page: filters.per_page ?? 10,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (activeTab === 'feedback') {
            const timer = setTimeout(() => fetchFeedbackPage({ page: 1 }), 400);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category, status, studentFilter]);

    const closeFeedbackForm = () => {
        if (feedbackForm.processing) return;
        setIsFormOpen(false);
        feedbackForm.clearErrors();
    };

    const submitFeedback = (event) => {
        event.preventDefault();
        feedbackForm.post('/portal/kritik-saran', {
            preserveScroll: true,
            onSuccess: () => {
                feedbackForm.reset('category', 'rating', 'subject', 'message');
                setIsFormOpen(false);
            },
        });
    };

    const submitReview = (event) => {
        event.preventDefault();
        reviewForm.post('/portal/kritik-saran/review', {
            preserveScroll: true,
            onSuccess: () => {
                // Success message handled by flash
            },
        });
    };

    const deleteReview = () => {
        if (!confirm('Apakah Anda yakin ingin menghapus ulasan publik Anda?')) return;
        router.delete('/portal/kritik-saran/review', {
            preserveScroll: true,
        });
    };

    const summaryCards = [
        { label: 'Total Masukan', value: stats.total ?? rows.length, valueClass: 'text-slate-900' },
        { label: 'Menunggu Tanggapan', value: stats.unreplied ?? 0, valueClass: 'text-amber-700' },
        { label: 'Sudah Dibalas', value: stats.replied ?? 0, valueClass: 'text-emerald-700' },
    ];

    return (
        <PortalLayout>
            <Head title="Kritik, Saran & Ulasan" />

            <div className="space-y-6">
                {/* Header Utama */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Kritik, Saran & Ulasan
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Sampaikan masukan operasional privat atau berikan ulasan publik untuk ditampilkan di halaman utama website ALC.
                        </p>
                    </div>

                    {activeTab === 'feedback' && (
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2"
                        >
                            <PlusIcon />
                            <span>Kirim Masukan</span>
                        </button>
                    )}
                </div>

                <FlashMessage flash={flash} />

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('feedback')}
                        className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                            activeTab === 'feedback'
                                ? 'border-violet-700 text-violet-700'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        }`}
                    >
                        <ChatBubbleIcon />
                        <span>Kritik & Saran Pengelola</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('testimonial')}
                        className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                            activeTab === 'testimonial'
                                ? 'border-violet-700 text-violet-700'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        }`}
                    >
                        <SparkleIcon />
                        <span>Review & Testimoni Publik (Landing Page)</span>
                        {myReview && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Aktif
                            </span>
                        )}
                    </button>
                </div>

                {/* ================= TAB 1: KRITIK & SARAN ================= */}
                {activeTab === 'feedback' && (
                    <div className="space-y-6">
                        {/* Ringkasan Statistik */}
                        <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm sm:grid-cols-3">
                            {summaryCards.map((item) => (
                                <div key={item.label} className="border-b border-slate-100 px-5 py-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                                    <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                                    <p className={`mt-1 text-2xl font-extrabold tabular-nums ${item.valueClass}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* DataTable Container */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            {/* Filter & Pencarian */}
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
                                <div className="w-full lg:max-w-xs">
                                    <SearchInput
                                        value={search}
                                        onChange={setSearch}
                                        placeholder="Cari topik atau pesan..."
                                    />
                                </div>

                                <div className="flex flex-1 flex-wrap items-center justify-start gap-2 lg:justify-end">
                                    {students.length > 1 && (
                                        <select
                                            value={studentFilter}
                                            onChange={(e) => setStudentFilter(e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-400"
                                        >
                                            <option value="">Semua Siswa</option>
                                            <option value="general">Umum</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>{student.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-400"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {Object.entries(categories).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-400"
                                    >
                                        {replyFilterOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tabel Data */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                                            <th className="w-12 px-4 py-3 text-center font-semibold">No</th>
                                            <th className="px-5 py-3 font-semibold">Tanggal</th>
                                            <th className="px-5 py-3 font-semibold">Terkait</th>
                                            <th className="px-5 py-3 font-semibold">Kategori</th>
                                            <th className="px-5 py-3 font-semibold">Topik & Isi Singkat</th>
                                            <th className="px-4 py-3 text-center font-semibold">Penilaian</th>
                                            <th className="px-5 py-3 font-semibold">Status Balasan</th>
                                            <th className="w-24 px-4 py-3 text-center font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rows.map((item, idx) => {
                                            const rowNumber = fromIndex + idx;
                                            const hasReply = Boolean(item.admin_reply);

                                            return (
                                                <tr key={item.id} className="transition hover:bg-slate-50/70">
                                                    <td className="px-4 py-4 text-center font-semibold text-slate-400 tabular-nums">
                                                        {rowNumber}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-500">
                                                        {formatDate(item.created_at)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-700">
                                                        {item.student?.name || (
                                                            <span className="italic text-slate-400">Umum</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                            {categories[item.category] || item.category}
                                                        </span>
                                                    </td>
                                                    <td className="max-w-xs px-5 py-4">
                                                        <p className="truncate font-semibold text-slate-900" title={item.subject}>
                                                            {item.subject}
                                                        </p>
                                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500" title={item.message}>
                                                            {item.message}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 tabular-nums">
                                                            <StarIcon /> {item.rating}/5
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        {hasReply ? (
                                                            <StatusBadge tone="emerald">Sudah Dibalas</StatusBadge>
                                                        ) : (
                                                            <StatusBadge tone="amber">Menunggu Tanggapan</StatusBadge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedDetail(item)}
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
                                                <td colSpan={8} className="px-6 py-14 text-center">
                                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                        <ChatBubbleIcon />
                                                    </span>
                                                    <p className="mt-3 text-sm font-bold text-slate-700">
                                                        Belum ada kritik & saran yang sesuai
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Gunakan tombol di bawah untuk menyampaikan masukan baru Anda.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsFormOpen(true)}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-violet-800"
                                                    >
                                                        <PlusIcon />
                                                        <span>Kirim Masukan Sekarang</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                meta={meta}
                                perPage={filters.per_page ?? 10}
                                onPage={(page) => fetchFeedbackPage({ page })}
                                onPerPageChange={(per_page) => fetchFeedbackPage({ per_page, page: 1 })}
                            />
                        </div>
                    </div>
                )}

                {/* ================= TAB 2: REVIEW & TESTIMONI PUBLIK ================= */}
                {activeTab === 'testimonial' && (
                    <div className="space-y-8">
                        {/* Banner Pengantar */}
                        <div className="rounded-2xl border border-violet-100 bg-linear-to-r from-violet-50 via-purple-50 to-white p-6 shadow-xs">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-200/60 px-3 py-1 text-xs font-bold text-violet-800">
                                        <SparkleIcon />
                                        <span>Kepercayaan Keluarga ALC</span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-900">
                                        Ulasan & Testimoni Publik Anda
                                    </h2>
                                    <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        Ulasan yang Anda tulis di sini akan ditampilkan secara langsung pada halaman utama website ALC di bagian <strong>"Kepercayaan Keluarga ALC"</strong> sebagai referensi nyata bagi orang tua dan siswa lainnya.
                                    </p>
                                </div>

                                {myReview && (
                                    <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs">
                                        <p className="font-bold text-emerald-800">✓ Ulasan Anda Sedang Aktif</p>
                                        <p className="text-emerald-700">Tampil di halaman depan website.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grid Form Ulasan & Preview Ulasan Saat Ini */}
                        <div className="grid gap-6 lg:grid-cols-12">
                            {/* Form Input Ulasan (7 Kolom) */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-7">
                                <h3 className="text-base font-bold text-slate-900">
                                    {myReview ? 'Perbarui Ulasan & Testimoni' : 'Tulis Ulasan & Testimoni Baru'}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Bagikan pengalaman belajar putra/putri Anda, kenyamanan sistem, atau kesan terhadap tutor ALC.
                                </p>

                                <form onSubmit={submitReview} className="mt-5 space-y-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {students.length > 0 && (
                                            <div>
                                                <label htmlFor="rev_student" className="mb-1.5 block text-xs font-bold text-slate-700">
                                                    Anak Terkait
                                                </label>
                                                <select
                                                    id="rev_student"
                                                    value={reviewForm.data.student_id}
                                                    onChange={(e) => {
                                                        const sId = e.target.value;
                                                        const matched = students.find((s) => String(s.id) === String(sId));
                                                        reviewForm.setData({
                                                            ...reviewForm.data,
                                                            student_id: sId,
                                                            student_name: matched ? matched.name : '',
                                                        });
                                                    }}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                                                >
                                                    <option value="">Umum (Seluruh Keluarga)</option>
                                                    {students.map((student) => (
                                                        <option key={student.id} value={student.id}>{student.name}</option>
                                                    ))}
                                                </select>
                                                {reviewForm.errors.student_id && (
                                                    <p className="mt-1 text-xs text-red-600">{reviewForm.errors.student_id}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className={students.length === 0 ? 'sm:col-span-2' : ''}>
                                            <label htmlFor="rev_highlight" className="mb-1.5 block text-xs font-bold text-slate-700">
                                                Kesan Singkat / Highlight <span className="text-slate-400">(Badge)</span>
                                            </label>
                                            <input
                                                id="rev_highlight"
                                                type="text"
                                                maxLength={80}
                                                placeholder="Contoh: Tutor Sangat Sabar / Nilai Naik Signifikan"
                                                value={reviewForm.data.highlight}
                                                onChange={(e) => reviewForm.setData('highlight', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                                            />
                                            {reviewForm.errors.highlight && (
                                                <p className="mt-1 text-xs text-red-600">{reviewForm.errors.highlight}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating Bintang */}
                                    <fieldset>
                                        <legend className="text-xs font-bold text-slate-700">
                                            Penilaian Kepuasan Bintang <span className="text-red-500">*</span>
                                        </legend>
                                        <div className="mt-2 flex gap-2" aria-label="Pilih bintang 1 sampai 5">
                                            {[1, 2, 3, 4, 5].map((stars) => (
                                                <label key={stars} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="review_rating"
                                                        value={stars}
                                                        checked={reviewForm.data.rating === stars}
                                                        onChange={() => reviewForm.setData('rating', stars)}
                                                        className="sr-only"
                                                    />
                                                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${reviewForm.data.rating >= stars ? 'border-amber-300 bg-amber-50 text-amber-500 shadow-2xs' : 'border-slate-200 bg-white text-slate-300 hover:border-amber-200'}`}>
                                                        <StarIcon filled={reviewForm.data.rating >= stars} className="h-5 w-5" />
                                                        <span className="sr-only">{stars} Bintang</span>
                                                    </span>
                                                </label>
                                            ))}
                                            <span className="ml-2 self-center text-xs font-bold text-amber-600">
                                                {reviewForm.data.rating} / 5 Bintang
                                            </span>
                                        </div>
                                        {reviewForm.errors.rating && (
                                            <p className="mt-1 text-xs text-red-600">{reviewForm.errors.rating}</p>
                                        )}
                                    </fieldset>

                                    {/* Isi Pesan Testimoni */}
                                    <div>
                                        <label htmlFor="rev_message" className="mb-1.5 block text-xs font-bold text-slate-700">
                                            Cerita & Testimoni Anda <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="rev_message"
                                            rows={5}
                                            maxLength={1000}
                                            placeholder="Tuliskan pengalaman nyata Anda, bagaimana bimbingan di ALC membantu anak Anda, keramahan tutor, atau kemudahan sistem portal belajar..."
                                            value={reviewForm.data.message}
                                            onChange={(e) => reviewForm.setData('message', e.target.value)}
                                            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm leading-relaxed text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                                        />
                                        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                                            <span>Minimal 10 karakter</span>
                                            <span>{reviewForm.data.message.length} / 1000</span>
                                        </div>
                                        {reviewForm.errors.message && (
                                            <p className="mt-1 text-xs text-red-600">{reviewForm.errors.message}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                        {myReview ? (
                                            <button
                                                type="button"
                                                onClick={deleteReview}
                                                className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                Hapus Ulasan
                                            </button>
                                        ) : <div />}

                                        <button
                                            type="submit"
                                            disabled={reviewForm.processing}
                                            className="rounded-xl bg-violet-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-violet-800 disabled:opacity-60"
                                        >
                                            {reviewForm.processing ? 'Menyimpan…' : (myReview ? 'Simpan Perubahan' : 'Kirim Ulasan Sekarang')}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Preview Card Tampilan di Landing Page (5 Kolom) */}
                            <div className="space-y-4 lg:col-span-5">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Preview Tampilan Landing Page
                                        </span>
                                        <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                                            Kepercayaan Keluarga ALC
                                        </span>
                                    </div>

                                    {/* Mockup Card Landing Page */}
                                    <div className="mt-4 flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs transition">
                                        <div>
                                            <div className="flex items-center gap-1 text-amber-400">
                                                {[...Array(reviewForm.data.rating || 5)].map((_, i) => (
                                                    <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                                <span className="ml-2 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                    {reviewForm.data.highlight || 'Keluarga ALC'}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                                                "{reviewForm.data.message || 'Tuliskan ulasan Anda untuk melihat pratinjau di sini...'}"
                                            </p>
                                        </div>

                                        <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white shadow-2xs">
                                                {myReview?.name ? myReview.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-display text-xs font-bold text-slate-900 leading-tight">
                                                    {myReview?.name || 'Nama Orang Tua'}
                                                </h4>
                                                <p className="text-[11px] font-medium text-violet-700">
                                                    {reviewForm.data.student_name ? `Orang Tua dari ${reviewForm.data.student_name}` : 'Orang Tua Siswa'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-center text-xs text-slate-400">
                                        Tampilan ini persis seperti yang akan dilihat oleh pengunjung website utama.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Daftar Ulasan Publik Terkini dari Keluarga ALC */}
                        {publicReviews.length > 0 && (
                            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Ulasan Publik dari Keluarga ALC Lainnya</h3>
                                        <p className="text-xs text-slate-500">Ulasan terkini yang saat ini aktif tampil di landing page.</p>
                                    </div>
                                    <span className="text-xs font-semibold text-violet-700">
                                        {publicReviews.length} Ulasan Aktif
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {publicReviews.map((pub) => (
                                        <div key={pub.id} className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                            <div>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    {[...Array(pub.rating || 5)].map((_, i) => (
                                                        <StarIcon key={i} className="h-3 w-3" />
                                                    ))}
                                                    <span className="ml-1.5 rounded-sm bg-amber-100/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                                                        {pub.highlight}
                                                    </span>
                                                </div>
                                                <p className="mt-2.5 text-xs italic text-slate-700 line-clamp-3">
                                                    "{pub.message}"
                                                </p>
                                            </div>

                                            <div className="mt-4 border-t border-slate-200/60 pt-2.5 flex items-center gap-2">
                                                <img
                                                    src={pub.avatar}
                                                    alt={pub.name}
                                                    className="h-7 w-7 rounded-full object-cover"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-bold text-slate-900">{pub.name}</p>
                                                    <p className="truncate text-[10px] text-violet-700">{pub.student}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Detail & Tanggapan Admin (Kritik & Saran) */}
            <Modal
                isOpen={Boolean(selectedDetail)}
                onClose={() => setSelectedDetail(null)}
                title="Detail Kritik & Saran"
                size="lg"
            >
                {selectedDetail && (
                    <div className="space-y-5">
                        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Terkait Siswa</p>
                                <p className="mt-1 font-bold text-slate-900">{selectedDetail.student?.name || 'Masukan Umum'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kategori</p>
                                <p className="mt-1 font-semibold text-violet-700">
                                    {categories[selectedDetail.category] || selectedDetail.category}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal Kirim</p>
                                <p className="mt-1 font-semibold text-slate-700">{formatDateTime(selectedDetail.created_at)}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Judul Masukan</span>
                                    <h3 className="mt-0.5 text-base font-bold text-slate-900">{selectedDetail.subject}</h3>
                                </div>
                                <div className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 font-bold text-amber-700">
                                    <StarIcon />
                                    <span className="text-sm tabular-nums">{selectedDetail.rating} / 5</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pesan Anda</span>
                                <p className="mt-1.5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                                    {selectedDetail.message}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            {selectedDetail.admin_reply ? (
                                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-100 pb-2.5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-violet-950">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-200/80 text-violet-800">
                                                <ChatBubbleIcon />
                                            </span>
                                            <span>Tanggapan dari Pihak Pengelola</span>
                                        </div>
                                        {selectedDetail.replied_at && (
                                            <span className="text-xs font-medium text-violet-700">
                                                Dibalas pada: {formatDateTime(selectedDetail.replied_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                                        {selectedDetail.admin_reply}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-sm text-amber-900">
                                    <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <div>
                                        <p className="font-bold">Menunggu Tanggapan Admin</p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                                            Masukan Anda telah tercatat dan sedang dipelajari oleh manajemen. Tanggapan resmi akan segera ditampilkan pada bagian ini.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setSelectedDetail(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Form Kirim Kritik & Saran Baru */}
            <Modal isOpen={isFormOpen} onClose={closeFeedbackForm} title="Kirim Kritik & Saran" size="lg">
                <form onSubmit={submitFeedback} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {students.length > 0 && (
                            <div>
                                <label htmlFor="student_id" className="mb-1.5 block text-xs font-bold text-slate-700">Anak Terkait</label>
                                <select
                                    id="student_id"
                                    value={feedbackForm.data.student_id}
                                    onChange={(event) => feedbackForm.setData('student_id', event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="">Umum (Tidak terkait anak spesifik)</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>{student.name}</option>
                                    ))}
                                </select>
                                {feedbackForm.errors.student_id && <p className="mt-1.5 text-xs font-medium text-red-600">{feedbackForm.errors.student_id}</p>}
                            </div>
                        )}

                        <div className={students.length === 0 ? 'sm:col-span-2' : ''}>
                            <label htmlFor="category" className="mb-1.5 block text-xs font-bold text-slate-700">
                                Kategori Masukan <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                value={feedbackForm.data.category}
                                onChange={(event) => feedbackForm.setData('category', event.target.value)}
                                aria-invalid={Boolean(feedbackForm.errors.category)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                            >
                                <option value="">Pilih kategori masukan</option>
                                {Object.entries(categories).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            {feedbackForm.errors.category && <p className="mt-1.5 text-xs font-medium text-red-600">{feedbackForm.errors.category}</p>}
                        </div>
                    </div>

                    <fieldset>
                        <legend className="text-xs font-bold text-slate-700">
                            Penilaian Kepuasan <span className="text-red-500">*</span>
                        </legend>
                        <div className="mt-2 flex gap-2" aria-label="Pilih penilaian dari 1 sampai 5">
                            {[1, 2, 3, 4, 5].map((ratingVal) => (
                                <label key={ratingVal} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="feedback_rating"
                                        value={ratingVal}
                                        checked={feedbackForm.data.rating === ratingVal}
                                        onChange={() => feedbackForm.setData('rating', ratingVal)}
                                        className="sr-only"
                                    />
                                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${feedbackForm.data.rating >= ratingVal ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400'}`}>
                                        <StarIcon filled={feedbackForm.data.rating >= ratingVal} className="h-5 w-5" />
                                        <span className="sr-only">{ratingVal} dari 5</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        {feedbackForm.errors.rating && <p className="mt-1.5 text-xs font-medium text-red-600">{feedbackForm.errors.rating}</p>}
                    </fieldset>

                    <div>
                        <label htmlFor="subject" className="mb-1.5 block text-xs font-bold text-slate-700">
                            Judul / Topik Singkat <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="subject"
                            type="text"
                            maxLength={120}
                            placeholder="Contoh: Jadwal bimbingan menjelang ujian sekolah"
                            value={feedbackForm.data.subject}
                            onChange={(event) => feedbackForm.setData('subject', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        />
                        {feedbackForm.errors.subject && <p className="mt-1.5 text-xs font-medium text-red-600">{feedbackForm.errors.subject}</p>}
                    </div>

                    <div>
                        <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-slate-700">
                            Kritik atau Saran <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            rows={5}
                            maxLength={3000}
                            placeholder="Ceritakan masukan Anda secara rinci demi perbaikan bersama..."
                            value={feedbackForm.data.message}
                            onChange={(event) => feedbackForm.setData('message', event.target.value)}
                            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        />
                        {feedbackForm.errors.message && <p className="mt-1.5 text-xs font-medium text-red-600">{feedbackForm.errors.message}</p>}
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeFeedbackForm}
                            disabled={feedbackForm.processing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={feedbackForm.processing}
                            className="rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {feedbackForm.processing ? 'Mengirim…' : 'Kirim Masukan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </PortalLayout>
    );
}
