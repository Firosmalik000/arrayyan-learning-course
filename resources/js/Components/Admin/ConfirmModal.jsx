import Modal from './Modal';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Hapus',
    message,
    confirmLabel = 'Ya, Hapus',
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <p className="text-slate-600">{message}</p>
                <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="mt-6 flex flex-col-reverse xs:flex-row justify-center gap-2 xs:gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full xs:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full xs:w-auto rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
