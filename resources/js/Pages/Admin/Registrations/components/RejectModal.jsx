import { Modal } from '@/Components/Admin';

export default function RejectModal({
    rejectModal,
    adminNote,
    setAdminNote,
    waRejectPreview,
    onClose,
    onConfirm,
    icons,
}) {
    return (
        <Modal isOpen={!!rejectModal} onClose={onClose} title="Tolak Pendaftaran" size="md">
            {rejectModal && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Tolak pendaftaran <span className="font-semibold text-slate-800">{rejectModal.name}</span>{' '}
                        <span className="font-mono text-xs">({rejectModal.ticket})</span>? Pendaftar akan menerima notifikasi WhatsApp otomatis.
                    </p>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Alasan Penolakan (opsional, terkirim ke pendaftar)
                        </label>
                        <textarea
                            rows="3"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Contoh: Kuota program sudah penuh, silakan pilih program lain."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                        />
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preview Pesan WhatsApp</p>
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{waRejectPreview}</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            {icons.x} Ya, Tolak
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
