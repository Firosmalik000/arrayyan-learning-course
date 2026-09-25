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
                                    <Field label="Alamat">{detailModal.data.address || '-'}</Field>
                                    <Field label="Sekolah">{detailModal.data.school_name || '-'}</Field>
                                    <Field label="Program">{detailModal.data.program || '-'}</Field>
                                    <Field label="Paket">{detailModal.data.package || '-'}</Field>
                                    <Field label="Mata Pelajaran">{detailModal.data.subjects || '-'}</Field>
                                    <Field label="Mode">{detailModal.data.preferred_mode || '-'}</Field>
                                    <Field label="Kontak Orang Tua">{detailModal.data.parent_contact || '-'}</Field>
                                    <Field label="Status">{statusBadge(detailModal.data.status)}</Field>
                                    <Field label="Tanggal Daftar">{formatDate(detailModal.data.created_at)}</Field>
                                </>
                            ) : (
                                <>
                                    <Field label="Nama">{detailModal.data.name}</Field>
                                    <Field label="No. Tiket" mono>{detailModal.data.registration_no || '-'}</Field>
                                    <Field label="Pendidikan">{detailModal.data.education || '-'}</Field>
                                    <Field label="Alamat">{detailModal.data.address || '-'}</Field>
                                    <Field label="Mata Pelajaran">{detailModal.data.subjects || '-'}</Field>
                                    <Field label="Pengalaman">{detailModal.data.experience || '-'}</Field>
                                    <Field label="Kontak">{detailModal.data.contact || '-'}</Field>
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
                    {detailModal.data.status === 'pending' && (canApprove || canReject) && (
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            {canReject && (
                                <button
                                    type="button"
                                    onClick={() => onReject(detailModal.type, detailModal.data)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                >
                                    {icons.x} Tolak
                                </button>
                            )}
                            {canApprove && (
                                <button
                                    type="button"
                                    onClick={() => onApprove(detailModal.type, detailModal.data.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    {icons.check} Setujui
                                </button>
                            )}
                        </div>
                    )}
                    {detailModal.type === 'student' && detailModal.data.status === 'approved' && canCreateInvoice && (
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => onCreateInvoice(detailModal.data.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                            >
                                Buatkan Invoice
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
