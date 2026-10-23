import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/Components/Admin';

const attendanceOptions = [
    { value: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-600 text-white' },
    { value: 'izin', label: 'Izin', activeClass: 'bg-amber-500 text-white' },
    { value: 'sakit', label: 'Sakit', activeClass: 'bg-sky-500 text-white' },
    { value: 'alpa', label: 'Alpa', activeClass: 'bg-rose-500 text-white' },
];

const understandingLabels = {
    1: 'Sangat kurang paham',
    2: 'Kurang paham',
    3: 'Cukup memahami',
    4: 'Memahami dengan baik',
    5: 'Sangat memahami',
};

const statusDotClasses = {
    hadir: 'bg-emerald-500',
    izin: 'bg-amber-500',
    sakit: 'bg-sky-500',
    alpa: 'bg-rose-500',
};

export const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceModal({
    show,
    onClose,
    selectedClass,
    members = [],
    initialDate = '',
    attendances = [],
    onSubmit,
}) {
    const [date, setDate] = useState(initialDate || todayStr());
    const [subject, setSubject] = useState('');
    const [material, setMaterial] = useState('');
    const [rows, setRows] = useState({});
    const [scores, setScores] = useState({});
    const [evaluations, setEvaluations] = useState({});
    const [notes, setNotes] = useState({});
    const [search, setSearch] = useState('');
    const [activeStudentId, setActiveStudentId] = useState(null);
    const [formError, setFormError] = useState('');
    const [processing, setProcessing] = useState(false);

    const loadAttendanceDate = (targetDate) => {
        const dateRecords = (attendances || []).filter((attendance) => attendance.date === targetDate);
        const firstRecord = dateRecords[0];
        const statusMap = {};
        const scoreMap = {};
        const evaluationMap = {};
        const noteMap = {};

        dateRecords.forEach((attendance) => {
            statusMap[attendance.student_id] = attendance.status;
            if (attendance.understanding_score) scoreMap[attendance.student_id] = attendance.understanding_score;
            if (attendance.evaluation) evaluationMap[attendance.student_id] = attendance.evaluation;
            if (attendance.note) noteMap[attendance.student_id] = attendance.note;
        });

        const initialRows = {};
        members.forEach((member) => {
            const savedStatus = statusMap[member.student_id];
            initialRows[member.student_id] = savedStatus && savedStatus !== 'belum_absen' ? savedStatus : 'hadir';
        });

        setSubject(firstRecord?.subject || '');
        setMaterial(firstRecord?.material || '');
        setRows(initialRows);
        setScores(scoreMap);
        setEvaluations(evaluationMap);
        setNotes(noteMap);
        setActiveStudentId(members[0]?.student_id ?? null);
        setFormError('');
    };

    useEffect(() => {
        if (!show) return;

        const targetDate = initialDate || todayStr();
        setDate(targetDate);
        setSearch('');
        loadAttendanceDate(targetDate);
    }, [show, initialDate, attendances, members]);

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return members;

        return members.filter((member) => (
            (member.student_name || '').toLowerCase().includes(query)
            || (member.student?.school_name || '').toLowerCase().includes(query)
        ));
    }, [members, search]);

    const activeMember = filteredMembers.find((member) => member.student_id === activeStudentId)
        || filteredMembers[0]
        || null;
    const activeIndex = activeMember
        ? members.findIndex((member) => member.student_id === activeMember.student_id)
        : -1;
    const filteredActiveIndex = activeMember
        ? filteredMembers.findIndex((member) => member.student_id === activeMember.student_id)
        : -1;

    const isComplete = (member) => {
        const studentId = member.student_id;
        const status = rows[studentId] || 'hadir';

        return status !== 'hadir'
            || (Boolean(scores[studentId]) && Boolean(evaluations[studentId]?.trim()));
    };

    const completedCount = members.filter(isComplete).length;
    const progress = members.length > 0 ? Math.round((completedCount / members.length) * 100) : 0;

    const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    Object.values(rows).forEach((status) => {
        if (counts[status] !== undefined) counts[status] += 1;
    });

    const handleDateChange = (newDate) => {
        setDate(newDate);
        loadAttendanceDate(newDate);
    };

    const setAllStatus = (status) => {
        const updatedRows = {};
        members.forEach((member) => {
            updatedRows[member.student_id] = status;
        });
        setRows((currentRows) => ({ ...currentRows, ...updatedRows }));
        setFormError('');
    };

    const goToMember = (direction) => {
        const nextIndex = filteredActiveIndex + direction;
        if (nextIndex >= 0 && nextIndex < filteredMembers.length) {
            setActiveStudentId(filteredMembers[nextIndex].student_id);
        }
    };

    const handleSave = (event) => {
        event.preventDefault();
        setFormError('');

        if (!date || !subject.trim() || !material.trim()) {
            setFormError('Lengkapi tanggal, mata pelajaran, dan materi sebelum menyimpan.');
            return;
        }

        const incompleteMember = members.find((member) => !isComplete(member));
        if (incompleteMember) {
            setActiveStudentId(incompleteMember.student_id);
            setFormError(`Lengkapi skala pemahaman dan evaluasi untuk ${incompleteMember.student_name}.`);
            return;
        }

        const payload = members.map((member) => {
            const studentId = member.student_id;
            const status = rows[studentId] || 'hadir';

            return {
                student_id: Number(studentId),
                status,
                understanding_score: status === 'hadir' ? Number(scores[studentId]) : null,
                evaluation: status === 'hadir' ? evaluations[studentId]?.trim() || null : null,
                note: notes[studentId]?.trim() || null,
            };
        });

        setProcessing(true);
        onSubmit(date, subject.trim(), material.trim(), payload, {
            onSuccess: () => onClose(),
            onError: (errors) => {
                setFormError(Object.values(errors)[0] || 'Periksa kembali data evaluasi yang diisi.');
            },
            onFinish: () => setProcessing(false),
        });
    };

    const activeStatus = activeMember ? rows[activeMember.student_id] || 'hadir' : null;

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={`Absensi & Evaluasi — ${selectedClass?.name ?? 'Kelas'}`}
            maxWidth="max-w-6xl"
        >
            <form onSubmit={handleSave} className="space-y-4">
                <section className="grid gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:grid-cols-[180px_220px_minmax(0,1fr)]">
                    <label className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700">Tanggal</span>
                        <input
                            type="date"
                            value={date}
                            onChange={(event) => handleDateChange(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            required
                        />
                    </label>

                    <label className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700">Mata Pelajaran</span>
                        <input
                            type="text"
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            placeholder="Contoh: Calistung"
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            required
                        />
                    </label>

                    <label className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700">Materi Pertemuan</span>
                        <input
                            type="text"
                            value={material}
                            onChange={(event) => setMaterial(event.target.value)}
                            placeholder="Ringkas materi yang diajarkan hari ini"
                            maxLength={2000}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            required
                        />
                    </label>
                </section>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="border-b border-slate-200 bg-slate-50/80 lg:border-b-0 lg:border-r">
                        <div className="space-y-3 border-b border-slate-200 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-extrabold text-slate-900">Daftar murid</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{completedCount} dari {members.length} selesai</p>
                                </div>
                                <span className="text-sm font-black tabular-nums text-violet-700">{progress}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" aria-label={`Progres evaluasi ${progress}%`}>
                                <div
                                    className="h-full rounded-full bg-violet-600 transition-[width] duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {members.length > 5 && (
                                <input
                                    type="search"
                                    placeholder="Cari murid..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                />
                            )}
                        </div>

                        <div className="flex max-h-52 gap-2 overflow-x-auto p-3 lg:block lg:max-h-[410px] lg:space-y-1 lg:overflow-x-hidden lg:overflow-y-auto">
                            {filteredMembers.map((member) => {
                                const studentId = member.student_id;
                                const status = rows[studentId] || 'hadir';
                                const complete = isComplete(member);
                                const active = activeMember?.student_id === studentId;

                                return (
                                    <button
                                        key={studentId}
                                        type="button"
                                        onClick={() => setActiveStudentId(studentId)}
                                        className={`flex min-w-52 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-violet-300 lg:w-full ${
                                            active
                                                ? 'bg-violet-600 text-white shadow-sm'
                                                : 'text-slate-700 hover:bg-white'
                                        }`}
                                    >
                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${active ? 'bg-white' : statusDotClasses[status]}`} />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-bold">{member.student_name}</span>
                                            <span className={`block truncate text-[11px] ${active ? 'text-violet-100' : 'text-slate-500'}`}>
                                                {status === 'hadir' ? (complete ? 'Evaluasi lengkap' : 'Perlu evaluasi') : status}
                                            </span>
                                        </span>
                                        {complete && (
                                            <svg className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}

                            {filteredMembers.length === 0 && (
                                <p className="px-3 py-8 text-center text-sm text-slate-500">Murid tidak ditemukan.</p>
                            )}
                        </div>

                        <div className="hidden border-t border-slate-200 p-3 lg:block">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAllStatus('hadir')}
                                    className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                >
                                    Semua Hadir
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAllStatus('izin')}
                                    className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                >
                                    Semua Izin
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="min-h-[430px] p-4 sm:p-5">
                        {activeMember ? (
                            <div className="space-y-5">
                                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">{activeMember.student_name}</h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {activeMember.student?.school_name || 'Sekolah belum dicatat'}
                                            {activeMember.target_sessions != null && ` · Sesi ${activeMember.attended_sessions}/${activeMember.target_sessions}`}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold tabular-nums text-slate-500">
                                        Murid {activeIndex + 1} dari {members.length}
                                    </span>
                                </div>

                                <fieldset>
                                    <legend className="text-xs font-bold text-slate-700">Status Kehadiran</legend>
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                        {attendanceOptions.map((option) => {
                                            const selected = activeStatus === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    aria-pressed={selected}
                                                    onClick={() => {
                                                        setRows((currentRows) => ({
                                                            ...currentRows,
                                                            [activeMember.student_id]: option.value,
                                                        }));
                                                        setFormError('');
                                                    }}
                                                    className={`min-h-10 rounded-lg px-2 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                                                        selected
                                                            ? option.activeClass
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                {activeStatus === 'hadir' ? (
                                    <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
                                        <fieldset>
                                            <legend className="text-xs font-bold text-slate-700">Skala Pemahaman</legend>
                                            <div className="mt-2 grid grid-cols-5 gap-2">
                                                {[1, 2, 3, 4, 5].map((score) => {
                                                    const selected = Number(scores[activeMember.student_id]) === score;
                                                    return (
                                                        <button
                                                            key={score}
                                                            type="button"
                                                            title={understandingLabels[score]}
                                                            aria-label={`${score} - ${understandingLabels[score]}`}
                                                            aria-pressed={selected}
                                                            onClick={() => {
                                                                setScores((currentScores) => ({
                                                                    ...currentScores,
                                                                    [activeMember.student_id]: score,
                                                                }));
                                                                setFormError('');
                                                            }}
                                                            className={`h-11 rounded-lg text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                                                                selected
                                                                    ? 'bg-violet-600 text-white shadow-sm'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {score}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="mt-2 min-h-5 text-xs font-semibold text-violet-700">
                                                {scores[activeMember.student_id]
                                                    ? understandingLabels[scores[activeMember.student_id]]
                                                    : 'Pilih nilai 1 sampai 5'}
                                            </p>
                                        </fieldset>

                                        <label className="space-y-1.5">
                                            <span className="text-xs font-bold text-slate-700">Evaluasi Perkembangan</span>
                                            <textarea
                                                value={evaluations[activeMember.student_id] || ''}
                                                onChange={(event) => {
                                                    setEvaluations((currentEvaluations) => ({
                                                        ...currentEvaluations,
                                                        [activeMember.student_id]: event.target.value,
                                                    }));
                                                    setFormError('');
                                                }}
                                                placeholder="Tuliskan kemampuan yang sudah dikuasai dan bagian yang masih perlu dilatih."
                                                rows={5}
                                                maxLength={2000}
                                                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                            />
                                            <span className="block text-right text-[11px] tabular-nums text-slate-400">
                                                {(evaluations[activeMember.student_id] || '').length}/2000
                                            </span>
                                        </label>
                                    </div>
                                ) : null}

                                <label className="block space-y-1.5">
                                    <span className="text-xs font-bold text-slate-700">Catatan Kehadiran <span className="font-medium text-slate-400">(opsional)</span></span>
                                    <input
                                        type="text"
                                        value={notes[activeMember.student_id] || ''}
                                        onChange={(event) => setNotes((currentNotes) => ({
                                            ...currentNotes,
                                            [activeMember.student_id]: event.target.value,
                                        }))}
                                        placeholder="Contoh: Datang terlambat 10 menit"
                                        maxLength={255}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    />
                                </label>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => goToMember(-1)}
                                        disabled={filteredActiveIndex <= 0}
                                        className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => goToMember(1)}
                                        disabled={filteredActiveIndex >= filteredMembers.length - 1}
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-80 items-center justify-center text-center">
                                <p className="text-sm font-bold text-slate-800">Belum ada murid aktif</p>
                            </div>
                        )}
                    </main>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span>{counts.hadir} hadir</span>
                    <span aria-hidden="true">·</span>
                    <span>{counts.izin} izin</span>
                    <span aria-hidden="true">·</span>
                    <span>{counts.sakit} sakit</span>
                    <span aria-hidden="true">·</span>
                    <span>{counts.alpa} alpa</span>
                </div>

                {formError && (
                    <div role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
                        {formError}
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing || members.length === 0}
                        className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Semua'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
