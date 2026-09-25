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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-display text-xl font-bold text-slate-900">Nilai Saya</h1>
                <div className="flex items-center gap-2">
                    {avg != null && (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-brand-primary">
                            Rata-rata {avg}
                        </span>
                    )}
                    <select value={term} onChange={(e) => setTerm(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none">
                        <option value="">Semua Term</option>
                        {terms.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>
            {filtered.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Belum ada nilai.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                <th className="px-4 py-3 font-medium">Mapel</th>
                                <th className="px-4 py-3 font-medium">Term</th>
                                <th className="px-4 py-3 font-medium">Kelas</th>
                                <th className="px-4 py-3 font-medium text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((g, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{g.subject}</td>
                                    <td className="px-4 py-3 text-slate-600">{g.term}</td>
                                    <td className="px-4 py-3 text-slate-600">{g.class}</td>
                                    <td className={`px-4 py-3 text-right font-display font-bold ${Number(g.score) < 60 ? 'text-red-600' : 'text-slate-900'}`}>
                                        {g.score}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PortalLayout>
    );
}
