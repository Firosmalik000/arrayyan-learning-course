import { useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

const formatRupiah = (v) => `Rp ${Number(v ?? 0).toLocaleString('id-ID')}`;

export default function AddProgramModal({
    isOpen,
    onClose,
    selectedStudent,
    availablePrograms = [],
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        program_id: '',
        package_id: '',
        package: '',
        subjects: '',
        preferred_mode: 'offline',
        notes: '',
    });

    const [clientError, setClientError] = useState('');

    const selectedProgram = useMemo(() => {
        if (!data.program_id) return null;
        return availablePrograms.find((p) => String(p.id) === String(data.program_id));
    }, [data.program_id, availablePrograms]);

    const programPackages = useMemo(() => {
        if (!selectedProgram || !selectedProgram.packages) return [];
        return selectedProgram.packages;
    }, [selectedProgram]);

    const selectedPackage = useMemo(() => {
        if (!data.package_id) return null;
        return programPackages.find((pkg) => String(pkg.id) === String(data.package_id));
    }, [data.package_id, programPackages]);

    // Reset client error when user makes changes
    useEffect(() => {
        if (clientError) setClientError('');
    }, [data.program_id, data.package_id, data.subjects]);

    const handleProgramChange = (e) => {
        const progId = e.target.value;
        const prog = availablePrograms.find((p) => String(p.id) === String(progId));
        const firstPkg = prog?.packages?.[0];

        setData((prev) => ({
            ...prev,
            program_id: progId,
            package_id: firstPkg ? String(firstPkg.id) : '',
            package: firstPkg ? (firstPkg.display_name || firstPkg.name) : (prog?.name || 'Standar'),
        }));
    };

    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const pkg = programPackages.find((p) => String(p.id) === String(pkgId));
        setData((prev) => ({
            ...prev,
            package_id: pkgId,
            package: pkg ? (pkg.display_name || pkg.name) : '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.program_id) {
            setClientError('Silakan pilih program belajar terlebih dahulu.');
            return;
        }

        if (programPackages.length > 0 && !data.package_id) {
            setClientError('Silakan pilih paket belajar & biaya.');
            return;
        }

        if (!data.subjects || !data.subjects.trim()) {
            setClientError('Mata pelajaran wajib diisi.');
            return;
        }

        setClientError('');

        post(route('portal.programs.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setClientError('');
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setClientError('');
        onClose();
    };

    if (!isOpen) return null;

    const estimatedPrice = selectedPackage?.price ?? selectedProgram?.price ?? 0;
    const activeErrors = Object.values(errors);
    const displayError = clientError || (activeErrors.length > 0 ? activeErrors[0] : '');

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                    onClick={handleClose}
                    aria-hidden="true"
                />

                <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl transition-all border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-purple-50/50 px-4 xs:px-5 sm:px-6 py-3.5 sm:py-4">
                        <div className="min-w-0 pr-2">
                            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
                                Tambah Program Belajar
                            </h3>
                            <p className="text-[11px] sm:text-xs font-semibold text-violet-700 mt-0.5 truncate">
                                Siswa: {selectedStudent?.name || 'Murid'} {selectedStudent?.level ? `(${selectedStudent.level})` : ''}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600 shrink-0 cursor-pointer"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 xs:p-5 sm:p-6 space-y-3.5 sm:space-y-4">
                        {/* Error Alert Toast inside modal */}
                        {displayError && (
                            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3 sm:p-3.5 text-xs text-rose-800 animate-in fade-in duration-200">
                                <svg className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <span className="font-semibold">{displayError}</span>
                            </div>
                        )}

                        {/* Program Selection */}
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Program <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.program_id}
                                onChange={handleProgramChange}
                                className={`w-full rounded-2xl border bg-white px-3.5 xs:px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-violet-100 ${
                                    errors.program_id ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-violet-500'
                                }`}
                                required
                            >
                                <option value="">-- Pilih Program --</option>
                                {availablePrograms.map((prog) => (
                                    <option key={prog.id} value={prog.id} disabled={prog.is_full}>
                                        {prog.name} {prog.level ? `(${prog.level})` : ''} {prog.is_full ? '• KUOTA PENUH' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Package Selection (if available) */}
                        {programPackages.length > 0 && (
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Pilihan Paket & Biaya <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.package_id}
                                    onChange={handlePackageChange}
                                    className={`w-full rounded-2xl border bg-white px-3.5 xs:px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-violet-100 ${
                                        errors.package_id ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-violet-500'
                                    }`}
                                    required
                                >
                                    <option value="">-- Pilih Paket Harga --</option>
                                    {programPackages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.display_name || `${pkg.name} - ${formatRupiah(pkg.price)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Subjects */}
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Mata Pelajaran <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.subjects}
                                onChange={(e) => setData('subjects', e.target.value)}
                                placeholder="Contoh: Matematika, Bahasa Inggris, Fisika"
                                className={`w-full rounded-2xl border bg-white px-3.5 xs:px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-100 ${
                                    errors.subjects ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-violet-500'
                                }`}
                                required
                            />
                        </div>

                        {/* Learning Mode */}
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Sistem Belajar
                            </label>
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('preferred_mode', 'offline')}
                                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                                        data.preferred_mode === 'offline'
                                            ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-xs ring-1 ring-violet-600'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Tatap Muka (Offline)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('preferred_mode', 'online')}
                                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                                        data.preferred_mode === 'online'
                                            ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-xs ring-1 ring-violet-600'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Daring (Online)
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Catatan Jadwal (Opsional)
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                                placeholder="Hari atau jam yang diinginkan (jika ada)"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 xs:px-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>

                        {/* Estimated Price Info */}
                        {estimatedPrice > 0 && (
                            <div className="flex items-center justify-between rounded-2xl bg-violet-50/60 border border-violet-100 px-3.5 xs:px-4 py-2.5 sm:py-3 text-xs">
                                <span className="text-slate-700 font-semibold">Total Biaya Paket:</span>
                                <span className="font-display font-extrabold text-violet-700 text-sm">
                                    {formatRupiah(estimatedPrice)}
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-5 flex flex-col-reverse xs:flex-row items-center justify-end gap-2.5 xs:gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                className="w-full xs:w-auto rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full xs:w-auto rounded-2xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Memproses...' : 'Kirim Pendaftaran'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
