import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const normalizeSubjects = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusOptions = ['Aktif', 'Nonaktif'];
const programModeOptions = [
    { value: 'offline', label: 'Offline' },
    { value: 'online', label: 'Online' },
];
const packageModeOptions = ['Offline', 'Online', 'Hybrid', 'Offline / Online', 'Offline / Hybrid'];
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
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                {options.map((opt) => {
                    const optionValue = typeof opt === 'string' ? opt : opt.value;
                    const optionLabel = typeof opt === 'string' ? opt : opt.label;
                    return (
                        <option key={optionValue} value={optionValue}>
                            {optionLabel}
                        </option>
                    );
                })}
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

const normalizeModeValue = (value) => (value ? value.toString().trim().toLowerCase() : '');

const formatModeLabel = (value) => {
    const normalized = normalizeModeValue(value);
    if (normalized === 'online') return 'Online';
    if (normalized === 'offline') return 'Offline';
    return value || '-';
};

const getInitials = (value) => {
    if (!value) return 'ALC';
    const chars = value.trim().split(/\s+/).map((part) => part[0]).join('');
    return chars.slice(0, 2).toUpperCase();
};

export default function Programs() {
    const { programs: programsData = [], packages: packagesData = [], allowedActions = {}, flash } = usePage().props;
    const programs = useMemo(() => programsData.map((program) => ({
        ...program,
        subjects: normalizeSubjects(program.subjects),
        is_active: Number(program.is_active ?? 1) === 1,
        mode: normalizeModeValue(program.mode),
    })), [programsData]);
    const normalizedPackages = packagesData.map((pkg) => ({
        ...pkg,
        subjects: normalizeSubjects(pkg.subjects),
        is_active: Number(pkg.is_active ?? 1) === 1,
    }));

    const [packages, setPackages] = useState(normalizedPackages);

    const can = (action) => (allowedActions.program ?? []).includes(action);
    const canCreate = can('create');
    const canView = can('view');
    const canEdit = can('edit');
    const canDelete = can('delete');

    // Modal states
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProgramDetailModal, setShowProgramDetailModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [editingPackage, setEditingPackage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', item: null });
    const [programDetail, setProgramDetail] = useState(null);
    const [currentProgramImageUrl, setCurrentProgramImageUrl] = useState(null);

    // Program form state
    const programForm = useForm({
        name: '',
        level: '',
        description: '',
        subjects: '',
        mode: '',
        image: null,
        is_active: true,
    });

    // Package form state
    const [packageForm, setPackageForm] = useState({
        name: '',
        level: '',
        subjects: '',
        sessions: '',
        mode: '',
        schedule: '',
        is_active: true,
    });

    // Program handlers
    const openProgramModal = (program = null) => {
        if (program) {
            setEditingProgram(program);
            programForm.setData({
                name: program.name || '',
                level: program.level || '',
                description: program.description || '',
                subjects: normalizeSubjects(program.subjects).join(', '),
                mode: normalizeModeValue(program.mode),
                image: null,
                is_active: Number(program.is_active ?? 1) === 1,
            });
            setCurrentProgramImageUrl(program.image_url || null);
        } else {
            setEditingProgram(null);
            programForm.setData({
                name: '',
                level: '',
                description: '',
                subjects: '',
                mode: '',
                image: null,
                is_active: true,
            });
            setCurrentProgramImageUrl(null);
        }
        programForm.clearErrors();
        setShowProgramModal(true);
    };

    const openProgramDetailModal = (program) => {
        setProgramDetail(program);
        setShowProgramDetailModal(true);
    };

    const saveProgramForm = () => {
        const payload = {
            ...programForm.data,
            subjects: normalizeSubjects(programForm.data.subjects),
            is_active: programForm.data.is_active ? 1 : 0,
            mode: programForm.data.mode || null,
        };

        programForm.transform(() => ({
            ...payload,
            ...(editingProgram ? { _method: 'put' } : {}),
        }));

        const url = editingProgram ? `/admin/program/${editingProgram.id}` : '/admin/program';

        programForm.post(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowProgramModal(false);
                programForm.reset('image');
            },
            onFinish: () => programForm.transform((data) => data),
        });
    };

    // Package handlers
    const openPackageModal = (pkg = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setPackageForm({
                name: pkg.name || '',
                level: pkg.level || '',
                subjects: normalizeSubjects(pkg.subjects).join(', '),
                sessions: pkg.sessions ?? '',
                mode: pkg.mode || '',
                schedule: pkg.schedule || '',
                is_active: Number(pkg.is_active ?? 1) === 1,
            });
        } else {
            setEditingPackage(null);
            setPackageForm({
                name: '',
                level: '',
                subjects: '',
                sessions: '',
                mode: '',
                schedule: '',
                is_active: true,
            });
        }
        setShowPackageModal(true);
    };

    const savePackageForm = () => {
        const payload = {
            ...packageForm,
            subjects: normalizeSubjects(packageForm.subjects),
            sessions: packageForm.sessions === '' ? null : Number(packageForm.sessions),
            is_active: packageForm.is_active ? 1 : 0,
        };
        if (editingPackage) {
            setPackages(packages.map((p) => (p.id === editingPackage.id ? { ...payload, id: editingPackage.id } : p)));
        } else {
            setPackages([...packages, { ...payload, id: Date.now() }]);
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
            router.delete(`/admin/program/${deleteTarget.item.id}`, {
                preserveScroll: true,
                onSuccess: () => setShowDeleteModal(false),
            });
        } else {
            setPackages(packages.filter(p => p.id !== deleteTarget.item.id));
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <Head title="Program & Paket" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Program & Paket Belajar</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola daftar program dan paket belajar ALC
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openProgramModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {icons.plus}
                            Tambah Program
                        </button>
                    )}
                </div>

                {/* Program Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {programs.map((program) => {
                        const statusLabel = program.is_active ? 'Aktif' : 'Nonaktif';
                        const modeLabel = formatModeLabel(program.mode);

                        return (
                            <div
                                key={program.id}
                                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                    {program.image_url ? (
                                        <img
                                            src={program.image_url}
                                            alt={program.name}
                                            className="h-40 w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 via-white to-violet-50">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-sm font-semibold text-violet-600 shadow-sm">
                                                {getInitials(program.name)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-slate-800">{program.name}</h3>
                                        <p className="mt-0.5 text-sm text-slate-500">{program.level || 'Semua Jenjang'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}>
                                            {statusLabel}
                                        </span>
                                        <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                            {modeLabel}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                                    {program.description || 'Belum ada deskripsi program.'}
                                </p>
                                {program.subjects?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {program.subjects.map((subject) => (
                                            <span
                                                key={`${program.id}-${subject}`}
                                                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {(canView || canEdit || canDelete) && (
                                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                        {canView && (
                                            <button
                                                type="button"
                                                onClick={() => openProgramDetailModal(program)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                                            >
                                                {icons.eye} Detail
                                            </button>
                                        )}
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => openProgramModal(program)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                                            >
                                                {icons.edit} Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal('program', program)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                                            >
                                                {icons.trash} Hapus
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Packages Table */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-800">Paket Belajar</h2>
                            <p className="mt-0.5 text-sm text-slate-500">Daftar paket berdasarkan data yang tersimpan</p>
                        </div>
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() => openPackageModal()}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                            >
                                {icons.plus} Tambah Paket
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama Paket</th>
                                    <th className="px-5 py-3 font-medium">Jenjang</th>
                                    <th className="px-5 py-3 font-medium">Sesi</th>
                                    <th className="px-5 py-3 font-medium">Mode</th>
                                    <th className="px-5 py-3 font-medium">Jadwal</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {packages.map((pkg) => {
                                    const statusLabel = pkg.is_active ? 'Aktif' : 'Nonaktif';

                                    return (
                                        <tr key={pkg.id} className="transition hover:bg-slate-50">
                                            <td className="px-5 py-4 font-medium text-slate-800">{pkg.name}</td>
                                            <td className="px-5 py-4 text-slate-600">{pkg.level || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{pkg.sessions ?? '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{pkg.mode || '-'}</td>
                                            <td className="px-5 py-4 text-slate-600">{pkg.schedule || '-'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPackageModal(pkg)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                            title="Edit"
                                                        >
                                                            {icons.edit}
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal('package', pkg)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                                                            title="Hapus"
                                                        >
                                                            {icons.trash}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                        <div className="space-y-1">
                            <FormInput
                                label="Nama Program"
                                value={programForm.data.name}
                                onChange={(v) => programForm.setData('name', v)}
                                placeholder="contoh: Reguler"
                                required
                            />
                            {programForm.errors.name && <p className="text-xs text-rose-500">{programForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <FormSelect
                                label="Jenjang"
                                value={programForm.data.level}
                                onChange={(v) => programForm.setData('level', v)}
                                options={levelOptions}
                                required
                            />
                            {programForm.errors.level && <p className="text-xs text-rose-500">{programForm.errors.level}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormSelect
                                label="Mode Program"
                                value={programForm.data.mode}
                                onChange={(v) => programForm.setData('mode', v)}
                                options={programModeOptions}
                                required
                            />
                            {programForm.errors.mode && <p className="text-xs text-rose-500">{programForm.errors.mode}</p>}
                        </div>
                        <FormSelect
                            label="Status"
                            value={programForm.data.is_active ? 'Aktif' : 'Nonaktif'}
                            onChange={(v) => programForm.setData('is_active', v === 'Aktif')}
                            options={statusOptions}
                        />
                    </div>
                    <FormTextarea
                        label="Deskripsi Program"
                        value={programForm.data.description}
                        onChange={(v) => programForm.setData('description', v)}
                        placeholder="Deskripsi singkat program..."
                    />
                    <FormInput
                        label="Mata Pelajaran"
                        value={programForm.data.subjects}
                        onChange={(v) => programForm.setData('subjects', v)}
                        placeholder="contoh: Matematika, IPA, Bahasa Inggris"
                    />
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload Foto</label>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => programForm.setData('image', e.target.files[0])}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
                        />
                        {currentProgramImageUrl && (
                            <p className="mt-2 text-xs text-slate-500">
                                Foto saat ini:{' '}
                                <a href={currentProgramImageUrl} target="_blank" rel="noreferrer" className="font-medium text-violet-600 underline">
                                    Lihat
                                </a>
                            </p>
                        )}
                        {programForm.errors.image && <p className="mt-1 text-xs text-rose-500">{programForm.errors.image}</p>}
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
                            disabled={programForm.processing}
                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {editingProgram ? 'Simpan Perubahan' : 'Tambah Program'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Program Detail Modal */}
            <Modal
                isOpen={showProgramDetailModal}
                onClose={() => setShowProgramDetailModal(false)}
                title="Detail Program"
                size="lg"
            >
                {programDetail && (
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                            {programDetail.image_url ? (
                                <img
                                    src={programDetail.image_url}
                                    alt={programDetail.name}
                                    className="h-56 w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-100 via-white to-violet-50">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-base font-semibold text-violet-600 shadow-sm">
                                        {getInitials(programDetail.name)}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[programDetail.is_active ? 'Aktif' : 'Nonaktif']}`}>
                                {programDetail.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                                {formatModeLabel(programDetail.mode)}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-slate-800">{programDetail.name}</h4>
                            <p className="text-sm text-slate-500">{programDetail.level || 'Semua Jenjang'}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi</p>
                            <p className="mt-2 text-sm text-slate-600">
                                {programDetail.description || 'Belum ada deskripsi program.'}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mata Pelajaran</p>
                            {programDetail.subjects?.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {programDetail.subjects.map((subject) => (
                                        <span key={subject} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-slate-500">Belum ada data mata pelajaran.</p>
                            )}
                        </div>
                    </div>
                )}
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
                        <FormSelect
                            label="Jenjang"
                            value={packageForm.level}
                            onChange={(v) => setPackageForm({ ...packageForm, level: v })}
                            options={levelOptions}
                        />
                        <FormInput
                            label="Mata Pelajaran"
                            value={packageForm.subjects}
                            onChange={(v) => setPackageForm({ ...packageForm, subjects: v })}
                            placeholder="contoh: Matematika, IPA"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormInput
                            label="Jumlah Sesi"
                            value={packageForm.sessions}
                            onChange={(v) => setPackageForm({ ...packageForm, sessions: v })}
                            placeholder="8"
                        />
                        <FormSelect
                            label="Mode"
                            value={packageForm.mode}
                            onChange={(v) => setPackageForm({ ...packageForm, mode: v })}
                            options={packageModeOptions}
                        />
                        <FormInput
                            label="Jadwal"
                            value={packageForm.schedule}
                            onChange={(v) => setPackageForm({ ...packageForm, schedule: v })}
                            placeholder="contoh: Senin - Jumat"
                        />
                    </div>
                    <FormSelect
                        label="Status"
                        value={packageForm.is_active ? 'Aktif' : 'Nonaktif'}
                        onChange={(v) => setPackageForm({ ...packageForm, is_active: v === 'Aktif' })}
                        options={statusOptions}
                    />
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
                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
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
