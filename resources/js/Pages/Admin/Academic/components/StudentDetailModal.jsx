import { Modal, StatusBadge } from '@/Components/Admin';

export default function StudentDetailModal({
    show,
    onClose,
    member,
    className,
    classAttendances = [],
}) {
    if (!member) return null;

    const student = member.student || {};
    const contact = student.parent_contact || '';
    // Format wa phone number: replace non-digits, replace leading 0 with 62
    const cleanPhone = contact.replace(/\D/g, '');
    const waNumber = cleanPhone.startsWith('0')
        ? '62' + cleanPhone.slice(1)
        : cleanPhone.startsWith('62')
          ? cleanPhone
          : cleanPhone ? '62' + cleanPhone : '';

    const studentAtts = (classAttendances || []).filter((a) => a.student_id === member.student_id);
    const attTotal = studentAtts.length;
    const attHadir = studentAtts.filter((a) => a.status === 'hadir').length;
    const attIzin = studentAtts.filter((a) => a.status === 'izin').length;
    const attSakit = studentAtts.filter((a) => a.status === 'sakit').length;
    const attAlpa = studentAtts.filter((a) => a.status === 'alpa').length;
    const attRate = attTotal > 0 ? Math.round((attHadir / attTotal) * 100) : null;

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={`Detail Murid — ${member.student_name}`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Profile Card */}
                <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50/50 p-4 border border-violet-100/80 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary font-bold text-xl text-white shadow-md shadow-brand-primary/20">
                        {member.student_name ? member.student_name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-slate-800 truncate">
                                {member.student_name}
                            </h4>
                            <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                                ID #{member.student_id}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Kelas: <span className="font-semibold text-violet-700">{className}</span>
                            {student.school_name ? ` • ${student.school_name}` : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:self-start">
                        <StatusBadge tone={member.status === 'active' ? 'emerald' : 'slate'}>
                            {member.status === 'active' ? 'Aktif' : member.status}
                        </StatusBadge>
                        {member.is_scholarship ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                Beasiswa
                            </span>
                        ) : (
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                Reguler
                            </span>
                        )}
                        {student.preferred_mode && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 uppercase">
                                {student.preferred_mode}
                            </span>
                        )}
                    </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Data Akademik */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Data Pendidikan & Program
                        </h5>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-slate-500">Asal Sekolah</span>
                                <span className="font-medium text-slate-800 text-right">{student.school_name || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-slate-500">Jenjang / Tingkat</span>
                                <span className="font-medium text-slate-800 text-right">
                                    {[student.level, student.class_level ? `Kelas ${student.class_level}` : null].filter(Boolean).join(' • ') || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-slate-500">Program Terdaftar</span>
                                <span className="font-medium text-slate-800 text-right">{student.program || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Paket Bimbingan</span>
                                <span className="font-medium text-slate-800 text-right">{student.package || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Kontak & Wali */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Kontak & Domisili
                        </h5>
                        <div className="space-y-2 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-1.5 min-w-0">
                                <span className="text-slate-500 shrink-0">Kontak Orang Tua / HP</span>
                                <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                                    <span className="font-medium text-slate-800 break-all">{contact || '-'}</span>
                                    {waNumber && (
                                        <a
                                            href={`https://wa.me/${waNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-200"
                                            title="Chat WhatsApp"
                                        >
                                            WA
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-1.5 min-w-0">
                                <span className="text-slate-500 shrink-0">Email Wali</span>
                                {student.parent_email ? (
                                    <a
                                        href={`mailto:${student.parent_email}`}
                                        className="font-medium text-brand-primary hover:underline break-all sm:text-right"
                                    >
                                        {student.parent_email}
                                    </a>
                                ) : (
                                    <span className="font-medium text-slate-400 sm:text-right">-</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-slate-500">Alamat Tempat Tinggal</span>
                                <span className="font-medium text-slate-800 text-xs leading-relaxed break-words">
                                    {student.address || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Keanggotaan Kelas & Catatan */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status Keanggotaan Kelas
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="text-slate-500">Tanggal Masuk Kelas: </span>
                            <span className="font-medium text-slate-800">{member.joined_at || '-'}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Catatan Kelas: </span>
                            <span className="font-medium text-slate-800">{member.notes || '-'}</span>
                        </div>
                    </div>
                    {attTotal > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-slate-500">Kehadiran di Kelas:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-emerald-700">{attHadir}/{attTotal} Hadir ({attRate}%)</span>
                                {attIzin > 0 && <span className="text-amber-700 font-medium">• {attIzin} Izin</span>}
                                {attSakit > 0 && <span className="text-sky-700 font-medium">• {attSakit} Sakit</span>}
                                {attAlpa > 0 && <span className="text-rose-700 font-medium">• {attAlpa} Alpa</span>}
                            </div>
                        </div>
                    )}
                    {student.notes && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs">
                            <span className="text-slate-500">Catatan Khusus Pelajar: </span>
                            <span className="italic text-slate-700">{student.notes}</span>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap gap-2">
                        <a
                            href={`/admin/pelajar/${member.student_id}/kartu`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
                        >
                            <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                            </svg>
                            Kartu Pelajar
                        </a>
                        <a
                            href="/admin/pelajar"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
                        >
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            Data Master Pelajar
                        </a>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
    );
}
