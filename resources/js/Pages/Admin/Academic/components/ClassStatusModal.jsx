import { Modal } from '@/Components/Admin';

export default function ClassStatusModal({ classGroup, form, onClose, onSubmit }) {
    const willActivate = !!form.data.is_active;

    return (
        <Modal
            isOpen={!!classGroup}
            onClose={onClose}
            title={willActivate ? 'Aktifkan Kembali Kelas' : 'Selesaikan Kelas'}
            size="sm"
        >
            <form onSubmit={onSubmit} className="space-y-5">
                <p className="text-sm leading-6 text-slate-600">
                    {willActivate ? (
                        <>
                            Aktifkan kembali <span className="font-semibold text-slate-800">{classGroup?.name}</span> agar jadwal,
                            absensi, nilai, dan periode dapat dikelola lagi.
                        </>
                    ) : (
                        <>
                            Selesaikan <span className="font-semibold text-slate-800">{classGroup?.name}</span>. Seluruh anggota,
                            jadwal, absensi, nilai, dan periode tetap tersimpan sebagai riwayat.
                        </>
                    )}
                </p>

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 xs:flex-row">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={form.processing}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            willActivate ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'
                        }`}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : willActivate
                              ? 'Aktifkan Kembali'
                              : 'Selesaikan Kelas'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
