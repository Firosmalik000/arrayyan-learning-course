import { useState, useMemo } from 'react';
import { ActionDropdown, Pagination, StatusBadge } from '@/Components/Admin';

export default function MemberSection({
    selected,
    activeMemberCount,
    canCreate,
    canEdit,
    onAdd,
    onComplete,
    onViewDetail,
    icons,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const members = selected.members ?? [];
    const totalPages = Math.ceil(members.length / perPage) || 1;
    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return members.slice(start, start + perPage);
    }, [members, currentPage, perPage]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                    Anggota ({activeMemberCount}{selected.quota != null ? `/${selected.quota}` : ''})
                </h3>
                {canCreate && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                    >
                        {icons.plus} Tambah Anggota
                    </button>
                )}
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100 w-full max-w-full">
                <table className="w-full min-w-[550px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                            <th className="w-12 px-4 py-2.5 text-center font-medium">No</th>
                            <th className="w-14 px-4 py-2.5 text-center font-medium">Aksi</th>
                            <th className="px-4 py-2.5 font-medium">Nama Murid</th>
                            <th className="px-4 py-2.5 font-medium">Kontak Wali</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium">Beasiswa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedMembers.map((m, idx) => {
                            const rowNum = (currentPage - 1) * perPage + idx + 1;
                            const student = m.student || {};
                            const contact = student.parent_contact || '';
                            const cleanPhone = contact.replace(/\D/g, '');
                            const waNumber = cleanPhone.startsWith('0')
                                ? '62' + cleanPhone.slice(1)
                                : cleanPhone.startsWith('62')
                                  ? cleanPhone
                                  : cleanPhone ? '62' + cleanPhone : '';

                            const actions = [
                                {
                                    label: 'Detail Profil Murid',
                                    onClick: () => onViewDetail(m),
                                },
                                {
                                    label: 'Cetak Kartu Pelajar',
                                    href: `/admin/pelajar/${m.student_id}/kartu`,
                                    external: true,
                                },
                                canEdit && m.status === 'active' && {
                                    label: 'Selesaikan Keikutsertaan',
                                    onClick: () => onComplete(m),
                                },
                            ].filter(Boolean);

                            return (
                                <tr key={m.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-2.5 text-center font-semibold text-slate-400">
                                        {rowNum}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <ActionDropdown actions={actions} />
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetail(m)}
                                            className="text-left font-semibold text-slate-800 hover:text-violet-600 transition group flex flex-col"
                                        >
                                            <span className="group-hover:underline">{m.student_name}</span>
                                            {student.school_name && (
                                                <span className="text-xs font-normal text-slate-400">
                                                    {student.school_name} {student.level ? `(${student.level})` : ''}
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-slate-600">
                                        {contact ? (
                                            <div className="flex items-center gap-1.5">
                                                <span>{contact}</span>
                                                {waNumber && (
                                                    <a
                                                        href={`https://wa.me/${waNumber}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                        title="Chat WhatsApp"
                                                    >
                                                        WA
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <StatusBadge tone={m.status === 'active' ? 'emerald' : 'slate'}>
                                            {m.status === 'active' ? 'Aktif' : m.status === 'graduated' ? 'Selesai' : m.status === 'moved' ? 'Pindah' : m.status}
                                        </StatusBadge>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-slate-600">
                                        {m.is_scholarship ? (
                                            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                                                Ya
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {members.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                    Belum ada anggota di kelas ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {members.length > 0 && (
                <div className="mt-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={members.length}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
