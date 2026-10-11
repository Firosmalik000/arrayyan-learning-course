import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import ActionDropdown from './components/ActionDropdown';
import PortalPagination from './components/PortalPagination';

const formatDate = (v) => {
    if (!v) return '-';
    try {
        return new Date(v).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

export default function Attendance() {
    const { props } = usePage();
    const records = props.records ?? [];
    const rate = props.rate;
    const selectedStudent = props.selected_student ?? null;

    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailRow, setDetailRow] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleCopy = (row) => {
        const text = `Absensi: ${row.class} - ${formatDate(row.date)} - Status: ${row.status}${row.note ? ` (${row.note})` : ''}`;
        navigator.clipboard?.writeText(text);
        showToast('Info absensi disalin ke clipboard');
    };

    const totalItems = records.length;
    const startIndex = (currentPage - 1) * perPage;
    const displayedRecords = records.slice(startIndex, startIndex + perPage);

    return (
        <PortalLayout>
            <Head title="Absensi Siswa" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {toastMessage}
                </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                        Absensi Siswa
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {selectedStudent
                            ? `Rekap kehadiran belajar ananda ${selectedStudent.name}`
                            : 'Rekap kehadiran sesi kelas bimbingan belajar'}
                    </p>
                </div>
                {rate != null && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
                        Tingkat Kehadiran {rate}%
                    </span>
                )}
            </div>

            {records.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
                    <p className="text-xs text-slate-400">Belum ada data absensi untuk anak yang dipilih.</p>
                    <Link
                        href="/portal"
                        className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                        Dashboard
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="w-12 px-4 py-3.5 text-center">No</th>
                                    <th className="w-14 px-3 py-3.5 text-center">Aksi</th>
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Kelas</th>
                                    <th className="px-5 py-3.5">Catatan</th>
                                    <th className="px-5 py-3.5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedRecords.map((r, i) => {
                                    const isHadir = r.status === 'hadir';
                                    const rowNumber = startIndex + i + 1;

                                    const actionItems = [
                                        {
                                            label: 'Lihat Detail',
                                            icon: (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ),
                                            onClick: () => setDetailRow(r),
                                        },
                                        {
                                            label: 'Salin Info',
                                            icon: (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                </svg>
                                            ),
                                            onClick: () => handleCopy(r),
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

                                            <td className="px-5 py-3.5 font-medium text-slate-600 whitespace-nowrap">
                                                {formatDate(r.date)}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">
                                                {r.class}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                                                {r.note || '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                                        isHadir
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : r.status === 'alpa'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Component */}
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
                                Detail Kehadiran
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
                                <span className="text-slate-400 font-medium">Tanggal</span>
                                <span className="font-bold text-slate-800">{formatDate(detailRow.date)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-400 font-medium">Kelas</span>
                                <span className="font-bold text-slate-800">{detailRow.class}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-400 font-medium">Status</span>
                                <span className="font-bold uppercase text-brand-primary">{detailRow.status}</span>
                            </div>
                            <div className="py-1">
                                <span className="text-slate-400 font-medium block mb-1">Catatan Pengajar</span>
                                <p className="rounded-xl bg-slate-50 p-2.5 text-slate-700">
                                    {detailRow.note || 'Tidak ada catatan khusus.'}
                                </p>
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
