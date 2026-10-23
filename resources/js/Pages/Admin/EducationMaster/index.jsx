import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { ConfirmModal, PageHeader } from '@/Components/Admin';
import LevelsTab from './components/LevelsTab';
import ClassesTab from './components/ClassesTab';
import SubjectsTab from './components/SubjectsTab';
import LevelModal from './components/LevelModal';
import ClassModal from './components/ClassModal';
import SubjectModal from './components/SubjectModal';

export default function EducationMaster({ levels = [], subjects = [] }) {
    // Read initial tab from URL param if present
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (['levels', 'classes', 'subjects'].includes(tab)) {
                return tab;
            }
        }
        return 'levels';
    });

    // Sync tab to URL without full page reload
    const switchTab = (tabKey) => {
        setActiveTab(tabKey);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabKey);
            window.history.replaceState({}, '', url.toString());
        }
    };

    // Calculate quick statistics
    const stats = useMemo(() => {
        const totalLevels = levels.length;
        const totalClasses = levels.reduce(
            (acc, lvl) => acc + (lvl.education_classes?.length || 0),
            0
        );
        const totalSubjects = subjects.length;
        const activeSubjects = subjects.filter((s) => s.is_active).length;

        return {
            totalLevels,
            totalClasses,
            totalSubjects,
            activeSubjects,
        };
    }, [levels, subjects]);

    // Modal state
    const [levelModal, setLevelModal] = useState({ isOpen: false, level: null });
    const [classModal, setClassModal] = useState({
        isOpen: false,
        educationClass: null,
        defaultLevelId: null,
    });
    const [subjectModal, setSubjectModal] = useState({ isOpen: false, subject: null });
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Handlers for Level
    const handleAddLevel = () => {
        setLevelModal({ isOpen: true, level: null });
    };

    const handleEditLevel = (level) => {
        setLevelModal({ isOpen: true, level });
    };

    const handleDeleteLevel = (level) => {
        setDeleteTarget({
            url: `/admin/master-pendidikan/jenjang/${level.id}`,
            typeLabel: 'jenjang',
            name: level.name,
        });
    };

    // Handlers for Class
    const handleAddClass = (defaultLevelId = null) => {
        setClassModal({
            isOpen: true,
            educationClass: null,
            defaultLevelId: defaultLevelId || levels[0]?.id || null,
        });
    };

    const handleEditClass = (cls) => {
        setClassModal({
            isOpen: true,
            educationClass: cls,
            defaultLevelId: cls.education_level_id,
        });
    };

    const handleDeleteClass = (cls) => {
        setDeleteTarget({
            url: `/admin/master-pendidikan/kelas/${cls.id}`,
            typeLabel: 'kelas',
            name: cls.name,
        });
    };

    // Handlers for Subject
    const handleAddSubject = () => {
        setSubjectModal({ isOpen: true, subject: null });
    };

    const handleEditSubject = (subject) => {
        setSubjectModal({ isOpen: true, subject });
    };

    const handleDeleteSubject = (subject) => {
        setDeleteTarget({
            url: `/admin/master-pendidikan/mapel/${subject.id}`,
            typeLabel: 'mata pelajaran',
            name: subject.name,
        });
    };

    const handleToggleSubjectLevel = (subject, levelId) => {
        const assignedLevelIds = (subject.education_levels || []).map((l) => l.id);
        const newLevelIds = assignedLevelIds.includes(levelId)
            ? assignedLevelIds.filter((id) => id !== levelId)
            : [...assignedLevelIds, levelId];

        if (newLevelIds.length === 0) {
            return;
        }

        router.put(
            `/admin/master-pendidikan/mapel/${subject.id}`,
            {
                name: subject.name,
                education_level_ids: newLevelIds,
                sort_order: subject.sort_order ?? 0,
                is_active: subject.is_active ?? true,
            },
            { preserveScroll: true }
        );
    };

    // Confirm Delete execution
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;

        router.delete(deleteTarget.url, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    // Quick add button based on active tab
    const handleActiveTabAdd = () => {
        if (activeTab === 'levels') {
            handleAddLevel();
        } else if (activeTab === 'classes') {
            handleAddClass();
        } else if (activeTab === 'subjects') {
            handleAddSubject();
        }
    };

    const activeTabAddLabel = {
        levels: 'Tambah Jenjang',
        classes: 'Tambah Kelas',
        subjects: 'Tambah Mapel',
    }[activeTab];

    return (
        <>
            <Head title="Master Data Pendidikan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-800">
                                Master Data
                            </span>
                        </div>
                        <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Jenjang, Kelas & Mata Pelajaran
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                            Kelola hierarki jenjang pendidikan, tingkatan kelas, dan distribusi mata pelajaran sebagai referensi utama Bank Soal & Akademik.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleActiveTabAdd}
                            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400 cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{activeTabAddLabel}</span>
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Jenjang</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                            {stats.totalLevels}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Tingkat utama pendidikan</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total Kelas</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                            {stats.totalClasses}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Tingkatan kelas aktif</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Mata Pelajaran</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                            {stats.totalSubjects}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{stats.activeSubjects} mapel berstatus aktif</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Integrasi Sistem</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-lg sm:text-xl font-black text-emerald-700 tracking-tight">
                            Terhubung
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Sinkron Bank Soal & Akademik</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-0 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => switchTab('levels')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                            activeTab === 'levels'
                                ? 'border-violet-600 text-violet-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Struktur Jenjang & Kelas</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                                activeTab === 'levels'
                                    ? 'bg-violet-100 text-violet-800 font-extrabold'
                                    : 'bg-slate-100 text-slate-600 font-semibold'
                            }`}
                        >
                            {levels.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => switchTab('classes')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                            activeTab === 'classes'
                                ? 'border-violet-600 text-violet-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>Daftar Kelas</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                                activeTab === 'classes'
                                    ? 'bg-violet-100 text-violet-800 font-extrabold'
                                    : 'bg-slate-100 text-slate-600 font-semibold'
                            }`}
                        >
                            {stats.totalClasses}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => switchTab('subjects')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                            activeTab === 'subjects'
                                ? 'border-violet-600 text-violet-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Mata Pelajaran</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                                activeTab === 'subjects'
                                    ? 'bg-violet-100 text-violet-800 font-extrabold'
                                    : 'bg-slate-100 text-slate-600 font-semibold'
                            }`}
                        >
                            {subjects.length}
                        </span>
                    </button>
                </div>

                {/* Tab Contents */}
                <div>
                    {activeTab === 'levels' && (
                        <LevelsTab
                            levels={levels}
                            onAddLevel={handleAddLevel}
                            onEditLevel={handleEditLevel}
                            onDeleteLevel={handleDeleteLevel}
                            onAddClassToLevel={handleAddClass}
                            onEditClass={handleEditClass}
                            onDeleteClass={handleDeleteClass}
                        />
                    )}

                    {activeTab === 'classes' && (
                        <ClassesTab
                            levels={levels}
                            onAddClass={() => handleAddClass()}
                            onEditClass={handleEditClass}
                            onDeleteClass={handleDeleteClass}
                        />
                    )}

                    {activeTab === 'subjects' && (
                        <SubjectsTab
                            subjects={subjects}
                            levels={levels}
                            onAddSubject={handleAddSubject}
                            onEditSubject={handleEditSubject}
                            onDeleteSubject={handleDeleteSubject}
                            onToggleSubjectLevel={handleToggleSubjectLevel}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <LevelModal
                isOpen={levelModal.isOpen}
                onClose={() => setLevelModal({ isOpen: false, level: null })}
                level={levelModal.level}
            />

            <ClassModal
                isOpen={classModal.isOpen}
                onClose={() =>
                    setClassModal({
                        isOpen: false,
                        educationClass: null,
                        defaultLevelId: null,
                    })
                }
                educationClass={classModal.educationClass}
                levels={levels}
                defaultLevelId={classModal.defaultLevelId}
            />

            <SubjectModal
                isOpen={subjectModal.isOpen}
                onClose={() => setSubjectModal({ isOpen: false, subject: null })}
                subject={subjectModal.subject}
                levels={levels}
            />

            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title={`Hapus ${deleteTarget?.typeLabel ? deleteTarget.typeLabel.charAt(0).toUpperCase() + deleteTarget.typeLabel.slice(1) : 'Data'}`}
                message={`Apakah Anda yakin ingin menghapus ${deleteTarget?.typeLabel || 'data'} "${deleteTarget?.name || ''}"?`}
                confirmLabel="Ya, Hapus"
            />
        </>
    );
}
