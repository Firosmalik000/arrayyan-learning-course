const attendanceOptions = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'alpa', label: 'Alpa' },
];

export const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceSection({
    members,
    attDate,
    setAttDate,
    attRows,
    setAttRows,
    onSubmit,
}) {
    return (
        <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold text-slate-800">Absensi</h3>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={attDate}
                        max={todayStr()}
                        onChange={(e) => setAttDate(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none"
                    />
                    <button type="button" onClick={onSubmit} className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90">
                        Simpan Absensi
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
                                    <div className="flex flex-wrap gap-1.5">
                                        {attendanceOptions.map((s) => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => setAttRows((prev) => ({ ...prev, [m.student_id]: s.value }))}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                    (attRows[m.student_id] || 'hadir') === s.value
                                                        ? 'bg-brand-primary text-white shadow'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
