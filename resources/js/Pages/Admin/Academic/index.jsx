import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

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
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
    download: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
};

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

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const attendanceStatuses = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'alpa', label: 'Alpa' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Academic() {
    const {
        classes = [],
        programs = [],
        teachers = [],
        students = [],
        days = {},
        flash,
        allowedActions = {},
    } = usePage().props;

    const can = (action) => (allowedActions.akademik ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canExport = can('export');

    const [selectedId, setSelectedId] = useState(classes[0]?.id ?? null);
    const selected = useMemo(
        () => classes.find((c) => c.id === selectedId) ?? classes[0] ?? null,
        [classes, selectedId]
    );
    const activeMembers = useMemo(
        () => (selected?.members ?? []).filter((m) => m.status === 'active'),
        [selected]
    );

    // Class modal
    const [showClassModal, setShowClassModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const classForm = useForm({
        program_id: '',
        teacher_id: '',
        name: '',
        quota: '',
        room: '',
        is_active: true,
    });

    // Delete modal
    const [deleteModal, setDeleteModal] = useState(null);

    // Member modal
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [memberChecked, setMemberChecked] = useState([]);
    const [scholarship, setScholarship] = useState(false);

    // Schedule modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const scheduleForm = useForm({ day_of_week: '', start_time: '', end_time: '', room: '' });

    // Attendance
    const [attDate, setAttDate] = useState(todayStr());
    const [attRows, setAttRows] = useState({});

    // Grades
    const [gradeSubject, setGradeSubject] = useState('');
    const [gradeTerm, setGradeTerm] = useState('');
    const [gradeRows, setGradeRows] = useState({});

    useEffect(() => {
        if (!classes.find((c) => c.id === selectedId) && classes[0]) {
            setSelectedId(classes[0].id);
        }
    }, [classes, selectedId]);

    useEffect(() => {
        const init = {};
        activeMembers.forEach((m) => { init[m.student_id] = 'hadir'; });
        setAttRows(init);
        setGradeRows({});
    }, [selected?.id, activeMembers.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const eligibleStudents = useMemo(() => {
        if (!selected) return [];
        const memberIds = new Set((selected.members ?? []).map((m) => m.student_id));
        const q = memberSearch.toLowerCase();
        return students.filter((s) => {
            if (memberIds.has(s.id)) return false;
            if (q && !s.name.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [students, selected, memberSearch]);

    // Class handlers
    const openClassModal = (cls = null) => {
        setEditingClass(cls);
        classForm.setData({
            program_id: cls?.program_id ? String(cls.program_id) : '',
            teacher_id: cls?.teacher_id ? String(cls.teacher_id) : '',
            name: cls?.name || '',
            quota: cls?.quota ?? '',
            room: cls?.room || '',
            is_active: cls ? !!cls.is_active : true,
        });
        classForm.clearErrors();
        setShowClassModal(true);
    };

    const saveClass = (e) => {
        e.preventDefault();
        const payload = {
            ...classForm.data,
            program_id: Number(classForm.data.program_id),
            teacher_id: classForm.data.teacher_id === '' ? null : Number(classForm.data.teacher_id),
            quota: classForm.data.quota === '' ? null : Number(classForm.data.quota),
            is_active: classForm.data.is_active ? 1 : 0,
        };
        classForm.transform(() => ({ ...payload, ...(editingClass ? { _method: 'put' } : {}) }));
        const url = editingClass ? `/admin/akademik/kelas/${editingClass.id}` : '/admin/akademik/kelas';
        classForm.post(url, {
            preserveScroll: true,
            onSuccess: () => { setShowClassModal(false); setSelectedId(editingClass?.id ?? null); },
            onFinish: () => classForm.transform((data) => data),
        });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        if (deleteModal.kind === 'class') {
            router.delete(`/admin/akademik/kelas/${deleteModal.id}`, {
                preserveScroll: true,
                onSuccess: () => { setDeleteModal(null); setSelectedId(null); },
            });
        } else if (deleteModal.kind === 'member') {
            router.delete(`/admin/akademik/anggota/${deleteModal.id}`, {
                preserveScroll: true,
                onSuccess: () => setDeleteModal(null),
            });
        } else if (deleteModal.kind === 'schedule') {
            router.delete(`/admin/akademik/jadwal/${deleteModal.id}`, {
                preserveScroll: true,
                onSuccess: () => setDeleteModal(null),
            });
        }
    };

    // Member handlers
    const openMemberModal = () => {
        setMemberChecked([]);
        setMemberSearch('');
        setScholarship(false);
        setShowMemberModal(true);
    };

    const submitMembers = () => {
        if (memberChecked.length === 0 || !selected) return;
        router.post(`/admin/akademik/kelas/${selected.id}/anggota`, {
            student_ids: memberChecked,
            is_scholarship: scholarship,
        }, {
            preserveScroll: true,
            onSuccess: () => { setShowMemberModal(false); setMemberChecked([]); },
        });
    };

    // Schedule handlers
    const openScheduleModal = (sch = null) => {
        setEditingSchedule(sch);
        scheduleForm.setData({
            day_of_week: sch ? String(sch.day_of_week) : '',
            start_time: sch ? sch.start_time : '',
            end_time: sch ? sch.end_time : '',
            room: sch?.room || '',
        });
        scheduleForm.clearErrors();
        setShowScheduleModal(true);
    };

    const saveSchedule = (e) => {
        e.preventDefault();
        scheduleForm.transform((data) => ({ ...data, ...(editingSchedule ? { _method: 'put' } : {}) }));
        const url = editingSchedule
            ? `/admin/akademik/jadwal/${editingSchedule.id}`
            : `/admin/akademik/kelas/${selected.id}/jadwal`;
        scheduleForm.post(url, {
            preserveScroll: true,
            onSuccess: () => setShowScheduleModal(false),
            onFinish: () => scheduleForm.transform((data) => data),
        });
    };

    // Attendance handlers
    const submitAttendance = () => {
        if (!selected) return;
        const rows = Object.entries(attRows).map(([student_id, status]) => ({
            student_id: Number(student_id),
            status,
        }));
        router.post(`/admin/akademik/kelas/${selected.id}/absensi`, {
            date: attDate,
            rows,
        }, { preserveScroll: true });
    };

    // Grade handlers
    const submitGrades = () => {
        if (!selected || !gradeSubject.trim() || !gradeTerm.trim()) return;
        const rows = Object.entries(gradeRows)
            .filter(([, score]) => score !== '' && score != null)
            .map(([student_id, score]) => ({ student_id: Number(student_id), score: Number(score) }));
        if (rows.length === 0) return;
        router.post(`/admin/akademik/kelas/${selected.id}/nilai`, {
            subject: gradeSubject.trim(),
            term: gradeTerm.trim(),
            rows,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Akademik" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Akademik</h1>
                        <p className="mt-1 text-sm text-slate-600">Kelola kelas, jadwal, absensi, dan nilai.</p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openClassModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {icons.plus} Tambah Kelas
                        </button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {classes.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                        Belum ada kelas. Klik “Tambah Kelas” untuk mulai.
                    </div>
                )}

                {/* Class selector */}
                {classes.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {classes.map((cls) => {
                            const active = selected?.id === cls.id;
                            const full = cls.quota != null && (cls.filled ?? 0) >= cls.quota;
                            return (
                                <button
                                    key={cls.id}
                                    type="button"
                                    onClick={() => setSelectedId(cls.id)}
                                    className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                                        active
                                            ? 'border-violet-300 bg-violet-50/60 ring-2 ring-violet-200'
                                            : 'border-slate-100 bg-white hover:border-violet-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-800">{cls.name}</p>
                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                {cls.program} • {cls.teacher || 'Tanpa pengajar'}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {cls.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${full ? 'text-red-600' : 'text-slate-600'}`}>
                                            {cls.quota != null ? `${cls.filled ?? 0}/${cls.quota} murid` : `${cls.filled ?? 0} murid`}
                                        </span>
                                        <span className="text-slate-500">{(cls.schedules ?? []).length} jadwal</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {selected && (
                    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                        {/* Class header */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {selected.program} • {selected.teacher || 'Tanpa pengajar'}
                                    {selected.room ? ` • Ruang ${selected.room}` : ''}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(canEdit || canDelete) && (
                                    <>
                                        {canEdit && (
                                            <button type="button" onClick={() => openClassModal(selected)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700">
                                                {icons.edit} Edit Kelas
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button type="button" onClick={() => setDeleteModal({ kind: 'class', id: selected.id, name: selected.name })} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-100 hover:text-red-700">
                                                {icons.trash} Hapus
                                            </button>
                                        )}
                                    </>
                                )}
                                {canExport && (
                                    <div className="flex flex-wrap gap-2">
                                        {['members', 'attendance', 'grades'].map((t) => (
                                            <a
                                                key={t}
                                                href={`/admin/akademik/kelas/${selected.id}/export/${t}`}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                                            >
                                                {icons.download} {t === 'members' ? 'Anggota' : t === 'attendance' ? 'Absensi' : 'Nilai'} CSV
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Members */}
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">
                                    Anggota ({activeMembers.length}{selected.quota != null ? `/${selected.quota}` : ''})
                                </h3>
                                {canCreate && (
                                    <button type="button" onClick={openMemberModal} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                                        {icons.plus} Tambah Anggota
                                    </button>
                                )}
                            </div>
                            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                            <th className="px-4 py-2.5 font-medium">Nama</th>
                                            <th className="px-4 py-2.5 font-medium">Status</th>
                                            <th className="px-4 py-2.5 font-medium">Beasiswa</th>
                                            <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(selected.members ?? []).map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2.5 font-medium text-slate-800">{m.student_name}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600">{m.is_scholarship ? 'Ya' : '-'}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    {canDelete && (
                                                        <button type="button" onClick={() => setDeleteModal({ kind: 'member', id: m.id, name: m.student_name })} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Keluarkan">
                                                            {icons.trash}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {(selected.members ?? []).length === 0 && (
                                            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Belum ada anggota.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Schedules */}
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">Jadwal Mingguan</h3>
                                {canCreate && (
                                    <button type="button" onClick={() => openScheduleModal()} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                                        {icons.plus} Tambah Jadwal
                                    </button>
                                )}
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {(selected.schedules ?? []).map((sch) => (
                                    <div key={sch.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{sch.day}</p>
                                            <p className="text-xs text-slate-500">{sch.start_time}–{sch.end_time}{sch.room ? ` • ${sch.room}` : ''}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {canEdit && (
                                                <button type="button" onClick={() => openScheduleModal(sch)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-100 hover:text-violet-700" title="Edit">
                                                    {icons.edit}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button type="button" onClick={() => setDeleteModal({ kind: 'schedule', id: sch.id, name: `${sch.day} ${sch.start_time}` })} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Hapus">
                                                    {icons.trash}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(selected.schedules ?? []).length === 0 && (
                                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 sm:col-span-2 lg:col-span-3">
                                        Belum ada jadwal.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Attendance */}
                        {canEdit && activeMembers.length > 0 && (
                            <div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-sm font-bold text-slate-800">Absensi</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={attDate}
                                            max={todayStr()}
                                            onChange={(e) => setAttDate(e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                                        />
                                        <button type="button" onClick={submitAttendance} className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90">
                                            Simpan Absensi
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-left text-sm">
                                        <tbody className="divide-y divide-slate-100">
                                            {activeMembers.map((m) => (
                                                <tr key={m.student_id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2.5 font-medium text-slate-800">{m.student_name}</td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {attendanceStatuses.map((s) => (
                                                                <button
                                                                    key={s.value}
                                                                    type="button"
                                                                    onClick={() => setAttRows((prev) => ({ ...prev, [m.student_id]: s.value }))}
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                                        (attRows[m.student_id] || 'hadir') === s.value
                                                                            ? 'bg-brand-primary text-white shadow'
                                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                                    }`}
                                                                >
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Grades */}
                        {canEdit && activeMembers.length > 0 && (
                            <div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-sm font-bold text-slate-800">Nilai</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            type="text"
                                            value={gradeSubject}
                                            onChange={(e) => setGradeSubject(e.target.value)}
                                            placeholder="Mapel (cth: Matematika)"
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={gradeTerm}
                                            onChange={(e) => setGradeTerm(e.target.value)}
                                            placeholder="Term (cth: UTS Ganjil)"
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                                        />
                                        <button type="button" onClick={submitGrades} className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90">
                                            Simpan Nilai
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-left text-sm">
                                        <tbody className="divide-y divide-slate-100">
                                            {activeMembers.map((m) => (
                                                <tr key={m.student_id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2.5 font-medium text-slate-800">{m.student_name}</td>
                                                    <td className="px-4 py-2.5">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            value={gradeRows[m.student_id] ?? ''}
                                                            onChange={(e) => setGradeRows((prev) => ({ ...prev, [m.student_id]: e.target.value }))}
                                                            placeholder="0–100"
                                                            className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Class Modal */}
            <Modal isOpen={showClassModal} onClose={() => setShowClassModal(false)} title={editingClass ? 'Edit Kelas' : 'Tambah Kelas'} size="lg">
                <form onSubmit={saveClass} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Program *</label>
                            <select value={classForm.data.program_id} onChange={(e) => classForm.setData('program_id', e.target.value)} className={inputClass} required>
                                <option value="" disabled>Pilih Program</option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}{p.level ? ` (${p.level})` : ''}</option>
                                ))}
                            </select>
                            {classForm.errors.program_id && <p className="mt-1 text-xs text-rose-500">{classForm.errors.program_id}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Pengajar</label>
                            <select value={classForm.data.teacher_id} onChange={(e) => classForm.setData('teacher_id', e.target.value)} className={inputClass}>
                                <option value="">Tanpa pengajar khusus</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Nama Kelas *</label>
                            <input type="text" value={classForm.data.name} onChange={(e) => classForm.setData('name', e.target.value)} placeholder="cth: Reguler SMP - A" className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Ruangan</label>
                            <input type="text" value={classForm.data.room} onChange={(e) => classForm.setData('room', e.target.value)} placeholder="cth: R1" className={inputClass} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Kuota (kosong = tanpa batas)</label>
                            <input type="number" min="1" value={classForm.data.quota} onChange={(e) => classForm.setData('quota', e.target.value)} className={inputClass} />
                        </div>
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700">
                            <input type="checkbox" checked={classForm.data.is_active} onChange={(e) => classForm.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                            Kelas aktif
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowClassModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={classForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                            {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Member Modal */}
            <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title={`Tambah Anggota — ${selected?.name || ''}`} size="lg">
                <div className="space-y-4">
                    <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Cari nama murid..."
                        className={inputClass}
                    />
                    <label className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                        <input type="checkbox" checked={scholarship} onChange={(e) => setScholarship(e.target.checked)} className="h-4 w-4 rounded border-amber-300 text-amber-600" />
                        Daftarkan sebagai beasiswa (lewati syarat lunas)
                    </label>
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                        {eligibleStudents.map((s) => {
                            const checked = memberChecked.includes(s.id);
                            const inProgram = (s.active_program_ids ?? []).includes(selected?.program_id);
                            return (
                                <label key={s.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${checked ? 'border-violet-300 bg-violet-50' : 'border-slate-100 hover:border-violet-200'}`}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => setMemberChecked((prev) => (checked ? prev.filter((v) => v !== s.id) : [...prev, s.id]))}
                                        className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                    />
                                    <span className="flex-1">
                                        <span className="block font-medium text-slate-800">{s.name}</span>
                                        <span className="block text-xs text-slate-500">{s.program || '-'}</span>
                                    </span>
                                    {s.has_paid
                                        ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Lunas</span>
                                        : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Belum lunas</span>}
                                    {inProgram && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Sudah ada kelas</span>}
                                </label>
                            );
                        })}
                        {eligibleStudents.length === 0 && (
                            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
                                Tidak ada murid yang cocok.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowMemberModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="button" onClick={submitMembers} disabled={memberChecked.length === 0} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                            Tambahkan ({memberChecked.length})
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Schedule Modal */}
            <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title={editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}>
                <form onSubmit={saveSchedule} className="space-y-4">
                    <div>
                        <label className={labelClass}>Hari *</label>
                        <select value={scheduleForm.data.day_of_week} onChange={(e) => scheduleForm.setData('day_of_week', e.target.value)} className={inputClass} required>
                            <option value="" disabled>Pilih Hari</option>
                            {Object.entries(days).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Mulai *</label>
                            <input type="time" value={scheduleForm.data.start_time} onChange={(e) => scheduleForm.setData('start_time', e.target.value)} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Selesai *</label>
                            <input type="time" value={scheduleForm.data.end_time} onChange={(e) => scheduleForm.setData('end_time', e.target.value)} className={inputClass} required />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Ruangan</label>
                        <input type="text" value={scheduleForm.data.room} onChange={(e) => scheduleForm.setData('room', e.target.value)} placeholder="cth: R1" className={inputClass} />
                    </div>
                    {scheduleForm.errors.end_time && <p className="text-xs text-rose-500">{scheduleForm.errors.end_time}</p>}
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowScheduleModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={scheduleForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                            {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Konfirmasi Hapus" size="sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        {deleteModal?.kind === 'class' && (
                            <>Hapus kelas <span className="font-semibold text-slate-800">{deleteModal?.name}</span> beserta seluruh jadwal, absensi, dan nilainya?</>
                        )}
                        {deleteModal?.kind !== 'class' && (
                            <>Hapus <span className="font-semibold text-slate-800">{deleteModal?.name}</span>?</>
                        )}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setDeleteModal(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
