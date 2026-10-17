import { useState } from 'react';
import { ActionDropdown, StatusBadge } from '@/Components/Admin';
import MemberSection from './MemberSection';
import ScheduleSection from './ScheduleSection';
import TrackingAttendanceTable from './TrackingAttendanceTable';

export default function ClassDetailView({
    selectedClass,
    canEdit,
    canCreate,
    canDelete,
    canExport,
    onBack,
    onEditClass,
    onDeleteClass,
    onOpenMemberModal,
    onRemoveMember,
    onViewStudentDetail,
    onOpenScheduleModal,
    onEditSchedule,
    onDeleteSchedule,
    onOpenAttendanceModal,
    onOpenGenerateModal,
    onOpenGradeModal,
    icons,
}) {
    const [activeTab, setActiveTab] = useState('tracking'); // 'tracking' | 'members' | 'schedules' | 'grades'

    const activeMembers = (selectedClass.members ?? []).filter((m) => m.status === 'active');
    const isFull = selectedClass.quota != null && activeMembers.length >= selectedClass.quota;

    const exportActions = [
        {
            label: 'Export Data Anggota (CSV)',
            href: `/admin/akademik/kelas/${selectedClass.id}/export/members`,
            external: true,
        },
        {
            label: 'Export Data Absensi (CSV)',
            href: `/admin/akademik/kelas/${selectedClass.id}/export/attendance`,
            external: true,
        },
        {
            label: 'Export Data Nilai (CSV)',
            href: `/admin/akademik/kelas/${selectedClass.id}/export/grades`,
            external: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Top Navigation & Back button */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    <span>Kembali ke Daftar Kelas</span>
                </button>

                {/* Top Action buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {canEdit && (
                        <button
                            type="button"
                            onClick={onEditClass}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                        >
                            {icons.edit}
                            <span>Edit Kelas</span>
                        </button>
                    )}

                    {canExport && (
                        <ActionDropdown
                            actions={exportActions}
                            label="Export CSV"
                            className="text-xs"
                        />
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDeleteClass}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                        >
                            {icons.trash}
                            <span>Hapus Kelas</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Class Info Card Header */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 xs:p-5 sm:p-6 shadow-2xs space-y-4 w-full max-w-full">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-800">
                                {selectedClass.program}
                            </span>
                            {selectedClass.level && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                                    Jenjang {selectedClass.level}
                                </span>
                            )}
                            <StatusBadge tone={selectedClass.is_active ? 'emerald' : 'slate'}>
                                {selectedClass.is_active ? 'Aktif' : 'Nonaktif'}
                            </StatusBadge>
                        </div>
                        <h2 className="font-display text-2xl font-extrabold text-slate-900">
                            {selectedClass.name}
                        </h2>
                        {selectedClass.package && (
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Paket: {selectedClass.package}
                            </p>
                        )}
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Pengajar
                            </span>
                            <span className="text-xs font-extrabold text-slate-800">
                                {selectedClass.teacher ? selectedClass.teacher : 'Belum Ada'}
                            </span>
                        </div>
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Kapasitas
                            </span>
                            <span className={`text-xs font-extrabold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                                {activeMembers.length} {selectedClass.quota != null ? `/ ${selectedClass.quota}` : ''} Murid
                            </span>
                        </div>
                        {selectedClass.total_sessions && (
                            <div className="rounded-2xl bg-violet-50 border border-violet-100 px-3.5 py-2 text-center">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600">
                                    Target Sesi
                                </span>
                                <span className="text-xs font-extrabold text-violet-800">
                                    {selectedClass.total_sessions} Pertemuan
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pt-2 w-full max-w-full">
                    <button
                        type="button"
                        onClick={() => setActiveTab('tracking')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                            activeTab === 'tracking'
                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                        </svg>
                        <span>Tracking Absensi</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                            activeTab === 'members'
                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span>Anggota Murid ({activeMembers.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('schedules')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                            activeTab === 'schedules'
                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Jadwal Mingguan ({selectedClass.schedules?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('grades')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
                            activeTab === 'grades'
                                ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-xl'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                        </svg>
                        <span>Nilai & Perkembangan</span>
                    </button>
                </div>
            </div>

            {/* Tab Contents */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
                {activeTab === 'tracking' && (
                    <TrackingAttendanceTable
                        selectedClass={selectedClass}
                        members={activeMembers}
                        attendances={selectedClass.attendances ?? []}
                        canEdit={canEdit}
                        onOpenAttendanceModal={onOpenAttendanceModal}
                        onOpenGenerateModal={onOpenGenerateModal}
                    />
                )}

                {activeTab === 'members' && (
                    <MemberSection
                        selected={selectedClass}
                        activeMemberCount={activeMembers.length}
                        canCreate={canCreate}
                        canDelete={canDelete}
                        onAdd={onOpenMemberModal}
                        onRemove={onRemoveMember}
                        onViewDetail={onViewStudentDetail}
                        icons={icons}
                    />
                )}

                {activeTab === 'schedules' && (
                    <ScheduleSection
                        schedules={selectedClass.schedules}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onAdd={() => onOpenScheduleModal(null)}
                        onEdit={onOpenScheduleModal}
                        onDelete={onDeleteSchedule}
                        icons={icons}
                    />
                )}

                {activeTab === 'grades' && (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Nilai & Perkembangan Siswa
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Catat nilai tugas, ujian, modul, atau perkembangan akademik murid di kelas ini.
                                </p>
                            </div>

                            {canEdit && activeMembers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={onOpenGradeModal}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span>+ Input Nilai Murid</span>
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-100 w-full max-w-full">
                            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="w-12 px-4 py-3 text-center">No</th>
                                        <th className="px-5 py-3">Nama Murid</th>
                                        <th className="px-5 py-3">Sekolah & Jenjang</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeMembers.map((m, idx) => (
                                        <tr key={m.student_id} className="hover:bg-slate-50/70 transition">
                                            <td className="w-12 px-4 py-3 text-center font-mono font-bold text-slate-400 text-xs">
                                                {idx + 1}
                                            </td>
                                            <td className="px-5 py-3 font-bold text-slate-800">
                                                {m.student_name}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-500">
                                                {m.student?.school_name || '-'} {m.student?.level ? `(${m.student.level})` : ''}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                                    Aktif
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {activeMembers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-xs text-slate-400">
                                                Belum ada murid di kelas ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
