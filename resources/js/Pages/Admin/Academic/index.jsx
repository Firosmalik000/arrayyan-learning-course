import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    ConfirmModal,
    FlashMessage,
    PageHeader,
} from '@/Components/Admin';
import AttendanceModal from './components/AttendanceModal';
import ClassDetailView from './components/ClassDetailView';
import ClassModal from './components/ClassModal';
import ClassTable from './components/ClassTable';
import GenerateSessionsModal from './components/GenerateSessionsModal';
import GradeModal from './components/GradeModal';
import MemberModal from './components/MemberModal';
import ScheduleModal from './components/ScheduleModal';
import StudentDetailModal from './components/StudentDetailModal';

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

    // Selected class ID to view in detail (default is null for Datatable view)
    const [selectedClassId, setSelectedClassId] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const kelasParam = params.get('kelas');
            if (kelasParam) return Number(kelasParam);
        }
        return null;
    });

    const selected = useMemo(() => {
        if (!selectedClassId) return null;
        return classes.find((c) => c.id === selectedClassId) ?? null;
    }, [classes, selectedClassId]);

    const activeMembers = useMemo(
        () => (selected?.members ?? []).filter((m) => m.status === 'active'),
        [selected]
    );

    // Class modal (Create / Edit)
    const [showClassModal, setShowClassModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const classForm = useForm({
        program_id: '',
        level: '',
        package_id: '',
        total_sessions: '',
        teacher_id: '',
        name: '',
        quota: '',
        is_active: true,
    });

    // Delete modal
    const [deleteModal, setDeleteModal] = useState(null);

    // Member modal
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [memberChecked, setMemberChecked] = useState([]);
    const [scholarship, setScholarship] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);

    // Schedule modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const scheduleForm = useForm({ day_of_week: '', start_time: '', end_time: '' });

    // Attendance modal & generate modal
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceModalDate, setAttendanceModalDate] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Grade modal
    const [showGradeModal, setShowGradeModal] = useState(false);

    const remainingQuota = useMemo(() => {
        if (!selected || selected.quota == null) return null;
        return Math.max(0, selected.quota - activeMembers.length);
    }, [selected, activeMembers.length]);

    const eligibleStudents = useMemo(() => {
        if (!selected) return [];
        const memberIds = new Set((selected.members ?? []).map((m) => m.student_id));
        const q = memberSearch.toLowerCase().trim();
        return students.filter((s) => {
            if (memberIds.has(s.id)) return false;
            if (q) {
                const matchName = s.name.toLowerCase().includes(q);
                const matchSchool = (s.school_name || '').toLowerCase().includes(q);
                const matchLevel = (s.level || '').toLowerCase().includes(q);
                const matchContact = (s.parent_contact || '').toLowerCase().includes(q);
                if (!matchName && !matchSchool && !matchLevel && !matchContact) return false;
            }
            return true;
        });
    }, [students, selected, memberSearch]);

    const selectAllEligible = () => {
        const available = eligibleStudents
            .filter((s) => scholarship || s.has_paid)
            .map((s) => s.id);

        if (remainingQuota != null) {
            setMemberChecked(available.slice(0, remainingQuota));
        } else {
            setMemberChecked(available);
        }
    };

    const unselectAll = () => {
        setMemberChecked([]);
    };

    // Class handlers
    const openClassModal = (cls = null) => {
        setEditingClass(cls);
        const initialProgramId = cls?.program_id ? String(cls.program_id) : '';
        const selectedProg = programs.find((p) => String(p.id) === initialProgramId);
        classForm.setData({
            program_id: initialProgramId,
            level: cls?.level || '',
            package_id: cls?.package_id ? String(cls.package_id) : '',
            total_sessions: cls?.total_sessions != null ? String(cls.total_sessions) : '',
            teacher_id: cls?.teacher_id ? String(cls.teacher_id) : '',
            name: cls?.name || '',
            quota: cls?.quota != null ? String(cls.quota) : (selectedProg?.quota != null ? String(selectedProg.quota) : ''),
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
            level: classForm.data.level || null,
            package_id: classForm.data.package_id ? Number(classForm.data.package_id) : null,
            total_sessions: classForm.data.total_sessions ? Number(classForm.data.total_sessions) : null,
            teacher_id: classForm.data.teacher_id === '' ? null : Number(classForm.data.teacher_id),
            quota: classForm.data.quota === '' ? null : Number(classForm.data.quota),
            is_active: classForm.data.is_active ? 1 : 0,
        };
        classForm.transform(() => ({ ...payload, ...(editingClass ? { _method: 'put' } : {}) }));
        const url = editingClass ? `/admin/akademik/kelas/${editingClass.id}` : '/admin/akademik/kelas';
        classForm.post(url, {
            preserveScroll: true,
            onSuccess: () => {
                setShowClassModal(false);
                if (editingClass) setSelectedClassId(editingClass.id);
            },
            onFinish: () => classForm.transform((data) => data),
        });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        if (deleteModal.kind === 'class') {
            router.delete(`/admin/akademik/kelas/${deleteModal.id}`, {
                preserveScroll: true,
                onSuccess: () => { setDeleteModal(null); setSelectedClassId(null); },
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
    const openAttendanceModal = (date = '') => {
        setAttendanceModalDate(date);
        setShowAttendanceModal(true);
    };

    const submitAttendance = (date, rows) => {
        if (!selected) return;
        router.post(`/admin/akademik/kelas/${selected.id}/absensi`, {
            date,
            rows,
        }, { preserveScroll: true });
    };

    const handleGenerateSessions = (startDate, count, dates) => {
        if (!selected) return;
        router.post(`/admin/akademik/kelas/${selected.id}/generate-pertemuan`, {
            start_date: startDate,
            count: count,
            dates: dates,
        }, { preserveScroll: true });
    };

    // Grade handlers
    const submitGrades = (subject, term, rows) => {
        if (!selected || rows.length === 0) return;
        router.post(`/admin/akademik/kelas/${selected.id}/nilai`, {
            subject,
            term,
            rows,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Akademik" />

            <div className="space-y-6">
                <FlashMessage flash={flash} />

                {/* Main Datatable View when no class selected */}
                {!selected ? (
                    <div className="space-y-6">
                        <PageHeader
                            title="Akademik"
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

                        <ClassTable
                            classes={classes}
                            programs={programs}
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onSelectClass={(cls) => setSelectedClassId(cls.id)}
                            onEditClass={(cls) => openClassModal(cls)}
                            onDeleteClass={(cls) => setDeleteModal({ kind: 'class', id: cls.id, name: cls.name })}
                            onAddClass={() => openClassModal()}
                        />
                    </div>
                ) : (
                    /* Detailed Class View */
                    <ClassDetailView
                        selectedClass={selected}
                        canEdit={canEdit}
                        canCreate={canCreate}
                        canDelete={canDelete}
                        canExport={canExport}
                        onBack={() => setSelectedClassId(null)}
                        onEditClass={() => openClassModal(selected)}
                        onDeleteClass={() => setDeleteModal({ kind: 'class', id: selected.id, name: selected.name })}
                        onOpenMemberModal={openMemberModal}
                        onRemoveMember={(m) => setDeleteModal({ kind: 'member', id: m.id, name: m.student_name })}
                        onViewStudentDetail={setViewingStudent}
                        onOpenScheduleModal={() => openScheduleModal(null)}
                        onEditSchedule={(sch) => openScheduleModal(sch)}
                        onDeleteSchedule={(sch) => setDeleteModal({ kind: 'schedule', id: sch.id, name: `${sch.day} ${sch.start_time}` })}
                        onOpenAttendanceModal={openAttendanceModal}
                        onOpenGenerateModal={() => setShowGenerateModal(true)}
                        onOpenGradeModal={() => setShowGradeModal(true)}
                        icons={icons}
                    />
                )}
            </div>

            {/* Modals */}
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
                remainingQuota={remainingQuota}
                totalQuota={selected?.quota}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                scholarship={scholarship}
                setScholarship={setScholarship}
                eligibleStudents={eligibleStudents}
                memberChecked={memberChecked}
                toggleCheck={toggleMemberCheck}
                selectAllEligible={selectAllEligible}
                unselectAll={unselectAll}
                selectedProgramId={selected?.program_id}
                onSubmit={submitMembers}
            />

            <StudentDetailModal
                show={!!viewingStudent}
                onClose={() => setViewingStudent(null)}
                member={viewingStudent}
                className={selected?.name}
                classAttendances={selected?.attendances ?? []}
            />

            <ScheduleModal
                show={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                editing={editingSchedule}
                form={scheduleForm}
                days={days}
                onSubmit={saveSchedule}
            />

            {selected && (
                <>
                    <AttendanceModal
                        show={showAttendanceModal}
                        onClose={() => setShowAttendanceModal(false)}
                        selectedClass={selected}
                        members={activeMembers}
                        initialDate={attendanceModalDate}
                        attendances={selected.attendances ?? []}
                        onSubmit={submitAttendance}
                    />

                    <GenerateSessionsModal
                        show={showGenerateModal}
                        onClose={() => setShowGenerateModal(false)}
                        selectedClass={selected}
                        onSubmit={handleGenerateSessions}
                    />

                    <GradeModal
                        show={showGradeModal}
                        onClose={() => setShowGradeModal(false)}
                        selectedClass={selected}
                        members={activeMembers}
                        onSubmit={submitGrades}
                    />
                </>
            )}

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
