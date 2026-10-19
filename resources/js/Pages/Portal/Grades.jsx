import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import ActionDropdown from './components/ActionDropdown';
import PortalPagination from './components/PortalPagination';

export default function Grades() {
    const { props } = usePage();
    const grades = props.grades ?? [];
    const selectedStudent = props.selected_student ?? null;

    const [term, setTerm] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailRow, setDetailRow] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleCopy = (row) => {
        const text = `Nilai ${row.subject} (${row.term}) - Kelas ${row.class}: ${row.score}`;
        navigator.clipboard?.writeText(text);
        showToast('Info nilai disalin ke clipboard');
    };

    const terms = useMemo(() => [...new Set(grades.map((g) => g.term))], [grades]);
    const filtered = useMemo(() => {
        return term ? grades.filter((g) => g.term === term) : grades;
    }, [grades, term]);

    const avg = filtered.length > 0
        ? (filtered.reduce((s, g) => s + Number(g.score), 0) / filtered.length).toFixed(1)
        : null;

    const totalItems = filtered.length;
    const startIndex = (currentPage - 1) * perPage;
    const displayedGrades = filtered.slice(startIndex, startIndex + perPage);

    return (
        <PortalLayout>
            <Head title="Nilai Belajar" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {toastMessage}
                </div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
                <div>
                    <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                        Nilai Belajar
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full xs:w-auto">
                    {avg != null && (
                        <span className="rounded-full bg-violet-50 border border-violet-200/80 px-3 py-1 text-xs font-bold text-brand-primary shadow-2xs">
                            Rata-rata {avg}
                        </span>
                    )}
                    <select
                        value={term}
                        onChange={(e) => {
                            setTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full xs:w-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs cursor-pointer"
                    >
                        <option value="">Semua Term</option>
                        {terms.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-slate-200/80 bg-white p-6 text-center shadow-2xs">
                    <p className="text-xs text-slate-400">Belum ada data nilai untuk anak yang dipilih.</p>
                    <Link
                        href="/portal"
                        className="mt-2.5 inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                        Dashboard
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                    {/* Mobile Card List (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {displayedGrades.map((g, i) => {
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
                                <div key={i} className="p-3 space-y-2 hover:bg-slate-50/50 transition">
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                {g.subject}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                {g.class} • <span className="text-violet-700 font-semibold">{g.term}</span>
                                            </p>
                                        </div>
                                        <span className={`inline-flex rounded-lg border px-2 py-0.5 font-display font-extrabold text-xs shrink-0 ${scoreColor}`}>
                                            {g.score}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setDetailRow(g)}
                                            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                                        >
                                            Detail Nilai
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(g)}
                                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95"
                                            title="Salin Info"
                                        >
                                            Salin
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Datatable (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[500px] text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="w-10 px-3 py-2.5 text-center">No</th>
                                    <th className="w-12 px-2.5 py-2.5 text-center">Aksi</th>
                                    <th className="px-3.5 py-2.5">Mata Pelajaran</th>
                                    <th className="px-3.5 py-2.5">Term</th>
                                    <th className="px-3.5 py-2.5">Kelas</th>
                                    <th className="px-3.5 py-2.5 text-right">Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedGrades.map((g, i) => {
                                    const scoreNum = Number(g.score);
                                    const scoreColor =
                                        scoreNum >= 85
                                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                            : scoreNum >= 70
                                            ? 'text-violet-700 bg-violet-50 border-violet-200'
                                            : scoreNum >= 60
                                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                                            : 'text-rose-700 bg-rose-50 border-rose-200';

                                    const rowNumber = startIndex + i + 1;

                                    const actionItems = [
                                        {
                                            label: 'Lihat Detail',
                                            icon: (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ),
                                            onClick: () => setDetailRow(g),
                                        },
                                        {
                                            label: 'Salin Nilai',
                                            icon: (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                </svg>
                                            ),
                                            onClick: () => handleCopy(g),
                                        },
                                        {
                                            label: `Filter: ${g.term}`,
                                            icon: (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                </svg>
                                            ),
                                            onClick: () => {
                                                setTerm(g.term);
                                                setCurrentPage(1);
                                            },
                                        },
                                    ];

                                    return (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Index Column */}
                                            <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                                {rowNumber}
                                            </td>

                                            {/* Action Column with 3 dots */}
                                            <td className="w-14 px-3 py-3.5 text-center">
                                                <ActionDropdown items={actionItems} label={`Aksi baris ${rowNumber}`} />
                                            </td>

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

                    {/* Pagination */}
                    <PortalPagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        perPage={perPage}
                        onPageChange={(page) => setCurrentPage(page)}
                        onPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            {/* Detail Modal */}
            {detailRow && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-3 xs:p-4 sm:p-6">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 xs:p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-display text-base font-bold text-slate-900">
                                    Detail Nilai Siswa
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setDetailRow(null)}
                                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-400 font-medium">Mata Pelajaran</span>
                                    <span className="font-bold text-slate-800">{detailRow.subject}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-400 font-medium">Periode / Term</span>
                                    <span className="font-bold text-slate-800">{detailRow.term}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-400 font-medium">Kelas</span>
                                    <span className="font-bold text-slate-800">{detailRow.class}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-400 font-medium">Skor / Nilai</span>
                                    <span className="font-display text-2xl font-black text-brand-primary">
                                        {detailRow.score}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDetailRow(null)}
                                    className="w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
