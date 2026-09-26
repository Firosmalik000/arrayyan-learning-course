import { StatusBadge } from '@/Components/Admin';

export default function MemberSection({
    selected,
    activeMemberCount,
    canCreate,
    canDelete,
    onAdd,
    onRemove,
    icons,
}) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                    Anggota ({activeMemberCount}{selected.quota != null ? `/${selected.quota}` : ''})
                </h3>
                {canCreate && (
                    <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                        {icons.plus} Tambah Anggota
                    </button>
                )}
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-2.5 font-medium">Nama</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium">Beasiswa</th>
                            <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(selected.members ?? []).map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-800">{m.student_name}</td>
                                <td className="px-4 py-2.5">
                                    <StatusBadge tone={m.status === 'active' ? 'emerald' : 'slate'}>
                                        {m.status}
                                    </StatusBadge>
                                </td>
                                <td className="px-4 py-2.5 text-slate-600">{m.is_scholarship ? 'Ya' : '-'}</td>
                                <td className="px-4 py-2.5 text-right">
                                    {canDelete && (
                                        <button type="button" onClick={() => onRemove(m)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600" title="Keluarkan">
                                            {icons.trash}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(selected.members ?? []).length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Belum ada anggota.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
