import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Modal } from '@/Components/Admin';

export default function ClassModal({
    isOpen,
    onClose,
    educationClass = null,
    levels = [],
    defaultLevelId = null,
}) {
    const isEdit = Boolean(educationClass);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        education_level_id: defaultLevelId || levels[0]?.id || '',
        name: '',
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (educationClass) {
                setData({
                    education_level_id: educationClass.education_level_id,
                    name: educationClass.name || '',
                    sort_order: educationClass.sort_order ?? 0,
                    is_active: educationClass.is_active ?? true,
                });
            } else {
                setData({
                    education_level_id: defaultLevelId || levels[0]?.id || '',
                    name: '',
                    sort_order: 0,
                    is_active: true,
                });
            }
        }
    }, [isOpen, educationClass, defaultLevelId, levels]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/master-pendidikan/kelas/${educationClass.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/admin/master-pendidikan/kelas', {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Kelas / Tingkat' : 'Tambah Kelas / Tingkat Baru'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Jenjang Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={data.education_level_id}
                        onChange={(e) => setData('education_level_id', Number(e.target.value))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-hidden focus:ring-2 ${
                            errors.education_level_id
                                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200'
                                : 'border-slate-300 bg-white focus:border-violet-500 focus:ring-violet-200'
                        }`}
                        required
                    >
                        {levels.map((level) => (
                            <option key={level.id} value={level.id}>
                                {level.name}
                            </option>
                        ))}
                    </select>
                    {errors.education_level_id && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-600">
                            {errors.education_level_id}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nama Kelas <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Contoh: Kelas 1, Kelas 10 IPA, dsb."
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-hidden focus:ring-2 ${
                            errors.name
                                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200'
                                : 'border-slate-300 bg-white focus:border-violet-500 focus:ring-violet-200'
                        }`}
                        required
                    />
                    {errors.name && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.name}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Urutan Tampilan
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value, 10) || 0)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm transition focus:border-violet-500 focus:outline-hidden focus:ring-2 focus:ring-violet-200"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">Urutan dalam daftar kelas</p>
                    </div>

                    <div className="flex items-center pt-6">
                        <label className="relative flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-5 w-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-700">Status Aktif</span>
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                    >
                        {processing && (
                            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        )}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Kelas'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
