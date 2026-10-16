import { useState, useMemo } from 'react';
import { ActionDropdown, Pagination, StatusBadge } from '@/Components/Admin';

export default function ClassTable({
    classes = [],
    programs = [],
    canCreate = false,
    canEdit = false,
    canDelete = false,
    onSelectClass,
    onEditClass,
    onDeleteClass,
    onAddClass,
}) {
    const [search, setSearch] = useState('');
    const [filterProgram, setFilterProgram] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Summary statistics
    const stats = useMemo(() => {
        const total = classes.length;
        const active = classes.filter((c) => c.is_active).length;
        const totalStudents = classes.reduce((sum, c) => sum + (c.filled || 0), 0);
        const totalQuota = classes.reduce((sum, c) => sum + (c.quota || 0), 0);
        const occupancyRate = totalQuota > 0 ? Math.round((totalStudents / totalQuota) * 100) : 0;

        return { total, active, totalStudents, occupancyRate };
    }, [classes]);

    // Filtering
    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
            if (search) {
                const q = search.toLowerCase();
                const matchName = (cls.name || '').toLowerCase().includes(q);
                const matchProg = (cls.program || '').toLowerCase().includes(q);
                const matchTeacher = (cls.teacher || '').toLowerCase().includes(q);
                if (!matchName && !matchProg && !matchTeacher) return false;
            }

            if (filterProgram && String(cls.program_id) !== String(filterProgram)) {
                return false;
            }

            if (filterStatus) {
                const isActive = filterStatus === 'aktif';
                if (Boolean(cls.is_active) !== isActive) return false;
            }

            return true;
        });
    }, [classes, search, filterProgram, filterStatus]);

    const totalPages = Math.ceil(filteredClasses.length / perPage) || 1;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedClasses = filteredClasses.slice(startIndex, startIndex + perPage);

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total Kelas
                    </span>
                    <span className="mt-1 text-2xl font-extrabold text-slate-900">
                        {stats.total}
                    </span>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                        Kelas Aktif
                    </span>
                    <span className="mt-1 text-2xl font-extrabold text-emerald-700">
                        {stats.active}
                    </span>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 shadow-2xs">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-violet-600">
                        Total Murid Terdaftar
                    </span>
                    <span className="mt-1 text-2xl font-extrabold text-violet-700">
                        {stats.totalStudents}
                    </span>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 shadow-2xs">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-600">
                        Kapasitas Terisi
                    </span>
                    <span className="mt-1 text-2xl font-extrabold text-sky-700">
                        {stats.occupancyRate}%
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
                    {/* Search */}
                    <div className="relative w-full sm:min-w-[200px] sm:max-w-xs">
                        <svg
                            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari kelas, program, pengajar..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-500 shadow-2xs"
                        />
                    </div>

                    <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto">
                        {/* Program Filter */}
                        <select
                            value={filterProgram}
                            onChange={(e) => {
                                setFilterProgram(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full xs:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                        >
                            <option value="">Semua Program</option>
                            {programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full xs:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>
                </div>

                {/* Per Page */}
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto text-xs text-slate-500 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                    <span>Tampilkan:</span>
                    <select
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-500 shadow-2xs cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {/* Datatable */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="w-12 px-4 py-3.5 text-center font-bold">No</th>
                                <th className="w-14 px-3 py-3.5 text-center font-bold">Aksi</th>
                                <th className="px-5 py-3.5 font-bold">Nama Kelas</th>
                                <th className="px-5 py-3.5 font-bold">Program & Paket</th>
                                <th className="px-5 py-3.5 font-bold">Pengajar</th>
                                <th className="px-5 py-3.5 font-bold">Jadwal Mingguan</th>
                                <th className="px-5 py-3.5 font-bold text-center">Peserta / Kuota</th>
                                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedClasses.map((cls, idx) => {
                                const rowNumber = startIndex + idx + 1;
                                const isFull = cls.quota != null && cls.filled >= cls.quota;

                                const actionItems = [
                                    {
                                        label: 'Buka Detail & Kelola',
                                        icon: (
                                            <svg className="h-3.5 w-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ),
                                        onClick: () => onSelectClass(cls),
                                    },
                                    canEdit && {
                                        label: 'Edit Kelas',
                                        icon: (
                                            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                            </svg>
                                        ),
                                        onClick: () => onEditClass(cls),
                                    },
                                    canDelete && {
                                        label: 'Hapus Kelas',
                                        danger: true,
                                        icon: (
                                            <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        ),
                                        onClick: () => onDeleteClass(cls),
                                    },
                                ].filter(Boolean);

                                return (
                                    <tr
                                        key={cls.id}
                                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                                        onClick={() => onSelectClass(cls)}
                                    >
                                        {/* No */}
                                        <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                            {rowNumber}
                                        </td>

                                        {/* Aksi */}
                                        <td
                                            className="w-14 px-3 py-3.5 text-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ActionDropdown actions={actionItems} />
                                        </td>

                                        {/* Class Name */}
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-slate-900 group-hover:text-violet-700 transition">
                                                {cls.name}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                                {cls.level && (
                                                    <span className="font-semibold text-slate-600">
                                                        Jenjang {cls.level}
                                                    </span>
                                                )}
                                                {cls.total_sessions && (
                                                    <span>• {cls.total_sessions} Pertemuan</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Program & Package */}
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                                                {cls.program}
                                            </span>
                                            {cls.package && (
                                                <p className="mt-1 text-xs text-slate-500 font-medium truncate max-w-[180px]">
                                                    {cls.package}
                                                </p>
                                            )}
                                        </td>

                                        {/* Teacher */}
                                        <td className="px-5 py-3.5">
                                            {cls.teacher ? (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                                        {cls.teacher.slice(0, 1).toUpperCase()}
                                                    </span>
                                                    <span>{cls.teacher}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">
                                                    Belum ditentukan
                                                </span>
                                            )}
                                        </td>

                                        {/* Weekly Schedules */}
                                        <td className="px-5 py-3.5">
                                            {cls.schedules?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {cls.schedules.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                                                        >
                                                            {s.day} {s.start_time}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">
                                                    Belum ada jadwal
                                                </span>
                                            )}
                                        </td>

                                        {/* Members / Quota */}
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`text-xs font-extrabold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                                                    {cls.filled} {cls.quota != null ? `/ ${cls.quota}` : 'murid'}
                                                </span>
                                                {cls.quota != null && (
                                                    <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                isFull ? 'bg-rose-500' : 'bg-violet-500'
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(100, Math.round((cls.filled / cls.quota) * 100))}%`,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5 text-center">
                                            <StatusBadge tone={cls.is_active ? 'emerald' : 'slate'}>
                                                {cls.is_active ? 'Aktif' : 'Nonaktif'}
                                            </StatusBadge>
                                        </td>
                                    </tr>
                                );
                            })}

                            {paginatedClasses.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-xs text-slate-400">
                                        {classes.length === 0 ? (
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">Belum ada kelas.</p>
                                                <p className="mt-1 text-slate-400">Klik tombol "Tambah Kelas" untuk membuat kelas baru.</p>
                                                {canCreate && (
                                                    <button
                                                        type="button"
                                                        onClick={onAddClass}
                                                        className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                                                    >
                                                        + Tambah Kelas Baru
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            'Tidak ada kelas yang sesuai dengan filter pencarian.'
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredClasses.length > 0 && (
                    <div className="border-t border-slate-100 p-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredClasses.length}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
