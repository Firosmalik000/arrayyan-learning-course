import { useState, useEffect } from 'react';
import { Modal } from '@/Components/Admin';

export default function GradeModal({
    show,
    onClose,
    selectedClass,
    members = [],
    onSubmit,
}) {
    const [subject, setSubject] = useState('');
    const [term, setTerm] = useState('');
    const [rows, setRows] = useState({});

    useEffect(() => {
        if (!show) return;
        setSubject('');
        setTerm('');
        const init = {};
        members.forEach((m) => {
            init[m.student_id] = '';
        });
        setRows(init);
    }, [show, members]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!subject.trim() || !term.trim()) return;

        const payload = Object.entries(rows)
            .filter(([, score]) => score !== '' && score != null)
            .map(([student_id, score]) => ({
                student_id: Number(student_id),
                score: Number(score),
            }));

        if (payload.length === 0) return;
        onSubmit(subject.trim(), term.trim(), payload);
        onClose();
    };

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={`Input Nilai — ${selectedClass?.name ?? 'Kelas'}`}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Mata Pelajaran / Topik
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Matematika Dasar / Aljabar"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-500 shadow-2xs"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Periode / Semester / Term
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: UTS Semester 1 / Modul 2"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-500 shadow-2xs"
                            required
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                    {members.map((m, idx) => (
                        <div
                            key={m.student_id}
                            className="flex items-center justify-between p-3 hover:bg-slate-50 transition"
                        >
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-900 block">
                                    {idx + 1}. {m.student_name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    {m.student?.school_name || 'Murid'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    placeholder="0 - 100"
                                    value={rows[m.student_id] ?? ''}
                                    onChange={(e) =>
                                        setRows((prev) => ({
                                            ...prev,
                                            [m.student_id]: e.target.value,
                                        }))
                                    }
                                    className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 text-center text-xs font-bold text-slate-800 outline-none focus:border-violet-500 shadow-2xs"
                                />
                                <span className="text-xs font-semibold text-slate-400">/ 100</span>
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">
                            Belum ada murid di kelas ini.
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition"
                    >
                        Simpan Nilai
                    </button>
                </div>
            </form>
        </Modal>
    );
}
