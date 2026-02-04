import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
const fallbackEducationOptions = ['SMA', 'D3', 'S1', 'S2'];

// Icons
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
    user: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    phone: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
    ),
    mail: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    calendar: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

// Modal Component
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

// Form Components
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
                required={required}
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
                required={required}
            >
                <option value="">Pilih {label}</option>
                {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
        </div>
    );
}

export default function Teachers() {
    const { teacherRegistrations: registrationsData = [], allowedActions = {} } = usePage().props;
    const normalizedTeachers = registrationsData.map((item) => ({
        id: item.id,
        name: item.name ?? '',
        address: item.address ?? '',
        education: item.education ?? '',
        subjects: item.subjects ?? '',
        experience: item.experience ?? '',
        contact: item.contact ?? '',
        cv_url: item.cv_url ?? null,
        notes: item.notes ?? '',
        is_active: item.is_active ?? true,
        created_at: item.created_at ?? null,
    }));
    const [teachers, setTeachers] = useState(normalizedTeachers);
    const [search, setSearch] = useState('');
    const [filterEducation, setFilterEducation] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const can = (action) => (allowedActions.pengajar ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    // Form state
    const [form, setForm] = useState({
        name: '',
        address: '',
        education: '',
        subjects: '',
        experience: '',
        contact: '',
        cv_url: '',
        notes: '',
        is_active: true,
    });

    // Filtered data
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

    // Stats
    const stats = [
        { label: 'Total Pelamar', value: teachers.length },
        { label: 'Ada CV', value: teachers.filter((t) => t.cv_url).length },
        { label: 'Berpengalaman', value: teachers.filter((t) => t.experience).length },
    ];

    const educationOptions = Array.from(new Set(teachers.map((t) => t.education).filter(Boolean)));
    const resolvedEducationOptions = educationOptions.length > 0 ? educationOptions : fallbackEducationOptions;

    // Handlers
    const openModal = (item = null) => {
        if (item) {
            setEditing(item);
            setForm({
                name: item.name,
                address: item.address,
                education: item.education,
                subjects: item.subjects,
                experience: item.experience,
                contact: item.contact,
                cv_url: item.cv_url,
                notes: item.notes,
                is_active: item.is_active ?? true,
            });
        } else {
            setEditing(null);
            setForm({
                name: '',
                address: '',
                education: '',
                subjects: '',
                experience: '',
                contact: '',
                cv_url: '',
                notes: '',
                is_active: true,
            });
        }
        setShowModal(true);
    };

    const saveForm = () => {
        const data = { ...form, is_active: form.is_active ?? true };
        if (editing) {
            setTeachers(teachers.map((t) => (t.id === editing.id ? { ...data, id: editing.id } : t)));
        } else {
            setTeachers([...teachers, { ...data, id: Date.now() }]);
        }
        setShowModal(false);
    };

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setTeachers(teachers.filter(t => t.id !== deleteTarget.id));
        setShowDeleteModal(false);
    };

    return (
        <>
            <Head title="Pengajar" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pengajar</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola data pendaftaran pengajar yang masuk
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                        >
                            {icons.plus}
                            Tambah Pengajar
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 sm:max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pelamar..."
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

                {/* Data Table */}
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
                                    <th className="px-5 py-3 font-medium">Alamat</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">CV</th>
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
                                        <td className="px-5 py-4 text-slate-600">
                                            {teacher.address || '-'}
                                        </td>
                                        <td className="px-5 py-4">{statusBadge(teacher.is_active)}</td>
                                        <td className="px-5 py-4">
                                            {teacher.cv_url ? (
                                                <a
                                                    href={teacher.cv_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-medium text-violet-600 underline hover:text-violet-800"
                                                >
                                                    Lihat
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {teacher.created_at
                                                ? new Date(teacher.created_at).toLocaleDateString('id-ID')
                                                : '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
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
                                                        title="Hapus"
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
                                        <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
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

            {/* Form Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Pengajar' : 'Tambah Pengajar Baru'} size="lg">
                <form onSubmit={(e) => { e.preventDefault(); saveForm(); }} className="space-y-4">
                    <FormInput label="Nama Lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="contoh: Ustadzah Hana" required />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Alamat" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Alamat lengkap" />
                        <FormSelect label="Pendidikan Terakhir" value={form.education} onChange={(v) => setForm({ ...form, education: v })} options={resolvedEducationOptions} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Mata Pelajaran" value={form.subjects} onChange={(v) => setForm({ ...form, subjects: v })} placeholder="contoh: Matematika, IPA" />
                        <FormInput label="Pengalaman" value={form.experience} onChange={(v) => setForm({ ...form, experience: v })} placeholder="contoh: 2 tahun" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="No. HP/WA" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="08xx-xxxx-xxxx" />
                        <FormInput label="Link CV" value={form.cv_url} onChange={(v) => setForm({ ...form, cv_url: v })} placeholder="https://..." />
                    </div>
                    <FormInput label="Catatan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Catatan tambahan..." />
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800">
                            {editing ? 'Simpan Perubahan' : 'Tambah Pengajar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Hapus" size="sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
