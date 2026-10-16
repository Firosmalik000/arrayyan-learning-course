import { Modal } from '@/Components/Admin';

function Field({ label, children, mono = false }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>{children}</p>
        </div>
    );
}

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('id-ID') : '-');

export default function DetailModal({
    detailModal,
    onClose,
    onApprove,
    onReject,
    onCreateInvoice,
    onResendEmail,
    resendingEmail = false,
    canApprove,
    canReject,
    canCreateInvoice,
    icons,
    statusBadge,
}) {
    return (
        <Modal
            isOpen={!!detailModal}
            onClose={onClose}
            title={detailModal?.type === 'student' ? 'Detail Pendaftaran Murid' : 'Detail Pendaftaran Pengajar'}
        >
            {detailModal && (
                <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {detailModal.type === 'student' ? (
                                <>
                                    <Field label="Nama">{detailModal.data.student_name}</Field>
                                    <Field label="No. Tiket" mono>{detailModal.data.registration_no || '-'}</Field>
                                    <Field label="Jenjang">{detailModal.data.level || '-'}</Field>
                                    <Field label="Kelas">{detailModal.data.class_level || '-'}</Field>
                                    <Field label="Alamat">{detailModal.data.address || '-'}</Field>
                                    <Field label="Sekolah">{detailModal.data.school_name || '-'}</Field>
                                    <Field label="Program">{detailModal.data.program || '-'}</Field>
                                    <Field label="Paket">{detailModal.data.package || '-'}</Field>
                                    <Field label="Mata Pelajaran">{detailModal.data.subjects || '-'}</Field>
                                    <Field label="Mode">{detailModal.data.preferred_mode || '-'}</Field>
                                    <Field label="Kontak Orang Tua">{detailModal.data.parent_contact || '-'}</Field>
                                    <Field label="Email Orang Tua">{detailModal.data.parent_email || '-'}</Field>
                                    <Field label="Status">{statusBadge(detailModal.data.status)}</Field>
                                    <Field label="Tanggal Daftar">{formatDate(detailModal.data.created_at)}</Field>
                                </>
                            ) : (
                                <>
                                    <Field label="Nama">{detailModal.data.name}</Field>
                                    <Field label="No. Tiket" mono>{detailModal.data.registration_no || '-'}</Field>
                                    <Field label="Jenjang yang Diajar">{detailModal.data.teacher_role || '-'}</Field>
                                    <Field label="Domisili">
                                        {[detailModal.data.district, detailModal.data.city].filter(Boolean).join(', ') || '-'}
                                    </Field>
                                    <Field label="Alamat">{detailModal.data.address || '-'}</Field>
                                    <Field label="Pendidikan">{detailModal.data.education || '-'}</Field>
                                    <Field label="Keahlian / Mata Pelajaran">{detailModal.data.subjects || '-'}</Field>
                                    <Field label="Pengalaman">{detailModal.data.experience || '-'}</Field>
                                    <Field label="Kontak">{detailModal.data.contact || '-'}</Field>
                                    <Field label="Email">{detailModal.data.email || '-'}</Field>
                                    <div>
                                        <p className="text-xs text-slate-500">CV</p>
                                        {detailModal.data.cv_url ? (
                                            <a href={detailModal.data.cv_url} target="_blank" rel="noreferrer" className="font-medium text-violet-600 underline">Lihat CV</a>
                                        ) : <p className="font-medium text-slate-800">-</p>}
                                    </div>
                                    <Field label="Status">{statusBadge(detailModal.data.status)}</Field>
                                    <Field label="Tanggal Daftar">{formatDate(detailModal.data.created_at)}</Field>
                                </>
                            )}
                        </div>
                    </div>
                    {detailModal.data.notes && (
                        <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan</p>
                            <p className="mt-2">{detailModal.data.notes}</p>
                        </div>
                    )}
                    {detailModal.data.admin_note && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Catatan Admin (dikirim ke pendaftar)</p>
                            <p className="mt-2">{detailModal.data.admin_note}</p>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                        <div>
                            {Boolean(detailModal.type === 'student' ? detailModal.data.parent_email : detailModal.data.email) && onResendEmail && (
                                <button
                                    type="button"
                                    disabled={resendingEmail}
                                    onClick={() => onResendEmail(detailModal.type, detailModal.data.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50 cursor-pointer"
                                    title="Kirim ulang email notifikasi ke pendaftar"
                                >
                                    <svg className={`h-3.5 w-3.5 ${resendingEmail ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {resendingEmail ? 'Mengirim...' : 'Kirim Ulang Email'}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {detailModal.data.status === 'pending' && (
                                <>
                                    {canReject && (
                                        <button
                                            type="button"
                                            onClick={() => onReject(detailModal.type, detailModal.data)}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer"
                                        >
                                            {icons.x} Tolak
                                        </button>
                                    )}
                                    {canApprove && (
                                        <button
                                            type="button"
                                            onClick={() => onApprove(detailModal.type, detailModal.data.id)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 cursor-pointer"
                                        >
                                            {icons.check} Setujui
                                        </button>
                                    )}
                                </>
                            )}
                            {detailModal.type === 'student' && detailModal.data.status === 'approved' && canCreateInvoice && (
                                <button
                                    type="button"
                                    onClick={() => onCreateInvoice(detailModal.data.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 cursor-pointer"
                                >
                                    Buatkan Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
