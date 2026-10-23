import { Modal } from '@/Components/Admin';

export default function MemberModal({
    show,
    onClose,
    className,
    remainingQuota,
    totalQuota,
    memberSearch,
    setMemberSearch,
    scholarship,
    setScholarship,
    eligibleStudents,
    memberChecked,
    toggleCheck,
    selectAllEligible,
    unselectAll,
    selectedProgramId,
    onSubmit,
}) {
    const isOverQuota = totalQuota != null && memberChecked.length > remainingQuota;

    return (
        <Modal isOpen={show} onClose={onClose} title={`Tambah Anggota — ${className || ''}`} size="lg">
            <div className="space-y-4">
                {/* Quota & Fast Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Kapasitas Kelas:</span>
                        {totalQuota != null ? (
                            <span className="font-semibold text-slate-800">
                                Sisa <span className={remainingQuota <= 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{remainingQuota}</span> dari {totalQuota} kursi
                            </span>
                        ) : (
                            <span className="font-semibold text-emerald-700">Tidak Terbatas</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={selectAllEligible}
                            className="font-medium text-violet-600 hover:text-violet-800 hover:underline"
                        >
                            Pilih Semua
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            type="button"
                            onClick={unselectAll}
                            className="font-medium text-slate-500 hover:text-slate-700 hover:underline"
                        >
                            Reset Pilihan
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Cari murid..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                    <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>

                {/* Scholarship Option */}
                <label className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 cursor-pointer transition hover:bg-amber-100/70">
                    <input
                        type="checkbox"
                        checked={scholarship}
                        onChange={(e) => setScholarship(e.target.checked)}
                        className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                    />
                    <span className="font-semibold">Daftarkan sebagai beasiswa</span>
                </label>

                {/* Quota Exceeded Warning */}
                {isOverQuota && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <span>
                            Pilihan ({memberChecked.length}) melebihi sisa kuota ({remainingQuota} kursi).
                        </span>
                    </div>
                )}

                {/* Student List */}
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {eligibleStudents.map((s) => {
                        const checked = memberChecked.includes(s.id);
                        const inProgram = (s.active_program_ids ?? []).includes(selectedProgramId);

                        return (
                            <label
                                key={s.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                                    checked
                                        ? 'border-violet-300 bg-violet-50/80 shadow-sm'
                                        : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCheck(s.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800 truncate">{s.name}</span>
                                        {s.school_name && (
                                            <span className="text-xs text-slate-400 truncate">
                                                • {s.school_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        <span>Program: {s.program || '-'}</span>
                                        {s.level && <span>• Jenjang: {s.level}</span>}
                                        {s.package && <span>• Paket: {s.package}</span>}
                                        {s.parent_contact && <span>• Kontak: {s.parent_contact}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                    {s.has_paid ? (
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                            Lunas
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                            Belum lunas
                                        </span>
                                    )}
                                    {inProgram && (
                                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                                            Ada kelas lain
                                        </span>
                                    )}
                                </div>
                            </label>
                        );
                    })}

                    {eligibleStudents.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
                            Tidak ada data murid.
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-500">
                        {memberChecked.length} murid dipilih
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={memberChecked.length === 0 || isOverQuota}
                            className="rounded-xl bg-brand-primary px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 shadow-sm"
                        >
                            Tambahkan ({memberChecked.length})
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
