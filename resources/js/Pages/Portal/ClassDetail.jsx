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
                <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Kelas tidak ditemukan.
                </p>
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
        router.post(`/portal/kelas/${cls.id}/nilai`, {
            subject: gradeSubject.trim(),
            term: gradeTerm.trim(),
            rows,
        }, { preserveScroll: true });
    };

    return (
        <PortalLayout>
            <Head title={cls.name} />
            <h1 className="font-display text-xl font-bold text-slate-900">{cls.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
                {cls.program} • {cls.filled}{cls.quota != null ? `/${cls.quota}` : ''} murid
            </p>

            {(cls.schedules ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {cls.schedules.map((s, i) => (
                        <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {s.day} {s.start_time}–{s.end_time}{s.room ? ` • ${s.room}` : ''}
                        </span>
                    ))}
                </div>
            )}

            {/* Attendance */}
            <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Input Absensi</h3>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={attDate}
                            max={todayStr()}
                            onChange={(e) => setAttDate(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none"
                        />
                        <button type="button" onClick={submitAttendance} className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-90">
                            Simpan
                        </button>
                    </div>
                </div>
                <div className="mt-3 divide-y divide-slate-100">
                    {(cls.members ?? []).map((m) => (
                        <div key={m.student_id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium text-slate-800">{m.student_name}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {attendanceOptions.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setAttRows((prev) => ({ ...prev, [m.student_id]: s }))}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                            (attRows[m.student_id] || 'hadir') === s
                                                ? 'bg-brand-primary text-white shadow'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grades */}
            <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Input Nilai</h3>
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="text"
                            value={gradeSubject}
                            onChange={(e) => setGradeSubject(e.target.value)}
                            placeholder="Mapel"
                            className="w-32 rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none"
                        />
                        <input
                            type="text"
                            value={gradeTerm}
                            onChange={(e) => setGradeTerm(e.target.value)}
                            placeholder="Term"
                            className="w-32 rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none"
                        />
                        <button type="button" onClick={submitGrades} className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-90">
                            Simpan
                        </button>
                    </div>
                </div>
                <div className="mt-3 divide-y divide-slate-100">
                    {(cls.members ?? []).map((m) => (
                        <div key={m.student_id} className="flex items-center justify-between gap-2 py-2.5">
                            <p className="text-sm font-medium text-slate-800">{m.student_name}</p>
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
                        </div>
                    ))}
                </div>
            </div>
        </PortalLayout>
    );
}
