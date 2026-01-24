import { Head } from '@inertiajs/react';
import { useState } from 'react';

const initialPrograms = [
    {
        id: 1,
        name: 'Reguler',
        level: 'Pra TK - SMA',
        focus: 'Calistung, Matematika, Bahasa Inggris',
        sessions: '8x pertemuan / bulan',
        mode: 'Offline / Online',
        status: 'Aktif',
    },
    {
        id: 2,
        name: 'Intensif',
        level: 'SD - SMA',
        focus: 'Penguatan konsep + latihan soal',
        sessions: '12x pertemuan / bulan',
        mode: 'Offline / Hybrid',
        status: 'Aktif',
    },
    {
        id: 3,
        name: 'Privat / Semi Privat',
        level: 'TK - SMA',
        focus: 'Sesuai kebutuhan siswa',
        sessions: 'Fleksibel',
        mode: 'Offline / Online',
        status: 'Draft',
    },
    {
        id: 4,
        name: 'Persiapan Ujian / Olimpiade',
        level: 'SD - SMA',
        focus: 'Try out, pembahasan, strategi',
        sessions: 'Program khusus',
        mode: 'Offline / Online',
        status: 'Review',
    },
];

const initialPackages = [
    {
        id: 1,
        name: 'Reguler SD',
        sessions: '8x',
        price: 'Rp 450.000',
        mode: 'Offline / Online',
        status: 'Publik',
    },
    {
        id: 2,
        name: 'Intensif SMP',
        sessions: '12x',
        price: 'Rp 650.000',
        mode: 'Hybrid',
        status: 'Publik',
    },
    {
        id: 3,
        name: 'Privat SMA',
        sessions: 'Fleksibel',
        price: 'Rp 900.000',
        mode: 'Offline',
        status: 'Draft',
    },
];

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    Review: 'bg-rose-50 text-rose-700 border-rose-200',
    Publik: 'bg-violet-50 text-violet-700 border-violet-200',
};

const statusOptions = ['Aktif', 'Draft', 'Review'];
const packageStatusOptions = ['Publik', 'Draft'];
const modeOptions = ['Offline', 'Online', 'Hybrid', 'Offline / Online', 'Offline / Hybrid'];
const levelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA', 'Pra TK - SMA', 'TK - SMA', 'SD - SMA'];

// Icons
const icons = {
    plus: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
    ),
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    close: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
};

