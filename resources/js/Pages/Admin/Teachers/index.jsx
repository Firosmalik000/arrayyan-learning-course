import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    ActionDropdown,
    ConfirmModal,
    FlashMessage,
    FormInput,
    FormSelect,
    FormTextarea,
    Modal,
    PageHeader,
    Pagination,
    SearchInput,
} from '@/Components/Admin';

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

export default function Teachers() {
    const { teacherRegistrations: registrationsData = [], allowedActions = {}, flash } = usePage().props;

    const teachers = useMemo(() => registrationsData.map((item) => ({
        id: item.id,
        name: item.name ?? '',
        address: item.address ?? '',
        city: item.city ?? '',
        district: item.district ?? '',
        teacher_role: item.teacher_role ?? '',
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
        city: '',
        district: '',
        teacher_role: '',
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
        const query = search.toLowerCase();
        const matchSearch =
            t.name.toLowerCase().includes(query) ||
            t.subjects.toLowerCase().includes(query) ||
            t.teacher_role.toLowerCase().includes(query) ||
            t.city.toLowerCase().includes(query) ||
            t.district.toLowerCase().includes(query);
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
                city: item.city,
                district: item.district,
                teacher_role: item.teacher_role,
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
                city: '',
                district: '',
                teacher_role: '',
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
                <PageHeader
                    title="Pengajar"
                    actions={canCreate && (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {icons.plus}
                            Tambah Pengajar
                        </button>
                    )}
                />

                <FlashMessage flash={flash} />

                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Cari pengajar..."
                    />
                    <select
                        value={filterEducation}
                        onChange={(e) => setFilterEducation(e.target.value)}
                        className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
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
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="w-12 px-4 py-3 font-medium text-center">No</th>
                                    <th className="w-14 px-3 py-3 font-medium text-center">Aksi</th>
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Pendidikan</th>
                                    <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                    <th className="px-5 py-3 font-medium">Kontak</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedData.map((teacher, index) => {
                                    const rowNumber = (page - 1) * pageSize + index + 1;
                                    const actionItems = [
                                        canView && {
                                            label: 'Lihat Detail',
                                            icon: icons.eye,
                                            onClick: () => setDetailModal(teacher),
                                        },
                                        canEdit && {
                                            label: 'Edit Data',
                                            icon: icons.edit,
                                            onClick: () => openModal(teacher),
                                        },
                                        canDelete && {
                                            label: 'Nonaktifkan',
                                            icon: icons.trash,
                                            danger: true,
                                            onClick: () => openDeleteModal(teacher),
                                        },
                                    ];

                                    return (
                                        <tr key={teacher.id} className="transition hover:bg-slate-50">
                                            <td className="w-12 px-4 py-4 text-center font-mono text-xs font-bold text-slate-400">
                                                {rowNumber}
                                            </td>
                                            <td className="w-14 px-3 py-4 text-center">
                                                <ActionDropdown items={actionItems} label={`Aksi ${teacher.name}`} />
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                <div className="font-semibold text-slate-900">{teacher.name}</div>
                                                {(teacher.teacher_role || teacher.city) && (
                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                                                        {teacher.teacher_role && (
                                                            <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200/60">
                                                                {teacher.teacher_role}
                                                            </span>
                                                        )}
                                                        {(teacher.district || teacher.city) && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                                                                <svg className="h-3 w-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {[teacher.district ? `Kec. ${teacher.district}` : null, teacher.city].filter(Boolean).join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
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
                                            <td className="px-5 py-4 text-right text-slate-600">
                                                {teacher.created_at
                                                    ? new Date(teacher.created_at).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada data pengajar yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={page}
                        totalItems={sortedData.length}
                        perPage={pageSize}
                        onPageChange={(p) => setPage(p)}
                        onPerPageChange={(n) => {
                            setPageSize(n);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Pengajar" size="lg">
                {detailModal && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-800">{detailModal.name}</p></div>
                                <div><p className="text-xs text-slate-500">Jenjang yang Diajar</p><p className="font-medium text-slate-800">{detailModal.teacher_role || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Pendidikan</p><p className="font-medium text-slate-800">{detailModal.education || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Domisili</p><p className="font-medium text-slate-800">{[detailModal.district ? `Kec. ${detailModal.district}` : null, detailModal.city].filter(Boolean).join(', ') || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Alamat Lengkap</p><p className="font-medium text-slate-800">{detailModal.address || '-'}</p></div>
                                <div><p className="text-xs text-slate-500">Keahlian / Mata Pelajaran</p><p className="font-medium text-slate-800">{detailModal.subjects || '-'}</p></div>
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Nama Lengkap" value={form.data.name} onChange={(v) => form.setData('name', v)} placeholder="contoh: Ustadzah Hana" required />
                        <FormInput label="Jenjang yang Diajar" value={form.data.teacher_role} onChange={(v) => form.setData('teacher_role', v)} placeholder="contoh: SD, SMP / SMA" />
                    </div>
                    {form.errors.name && <p className="text-xs text-rose-500">{form.errors.name}</p>}
                    {form.errors.teacher_role && <p className="text-xs text-rose-500">{form.errors.teacher_role}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Kota / Kabupaten" value={form.data.city} onChange={(v) => form.setData('city', v)} placeholder="contoh: Kota Padang" />
                        <FormInput label="Kecamatan" value={form.data.district} onChange={(v) => form.setData('district', v)} placeholder="contoh: Koto Tangah" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Alamat Lengkap" value={form.data.address} onChange={(v) => form.setData('address', v)} placeholder="Alamat jalan / RT / RW" />
                        <FormSelect label="Pendidikan Terakhir" value={form.data.education} onChange={(v) => form.setData('education', v)} options={resolvedEducationOptions} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Keahlian / Mata Pelajaran" value={form.data.subjects} onChange={(v) => form.setData('subjects', v)} placeholder="contoh: Matematika, IPA" />
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

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Nonaktifkan Pengajar"
                message={(
                    <>
                        Pengajar <span className="font-semibold text-slate-800">{deleteTarget?.name}</span> akan dinonaktifkan (tidak terhapus permanen).
                    </>
                )}
                confirmLabel="Ya, Nonaktifkan"
                onConfirm={confirmDelete}
            />
        </>
    );
}
