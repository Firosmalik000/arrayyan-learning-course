import { Modal } from '@/Components/Admin';

export default function CompleteMemberModal({ member, className, form, onClose, onSubmit }) {
    return (
        <Modal isOpen={!!member} onClose={onClose} title="Selesaikan Keikutsertaan Murid" size="sm">
            <form onSubmit={onSubmit} className="space-y-5">
                <p className="text-sm leading-6 text-slate-600">
                    Selesaikan keanggotaan <span className="font-semibold text-slate-800">{member?.student_name}</span>
                    {className ? <> di kelas <span className="font-semibold text-slate-800">{className}</span></> : null}.
                    Histori periode, absensi, dan nilai tetap tersimpan.
                </p>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                        type="checkbox"
                        checked={form.data.deactivate_student}
                        onChange={(event) => form.setData('deactivate_student', event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Nonaktifkan juga data murid</span>
                </label>

                {form.errors.deactivate_student && (
                    <p className="text-xs text-rose-600">{form.errors.deactivate_student}</p>
                )}

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 xs:flex-row">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing ? 'Menyimpan...' : 'Selesaikan Keikutsertaan'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
