import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusOptions = ['Aktif', 'Nonaktif'];
const fallbackLevelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'];

const icons = {
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
};

const statusBadge = (isActive) => (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${isActive ? statusStyles.Aktif : statusStyles.Nonaktif}`}>
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

function FormInput({ label, value, onChange, placeholder, required }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
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

function FormSelect({ label, value, onChange, options, required, placeholder }) {
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
                <option value="">{placeholder || `Pilih ${label}`}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export default function Students() {
    const { students: studentsData = [], programs = [], allowedActions = {}, flash } = usePage().props;

    const students = useMemo(() => studentsData.map((student) => ({
        id: student.id,
        name: student.name ?? '',
        address: student.address ?? '',
        school_name: student.school_name ?? '',
        level: student.level ?? '',
        subjects: student.subjects ?? '',
        program_id: student.program_id ?? '',
        program: student.program ?? '',
        package: student.package ?? '',
        parent_contact: student.parent_contact ?? '',
        preferred_mode: student.preferred_mode ?? '',
        notes: student.notes ?? '',
        is_active: student.is_active ?? true,
        created_at: student.created_at ?? null,
    })), [studentsData]);

    const programOptions = useMemo(() => programs.map((program) => ({
        value: String(program.id),
        label: program.level ? `${program.name} • ${program.level}` : program.name,
    })), [programs]);

    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [detailModal, setDetailModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const editForm = useForm({
        name: '',
        address: '',
        school_name: '',
        level: '',
        subjects: '',
        program_id: '',
        package: '',
        parent_contact: '',
        preferred_mode: '',
        notes: '',
        is_active: true,
    });

    const can = (action) => (allowedActions.pelajar ?? []).includes(action);
    const canView = can('view');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const levelOptions = Array.from(new Set(students.map((s) => s.level).filter(Boolean)));
    const resolvedLevelOptions = levelOptions.length > 0 ? levelOptions : fallbackLevelOptions;

    const filteredStudents = students.filter((student) => {
        const matchSearch = student.name.toLowerCase().includes(search.toLowerCase());
        const matchLevel = !filterLevel || student.level === filterLevel;
        const statusLabel = student.is_active ? 'Aktif' : 'Nonaktif';
        const matchStatus = !filterStatus || statusLabel === filterStatus;
        return matchSearch && matchLevel && matchStatus;
    });

    const stats = [
        { label: 'Total Pelajar', value: students.length, tone: 'violet' },
        { label: 'Aktif', value: students.filter((s) => s.is_active).length, tone: 'emerald' },
        { label: 'Nonaktif', value: students.filter((s) => !s.is_active).length, tone: 'slate' },
    ];

    const toneStyles = {
        violet: 'bg-violet-50 text-violet-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        slate: 'bg-slate-100 text-slate-600',
    };

    const openEditModal = (student) => {
        setEditModal(student);
        editForm.setData({
            name: student.name,
            address: student.address,
            school_name: student.school_name,
            level: student.level,
            subjects: student.subjects,
            program_id: student.program_id ? String(student.program_id) : '',
            package: student.package,
            parent_contact: student.parent_contact,
            preferred_mode: student.preferred_mode,
            notes: student.notes,
            is_active: Boolean(student.is_active),
        });
        editForm.clearErrors();
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editModal) return;
        editForm.put(`/admin/pelajar/${editModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditModal(null),
        });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        router.delete(`/admin/pelajar/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal(null),
        });
    };

    return (
        <>
            <Head title="Pelajar" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pelajar</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Data siswa aktif yang terdaftar di ALC
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[stat.tone]}`}>
                                {stat.label}
                            </span>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
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
                                placeholder="Cari pelajar..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                            >
                                <option value="">Semua Jenjang</option>
                                {resolvedLevelOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Jenjang</th>
                                    <th className="px-5 py-3 font-medium">Program</th>
                                    <th className="px-5 py-3 font-medium">Paket</th>
                                    <th className="px-5 py-3 font-medium">Kontak Ortu</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Tanggal</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{student.level || '-'}</td>
                                        <td className="px-5 py-4 text-slate-600">{student.program || '-'}</td>
                                        <td className="px-5 py-4 text-slate-600">{student.package || '-'}</td>
                                        <td className="px-5 py-4 text-slate-600">{student.parent_contact || '-'}</td>
                                        <td className="px-5 py-4">{statusBadge(student.is_active)}</td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {student.created_at ? new Date(student.created_at).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                {canView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailModal(student)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                        title="Detail"
                                                    >
                                                        {icons.eye}
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(student)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                        title="Edit"
                                                    >
                                                        {icons.edit}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModal(student)}
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
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada data pelajar yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Pelajar" size="lg">
                {detailModal && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-800">{detailModal.name}</p></div>
                                <div><p className="text-xs text-slate-500">Jenjang</p><p className="font-medium text-slate-800">{detailModal.level || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Alamat</p><p className="font-medium text-slate-800">{detailModal.address || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Sekolah</p><p className="font-medium text-slate-800">{detailModal.school_name || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Program</p><p className="font-medium text-slate-800">{detailModal.program || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Paket</p><p className="font-medium text-slate-800">{detailModal.package || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Mata Pelajaran</p><p className="font-medium text-slate-800">{detailModal.subjects || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Mode</p><p className="font-medium text-slate-800">{detailModal.preferred_mode || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Kontak Orang Tua</p><p className="font-medium text-slate-800">{detailModal.parent_contact || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Status</p>{statusBadge(detailModal.is_active)}</div>
                                <div><p className="text-xs text-slate-500">Tanggal Daftar</p><p className="font-medium text-slate-800">{detailModal.created_at ? new Date(detailModal.created_at).toLocaleDateString('id-ID') : '-'}</p></div>
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

            <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Pelajar" size="lg">
                <form onSubmit={submitEdit} className="space-y-4">
                    <FormInput label="Nama Pelajar" value={editForm.data.name} onChange={(v) => editForm.setData('name', v)} required />
                    {editForm.errors.name && <p className="text-xs text-rose-500">{editForm.errors.name}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Alamat" value={editForm.data.address} onChange={(v) => editForm.setData('address', v)} />
                        <FormInput label="Sekolah" value={editForm.data.school_name} onChange={(v) => editForm.setData('school_name', v)} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Jenjang" value={editForm.data.level} onChange={(v) => editForm.setData('level', v)} />
                        <FormInput label="Mata Pelajaran" value={editForm.data.subjects} onChange={(v) => editForm.setData('subjects', v)} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Program"
                            value={editForm.data.program_id}
                            onChange={(v) => editForm.setData('program_id', v)}
                            options={programOptions}
                            required
                            placeholder={programOptions.length > 0 ? 'Pilih Program' : 'Belum ada program aktif'}
                        />
                        <FormInput label="Paket" value={editForm.data.package} onChange={(v) => editForm.setData('package', v)} />
                    </div>
                    {editForm.errors.program_id && <p className="text-xs text-rose-500">{editForm.errors.program_id}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Kontak Orang Tua" value={editForm.data.parent_contact} onChange={(v) => editForm.setData('parent_contact', v)} />
                        <FormInput label="Mode Belajar" value={editForm.data.preferred_mode} onChange={(v) => editForm.setData('preferred_mode', v)} />
                    </div>
                    <FormTextarea label="Catatan" value={editForm.data.notes} onChange={(v) => editForm.setData('notes', v)} />
                    <FormSelect
                        label="Status"
                        value={editForm.data.is_active ? 'Aktif' : 'Nonaktif'}
                        onChange={(v) => editForm.setData('is_active', v === 'Aktif')}
                        options={statusOptions.map((opt) => ({ value: opt, label: opt }))}
                    />
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setEditModal(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={editForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Nonaktifkan Pelajar" size="sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        Pelajar <span className="font-semibold text-slate-800">{deleteModal?.name}</span> akan dinonaktifkan.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Status berubah menjadi Nonaktif dan tidak terhapus permanen.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setDeleteModal(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
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
