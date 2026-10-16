import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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
    StatusBadge,
} from '@/Components/Admin';

const statusOptions = ['Aktif', 'Nonaktif'];
const fallbackLevelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'];

const icons = {
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
    mail: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    phone: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
    ),
    card: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5.25A2.25 2.25 0 003 8.25v7.5A2.25 2.25 0 005.25 18H19.5a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5H14m-4 0V6m0 0L8.5 7.5M10 6l-1.5 1.5M14 18h4" />
        </svg>
    ),
    academic: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
    ),
    mapPin: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
    ),
};

const statusBadge = (isActive) => (
    <StatusBadge tone={isActive ? 'emerald' : 'slate'}>{isActive ? 'Aktif' : 'Nonaktif'}</StatusBadge>
);

const getWhatsAppUrl = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return null;
    const waNumber = cleanPhone.startsWith('0')
        ? '62' + cleanPhone.slice(1)
        : cleanPhone.startsWith('62')
          ? cleanPhone
          : '62' + cleanPhone;
    return `https://wa.me/${waNumber}`;
};

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
        parent_email: student.parent_email ?? '',
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
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
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
        parent_email: '',
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

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchSearch = student.name.toLowerCase().includes(search.toLowerCase());
            const matchLevel = !filterLevel || student.level === filterLevel;
            const statusLabel = student.is_active ? 'Aktif' : 'Nonaktif';
            const matchStatus = !filterStatus || statusLabel === filterStatus;
            return matchSearch && matchLevel && matchStatus;
        });
    }, [students, search, filterLevel, filterStatus]);

    const totalItems = filteredStudents.length;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + perPage);

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
            parent_email: student.parent_email ?? '',
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
                <PageHeader
                    title="Pelajar"
                />

                <FlashMessage flash={flash} />

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
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Cari pelajar..."
                        />
                        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none sm:w-auto"
                            >
                                <option value="">Semua Jenjang</option>
                                {resolvedLevelOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none sm:w-auto"
                            >
                                <option value="">Semua Status</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="w-12 px-4 py-3 font-medium text-center">No</th>
                                    <th className="w-14 px-3 py-3 font-medium text-center">Aksi</th>
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Jenjang</th>
                                    <th className="px-5 py-3 font-medium">Program</th>
                                    <th className="px-5 py-3 font-medium">Paket</th>
                                    <th className="px-5 py-3 font-medium">Kontak Ortu</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedStudents.map((student, index) => {
                                    const rowNumber = startIndex + index + 1;
                                    const actionItems = [
                                        canView && {
                                            label: 'Lihat Detail',
                                            icon: icons.eye,
                                            onClick: () => setDetailModal(student),
                                        },
                                        canView && {
                                            label: 'Cetak Kartu',
                                            icon: (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5.25A2.25 2.25 0 003 8.25v7.5A2.25 2.25 0 005.25 18H19.5a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5H14m-4 0V6m0 0L8.5 7.5M10 6l-1.5 1.5M14 18h4" />
                                                </svg>
                                            ),
                                            href: `/admin/pelajar/${student.id}/kartu`,
                                            isExternal: true,
                                        },
                                        canEdit && {
                                            label: 'Edit Data',
                                            icon: icons.edit,
                                            onClick: () => openEditModal(student),
                                        },
                                        canDelete && {
                                            label: 'Nonaktifkan',
                                            icon: icons.trash,
                                            danger: true,
                                            onClick: () => setDeleteModal(student),
                                        },
                                    ];

                                    return (
                                        <tr key={student.id} className="transition hover:bg-slate-50">
                                            <td className="w-12 px-4 py-4 text-center font-mono text-xs font-bold text-slate-400">
                                                {rowNumber}
                                            </td>
                                            <td className="w-14 px-3 py-4 text-center">
                                                <ActionDropdown items={actionItems} label={`Aksi ${student.name}`} />
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.level || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.program || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.package || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{student.parent_contact || '-'}</td>
                                            <td className="px-5 py-4">{statusBadge(student.is_active)}</td>
                                            <td className="px-5 py-4 text-right text-slate-600">
                                                {student.created_at ? new Date(student.created_at).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada data pelajar yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        perPage={perPage}
                        onPageChange={(p) => setCurrentPage(p)}
                        onPerPageChange={(n) => {
                            setPerPage(n);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Pelajar" size="lg">
                {detailModal && (
                    <div className="space-y-4">
                        {/* Header Profile Card */}
                        <div className="flex flex-col gap-3.5 rounded-2xl bg-gradient-to-br from-violet-50/80 via-slate-50 to-indigo-50/40 p-4 border border-violet-100/80 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary font-bold text-lg sm:text-xl text-white shadow-md shadow-brand-primary/20">
                                    {detailModal.name ? detailModal.name.charAt(0).toUpperCase() : 'P'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-base sm:text-lg font-bold text-slate-800 break-words">
                                            {detailModal.name}
                                        </h4>
                                        <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                                            ID #{detailModal.id}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-500 break-words">
                                        {detailModal.school_name ? detailModal.school_name : 'Siswa Bimbel ALC'}
                                        {detailModal.level ? ` • ${detailModal.level}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                {statusBadge(detailModal.is_active)}
                                {detailModal.level && (
                                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800">
                                        {detailModal.level}
                                    </span>
                                )}
                                {detailModal.preferred_mode && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 uppercase">
                                        {detailModal.preferred_mode}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Grid Information: 2 Columns on desktop, 1 on mobile */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Kontak & Data Orang Tua */}
                            <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                                        <span className="text-violet-600">{icons.phone}</span>
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Kontak & Orang Tua
                                        </h5>
                                    </div>
                                    <div className="mt-3 space-y-2.5 text-xs">
                                        {/* Email Orang Tua / Wali */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2 min-w-0">
                                            <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                                                <span className="text-slate-400">{icons.mail}</span>
                                                Email
                                            </span>
                                            {detailModal.parent_email ? (
                                                <a
                                                    href={`mailto:${detailModal.parent_email}`}
                                                    className="font-medium text-brand-primary hover:underline break-all sm:text-right"
                                                    title={`Kirim email ke ${detailModal.parent_email}`}
                                                >
                                                    {detailModal.parent_email}
                                                </a>
                                            ) : (
                                                <span className="font-medium text-slate-400 sm:text-right">-</span>
                                            )}
                                        </div>

                                        {/* Kontak Orang Tua / HP */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2 min-w-0">
                                            <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                                                <span className="text-slate-400">{icons.phone}</span>
                                                Kontak HP / WA
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                                                <span className="font-medium text-slate-800 break-all">
                                                    {detailModal.parent_contact || '-'}
                                                </span>
                                                {getWhatsAppUrl(detailModal.parent_contact) && (
                                                    <a
                                                        href={getWhatsAppUrl(detailModal.parent_contact)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-200"
                                                        title="Chat WhatsApp"
                                                    >
                                                        WA
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Alamat */}
                                        <div className="flex flex-col gap-1 min-w-0 pt-0.5">
                                            <span className="text-slate-500 flex items-center gap-1.5">
                                                <span className="text-slate-400">{icons.mapPin}</span>
                                                Alamat Domisili
                                            </span>
                                            <span className="font-medium text-slate-800 text-xs leading-relaxed break-words pl-5">
                                                {detailModal.address || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Bimbingan & Akademik */}
                            <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                                        <span className="text-violet-600">{icons.academic}</span>
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Pendidikan & Program
                                        </h5>
                                    </div>
                                    <div className="mt-3 space-y-2.5 text-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2">
                                            <span className="text-slate-500 shrink-0">Program Bimbel</span>
                                            <span className="font-semibold text-violet-700 sm:text-right break-words">{detailModal.program || '-'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2">
                                            <span className="text-slate-500 shrink-0">Paket Bimbingan</span>
                                            <span className="font-medium text-slate-800 sm:text-right break-words">{detailModal.package || '-'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2">
                                            <span className="text-slate-500 shrink-0">Asal Sekolah</span>
                                            <span className="font-medium text-slate-800 sm:text-right break-words">{detailModal.school_name || '-'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2">
                                            <span className="text-slate-500 shrink-0">Mata Pelajaran</span>
                                            <span className="font-medium text-slate-800 sm:text-right break-words">{detailModal.subjects || '-'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-0.5">
                                            <span className="text-slate-500 shrink-0">Mode Belajar</span>
                                            <span className="font-medium text-slate-800 sm:text-right uppercase">{detailModal.preferred_mode || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tanggal & Catatan */}
                        <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-500">
                                <span>Terdaftar Pada:</span>
                                <span className="font-medium text-slate-700">
                                    {detailModal.created_at ? new Date(detailModal.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : '-'}
                                </span>
                            </div>
                            {detailModal.notes && (
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="font-semibold uppercase tracking-wide text-slate-400 text-[11px]">Catatan Khusus</p>
                                    <p className="mt-1 text-slate-600 leading-relaxed break-words">{detailModal.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Action Buttons: Responsive */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-2 pt-3 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row gap-2">
                                {canView && (
                                    <a
                                        href={`/admin/pelajar/${detailModal.id}/kartu`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-xs cursor-pointer"
                                    >
                                        {icons.card}
                                        Cetak Kartu
                                    </a>
                                )}
                                {canEdit && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const studentToEdit = detailModal;
                                            setDetailModal(null);
                                            openEditModal(studentToEdit);
                                        }}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-xs cursor-pointer"
                                    >
                                        {icons.edit}
                                        Edit Pelajar
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModal(null)}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
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
                        <FormInput type="email" label="Email Orang Tua / Wali" value={editForm.data.parent_email} onChange={(v) => editForm.setData('parent_email', v)} error={editForm.errors.parent_email} />
                    </div>
                    <FormInput label="Mode Belajar" value={editForm.data.preferred_mode} onChange={(v) => editForm.setData('preferred_mode', v)} />
                    <FormTextarea label="Catatan" value={editForm.data.notes} onChange={(v) => editForm.setData('notes', v)} />
                    <FormSelect
                        label="Status"
                        value={editForm.data.is_active ? 'Aktif' : 'Nonaktif'}
                        onChange={(v) => editForm.setData('is_active', v === 'Aktif')}
                        options={statusOptions.map((opt) => ({ value: opt, label: opt }))}
                    />
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setEditModal(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" disabled={editForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Nonaktifkan Pelajar"
                message={(
                    <>
                        Pelajar <span className="font-semibold text-slate-800">{deleteModal?.name}</span> akan dinonaktifkan (tidak terhapus permanen).
                    </>
                )}
                confirmLabel="Ya, Nonaktifkan"
                onConfirm={confirmDelete}
            />
        </>
    );
}
