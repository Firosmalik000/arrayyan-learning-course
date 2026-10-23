import { useState, useMemo } from 'react';

const levelColorThemes = [
    {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        gradient: 'from-amber-500 to-orange-500',
    },
    {
        bg: 'bg-sky-500/10',
        text: 'text-sky-700',
        border: 'border-sky-200',
        badge: 'bg-sky-100 text-sky-800',
        gradient: 'from-sky-500 to-blue-600',
    },
    {
        bg: 'bg-violet-500/10',
        text: 'text-violet-700',
        border: 'border-violet-200',
        badge: 'bg-violet-100 text-violet-800',
        gradient: 'from-violet-600 to-purple-600',
    },
    {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800',
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        bg: 'bg-rose-500/10',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-800',
        gradient: 'from-rose-500 to-pink-600',
    },
];

export default function LevelsTab({
    levels = [],
    onAddLevel,
    onEditLevel,
    onDeleteLevel,
    onAddClassToLevel,
    onEditClass,
    onDeleteClass,
}) {
    const [search, setSearch] = useState('');

    const filteredLevels = useMemo(() => {
        if (!search.trim()) return levels;
        const q = search.toLowerCase();
        return levels.filter((level) => {
            const matchLevel = level.name.toLowerCase().includes(q);
            const matchClass = (level.education_classes || []).some((c) =>
                c.name.toLowerCase().includes(q)
            );
            return matchLevel || matchClass;
        });
    }, [levels, search]);

    return (
        <div className="space-y-6">
            {/* Header / Actions toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 max-w-md">
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
                        placeholder="Cari jenjang atau nama kelas..."
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

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onAddLevel}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tambah Jenjang</span>
                    </button>
                </div>
            </div>

            {/* Levels Structure Cards */}
            {filteredLevels.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 mb-3">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Tidak ada jenjang ditemukan</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        {search ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada data jenjang pendidikan yang dibuat.'}
                    </p>
                    {search ? (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Reset Pencarian
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onAddLevel}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
                        >
                            + Tambah Jenjang Pertama
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-5">
                    {filteredLevels.map((level, idx) => {
                        const theme = levelColorThemes[idx % levelColorThemes.length];
                        const classCount = level.education_classes?.length || 0;
                        const subjectCount = level.subjects?.length || 0;

                        return (
                            <div
                                key={level.id}
                                className="group relative rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md"
                            >
                                {/* Top Header of Level */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-start sm:items-center gap-3.5">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-sm font-bold text-sm`}
                                        >
                                            {level.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                                    {level.name}
                                                </h3>
                                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${theme.badge}`}>
                                                    Urutan #{level.sort_order ?? 0}
                                                </span>
                                                {!level.is_active && (
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                        Non-aktif
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                <span className="font-semibold text-slate-700">{classCount} Kelas</span> terdaftar
                                                <span className="mx-2 text-slate-300">•</span>
                                                <span className="font-semibold text-slate-700">{subjectCount} Mata Pelajaran</span> terkait
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Level */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                                        <button
                                            type="button"
                                            onClick={() => onAddClassToLevel(level.id)}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100/70 transition cursor-pointer"
                                            title="Tambah kelas di jenjang ini"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Tambah Kelas</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onEditLevel(level)}
                                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                                            title="Edit Jenjang"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDeleteLevel(level)}
                                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                            title="Hapus Jenjang"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Classes list inside this level */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Daftar Kelas Pada Jenjang Ini
                                        </p>
                                    </div>

                                    {classCount === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Belum ada kelas pada jenjang {level.name}.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => onAddClassToLevel(level.id)}
                                                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer"
                                            >
                                                <span>+ Tambah Kelas Pertama</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                            {level.education_classes.map((cls) => (
                                                <div
                                                    key={cls.id}
                                                    className="group/item flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-violet-200 hover:bg-white hover:shadow-xs"
                                                >
                                                    <div className="min-w-0 flex-1 pr-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                                {cls.name}
                                                            </p>
                                                            {!cls.is_active && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" title="Non-aktif" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            Urutan #{cls.sort_order ?? 0}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-0.5 opacity-80 group-hover/item:opacity-100 transition">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEditClass(cls)}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition cursor-pointer"
                                                            title="Edit Kelas"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onDeleteClass(cls)}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                                            title="Hapus Kelas"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
