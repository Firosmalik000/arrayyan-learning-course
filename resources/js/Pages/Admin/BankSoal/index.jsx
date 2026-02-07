import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

const normalizeModule = (item, index) => ({
    id: item?.id ?? index + 1,
    name: item?.name?.id ?? item?.name ?? '',
    category: item?.category?.id ?? item?.category ?? '',
    level: item?.level?.id ?? item?.level ?? '',
    format: item?.format ?? '',
    questions: item?.questions ?? 0,
    slug: item?.slug ?? '',
    description: item?.description?.id ?? item?.description ?? '',
    tone: item?.tone ?? 'violet',
    links: Array.isArray(item?.links) ? item.links : [],
    is_active: item?.is_active ?? true,
});

const fallbackLevelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'];
const fallbackFormatOptions = ['Offline', 'Online', 'Hybrid'];
const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
};
const statusOptions = ['Aktif', 'Nonaktif'];

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
    search: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    file: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
};

// Modal Component
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;
    const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-2xl`}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            {icons.close}
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

// Form Components
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
                {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
        </div>
    );
}

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

export default function BankSoal() {
    const { bankSoalItems: bankSoalData = [], flash, allowedActions = {} } = usePage().props;
    const modules = bankSoalData.map((item, index) => normalizeModule(item, index));
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterFormat, setFilterFormat] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);

    // Form state
    const createLinkRow = () => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        label: '',
        link: '',
    });

    const [form, setForm] = useState({
        name: '',
        category: '',
        level: '',
        format: '',
        slug: '',
        description: '',
        is_active: true,
        links: [createLinkRow()],
    });

    // Filtered modules
    const filteredModules = modules.filter((m) => {
        const matchSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.category.toLowerCase().includes(search.toLowerCase());
        const matchLevel = !filterLevel || m.level === filterLevel;
        const matchCategory = !filterCategory || m.category === filterCategory;
        const matchFormat = !filterFormat || m.format === filterFormat;
        return matchSearch && matchLevel && matchCategory && matchFormat;
    });

    // Stats
    const stats = [
        { label: 'Total Modul', value: modules.length, color: 'violet' },
        { label: 'Kategori', value: new Set(modules.map((m) => m.category).filter(Boolean)).size, color: 'amber' },
        { label: 'Total Link', value: modules.reduce((acc, item) => acc + (item.links?.length ?? 0), 0), color: 'emerald' },
    ];

    const levelOptions = Array.from(new Set(modules.map((m) => m.level).filter(Boolean)));
    const categoryOptions = Array.from(new Set(modules.map((m) => m.category).filter(Boolean)));
    const formatOptions = Array.from(new Set(modules.map((m) => m.format).filter(Boolean)));

    const resolvedLevelOptions = levelOptions.length > 0 ? levelOptions : fallbackLevelOptions;
    const resolvedFormatOptions = formatOptions.length > 0 ? formatOptions : fallbackFormatOptions;

    const can = (action) => (allowedActions['bank-soal'] ?? []).includes(action);
    const canCreate = can('create');
    const canView = can('view');
    const canEdit = can('edit');
    const canDelete = can('delete');

    // Handlers
    const openModal = (item = null) => {
        if (item) {
            setEditing(item);
            setForm({
                name: item.name,
                category: item.category,
                level: item.level,
                format: item.format,
                slug: item.slug,
                description: item.description,
                is_active: item.is_active ?? true,
                links: item.links?.length
                    ? item.links.map((link) => ({
                        id: link.id ?? createLinkRow().id,
                        label: link.label ?? '',
                        link: link.link ?? '',
                    }))
                    : [createLinkRow()],
            });
        } else {
            setEditing(null);
            setForm({
                name: '',
                category: '',
                level: '',
                format: '',
                slug: '',
                description: '',
                is_active: true,
                links: [createLinkRow()],
            });
        }
        setShowModal(true);
    };

    const saveForm = () => {
        const cleanedLinks = (form.links || [])
            .map((link) => ({
                id: Number(link.id) || createLinkRow().id,
                label: link.label?.trim() ?? '',
                link: link.link?.trim() ?? '',
            }))
            .filter((link) => link.label || link.link);

        const data = {
            ...form,
            is_active: form.is_active ? 1 : 0,
            links: cleanedLinks,
        };
        if (editing) {
            router.put(`/admin/bank-soal/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            router.post('/admin/bank-soal', data, {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const openDetailModal = (item) => {
        setDetailTarget(item);
        setShowDetailModal(true);
    };

    const updateLink = (index, field, value) => {
        setForm((prev) => {
            const nextLinks = [...prev.links];
            nextLinks[index] = { ...nextLinks[index], [field]: value };
            return { ...prev, links: nextLinks };
        });
    };

    const addLinkRow = () => {
        setForm((prev) => ({
            ...prev,
            links: [...prev.links, createLinkRow()],
        }));
    };

    const removeLinkRow = (index) => {
        setForm((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    const confirmDelete = () => {
        router.delete(`/admin/bank-soal/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    return (
        <>
            <Head title="Bank Soal" />

            <div className="space-y-6">
                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Bank Soal</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola modul latihan dan soal untuk siswa
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {icons.plus}
                            Tambah Modul
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    {/* Filters */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icons.search}</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari modul..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-violet-400"
                            >
                                <option value="">Semua Jenjang</option>
                                {resolvedLevelOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-violet-400"
                            >
                                <option value="">Semua Kategori</option>
                                {categoryOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                value={filterFormat}
                                onChange={(e) => setFilterFormat(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-violet-400"
                            >
                                <option value="">Semua Format</option>
                                {resolvedFormatOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama Modul</th>
                                    <th className="px-5 py-3 font-medium">Kategori</th>
                                    <th className="px-5 py-3 font-medium">Jenjang</th>
                                    <th className="px-5 py-3 font-medium">Format</th>
                                    <th className="px-5 py-3 font-medium">Links</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Slug</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredModules.map((item) => {
                                    const statusLabel = item.is_active ? 'Aktif' : 'Nonaktif';

                                    return (
                                        <tr key={item.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                                    {icons.file}
                                                </div>
                                                <span className="font-medium text-slate-800">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{item.category || '-'}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.level || '-'}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.format || '-'}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.links?.length ?? 0}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{item.slug || '-'}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                {canView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetailModal(item)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                        title="Detail"
                                                    >
                                                        {icons.eye}
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(item)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                        title="Edit"
                                                    >
                                                        {icons.edit}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(item)}
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
                                {filteredModules.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada modul yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Modul' : 'Tambah Modul Baru'} size="lg">
                <form onSubmit={(e) => { e.preventDefault(); saveForm(); }} className="space-y-4">
                    <FormInput
                        label="Nama Modul"
                        value={form.name}
                        onChange={(v) => setForm({ ...form, name: v })}
                        placeholder="contoh: Matematika SD - Paket 1"
                        required
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Kategori"
                            value={form.category}
                            onChange={(v) => setForm({ ...form, category: v })}
                            placeholder="contoh: Matematika"
                            required
                        />
                        <FormSelect
                            label="Jenjang"
                            value={form.level}
                            onChange={(v) => setForm({ ...form, level: v })}
                            options={resolvedLevelOptions}
                            required
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Format"
                            value={form.format}
                            onChange={(v) => setForm({ ...form, format: v })}
                            options={resolvedFormatOptions}
                            required
                        />
                        <FormInput
                            label="Slug"
                            value={form.slug}
                            onChange={(v) => setForm({ ...form, slug: v })}
                            placeholder="contoh: matematika-sd-paket-1"
                        />
                    </div>
                    <FormTextarea
                        label="Deskripsi"
                        value={form.description}
                        onChange={(v) => setForm({ ...form, description: v })}
                        placeholder="Deskripsi modul..."
                    />
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Link Modul</label>
                        <div className="space-y-2">
                            {form.links.map((link, index) => (
                                <div key={link.id} className="grid gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
                                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                                        ID #{link.id}
                                    </div>
                                    <input
                                        type="text"
                                        value={link.label}
                                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                                        placeholder="Label (contoh: Kelas 1)"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    />
                                    <input
                                        type="text"
                                        value={link.link}
                                        onChange={(e) => updateLink(index, 'link', e.target.value)}
                                        placeholder="Link (contoh: https://...)"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeLinkRow(index)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLinkRow}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                {icons.plus} Tambah Link
                            </button>
                        </div>
                    </div>
                    <FormSelect
                        label="Status"
                        value={form.is_active ? 'Aktif' : 'Nonaktif'}
                        onChange={(v) => setForm({ ...form, is_active: v === 'Aktif' })}
                        options={statusOptions}
                    />
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
                            {editing ? 'Simpan Perubahan' : 'Tambah Modul'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Modul" size="lg">
                {detailTarget && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[detailTarget.is_active ? 'Aktif' : 'Nonaktif']}`}>
                                {detailTarget.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-slate-800">{detailTarget.name}</h4>
                            <p className="text-sm text-slate-500">{detailTarget.category || '-'}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jenjang</p>
                                <p className="mt-1 text-sm font-medium text-slate-800">{detailTarget.level || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Format</p>
                                <p className="mt-1 text-sm font-medium text-slate-800">{detailTarget.format || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</p>
                                <p className="mt-1 text-sm font-medium text-slate-800">{detailTarget.slug || '-'}</p>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi</p>
                            <p className="mt-2 text-sm text-slate-600">{detailTarget.description || '-'}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link Modul</p>
                            {detailTarget.links?.length ? (
                                <div className="mt-2 space-y-2">
                                    {detailTarget.links.map((link) => (
                                        <div key={`${link.id}-${link.label}`} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{link.label || `Link ${link.id}`}</p>
                                                <p className="text-xs text-slate-500">{link.link}</p>
                                            </div>
                                            {link.link && (
                                                <a
                                                    href={link.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                                                >
                                                    Buka
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-slate-500">Belum ada link modul.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Hapus" size="sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        {icons.warning}
                    </div>
                    <p className="text-slate-600">
                        Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
