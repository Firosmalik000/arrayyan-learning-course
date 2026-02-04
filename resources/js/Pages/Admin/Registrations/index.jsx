import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Icons
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

const statusBadge = (status) => {
    const map = {
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rejected: 'border-red-200 bg-red-50 text-red-700',
    };
    const labelMap = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' };
    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || map.pending}`}>
            {labelMap[status] || 'Pending'}
        </span>
    );
};

// Modal
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

export default function Registrations() {
    const {
        studentRegistrations = [],
        teacherRegistrations = [],
        flash,
        initialTab = 'student',
        allowedActions = {},
    } = usePage().props;
    const [activeTab, setActiveTab] = useState(initialTab);
    const [studentSearch, setStudentSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [teacherFilterStatus, setTeacherFilterStatus] = useState('pending');

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // Detail modal
    const [detailModal, setDetailModal] = useState(null);
    // Delete modal
    const [deleteModal, setDeleteModal] = useState(null);

    const can = (action) => (allowedActions.pendaftaran ?? []).includes(action);
    const canView = can('view');
    const canApprove = can('approve');
    const canReject = can('reject');
    const canDelete = can('delete');

    // Student filtering
    const filteredStudents = studentRegistrations.filter((r) => {
        const name = r.student_name || '';
        const matchSearch = name.toLowerCase().includes(studentSearch.toLowerCase());
        const matchLevel = !filterLevel || r.level === filterLevel;
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchLevel && matchStatus;
    });

    // Teacher filtering
    const filteredTeachers = teacherRegistrations.filter((t) => {
        const name = t.name || '';
        const matchSearch = name.toLowerCase().includes(teacherSearch.toLowerCase());
        const matchStatus = !teacherFilterStatus || t.status === teacherFilterStatus;
        return matchSearch && matchStatus;
    });

    const levelOptions = [...new Set(studentRegistrations.map((r) => r.level).filter(Boolean))];

    // Stats
    const studentStats = [
        { label: 'Total', value: studentRegistrations.length, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Pending', value: studentRegistrations.filter((r) => r.status === 'pending').length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Disetujui', value: studentRegistrations.filter((r) => r.status === 'approved').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Ditolak', value: studentRegistrations.filter((r) => r.status === 'rejected').length, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    const teacherStats = [
        { label: 'Total', value: teacherRegistrations.length, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        { label: 'Pending', value: teacherRegistrations.filter((t) => t.status === 'pending').length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { label: 'Disetujui', value: teacherRegistrations.filter((t) => t.status === 'approved').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Ditolak', value: teacherRegistrations.filter((t) => t.status === 'rejected').length, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    const typeSlug = { student: 'murid', teacher: 'pengajar' };

    const handleApprove = (type, id) => {
        router.post(`/admin/pendaftaran/${typeSlug[type]}/${id}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = (type, id) => {
        router.post(`/admin/pendaftaran/${typeSlug[type]}/${id}/reject`, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deleteModal) return;
        router.delete(`/admin/pendaftaran/${typeSlug[deleteModal.type]}/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal(null),
        });
    };

    const tabs = [
        { key: 'student', label: 'Pendaftaran Murid', count: studentRegistrations.length },
        { key: 'teacher', label: 'Pendaftaran Pengajar', count: teacherRegistrations.length },
    ];

    return (
        <>
            <Head title="Pendaftaran" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pendaftaran</h1>
                    <p className="mt-1 text-sm text-slate-600">Kelola pendaftaran murid dan pengajar yang masuk</p>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                activeTab === tab.key
                                    ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow'
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
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {studentStats.map((stat) => (
                                <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
                                    <p className="text-sm font-medium">{stat.label}</p>
                                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative flex-1 sm:max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                                    <input
                                        type="text"
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        placeholder="Cari nama..."
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>
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
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                            <th className="px-5 py-3 font-medium">Nama</th>
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
                                        {filteredStudents.map((item) => (
                                            <tr key={item.id} className="transition hover:bg-slate-50">
                                                <td className="px-5 py-4 font-medium text-slate-800">{item.student_name}</td>
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
                                                            <button type="button" onClick={() => handleReject('student', item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-600" title="Tolak">
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
                                        {filteredStudents.length === 0 && (
                                            <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teacher Tab */}
                {activeTab === 'teacher' && (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {teacherStats.map((stat) => (
                                <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
                                    <p className="text-sm font-medium">{stat.label}</p>
                                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative flex-1 sm:max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                                    <input
                                        type="text"
                                        value={teacherSearch}
                                        onChange={(e) => setTeacherSearch(e.target.value)}
                                        placeholder="Cari nama..."
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    />
                                </div>
                                <select value={teacherFilterStatus} onChange={(e) => setTeacherFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
                                    <option value="">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                            <th className="px-5 py-3 font-medium">Nama</th>
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
                                        {filteredTeachers.map((item) => (
                                            <tr key={item.id} className="transition hover:bg-slate-50">
                                                <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
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
                                                            <button type="button" onClick={() => handleReject('teacher', item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-600" title="Tolak">
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
                                        {filteredTeachers.length === 0 && (
                                            <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-500">Tidak ada data yang ditemukan</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.type === 'student' ? 'Detail Pendaftaran Murid' : 'Detail Pendaftaran Pengajar'}>
                {detailModal && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {detailModal.type === 'student' ? (
                                    <>
                                        <div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-800">{detailModal.data.student_name}</p></div>
                                        <div><p className="text-xs text-slate-500">Jenjang</p><p className="font-medium text-slate-800">{detailModal.data.level || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Alamat</p><p className="font-medium text-slate-800">{detailModal.data.address || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Sekolah</p><p className="font-medium text-slate-800">{detailModal.data.school_name || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Program</p><p className="font-medium text-slate-800">{detailModal.data.program || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Paket</p><p className="font-medium text-slate-800">{detailModal.data.package || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Mata Pelajaran</p><p className="font-medium text-slate-800">{detailModal.data.subjects || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Mode</p><p className="font-medium text-slate-800">{detailModal.data.preferred_mode || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Kontak Orang Tua</p><p className="font-medium text-slate-800">{detailModal.data.parent_contact || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Status</p>{statusBadge(detailModal.data.status)}</div>
                                        <div><p className="text-xs text-slate-500">Tanggal Daftar</p><p className="font-medium text-slate-800">{detailModal.data.created_at ? new Date(detailModal.data.created_at).toLocaleDateString('id-ID') : '-'}</p></div>
                                    </>
                                ) : (
                                    <>
                                        <div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-800">{detailModal.data.name}</p></div>
                                        <div><p className="text-xs text-slate-500">Pendidikan</p><p className="font-medium text-slate-800">{detailModal.data.education || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Alamat</p><p className="font-medium text-slate-800">{detailModal.data.address || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Mata Pelajaran</p><p className="font-medium text-slate-800">{detailModal.data.subjects || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Pengalaman</p><p className="font-medium text-slate-800">{detailModal.data.experience || '-'}</p></div>
                                        <div><p className="text-xs text-slate-500">Kontak</p><p className="font-medium text-slate-800">{detailModal.data.contact || '-'}</p></div>
                                        <div>
                                            <p className="text-xs text-slate-500">CV</p>
                                            {detailModal.data.cv_url ? (
                                                <a href={detailModal.data.cv_url} target="_blank" rel="noreferrer" className="font-medium text-violet-600 underline">Lihat CV</a>
                                            ) : <p className="font-medium text-slate-800">-</p>}
                                        </div>
                                        <div><p className="text-xs text-slate-500">Status</p>{statusBadge(detailModal.data.status)}</div>
                                        <div><p className="text-xs text-slate-500">Tanggal Daftar</p><p className="font-medium text-slate-800">{detailModal.data.created_at ? new Date(detailModal.data.created_at).toLocaleDateString('id-ID') : '-'}</p></div>
                                    </>
                                )}
                            </div>
                        </div>
                        {detailModal.data.notes && (
                            <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan</p>
                                <p className="mt-2">{detailModal.data.notes}</p>
                            </div>
                        )}
                        {detailModal.data.status === 'pending' && (canApprove || canReject) && (
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                {canReject && (
                                    <button
                                        type="button"
                                        onClick={() => { handleReject(detailModal.type, detailModal.data.id); setDetailModal(null); }}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                    >
                                        {icons.x} Tolak
                                    </button>
                                )}
                                {canApprove && (
                                    <button
                                        type="button"
                                        onClick={() => { handleApprove(detailModal.type, detailModal.data.id); setDetailModal(null); }}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        {icons.check} Setujui
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Konfirmasi Hapus" size="sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-800">{deleteModal?.name}</span>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setDeleteModal(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={handleDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
