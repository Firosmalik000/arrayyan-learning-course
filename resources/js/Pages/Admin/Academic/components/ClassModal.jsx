import { FormCheckbox, FormInput, FormSelect, Modal } from '@/Components/Admin';

export default function ClassModal({
    show,
    onClose,
    editingClass,
    form,
    programs,
    teachers,
    onSubmit,
}) {
    return (
        <Modal isOpen={show} onClose={onClose} title={editingClass ? 'Edit Kelas' : 'Tambah Kelas'} size="lg">
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                        label="Program"
                        value={form.data.program_id}
                        onChange={(v) => form.setData('program_id', v)}
                        options={programs.map((p) => ({ value: String(p.id), label: p.level ? `${p.name} (${p.level})` : p.name }))}
                        required
                        error={form.errors.program_id}
                    />
                    <FormSelect
                        label="Pengajar"
                        value={form.data.teacher_id}
                        onChange={(v) => form.setData('teacher_id', v)}
                        options={[{ value: '', label: 'Tanpa pengajar khusus' }, ...teachers.map((t) => ({ value: String(t.id), label: t.name }))]}
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                        label="Nama Kelas"
                        value={form.data.name}
                        onChange={(v) => form.setData('name', v)}
                        placeholder="cth: Reguler SMP - A"
                        required
                        error={form.errors.name}
                    />
                    <FormInput
                        label="Ruangan"
                        value={form.data.room}
                        onChange={(v) => form.setData('room', v)}
                        placeholder="cth: R1"
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                        label="Kuota (kosong = tanpa batas)"
                        type="number"
                        value={form.data.quota}
                        onChange={(v) => form.setData('quota', v)}
                        error={form.errors.quota}
                    />
                    <FormCheckbox
                        label="Kelas aktif"
                        checked={form.data.is_active}
                        onChange={(v) => form.setData('is_active', v)}
                    />
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="submit" disabled={form.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                        {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
