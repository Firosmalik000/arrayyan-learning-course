import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    ConfirmModal,
    FlashMessage,
    PageHeader,
} from '@/Components/Admin';
import AttendanceSection, { todayStr } from './components/AttendanceSection';
import ClassCards from './components/ClassCards';
import ClassHeader from './components/ClassHeader';
import ClassModal from './components/ClassModal';
import GradeSection from './components/GradeSection';
import MemberModal from './components/MemberModal';
import MemberSection from './components/MemberSection';
import ScheduleModal from './components/ScheduleModal';
import ScheduleSection from './components/ScheduleSection';

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
    download: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
};

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

    const toggleMemberCheck = (id) => {
        setMemberChecked((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
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
                <PageHeader
                    title="Akademik"
                    subtitle="Kelola kelas, jadwal, absensi, dan nilai."
                    actions={canCreate && (
                        <button
                            type="button"
                            onClick={() => openClassModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {icons.plus} Tambah Kelas
                        </button>
                    )}
                />

                <FlashMessage flash={flash} />

                {classes.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                        Belum ada kelas. Klik “Tambah Kelas” untuk mulai.
                    </div>
                )}

                <ClassCards classes={classes} selectedId={selected?.id} onSelect={setSelectedId} />

                {selected && (
                    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                        <ClassHeader
                            selected={selected}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canExport={canExport}
                            onEdit={() => openClassModal(selected)}
                            onDelete={() => setDeleteModal({ kind: 'class', id: selected.id, name: selected.name })}
                            icons={icons}
                        />

                        <MemberSection
                            selected={selected}
                            activeMemberCount={activeMembers.length}
                            canCreate={canCreate}
                            canDelete={canDelete}
                            onAdd={openMemberModal}
                            onRemove={(m) => setDeleteModal({ kind: 'member', id: m.id, name: m.student_name })}
                            icons={icons}
                        />

                        <ScheduleSection
                            schedules={selected.schedules}
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onAdd={() => openScheduleModal()}
                            onEdit={openScheduleModal}
                            onDelete={(sch) => setDeleteModal({ kind: 'schedule', id: sch.id, name: `${sch.day} ${sch.start_time}` })}
                            icons={icons}
                        />

                        {canEdit && activeMembers.length > 0 && (
                            <AttendanceSection
                                members={activeMembers}
                                attDate={attDate}
                                setAttDate={setAttDate}
                                attRows={attRows}
                                setAttRows={setAttRows}
                                onSubmit={submitAttendance}
                            />
                        )}

                        {canEdit && activeMembers.length > 0 && (
                            <GradeSection
                                members={activeMembers}
                                subject={gradeSubject}
                                setSubject={setGradeSubject}
                                term={gradeTerm}
                                setTerm={setGradeTerm}
                                gradeRows={gradeRows}
                                setGradeRows={setGradeRows}
                                onSubmit={submitGrades}
                            />
                        )}
                    </div>
                )}
            </div>

            <ClassModal
                show={showClassModal}
                onClose={() => setShowClassModal(false)}
                editingClass={editingClass}
                form={classForm}
                programs={programs}
                teachers={teachers}
                onSubmit={saveClass}
            />

            <MemberModal
                show={showMemberModal}
                onClose={() => setShowMemberModal(false)}
                className={selected?.name}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                scholarship={scholarship}
                setScholarship={setScholarship}
                eligibleStudents={eligibleStudents}
                memberChecked={memberChecked}
                toggleCheck={toggleMemberCheck}
                selectedProgramId={selected?.program_id}
                onSubmit={submitMembers}
            />

            <ScheduleModal
                show={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                editing={editingSchedule}
                form={scheduleForm}
                days={days}
                onSubmit={saveSchedule}
            />

            <ConfirmModal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Konfirmasi Hapus"
                message={deleteModal?.kind === 'class' ? (
                    <>Hapus kelas <span className="font-semibold text-slate-800">{deleteModal?.name}</span> beserta seluruh jadwal, absensi, dan nilainya?</>
                ) : (
                    <>Hapus <span className="font-semibold text-slate-800">{deleteModal?.name}</span>?</>
                )}
                onConfirm={confirmDelete}
            />
        </>
    );
}