// Modal Component
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-2xl`}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            {icons.close}
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

// Form Input Component
function FormInput({ label, type = 'text', value, onChange, placeholder, required }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                required={required}
            />
        </div>
    );
}

// Form Select Component
function FormSelect({ label, value, onChange, options, required }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                required={required}
            >
                <option value="">Pilih {label}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

// Form Textarea Component
function FormTextarea({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
        </div>
    );
}

export default function Programs() {
    const [programs, setPrograms] = useState(initialPrograms);
    const [packages, setPackages] = useState(initialPackages);

    // Modal states
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [editingPackage, setEditingPackage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', item: null });

    // Program form state
    const [programForm, setProgramForm] = useState({
        name: '', level: '', focus: '', sessions: '', mode: '', status: 'Aktif'
    });

    // Package form state
    const [packageForm, setPackageForm] = useState({
        name: '', sessions: '', price: '', mode: '', status: 'Publik'
    });

    // Program handlers
    const openProgramModal = (program = null) => {
        if (program) {
            setEditingProgram(program);
            setProgramForm({ ...program });
        } else {
            setEditingProgram(null);
            setProgramForm({ name: '', level: '', focus: '', sessions: '', mode: '', status: 'Aktif' });
        }
        setShowProgramModal(true);
    };

    const saveProgramForm = () => {
        if (editingProgram) {
            setPrograms(programs.map(p => p.id === editingProgram.id ? { ...programForm, id: editingProgram.id } : p));
        } else {
            setPrograms([...programs, { ...programForm, id: Date.now() }]);
        }
        setShowProgramModal(false);
    };

    // Package handlers
    const openPackageModal = (pkg = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setPackageForm({ ...pkg });
        } else {
            setEditingPackage(null);
            setPackageForm({ name: '', sessions: '', price: '', mode: '', status: 'Publik' });
        }
        setShowPackageModal(true);
    };

    const savePackageForm = () => {
        if (editingPackage) {
            setPackages(packages.map(p => p.id === editingPackage.id ? { ...packageForm, id: editingPackage.id } : p));
        } else {
            setPackages([...packages, { ...packageForm, id: Date.now() }]);
        }
        setShowPackageModal(false);
    };

    // Delete handlers
    const openDeleteModal = (type, item) => {
        setDeleteTarget({ type, item });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteTarget.type === 'program') {
            setPrograms(programs.filter(p => p.id !== deleteTarget.item.id));
        } else {
            setPackages(packages.filter(p => p.id !== deleteTarget.item.id));
        }
        setShowDeleteModal(false);
    };

    return (
        <>
            <Head title="Program & Paket" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Program & Paket Belajar</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola daftar program dan paket belajar ALC
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openProgramModal()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                    >
                        {icons.plus}
                        Tambah Program
                    </button>
                </div>

                {/* Program Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {programs.map((program) => (
                        <div
                            key={program.id}
                            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-slate-800">{program.name}</h3>
                                    <p className="mt-0.5 text-sm text-slate-500">{program.level}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[program.status]}`}>
                                        {program.status}
                                    </span>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-600">{program.focus}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{program.sessions}</span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{program.mode}</span>
                            </div>
                            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 opacity-0 transition group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => openProgramModal(program)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                                >
                                    {icons.edit} Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openDeleteModal('program', program)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                                >
                                    {icons.trash} Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Packages Table */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-800">Paket Belajar</h2>
                            <p className="mt-0.5 text-sm text-slate-500">Daftar paket yang tampil di website</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => openPackageModal()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        >
                            {icons.plus} Tambah Paket
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama Paket</th>
                                    <th className="px-5 py-3 font-medium">Sesi</th>
                                    <th className="px-5 py-3 font-medium">Harga</th>
                                    <th className="px-5 py-3 font-medium">Mode</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {packages.map((pkg) => (
                                    <tr key={pkg.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-800">{pkg.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{pkg.sessions}</td>
                                        <td className="px-5 py-4 text-slate-600">{pkg.price}</td>
                                        <td className="px-5 py-4 text-slate-600">{pkg.mode}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[pkg.status]}`}>
                                                {pkg.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openPackageModal(pkg)}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                    title="Edit"
                                                >
                                                    {icons.edit}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal('package', pkg)}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                                                    title="Hapus"
                                                >
                                                    {icons.trash}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Program Modal */}
            <Modal
                isOpen={showProgramModal}
                onClose={() => setShowProgramModal(false)}
                title={editingProgram ? 'Edit Program' : 'Tambah Program Baru'}
                size="lg"
            >
                <form onSubmit={(e) => { e.preventDefault(); saveProgramForm(); }} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Nama Program"
                            value={programForm.name}
                            onChange={(v) => setProgramForm({ ...programForm, name: v })}
                            placeholder="contoh: Reguler"
                            required
                        />
                        <FormSelect
                            label="Jenjang"
                            value={programForm.level}
                            onChange={(v) => setProgramForm({ ...programForm, level: v })}
                            options={levelOptions}
                            required
                        />
                    </div>
                    <FormTextarea
                        label="Fokus Pembelajaran"
                        value={programForm.focus}
                        onChange={(v) => setProgramForm({ ...programForm, focus: v })}
                        placeholder="Deskripsi fokus program..."
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormInput
                            label="Sesi"
                            value={programForm.sessions}
                            onChange={(v) => setProgramForm({ ...programForm, sessions: v })}
                            placeholder="8x pertemuan"
                        />
                        <FormSelect
                            label="Mode"
                            value={programForm.mode}
                            onChange={(v) => setProgramForm({ ...programForm, mode: v })}
                            options={modeOptions}
                        />
                        <FormSelect
                            label="Status"
                            value={programForm.status}
                            onChange={(v) => setProgramForm({ ...programForm, status: v })}
                            options={statusOptions}
                        />
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowProgramModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                        >
                            {editingProgram ? 'Simpan Perubahan' : 'Tambah Program'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Package Modal */}
            <Modal
                isOpen={showPackageModal}
                onClose={() => setShowPackageModal(false)}
                title={editingPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
            >
                <form onSubmit={(e) => { e.preventDefault(); savePackageForm(); }} className="space-y-4">
                    <FormInput
                        label="Nama Paket"
                        value={packageForm.name}
                        onChange={(v) => setPackageForm({ ...packageForm, name: v })}
                        placeholder="contoh: Reguler SD"
                        required
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Jumlah Sesi"
                            value={packageForm.sessions}
                            onChange={(v) => setPackageForm({ ...packageForm, sessions: v })}
                            placeholder="8x"
                        />
                        <FormInput
                            label="Harga"
                            value={packageForm.price}
                            onChange={(v) => setPackageForm({ ...packageForm, price: v })}
                            placeholder="Rp 450.000"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Mode"
                            value={packageForm.mode}
                            onChange={(v) => setPackageForm({ ...packageForm, mode: v })}
                            options={modeOptions}
                        />
                        <FormSelect
                            label="Status"
                            value={packageForm.status}
                            onChange={(v) => setPackageForm({ ...packageForm, status: v })}
                            options={packageStatusOptions}
                        />
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowPackageModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                        >
                            {editingPackage ? 'Simpan Perubahan' : 'Tambah Paket'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        Apakah Anda yakin ingin menghapus{' '}
                        <span className="font-semibold text-slate-800">
                            {deleteTarget.item?.name}
                        </span>
                        ?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={confirmDelete}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
