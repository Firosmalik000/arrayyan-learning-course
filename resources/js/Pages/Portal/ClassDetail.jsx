import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const attendanceOptions = ['hadir', 'izin', 'sakit', 'alpa'];
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ClassDetail() {
    const { props } = usePage();
    const cls = props.class;
    const [attDate, setAttDate] = useState(todayStr());
    const [attRows, setAttRows] = useState({});
    const [gradeSubject, setGradeSubject] = useState('');
    const [gradeTerm, setGradeTerm] = useState('');
    const [gradeRows, setGradeRows] = useState({});

    if (!cls) {
        return (
            <PortalLayout>
                <Head title="Kelas" />
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Kelas tidak ditemukan.</p>
                </div>
            </PortalLayout>
        );
    }

    const submitAttendance = () => {
        const rows = Object.entries(attRows).map(([student_id, status]) => ({
            student_id: Number(student_id),
            status,
        }));
        if (rows.length === 0) return;
        router.post(`/portal/kelas/${cls.id}/absensi`, { date: attDate, rows }, { preserveScroll: true });
    };

    const submitGrades = () => {
        if (!gradeSubject.trim() || !gradeTerm.trim()) return;
        const rows = Object.entries(gradeRows)
            .filter(([, score]) => score !== '' && score != null)
            .map(([student_id, score]) => ({ student_id: Number(student_id), score: Number(score) }));
        if (rows.length === 0) return;
        router.post(
            `/portal/kelas/${cls.id}/nilai`,
            {
                subject: gradeSubject.trim(),
                term: gradeTerm.trim(),
                rows,
            },
            { preserveScroll: true }
        );
    };

    return (
        <PortalLayout>
            <Head title={cls.name} />
            <div className="mb-6">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    {cls.name}
                </h1>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {cls.program} • {cls.filled}{cls.quota != null ? `/${cls.quota}` : ''} murid
                </p>

                {(cls.schedules ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {cls.schedules.map((s, i) => (
                            <span key={i} className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {s.day} {s.start_time}–{s.end_time}{s.room ? ` • Ruang ${s.room}` : ''}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Attendance Input Block */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                    <h3 className="font-display text-base font-bold text-slate-900">Input Absensi</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={attDate}
                            max={todayStr()}
                            onChange={(e) => setAttDate(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400"
                        />
                        <button
                            type="button"
                            onClick={submitAttendance}
                            className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 active:scale-95 transition"
                        >
                            Simpan
                        </button>
                    </div>
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                    {(cls.members ?? []).map((m) => (
                        <div key={m.student_id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-bold text-slate-800">{m.student_name}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {attendanceOptions.map((s) => {
                                    const isSelected = (attRows[m.student_id] || 'hadir') === s;
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setAttRows((prev) => ({ ...prev, [m.student_id]: s }))}
                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition ${
                                                isSelected
                                                    ? 'bg-brand-primary text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grades Input Block */}
            <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                    <h3 className="font-display text-base font-bold text-slate-900">Input Nilai</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            value={gradeSubject}
                            onChange={(e) => setGradeSubject(e.target.value)}
                            placeholder="Mata Pelajaran"
                            className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400"
                        />
                        <input
                            type="text"
                            value={gradeTerm}
                            onChange={(e) => setGradeTerm(e.target.value)}
                            placeholder="Term / Periode"
                            className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400"
                        />
                        <button
                            type="button"
                            onClick={submitGrades}
                            className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 active:scale-95 transition"
                        >
                            Simpan
                        </button>
                    </div>
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                    {(cls.members ?? []).map((m) => (
                        <div key={m.student_id} className="flex items-center justify-between gap-3 py-3">
                            <p className="text-sm font-bold text-slate-800">{m.student_name}</p>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={gradeRows[m.student_id] ?? ''}
                                onChange={(e) => setGradeRows((prev) => ({ ...prev, [m.student_id]: e.target.value }))}
                                placeholder="0–100"
                                className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-violet-400 text-center"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </PortalLayout>
    );
}
