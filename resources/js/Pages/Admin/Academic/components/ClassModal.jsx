import { useMemo } from 'react';
import { FormCheckbox, FormInput, FormSelect, Modal } from '@/Components/Admin';

export default function ClassModal({
    show,
    onClose,
    editingClass,
    form,
    programs = [],
    teachers = [],
    onSubmit,
}) {
    const selectedProgram = useMemo(
        () => programs.find((p) => String(p.id) === String(form.data.program_id)) || null,
        [programs, form.data.program_id]
    );

    // Jenjang list derived from packages of selected program
    const availableLevels = useMemo(() => {
        if (!selectedProgram) return [];
        const levels = (selectedProgram.packages ?? [])
            .map((p) => p.level)
            .filter(Boolean);
        const unique = [...new Set(levels)];
        if (unique.length === 0 && selectedProgram.level) {
            unique.push(selectedProgram.level);
        }
        return unique;
    }, [selectedProgram]);

    // Packages list derived from program and filtered by selected level
    const availablePackages = useMemo(() => {
        if (!selectedProgram) return [];
        const pkgs = selectedProgram.packages ?? [];
        if (!form.data.level) return pkgs;
        return pkgs.filter((p) => !p.level || p.level === form.data.level);
    }, [selectedProgram, form.data.level]);

    const handleProgramChange = (progId) => {
        const found = programs.find((p) => String(p.id) === String(progId));
        const levels = found?.packages ? [...new Set(found.packages.map((p) => p.level).filter(Boolean))] : [];
        const defaultLevel = levels.length === 1 ? levels[0] : '';
        const matchingPkgs = (found?.packages ?? []).filter((p) => !defaultLevel || p.level === defaultLevel);
        const defaultPkg = matchingPkgs.length === 1 ? matchingPkgs[0] : null;

        form.setData((prev) => ({
            ...prev,
            program_id: progId,
            level: defaultLevel,
            package_id: defaultPkg ? String(defaultPkg.id) : '',
            total_sessions: defaultPkg?.sessions != null ? String(defaultPkg.sessions) : '',
            quota: defaultPkg?.max_participants != null ? String(defaultPkg.max_participants) : (found?.quota != null ? String(found.quota) : prev.quota),
        }));
    };

    const handleLevelChange = (lvl) => {
        const matchingPkgs = (selectedProgram?.packages ?? []).filter((p) => !lvl || p.level === lvl);
        const defaultPkg = matchingPkgs.length === 1 ? matchingPkgs[0] : null;

        form.setData((prev) => ({
            ...prev,
            level: lvl,
            package_id: defaultPkg ? String(defaultPkg.id) : '',
            total_sessions: defaultPkg?.sessions != null ? String(defaultPkg.sessions) : prev.total_sessions,
            quota: defaultPkg?.max_participants != null ? String(defaultPkg.max_participants) : prev.quota,
        }));
    };

    const handlePackageChange = (pkgId) => {
        const found = availablePackages.find((p) => String(p.id) === String(pkgId));
        form.setData((prev) => ({
            ...prev,
            package_id: pkgId,
            total_sessions: found?.sessions != null ? String(found.sessions) : prev.total_sessions,
            quota: found?.max_participants != null ? String(found.max_participants) : (selectedProgram?.quota != null ? String(selectedProgram.quota) : prev.quota),
        }));
    };

    return (
        <Modal isOpen={show} onClose={onClose} title={editingClass ? 'Edit Kelas' : 'Tambah Kelas'} size="lg">
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Baris 1: Program & Jenjang */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                        label="Program"
                        value={form.data.program_id}
                        onChange={handleProgramChange}
                        options={programs.map((p) => ({
                            value: String(p.id),
                            label: p.name,
                        }))}
                        required
                        error={form.errors.program_id}
                    />
                    <FormSelect
                        label="Jenjang Pendidikan"
                        value={form.data.level || ''}
                        onChange={handleLevelChange}
                        options={[
                            { value: '', label: availableLevels.length > 0 ? 'Pilih Jenjang' : 'Umum / Semua Jenjang' },
                            ...availableLevels.map((lvl) => ({ value: lvl, label: lvl })),
                        ]}
                        disabled={!selectedProgram}
                        error={form.errors.level}
                    />
                </div>

                {/* Baris 2: Paket / Jumlah Pertemuan & Pengajar */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FormSelect
                            label="Paket (Jumlah Pertemuan)"
                            value={form.data.package_id || ''}
                            onChange={handlePackageChange}
                            options={[
                                { value: '', label: availablePackages.length > 0 ? 'Pilih Paket Pertemuan' : 'Tanpa Paket Khusus' },
                                ...availablePackages.map((pkg) => ({
                                    value: String(pkg.id),
                                    label: pkg.sessions ? `${pkg.sessions} Pertemuan${pkg.level ? ` (${pkg.level})` : ''}` : pkg.name,
                                })),
                            ]}
                            disabled={!selectedProgram}
                            error={form.errors.package_id}
                        />
                        {form.data.total_sessions && (
                            <p className="mt-1 text-xs text-violet-600 font-medium">
                                Target: {form.data.total_sessions} pertemuan per periode
                            </p>
                        )}
                    </div>
                    <FormSelect
                        label="Pengajar"
                        value={form.data.teacher_id}
                        onChange={(v) => form.setData('teacher_id', v)}
                        options={[
                            {
                                value: '',
                                label: form.data.is_active ? 'Pilih pengajar' : 'Tanpa pengajar khusus',
                            },
                            ...teachers.map((t) => ({ value: String(t.id), label: t.name })),
                        ]}
                        required={form.data.is_active}
                        error={form.errors.teacher_id}
                    />
                </div>

                {/* Baris 3: Nama Kelas & Kuota */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                        label="Nama Kelas"
                        value={form.data.name}
                        onChange={(v) => form.setData('name', v)}
                        placeholder="Contoh: Reguler Matematika SD 1"
                        required
                        error={form.errors.name}
                    />
                        <FormInput
                            label="Kuota Kelas"
                            type="number"
                            value={form.data.quota}
                            onChange={(v) => form.setData('quota', v)}
                            placeholder={selectedProgram?.quota != null ? String(selectedProgram.quota) : 'Tanpa batas'}
                            error={form.errors.quota}
                        />
                </div>

                {/* Status Kelas Aktif */}
                <div>
                    <FormCheckbox
                        label="Kelas aktif"
                        checked={form.data.is_active}
                        onChange={(v) => form.setData('is_active', v)}
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                        {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
