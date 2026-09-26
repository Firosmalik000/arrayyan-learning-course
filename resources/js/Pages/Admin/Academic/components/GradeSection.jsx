export default function GradeSection({
    members,
    subject,
    setSubject,
    term,
    setTerm,
    gradeRows,
    setGradeRows,
    onSubmit,
}) {
    return (
        <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold text-slate-800">Nilai</h3>
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Mapel (cth: Matematika)"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                    />
                    <input
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Term (cth: UTS Ganjil)"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                    />
                    <button type="button" onClick={onSubmit} className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90">
                        Simpan Nilai
                    </button>
                </div>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-slate-100">
                        {members.map((m) => (
                            <tr key={m.student_id} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-800">{m.student_name}</td>
                                <td className="px-4 py-2.5">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={gradeRows[m.student_id] ?? ''}
                                        onChange={(e) => setGradeRows((prev) => ({ ...prev, [m.student_id]: e.target.value }))}
                                        placeholder="0–100"
                                        className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
