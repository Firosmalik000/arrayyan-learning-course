export default function ClassHeader({
    selected,
    canEdit,
    canDelete,
    canExport,
    onEdit,
    onDelete,
    icons,
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                    {selected.program}
                    {selected.level ? ` • Jenjang ${selected.level}` : ''}
                    {selected.total_sessions ? ` • Target ${selected.total_sessions} Pertemuan` : ''}
                    {selected.teacher ? ` • Pengajar: ${selected.teacher}` : ' • Tanpa pengajar'}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {(canEdit || canDelete) && (
                    <>
                        {canEdit && (
                            <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700">
                                {icons.edit} Edit Kelas
                            </button>
                        )}
                        {canDelete && (
                            <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-100 hover:text-red-700">
                                {icons.trash} Hapus
                            </button>
                        )}
                    </>
                )}
                {canExport && (
                    <div className="flex flex-wrap gap-2">
                        {['members', 'attendance', 'grades'].map((t) => (
                            <a
                                key={t}
                                href={`/admin/akademik/kelas/${selected.id}/export/${t}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                            >
                                {icons.download} {t === 'members' ? 'Anggota' : t === 'attendance' ? 'Absensi' : 'Nilai'} CSV
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
