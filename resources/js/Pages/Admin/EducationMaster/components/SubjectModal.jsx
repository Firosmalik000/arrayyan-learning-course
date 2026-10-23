import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Modal } from '@/Components/Admin';

export default function SubjectModal({
    isOpen,
    onClose,
    subject = null,
    levels = [],
}) {
    const isEdit = Boolean(subject);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        education_level_ids: [],
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (subject) {
                const levelIds = (subject.education_levels || []).map((l) => l.id);
                setData({
                    name: subject.name || '',
                    education_level_ids: levelIds,
                    sort_order: subject.sort_order ?? 0,
                    is_active: subject.is_active ?? true,
                });
            } else {
                setData({
                    name: '',
                    education_level_ids: levels.map((l) => l.id), // default select all
                    sort_order: 0,
                    is_active: true,
                });
            }
        }
    }, [isOpen, subject, levels]);

    const handleToggleLevel = (levelId) => {
        const current = data.education_level_ids || [];
        if (current.includes(levelId)) {
            setData(
                'education_level_ids',
                current.filter((id) => id !== levelId)
            );
        } else {
            setData('education_level_ids', [...current, levelId]);
        }
    };

    const handleSelectAll = () => {
        setData(
            'education_level_ids',
            levels.map((l) => l.id)
        );
    };

    const handleClearAll = () => {
        setData('education_level_ids', []);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/master-pendidikan/mapel/${subject.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/admin/master-pendidikan/mapel', {
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
            title={isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nama Mata Pelajaran <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Contoh: Matematika, Fisika, Bahasa Indonesia"
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

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Tersedia Pada Jenjang <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="font-bold text-violet-600 hover:text-violet-800 transition cursor-pointer"
                            >
                                Pilih Semua
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                            >
                                Hapus Pilihan
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {levels.map((level) => {
                            const isSelected = data.education_level_ids.includes(level.id);
                            return (
                                <button
                                    key={level.id}
                                    type="button"
                                    onClick={() => handleToggleLevel(level.id)}
                                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
                                        isSelected
                                            ? 'border-violet-500 bg-violet-50/70 text-violet-950 ring-1 ring-violet-500/30'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                            isSelected
                                                ? 'border-violet-600 bg-violet-600 text-white'
                                                : 'border-slate-300 bg-white'
                                        }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold truncate">{level.name}</p>
                                        <p className="text-[11px] text-slate-400">
                                            {level.education_classes?.length || 0} Kelas
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {errors.education_level_ids && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-600">
                            {errors.education_level_ids}
                        </p>
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
                        <p className="mt-1 text-[11px] text-slate-500">Urutan dalam daftar mata pelajaran</p>
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
                        <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Mata Pelajaran'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
