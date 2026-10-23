import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Modal } from '@/Components/Admin';

export default function LevelModal({ isOpen, onClose, level = null }) {
    const isEdit = Boolean(level);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (level) {
                setData({
                    name: level.name || '',
                    sort_order: level.sort_order ?? 0,
                    is_active: level.is_active ?? true,
                });
            } else {
                setData({
                    name: '',
                    sort_order: 0,
                    is_active: true,
                });
            }
        }
    }, [isOpen, level]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/master-pendidikan/jenjang/${level.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/admin/master-pendidikan/jenjang', {
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
            title={isEdit ? 'Edit Jenjang Pendidikan' : 'Tambah Jenjang Pendidikan'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl bg-violet-50/60 p-3.5 text-xs text-violet-800 border border-violet-100 flex items-start gap-2.5">
                    <svg className="h-5 w-5 shrink-0 text-violet-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        Jenjang digunakan sebagai induk tingkatan pendidikan (contoh: SD, SMP, SMA, Perguruan Tinggi, atau Umum).
                    </span>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nama Jenjang <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Contoh: SD / Madrasah Ibtidaiyah"
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
                        <p className="mt-1 text-[11px] text-slate-500">Angka kecil tampil lebih awal</p>
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
                        <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Jenjang'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
