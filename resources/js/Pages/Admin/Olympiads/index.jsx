import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusOptions = ['Aktif', 'Nonaktif'];
const levelOptions = ['SD', 'SMP', 'SMA', 'SD / SMP', 'SMP / SMA', 'SD - SMA'];
const categoryOptions = [
    { value: 'free', label: 'Gratis' },
    { value: 'paid', label: 'Berbayar' },
];

const normalizeCategory = (value) => {
    if (!value) return 'free';
    const normalized = value.toString().toLowerCase();
    if (normalized === 'paid' || normalized === 'berbayar') return 'paid';
    return 'free';
};

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
    trophy: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
        </svg>
    ),
    calendar: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    users: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

const formatCurrency = (value) => {
    if (!value || value === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Olympiads() {
    const { olympiads: olympiadData = [], flash, allowedActions = {} } = usePage().props;
    const events = olympiadData.map((event) => ({
        ...event,
        is_active: event.is_active ?? true,
        category: normalizeCategory(event.category),
        fee: event.fee ?? 0,
    }));

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const can = (action) => (allowedActions.olimpiade ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    // Form state
    const [form, setForm] = useState({
        name: '',
        level: '',
        schedule: '',
        selection_system: '',
        category: 'free',
        fee: '',
        notes: '',
        is_active: true,
    });

    // Stats
    const stats = [
        { label: 'Total Event', value: events.length, icon: icons.trophy, color: 'violet' },
        { label: 'Gratis', value: events.filter((e) => e.category === 'free').length, icon: icons.users, color: 'emerald' },
        { label: 'Event Aktif', value: events.filter((e) => e.is_active).length, icon: icons.calendar, color: 'amber' },
    ];

    // Handlers
    const openModal = (item = null) => {
        if (item) {
            setEditing(item);
            setForm({
                name: item.name || '',
                level: item.level || '',
                schedule: item.schedule || '',
                selection_system: item.selection_system || '',
                category: normalizeCategory(item.category),
                fee: item.fee?.toString() ?? '',
                notes: item.notes || '',
                is_active: item.is_active ?? true,
            });
        } else {
            setEditing(null);
            setForm({
                name: '',
                level: '',
                schedule: '',
                selection_system: '',
                category: 'free',
                fee: '',
                notes: '',
                is_active: true,
            });
        }
        setShowModal(true);
    };

    const saveForm = () => {
        const data = {
            ...form,
            fee: form.fee === '' ? 0 : parseFloat(form.fee) || 0,
            is_active: Boolean(form.is_active),
        };
        if (editing) {
            router.put(`/admin/olimpiade/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            router.post('/admin/olimpiade', data, {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(`/admin/olimpiade/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    return (
        <>
            <Head title="Olimpiade" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Olimpiade</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola jadwal lomba, biaya, dan sistem seleksi
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                        >
                            {icons.plus}
                            Tambah Olimpiade
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Event Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => {
                        const statusLabel = event.is_active ? 'Aktif' : 'Nonaktif';
                        const categoryLabel = event.category === 'paid' ? 'Berbayar' : 'Gratis';

                        return (
                            <div key={event.id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-amber-400 text-white">
                                        {icons.trophy}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}>
                                            {statusLabel}
                                        </span>
                                        <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                            {categoryLabel}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="mt-4 font-semibold text-slate-800">{event.name}</h3>
                                <p className="mt-1 text-sm text-slate-500">{event.level || 'Semua Jenjang'}</p>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Jadwal</span>
                                        <span className="font-medium text-slate-700">{event.schedule || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Seleksi</span>
                                        <span className="font-medium text-slate-700">{event.selection_system || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Biaya</span>
                                        <span className="font-medium text-slate-700">{formatCurrency(event.fee)}</span>
                                    </div>
                                </div>
                                {event.notes && (
                                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">{event.notes}</p>
                                )}
                                {(canEdit || canDelete) && (
                                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 opacity-0 transition group-hover:opacity-100">
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => openModal(event)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                                            >
                                                {icons.edit} Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(event)}
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
            </div>

            {/* Form Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Olimpiade' : 'Tambah Olimpiade Baru'} size="lg">
                <form onSubmit={(e) => { e.preventDefault(); saveForm(); }} className="space-y-4">
                    <FormInput label="Nama Olimpiade" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="contoh: Olimpiade Sains Nasional" required />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect label="Jenjang" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={levelOptions} required />
                        <FormInput label="Jadwal" type="date" value={form.schedule} onChange={(v) => setForm({ ...form, schedule: v })} />
                    </div>
                    <FormInput
                        label="Sistem Seleksi"
                        value={form.selection_system}
                        onChange={(v) => setForm({ ...form, selection_system: v })}
                        placeholder="contoh: Seleksi internal + pembinaan"
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormInput
                            label="Biaya (Rp)"
                            type="number"
                            value={form.fee}
                            onChange={(v) => setForm({ ...form, fee: v })}
                            placeholder="0 untuk gratis"
                        />
                        <FormSelect
                            label="Kategori"
                            value={form.category}
                            onChange={(v) => setForm({ ...form, category: v })}
                            options={categoryOptions}
                        />
                        <FormSelect
                            label="Status"
                            value={form.is_active ? 'Aktif' : 'Nonaktif'}
                            onChange={(v) => setForm({ ...form, is_active: v === 'Aktif' })}
                            options={statusOptions}
                        />
                    </div>
                    <FormTextarea label="Catatan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Catatan tambahan..." />
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800">
                            {editing ? 'Simpan Perubahan' : 'Tambah Olimpiade'}
                        </button>
                    </div>
                </form>
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
