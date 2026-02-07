import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const fallbackEducationOptions = ['SMA', 'D3', 'S1', 'S2'];
const statusOptions = ['Aktif', 'Nonaktif'];

const icons = {
    plus: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
    ),
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    close: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    search: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const statusBadge = (isActive) => (
    <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-600'
        }`}
    >
        {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
);

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

function FormInput({ label, type = 'text', value, onChange, placeholder, required }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
        </div>
    );
}

function FormSelect({ label, value, onChange, options, required }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
                <option value="">Pilih {label}</option>
                {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
        </div>
    );
}

function FormTextarea({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
        </div>
    );
}

export default function Teachers() {
    const { teacherRegistrations: registrationsData = [], allowedActions = {}, flash } = usePage().props;

    const teachers = useMemo(() => registrationsData.map((item) => ({
        id: item.id,
        name: item.name ?? '',
        address: item.address ?? '',
        education: item.education ?? '',
        subjects: item.subjects ?? '',
        experience: item.experience ?? '',
        contact: item.contact ?? '',
        cv_url: item.cv_url ?? '',
        notes: item.notes ?? '',
        is_active: item.is_active ?? true,
        created_at: item.created_at ?? null,
    })), [registrationsData]);

    const [search, setSearch] = useState('');
    const [filterEducation, setFilterEducation] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [detailModal, setDetailModal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const can = (action) => (allowedActions.pengajar ?? []).includes(action);
    const canView = can('view');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const form = useForm({
        name: '',
        address: '',
        education: '',
        subjects: '',
        experience: '',
        contact: '',
        cv: null,
        notes: '',
        is_active: true,
    });
    const [currentCvUrl, setCurrentCvUrl] = useState(null);

    const filteredData = teachers.filter((t) => {
        const matchSearch =
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.subjects.toLowerCase().includes(search.toLowerCase());
        const matchEducation = !filterEducation || t.education === filterEducation;
        return matchSearch && matchEducation;
    });

    const sortedData = [...filteredData].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
    });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

    useEffect(() => {
        setPage(1);
    }, [search, filterEducation, pageSize]);

    useEffect(() => {
        setPage((current) => Math.min(Math.max(current, 1), totalPages));
    }, [totalPages]);

    const startIndex = sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = Math.min(sortedData.length, page * pageSize);
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

    const stats = [
        { label: 'Total Pelamar', value: teachers.length },
        { label: 'Ada CV', value: teachers.filter((t) => t.cv_url).length },
        { label: 'Berpengalaman', value: teachers.filter((t) => t.experience).length },
    ];

    const educationOptions = Array.from(new Set(teachers.map((t) => t.education).filter(Boolean)));
    const resolvedEducationOptions = educationOptions.length > 0 ? educationOptions : fallbackEducationOptions;

    const openModal = (item = null) => {
        if (item) {
            setEditing(item);
            form.setData({
                name: item.name,
                address: item.address,
                education: item.education,
                subjects: item.subjects,
                experience: item.experience,
                contact: item.contact,
                cv: null,
                notes: item.notes,
                is_active: item.is_active ?? true,
            });
            setCurrentCvUrl(item.cv_url || null);
        } else {
            setEditing(null);
            form.setData({
                name: '',
                address: '',
                education: '',
                subjects: '',
                experience: '',
                contact: '',
                cv: null,
                notes: '',
                is_active: true,
            });
            setCurrentCvUrl(null);
        }
        form.clearErrors();
        setShowModal(true);
    };

    const saveForm = (event) => {
        event.preventDefault();
        if (editing) {
            form
                .transform((data) => ({
                    ...data,
                    _method: 'put',
                }))
                .post(`/admin/pengajar/${editing.id}`, {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        setShowModal(false);
                        form.reset('cv');
                    },
                    onFinish: () => form.transform((data) => data),
                });
            return;
        }

        form.post('/admin/pengajar', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowModal(false);
                form.reset('cv');
            },
        });
    };

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/pengajar/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    return (
        <>
            <Head title="Pengajar" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pengajar</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola data pengajar yang terdaftar di ALC
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {icons.plus}
                            Tambah Pengajar
                        </button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 sm:max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pengajar..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                    </div>
                    <select
                        value={filterEducation}
                        onChange={(e) => setFilterEducation(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
                    >
                        <option value="">Semua Pendidikan</option>
                        {resolvedEducationOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">Daftar Pengajar</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Menampilkan {startIndex}-{endIndex} dari {sortedData.length} data
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-500" htmlFor="teacher-page-size">
                                Baris
                            </label>
                            <select
                                id="teacher-page-size"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Pendidikan</th>
                                    <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                    <th className="px-5 py-3 font-medium">Kontak</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Tanggal</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.map((teacher) => (
                                    <tr key={teacher.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {teacher.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {teacher.education || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {teacher.subjects || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {teacher.contact || '-'}
                                        </td>
                                        <td className="px-5 py-4">{statusBadge(teacher.is_active)}</td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {teacher.created_at
                                                ? new Date(teacher.created_at).toLocaleDateString('id-ID')
                                                : '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                {canView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailModal(teacher)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                        title="Detail"
                                                    >
                                                        {icons.eye}
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(teacher)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                        title="Edit"
                                                    >
                                                        {icons.edit}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(teacher)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                                                        title="Nonaktifkan"
                                                    >
                                                        {icons.trash}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada data pengajar yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
                        <p className="text-xs text-slate-500">
                            Menampilkan {startIndex}-{endIndex} dari {sortedData.length} data
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setPage(pageNumber)}
                                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                        pageNumber === page
                                            ? 'bg-violet-600 text-white shadow-sm'
                                            : 'border border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-700'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Pengajar" size="lg">
                {detailModal && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-800">{detailModal.name}</p></div>
                                <div><p className="text-xs text-slate-500">Pendidikan</p><p className="font-medium text-slate-800">{detailModal.education || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Alamat</p><p className="font-medium text-slate-800">{detailModal.address || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Mata Pelajaran</p><p className="font-medium text-slate-800">{detailModal.subjects || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Pengalaman</p><p className="font-medium text-slate-800">{detailModal.experience || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Kontak</p><p className="font-medium text-slate-800">{detailModal.contact || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Status</p>{statusBadge(detailModal.is_active)}</div>
                                <div><p className="text-xs text-slate-500">Tanggal</p><p className="font-medium text-slate-800">{detailModal.created_at ? new Date(detailModal.created_at).toLocaleDateString('id-ID') : '-'}</p></div>
                                <div>
                                    <p className="text-xs text-slate-500">CV</p>
                                    {detailModal.cv_url ? (
                                        <a href={detailModal.cv_url} target="_blank" rel="noreferrer" className="font-medium text-violet-600 underline">Lihat CV</a>
                                    ) : <p className="font-medium text-slate-800">-</p>}
                                </div>
                            </div>
                        </div>
                        {detailModal.notes && (
                            <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan</p>
                                <p className="mt-2">{detailModal.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Pengajar' : 'Tambah Pengajar Baru'} size="lg">
                <form onSubmit={saveForm} className="space-y-4">
                    <FormInput label="Nama Lengkap" value={form.data.name} onChange={(v) => form.setData('name', v)} placeholder="contoh: Ustadzah Hana" required />
                    {form.errors.name && <p className="text-xs text-rose-500">{form.errors.name}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Alamat" value={form.data.address} onChange={(v) => form.setData('address', v)} placeholder="Alamat lengkap" />
                        <FormSelect label="Pendidikan Terakhir" value={form.data.education} onChange={(v) => form.setData('education', v)} options={resolvedEducationOptions} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Mata Pelajaran" value={form.data.subjects} onChange={(v) => form.setData('subjects', v)} placeholder="contoh: Matematika, IPA" />
                        <FormInput label="Pengalaman" value={form.data.experience} onChange={(v) => form.setData('experience', v)} placeholder="contoh: 2 tahun" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="No. HP/WA" value={form.data.contact} onChange={(v) => form.setData('contact', v)} placeholder="08xx-xxxx-xxxx" />
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload CV</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => form.setData('cv', e.target.files[0])}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
                            />
                            {currentCvUrl && (
                                <p className="mt-2 text-xs text-slate-500">
                                    CV saat ini:{' '}
                                    <a href={currentCvUrl} target="_blank" rel="noreferrer" className="font-medium text-violet-600 underline">
                                        Lihat CV
                                    </a>
                                </p>
                            )}
                            {form.errors.cv && <p className="mt-1 text-xs text-rose-500">{form.errors.cv}</p>}
                        </div>
                    </div>
                    <FormTextarea label="Catatan" value={form.data.notes} onChange={(v) => form.setData('notes', v)} placeholder="Catatan tambahan..." />
                    <FormSelect
                        label="Status"
                        value={form.data.is_active ? 'Aktif' : 'Nonaktif'}
                        onChange={(v) => form.setData('is_active', v === 'Aktif')}
                        options={statusOptions}
                    />
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={form.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                            {editing ? 'Simpan Perubahan' : 'Tambah Pengajar'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Nonaktifkan Pengajar" size="sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        Pengajar <span className="font-semibold text-slate-800">{deleteTarget?.name}</span> akan dinonaktifkan.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Status berubah menjadi Nonaktif dan tidak terhapus permanen.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                        Ya, Nonaktifkan
                    </button>
                </div>
            </Modal>
        </>
    );
}
