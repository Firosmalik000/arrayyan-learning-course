import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ConfirmModal,
    FlashMessage,
    PageHeader,
    Pagination,
    SearchInput,
    StatCards,
    StatusBadge,
} from '@/Components/Admin';
import DetailModal from './components/DetailModal';
import RejectModal from './components/RejectModal';

// Icons
const icons = {
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    check: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    x: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
};

const statusTone = (status) => {
    const map = { pending: 'amber', approved: 'emerald', rejected: 'red' };
    return map[status] || 'amber';
};

const statusLabel = (status) => {
    const map = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' };
    return map[status] || 'Pending';
};

const statusBadge = (status) => (
    <StatusBadge tone={statusTone(status)}>{statusLabel(status)}</StatusBadge>
);

export default function Registrations() {
    const {
        studentRegistrations,
        teacherRegistrations,
        studentStats = { total: 0, pending: 0, approved: 0, rejected: 0 },
        teacherStats = { total: 0, pending: 0, approved: 0, rejected: 0 },
        levelOptions = [],
        filters = {},
        flash,
        initialTab = 'student',
        allowedActions = {},
    } = usePage().props;

    const studentRows = studentRegistrations?.data ?? [];
    const teacherRows = teacherRegistrations?.data ?? [];
    const studentMeta = studentRegistrations?.meta ?? null;
    const teacherMeta = teacherRegistrations?.meta ?? null;

    const [activeTab, setActiveTab] = useState(initialTab);
    const [studentSearch, setStudentSearch] = useState(filters.student_search ?? '');
    const [teacherSearch, setTeacherSearch] = useState(filters.teacher_search ?? '');
    const [filterLevel, setFilterLevel] = useState(filters.student_level ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.student_status ?? 'pending');
    const [teacherFilterStatus, setTeacherFilterStatus] = useState(filters.teacher_status ?? 'pending');

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const fetchPage = (overrides = {}) => {
        router.get('/admin/pendaftaran', {
            student_search: studentSearch,
            student_level: filterLevel,
            student_status: filterStatus,
            teacher_search: teacherSearch,
            teacher_status: teacherFilterStatus,
            students_page: studentMeta?.current_page ?? 1,
            teachers_page: teacherMeta?.current_page ?? 1,
            ...overrides,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounced server-side filtering (reset to page 1 on filter change)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchPage({ students_page: 1, teachers_page: 1 });
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentSearch, filterLevel, filterStatus, teacherSearch, teacherFilterStatus]);

    // Detail modal
    const [detailModal, setDetailModal] = useState(null);
    // Delete modal
    const [deleteModal, setDeleteModal] = useState(null);
    // Reject modal (with optional admin note)
    const [rejectModal, setRejectModal] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    // Bulk selection (pending rows on current page)
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedTeachers, setSelectedTeachers] = useState([]);

    const can = (action) => (allowedActions.pendaftaran ?? []).includes(action);
    const canView = can('view');
    const canApprove = can('approve');
    const canReject = can('reject');
    const canDelete = can('delete');
    const canExport = can('export');
    const canCreateInvoice = (allowedActions.keuangan ?? []).includes('create');

    const handleCreateInvoice = (registrationId) => {
        router.post(`/admin/keuangan/from-registration/${registrationId}`, {}, { preserveScroll: true });
    };

    // Stats (computed server-side so numbers stay correct with pagination)
    const studentStatCards = [
        { label: 'Total', value: studentStats.total ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Pending', value: studentStats.pending ?? 0, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Disetujui', value: studentStats.approved ?? 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Ditolak', value: studentStats.rejected ?? 0, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    const teacherStatCards = [
        { label: 'Total', value: teacherStats.total ?? 0, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Pending', value: teacherStats.pending ?? 0, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Disetujui', value: teacherStats.approved ?? 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Ditolak', value: teacherStats.rejected ?? 0, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    const typeSlug = { student: 'murid', teacher: 'pengajar' };

    const handleApprove = (type, id) => {
        router.post(`/admin/pendaftaran/${typeSlug[type]}/${id}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = (type, item) => {
        setRejectModal({
            type,
            id: item.id,
            name: type === 'student' ? item.student_name : item.name,
            ticket: item.registration_no || '-',
        });
        setAdminNote('');
    };

    const confirmReject = () => {
        if (!rejectModal) return;
        router.post(`/admin/pendaftaran/${typeSlug[rejectModal.type]}/${rejectModal.id}/reject`, {
            admin_note: adminNote,
        }, {
            preserveScroll: true,
            onSuccess: () => { setRejectModal(null); setAdminNote(''); },
        });
    };

    const toggleSelect = (type, id) => {
        if (type === 'student') {
            setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
        } else {
            setSelectedTeachers((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
        }
    };

    const handleBulkApprove = (type) => {
        const ids = type === 'student' ? selectedStudents : selectedTeachers;
        if (ids.length === 0) return;
        // eslint-disable-next-line no-alert
        if (!window.confirm(`Setujui ${ids.length} pendaftaran terpilih?`)) return;
        router.post(`/admin/pendaftaran/${typeSlug[type]}/bulk-approve`, { ids }, {
            preserveScroll: true,
            onSuccess: () => {
                if (type === 'student') setSelectedStudents([]);
                else setSelectedTeachers([]);
            },
        });
    };

    const waRejectPreview = rejectModal
        ? `Halo ${rejectModal.name}, mohon maaf pendaftaran Anda (${rejectModal.ticket}) di Ar Rayyan Learning Course BELUM dapat kami setujui.${adminNote ? `\nAlasan: ${adminNote}` : ''}\nSilakan hubungi admin untuk informasi lebih lanjut.`
        : '';

    const handleDelete = () => {
        if (!deleteModal) return;
        router.delete(`/admin/pendaftaran/${typeSlug[deleteModal.type]}/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal(null),
        });
    };

    const tabs = [
        { key: 'student', label: 'Pendaftaran Murid', count: studentStats.total ?? 0 },
        { key: 'teacher', label: 'Pendaftaran Pengajar', count: teacherStats.total ?? 0 },
    ];

    return (
        <>
            <Head title="Pendaftaran" />

            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Pendaftaran"
                    subtitle="Kelola pendaftaran murid dan pengajar yang masuk"
                    actions={canExport && (
                        <>
                            <a
                                href="/admin/pendaftaran/export/murid"
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                            >
                                Export Murid CSV
                            </a>
                            <a
                                href="/admin/pendaftaran/export/pengajar"
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                            >
                                Export Pengajar CSV
                            </a>
                        </>
                    )}
                />

                <FlashMessage flash={flash} />

                {/* Tabs */}
                <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                activeTab === tab.key
                                    ? 'bg-brand-primary text-white shadow'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                            <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Student Tab */}
                {activeTab === 'student' && (
                    <div className="space-y-4">
                        {/* Stats */}
                        <StatCards items={studentStatCards} />

                        {/* Table */}
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <SearchInput
                                    value={studentSearch}
                                    onChange={setStudentSearch}
                                    placeholder="Cari nama..."
                                />
                                <div className="flex flex-wrap gap-2">
                                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                        <option value="">Semua Jenjang</option>
                                        {levelOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                    </select>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                        <option value="">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Disetujui</option>
                                        <option value="rejected">Ditolak</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {selectedStudents.length > 0 && canApprove && (
                                    <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/70 px-4 py-2.5">
                                        <p className="text-xs font-semibold text-emerald-800">
                                            {selectedStudents.length} dipilih
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedStudents([])}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleBulkApprove('student')}
                                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                Setujui Terpilih
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                            {canApprove && <th className="w-10 px-3 py-3"><span className="sr-only">Pilih</span></th>}
                                            <th className="px-5 py-3 font-medium">Nama</th>
                                            <th className="px-5 py-3 font-medium">Tiket</th>
                                            <th className="px-5 py-3 font-medium">Jenjang</th>
                                            <th className="px-5 py-3 font-medium">Program</th>
                                            <th className="px-5 py-3 font-medium">Kontak</th>
                                            <th className="px-5 py-3 font-medium">Status</th>
                                            <th className="px-5 py-3 font-medium">Tanggal</th>
                                            <th className="px-5 py-3 font-medium">Ditolak Pada</th>
                                            <th className="px-5 py-3 font-medium">Ditolak Oleh</th>
                                            <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {studentRows.map((item) => (
                                            <tr key={item.id} className="transition hover:bg-slate-50">
                                                {canApprove && (
                                                    <td className="px-3 py-4">
                                                        {item.status === 'pending' ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudents.includes(item.id)}
                                                                onChange={() => toggleSelect('student', item.id)}
                                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                        ) : null}
                                                    </td>
                                                )}
                                                <td className="px-5 py-4 font-medium text-slate-800">{item.student_name}</td>
                                                <td className="px-5 py-4 font-mono text-xs text-slate-600">{item.registration_no || '-'}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.level}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.program}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.parent_contact}</td>
                                                <td className="px-5 py-4">{statusBadge(item.status)}</td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {item.rejected_at ? new Date(item.rejected_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {item.rejected_by_name || item.rejected_by || '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        {canView && (
                                                            <button type="button" onClick={() => setDetailModal({ type: 'student', data: item })} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Detail">
                                                                {icons.eye}
                                                            </button>
                                                        )}
                                                        {item.status === 'pending' && canApprove && (
                                                            <button type="button" onClick={() => handleApprove('student', item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-100 hover:text-emerald-600" title="Setujui">
                                                                {icons.check}
                                                            </button>
                                                        )}
                                                        {item.status === 'pending' && canReject && (
                                                            <button type="button" onClick={() => handleReject('student', item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-600" title="Tolak">
                                                                {icons.x}
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button type="button" onClick={() => setDeleteModal({ type: 'student', id: item.id, name: item.student_name })} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Hapus">
                                                                {icons.trash}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {studentRows.length === 0 && (
                                            <tr><td colSpan={11} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination meta={studentMeta} onPage={(page) => fetchPage({ students_page: page })} />
                        </div>
                    </div>
                )}

                {/* Teacher Tab */}
                {activeTab === 'teacher' && (
                    <div className="space-y-4">
                        {/* Stats */}
                        <StatCards items={teacherStatCards} />

                        {/* Table */}
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <SearchInput
                                    value={teacherSearch}
                                    onChange={setTeacherSearch}
                                    placeholder="Cari nama..."
                                />
                                <select value={teacherFilterStatus} onChange={(e) => setTeacherFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                    <option value="">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                {selectedTeachers.length > 0 && canApprove && (
                                    <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/70 px-4 py-2.5">
                                        <p className="text-xs font-semibold text-emerald-800">
                                            {selectedTeachers.length} dipilih
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTeachers([])}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleBulkApprove('teacher')}
                                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                Setujui Terpilih
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                            {canApprove && <th className="w-10 px-3 py-3"><span className="sr-only">Pilih</span></th>}
                                            <th className="px-5 py-3 font-medium">Nama</th>
                                            <th className="px-5 py-3 font-medium">Tiket</th>
                                            <th className="px-5 py-3 font-medium">Pendidikan</th>
                                            <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                            <th className="px-5 py-3 font-medium">Kontak</th>
                                            <th className="px-5 py-3 font-medium">CV</th>
                                            <th className="px-5 py-3 font-medium">Status</th>
                                            <th className="px-5 py-3 font-medium">Tanggal</th>
                                            <th className="px-5 py-3 font-medium">Ditolak Pada</th>
                                            <th className="px-5 py-3 font-medium">Ditolak Oleh</th>
                                            <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {teacherRows.map((item) => (
                                            <tr key={item.id} className="transition hover:bg-slate-50">
                                                {canApprove && (
                                                    <td className="px-3 py-4">
                                                        {item.status === 'pending' ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTeachers.includes(item.id)}
                                                                onChange={() => toggleSelect('teacher', item.id)}
                                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                        ) : null}
                                                    </td>
                                                )}
                                                <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
                                                <td className="px-5 py-4 font-mono text-xs text-slate-600">{item.registration_no || '-'}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.education}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.subjects}</td>
                                                <td className="px-5 py-4 text-slate-600">{item.contact}</td>
                                                <td className="px-5 py-4">
                                                    {item.cv_url ? (
                                                        <a href={item.cv_url} target="_blank" rel="noreferrer" className="text-violet-600 underline hover:text-violet-800">Lihat</a>
                                                    ) : <span className="text-slate-400">-</span>}
                                                </td>
                                                <td className="px-5 py-4">{statusBadge(item.status)}</td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {item.rejected_at ? new Date(item.rejected_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {item.rejected_by_name || item.rejected_by || '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        {canView && (
                                                            <button type="button" onClick={() => setDetailModal({ type: 'teacher', data: item })} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Detail">
                                                                {icons.eye}
                                                            </button>
                                                        )}
                                                        {item.status === 'pending' && canApprove && (
                                                            <button type="button" onClick={() => handleApprove('teacher', item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-100 hover:text-emerald-600" title="Setujui">
                                                                {icons.check}
                                                            </button>
                                                        )}
                                                        {item.status === 'pending' && canReject && (
                                                            <button type="button" onClick={() => handleReject('teacher', item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-600" title="Tolak">
                                                                {icons.x}
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button type="button" onClick={() => setDeleteModal({ type: 'teacher', id: item.id, name: item.name })} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Hapus">
                                                                {icons.trash}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {teacherRows.length === 0 && (
                                            <tr><td colSpan={12} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination meta={teacherMeta} onPage={(page) => fetchPage({ teachers_page: page })} />
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <DetailModal
                detailModal={detailModal}
                onClose={() => setDetailModal(null)}
                onApprove={(type, id) => { handleApprove(type, id); setDetailModal(null); }}
                onReject={(type, item) => { handleReject(type, item); setDetailModal(null); }}
                onCreateInvoice={(id) => { handleCreateInvoice(id); setDetailModal(null); }}
                canApprove={canApprove}
                canReject={canReject}
                canCreateInvoice={canCreateInvoice}
                icons={icons}
                statusBadge={statusBadge}
            />

            {/* Reject Modal */}
            <RejectModal
                rejectModal={rejectModal}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                waRejectPreview={waRejectPreview}
                onClose={() => setRejectModal(null)}
                onConfirm={confirmReject}
                icons={icons}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Konfirmasi Hapus"
                message={(
                    <>
                        Apakah Anda yakin ingin menghapus{' '}
                        <span className="font-semibold text-slate-800">{deleteModal?.name}</span>?
                    </>
                )}
                onConfirm={handleDelete}
            />
        </>
    );
}
