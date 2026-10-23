import { useState, useMemo } from 'react';

export default function SubjectsTab({
    subjects = [],
    levels = [],
    onAddSubject,
    onEditSubject,
    onDeleteSubject,
    onToggleSubjectLevel,
}) {
    const [search, setSearch] = useState('');
    const [selectedLevelId, setSelectedLevelId] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const filteredSubjects = useMemo(() => {
        return subjects.filter((subject) => {
            // Level filter
            if (selectedLevelId !== 'all') {
                const hasLevel = (subject.education_levels || []).some(
                    (lvl) => String(lvl.id) === String(selectedLevelId)
                );
                if (!hasLevel) return false;
            }
            // Status filter
            if (selectedStatus === 'active' && !subject.is_active) {
                return false;
            }
            if (selectedStatus === 'inactive' && subject.is_active) {
                return false;
            }
            // Search filter
            if (search.trim()) {
                const q = search.toLowerCase();
                const matchName = subject.name.toLowerCase().includes(q);
                const matchLevel = (subject.education_levels || []).some((l) =>
                    l.name.toLowerCase().includes(q)
                );
                if (!matchName && !matchLevel) return false;
            }
            return true;
        });
    }, [subjects, selectedLevelId, selectedStatus, search]);

    return (
        <div className="space-y-6">
            {/* Filter Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari mata pelajaran..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-200"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Jenjang */}
                    <select
                        value={selectedLevelId}
                        onChange={(e) => setSelectedLevelId(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs sm:text-sm text-slate-700 focus:border-violet-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-200"
                    >
                        <option value="all">Semua Jenjang</option>
                        {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.id}>
                                Jenjang {lvl.name}
                            </option>
                        ))}
                    </select>

                    {/* Filter Status */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs sm:text-sm text-slate-700 focus:border-violet-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-200"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Hanya Aktif</option>
                        <option value="inactive">Hanya Non-aktif</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                        type="button"
                        onClick={onAddSubject}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tambah Mata Pelajaran</span>
                    </button>
                </div>
            </div>

            {/* Hint Box */}
            <div className="rounded-2xl bg-amber-50/60 border border-amber-200/60 p-4 text-xs text-amber-900 flex items-start gap-3">
                <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1">
                    <p className="font-bold">Tips Penugasan Jenjang:</p>
                    <p className="text-amber-800">
                        Klik langsung pada pill jenjang untuk menghubungkan atau melepas mata pelajaran dari jenjang tersebut. Mata pelajaran minimal harus terhubung ke 1 jenjang dan tidak dapat dilepas jika sudah digunakan oleh Bank Soal.
                    </p>
                </div>
            </div>

            {/* Subjects Table / Cards */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-5 py-3.5 w-16 text-center">Urutan</th>
                                <th className="px-5 py-3.5">Mata Pelajaran</th>
                                <th className="px-5 py-3.5">Jenjang Terhubung</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredSubjects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada mata pelajaran yang sesuai</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Coba sesuaikan pencarian atau filter Anda.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubjects.map((subject) => {
                                    const assignedLevelIds = (subject.education_levels || []).map((l) => l.id);

                                    return (
                                        <tr key={subject.id} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-4 text-center font-bold text-slate-400">
                                                #{subject.sort_order ?? 0}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{subject.name}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {levels.map((level) => {
                                                        const isAssigned = assignedLevelIds.includes(level.id);
                                                        const isOnlyAssignment = isAssigned && assignedLevelIds.length === 1;

                                                        return (
                                                            <button
                                                                key={level.id}
                                                                type="button"
                                                                aria-pressed={isAssigned}
                                                                disabled={isOnlyAssignment}
                                                                onClick={() => onToggleSubjectLevel(subject, level.id)}
                                                                title={
                                                                    isOnlyAssignment
                                                                        ? 'Mata pelajaran harus terhubung ke minimal satu jenjang'
                                                                        : isAssigned
                                                                        ? `Klik untuk melepas dari jenjang ${level.name}`
                                                                        : `Klik untuk menambahkan ke jenjang ${level.name}`
                                                                }
                                                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                    isAssigned
                                                                        ? 'border border-violet-600 bg-violet-600 text-white shadow-xs hover:bg-violet-700'
                                                                        : 'border border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700'
                                                                }`}
                                                            >
                                                                {isAssigned && <span className="mr-1 text-[10px]">✓</span>}
                                                                {level.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {subject.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        Non-aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => onEditSubject(subject)}
                                                        className="rounded-xl p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition cursor-pointer"
                                                        title="Edit Mata Pelajaran"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteSubject(subject)}
                                                        className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                                        title="Hapus Mata Pelajaran"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredSubjects.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 font-medium">
                        Menampilkan {filteredSubjects.length} dari total {subjects.length} mata pelajaran terdaftar
                    </div>
                )}
            </div>
        </div>
    );
}
