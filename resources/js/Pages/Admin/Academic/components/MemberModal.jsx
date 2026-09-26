import { Modal } from '@/Components/Admin';

export default function MemberModal({
    show,
    onClose,
    className,
    memberSearch,
    setMemberSearch,
    scholarship,
    setScholarship,
    eligibleStudents,
    memberChecked,
    toggleCheck,
    selectedProgramId,
    onSubmit,
}) {
    return (
        <Modal isOpen={show} onClose={onClose} title={`Tambah Anggota — ${className || ''}`} size="lg">
            <div className="space-y-4">
                <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Cari nama murid..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <label className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                    <input type="checkbox" checked={scholarship} onChange={(e) => setScholarship(e.target.checked)} className="h-4 w-4 rounded border-amber-300 text-amber-600" />
                    Daftarkan sebagai beasiswa (lewati syarat lunas)
                </label>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                    {eligibleStudents.map((s) => {
                        const checked = memberChecked.includes(s.id);
                        const inProgram = (s.active_program_ids ?? []).includes(selectedProgramId);
                        return (
                            <label key={s.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${checked ? 'border-violet-300 bg-violet-50' : 'border-slate-100 hover:border-violet-200'}`}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCheck(s.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                />
                                <span className="flex-1">
                                    <span className="block font-medium text-slate-800">{s.name}</span>
                                    <span className="block text-xs text-slate-500">{s.program || '-'}</span>
                                </span>
                                {s.has_paid
                                    ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Lunas</span>
                                    : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Belum lunas</span>}
                                {inProgram && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Sudah ada kelas</span>}
                            </label>
                        );
                    })}
                    {eligibleStudents.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
                            Tidak ada murid yang cocok.
                        </p>
                    )}
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={onSubmit} disabled={memberChecked.length === 0} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                        Tambahkan ({memberChecked.length})
                    </button>
                </div>
            </div>
        </Modal>
    );
}
