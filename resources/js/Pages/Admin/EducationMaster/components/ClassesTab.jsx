import { useState, useMemo } from 'react';

export default function ClassesTab({
    levels = [],
    onAddClass,
    onEditClass,
    onDeleteClass,
}) {
    const [search, setSearch] = useState('');
    const [selectedLevelId, setSelectedLevelId] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Flatten all classes with their level reference
    const allClasses = useMemo(() => {
        const list = [];
        levels.forEach((lvl) => {
            (lvl.education_classes || []).forEach((cls) => {
                list.push({
                    ...cls,
                    levelName: lvl.name,
                    levelId: lvl.id,
                });
            });
        });
        return list;
    }, [levels]);

    const filteredClasses = useMemo(() => {
        return allClasses.filter((cls) => {
            // Level filter
            if (selectedLevelId !== 'all' && String(cls.levelId) !== String(selectedLevelId)) {
                return false;
            }
            // Status filter
            if (selectedStatus === 'active' && !cls.is_active) {
                return false;
            }
            if (selectedStatus === 'inactive' && cls.is_active) {
                return false;
            }
            // Search
            if (search.trim()) {
                const q = search.toLowerCase();
                const matchName = cls.name.toLowerCase().includes(q);
                const matchLevel = (cls.levelName || '').toLowerCase().includes(q);
                if (!matchName && !matchLevel) return false;
            }
            return true;
        });
    }, [allClasses, selectedLevelId, selectedStatus, search]);

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
                            placeholder="Cari kelas..."
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
                        <option value="all">Semua Jenjang ({allClasses.length})</option>
                        {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.id}>
                                {lvl.name} ({lvl.education_classes?.length || 0})
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
                        onClick={onAddClass}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tambah Kelas</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-5 py-3.5 w-16 text-center">Urutan</th>
                                <th className="px-5 py-3.5">Nama Kelas</th>
                                <th className="px-5 py-3.5">Jenjang Pendidikan</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredClasses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada kelas yang sesuai</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Coba sesuaikan pencarian atau filter Anda.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClasses.map((cls) => (
                                    <tr key={cls.id} className="transition hover:bg-slate-50/60">
                                        <td className="px-5 py-3.5 text-center font-bold text-slate-400">
                                            #{cls.sort_order ?? 0}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-slate-900">{cls.name}</div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 border border-violet-100">
                                                {cls.levelName}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {cls.is_active ? (
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
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEditClass(cls)}
                                                    className="rounded-xl p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition cursor-pointer"
                                                    title="Edit Kelas"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteClass(cls)}
                                                    className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                                    title="Hapus Kelas"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredClasses.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 font-medium">
                        Menampilkan {filteredClasses.length} dari total {allClasses.length} kelas terdaftar
                    </div>
                )}
            </div>
        </div>
    );
}
