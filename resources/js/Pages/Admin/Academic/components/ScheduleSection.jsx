export default function ScheduleSection({
    schedules,
    canCreate,
    canEdit,
    canDelete,
    onAdd,
    onEdit,
    onDelete,
    icons,
}) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Jadwal Mingguan</h3>
                {canCreate && (
                    <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                        {icons.plus} Tambah Jadwal
                    </button>
                )}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(schedules ?? []).map((sch) => (
                    <div key={sch.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{sch.day}</p>
                            <p className="text-xs text-slate-500">{sch.start_time}–{sch.end_time}</p>
                        </div>
                        <div className="flex gap-1">
                            {canEdit && (
                                <button type="button" onClick={() => onEdit(sch)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-100 hover:text-violet-700" title="Edit">
                                    {icons.edit}
                                </button>
                            )}
                            {canDelete && (
                                <button type="button" onClick={() => onDelete(sch)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Hapus">
                                    {icons.trash}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {(schedules ?? []).length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 sm:col-span-2 lg:col-span-3">
                        Belum ada jadwal.
                    </p>
                )}
            </div>
        </div>
    );
}
