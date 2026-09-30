import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

export default function Grades() {
    const { props } = usePage();
    const grades = props.grades ?? [];
    const [term, setTerm] = useState('');

    const terms = useMemo(() => [...new Set(grades.map((g) => g.term))], [grades]);
    const filtered = term ? grades.filter((g) => g.term === term) : grades;
    const avg = filtered.length > 0
        ? (filtered.reduce((s, g) => s + Number(g.score), 0) / filtered.length).toFixed(1)
        : null;

    return (
        <PortalLayout>
            <Head title="Nilai Saya" />
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Nilai Saya
                </h1>
                <div className="flex items-center gap-2.5">
                    {avg != null && (
                        <span className="rounded-full bg-violet-50 border border-violet-200/80 px-3.5 py-1 text-xs font-bold text-brand-primary shadow-2xs">
                            Rata-rata {avg}
                        </span>
                    )}
                    <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs cursor-pointer"
                    >
                        <option value="">Semua Term</option>
                        {terms.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Belum ada nilai.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3.5">Mata Pelajaran</th>
                                    <th className="px-5 py-3.5">Term</th>
                                    <th className="px-5 py-3.5">Kelas</th>
                                    <th className="px-5 py-3.5 text-right">Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((g, i) => {
                                    const scoreNum = Number(g.score);
                                    const scoreColor =
                                        scoreNum >= 85
                                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                            : scoreNum >= 70
                                            ? 'text-violet-700 bg-violet-50 border-violet-200'
                                            : scoreNum >= 60
                                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                                            : 'text-rose-700 bg-rose-50 border-rose-200';

                                    return (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 font-bold text-slate-800">{g.subject}</td>
                                            <td className="px-5 py-3.5 text-slate-500 font-medium">{g.term}</td>
                                            <td className="px-5 py-3.5 text-slate-600 font-medium">{g.class}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className={`inline-flex rounded-xl border px-3 py-1 font-display font-extrabold text-sm ${scoreColor}`}>
                                                    {g.score}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
