import { FormInput, FormSelect, Modal } from '@/Components/Admin';

export default function ScheduleModal({
    show,
    onClose,
    editing,
    form,
    days,
    onSubmit,
}) {
    return (
        <Modal isOpen={show} onClose={onClose} title={editing ? 'Edit Jadwal' : 'Tambah Jadwal'}>
            <form onSubmit={onSubmit} className="space-y-4">
                <FormSelect
                    label="Hari"
                    value={form.data.day_of_week}
                    onChange={(v) => form.setData('day_of_week', v)}
                    options={Object.entries(days).map(([val, label]) => ({ value: String(val), label }))}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Mulai"
                        type="time"
                        value={form.data.start_time}
                        onChange={(v) => form.setData('start_time', v)}
                        required
                    />
                    <FormInput
                        label="Selesai"
                        type="time"
                        value={form.data.end_time}
                        onChange={(v) => form.setData('end_time', v)}
                        required
                        error={form.errors.end_time}
                    />
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="submit" disabled={form.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                        {editing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
