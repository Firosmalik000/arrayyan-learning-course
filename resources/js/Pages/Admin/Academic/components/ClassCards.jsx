export default function ClassCards({ classes, selectedId, onSelect }) {
    if (classes.length === 0) return null;

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {classes.map((cls) => {
                const active = selectedId === cls.id;
                const full = cls.quota != null && (cls.filled ?? 0) >= cls.quota;
                return (
                    <button
                        key={cls.id}
                        type="button"
                        onClick={() => onSelect(cls.id)}
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
    );
}
