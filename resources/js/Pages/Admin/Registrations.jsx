import { Head } from '@inertiajs/react';
import { useState } from 'react';

const initialRegistrations = [
    { id: 1, name: 'Rafi Ahmad', type: 'Murid', level: 'SD', program: 'Reguler', contact: '0812-1234-8899', status: 'Kontak Ulang', date: '2026-01-20' },
    { id: 2, name: 'Nadia Azzahra', type: 'Murid', level: 'SMP', program: 'Privat', contact: '0813-2211-8811', status: 'Baru', date: '2026-01-22' },
    { id: 3, name: 'Salsa Nur', type: 'Pengajar', level: 'SMA', program: 'Matematika', contact: '0812-8888-1020', status: 'Seleksi', date: '2026-01-21' },
    { id: 4, name: 'Fahri Hakim', type: 'Murid', level: 'SMA', program: 'Olimpiade', contact: '0813-5555-3141', status: 'Terjadwal', date: '2026-01-19' },
    { id: 5, name: 'Aisyah Putri', type: 'Murid', level: 'SD', program: 'Intensif', contact: '0815-9999-1234', status: 'Selesai', date: '2026-01-18' },
];

const statusStyles = {
    Baru: 'bg-amber-50 text-amber-700 border-amber-200',
    Seleksi: 'bg-violet-50 text-violet-700 border-violet-200',
    Terjadwal: 'bg-blue-50 text-blue-700 border-blue-200',
    'Kontak Ulang': 'bg-rose-50 text-rose-700 border-rose-200',
    Selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusOptions = ['Baru', 'Kontak Ulang', 'Seleksi', 'Terjadwal', 'Selesai'];
const typeOptions = ['Murid', 'Pengajar'];
const levelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'];
const programOptions = ['Reguler', 'Intensif', 'Privat', 'Olimpiade', 'Matematika', 'B. Inggris', 'IPA'];

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
    search: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    download: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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

export default function Registrations() {
    const [registrations, setRegistrations] = useState(initialRegistrations);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: '', type: '', level: '', program: '', contact: '', status: 'Baru', notes: ''
    });

    // Filtered data
    const filteredData = registrations.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || r.status === filterStatus;
        const matchType = !filterType || r.type === filterType;
        return matchSearch && matchStatus && matchType;
    });

    // Stats
    const stats = [
        { label: 'Baru', value: registrations.filter(r => r.status === 'Baru').length, color: 'amber' },
        { label: 'Kontak Ulang', value: registrations.filter(r => r.status === 'Kontak Ulang').length, color: 'rose' },
        { label: 'Terjadwal', value: registrations.filter(r => r.status === 'Terjadwal').length, color: 'blue' },
        { label: 'Selesai', value: registrations.filter(r => r.status === 'Selesai').length, color: 'emerald' },
    ];

    const colorClasses = {
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    // Handlers
    const openModal = (item = null) => {
        if (item) {
            setEditing(item);
            setForm({ ...item });
        } else {
            setEditing(null);
            setForm({ name: '', type: '', level: '', program: '', contact: '', status: 'Baru', notes: '' });
        }
        setShowModal(true);
    };

    const saveForm = () => {
        if (editing) {
            setRegistrations(registrations.map(r => r.id === editing.id ? { ...form, id: editing.id, date: editing.date } : r));
        } else {
            setRegistrations([...registrations, { ...form, id: Date.now(), date: new Date().toISOString().split('T')[0] }]);
        }
        setShowModal(false);
    };

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setRegistrations(registrations.filter(r => r.id !== deleteTarget.id));
        setShowDeleteModal(false);
    };

    const openDetailModal = (item) => {
        setDetailTarget(item);
        setShowDetailModal(true);
    };

    return (
        <>
            <Head title="Pendaftaran" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pendaftaran</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Monitoring pendaftaran murid dan pengajar
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            {icons.download}
                            Export
                        </button>
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                        >
                            {icons.plus}
                            Tambah Manual
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className={`rounded-2xl border p-4 ${colorClasses[stat.color]}`}>
                            <p className="text-sm font-medium">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
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
                                placeholder="Cari nama..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                            >
                                <option value="">Semua Tipe</option>
                                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                            >
                                <option value="">Semua Status</option>
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Tipe</th>
                                    <th className="px-5 py-3 font-medium">Jenjang</th>
                                    <th className="px-5 py-3 font-medium">Program</th>
                                    <th className="px-5 py-3 font-medium">Kontak</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.type === 'Murid' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{item.level}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.program}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.contact}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetailModal(item)}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                    title="Lihat Detail"
                                                >
                                                    {icons.eye}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openModal(item)}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                    title="Edit"
                                                >
                                                    {icons.edit}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal(item)}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                                                    title="Hapus"
                                                >
                                                    {icons.trash}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada data yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Pendaftaran' : 'Tambah Pendaftaran'} size="lg">
                <form onSubmit={(e) => { e.preventDefault(); saveForm(); }} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Nama Lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Nama lengkap" required />
                        <FormSelect label="Tipe" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={typeOptions} required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect label="Jenjang" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={levelOptions} required />
                        <FormSelect label="Program" value={form.program} onChange={(v) => setForm({ ...form, program: v })} options={programOptions} required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Kontak (HP/WA)" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="08xx-xxxx-xxxx" required />
                        <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
                    </div>
                    <FormTextarea label="Catatan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Catatan tambahan..." />
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800">
                            {editing ? 'Simpan Perubahan' : 'Tambah Pendaftaran'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Pendaftaran">
                {detailTarget && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-800">{detailTarget.name}</p></div>
                                <div><p className="text-xs text-slate-500">Tipe</p><p className="font-medium text-slate-800">{detailTarget.type}</p></div>
                                <div><p className="text-xs text-slate-500">Jenjang</p><p className="font-medium text-slate-800">{detailTarget.level}</p></div>
                                <div><p className="text-xs text-slate-500">Program</p><p className="font-medium text-slate-800">{detailTarget.program}</p></div>
                                <div><p className="text-xs text-slate-500">Kontak</p><p className="font-medium text-slate-800">{detailTarget.contact}</p></div>
                                <div><p className="text-xs text-slate-500">Tanggal Daftar</p><p className="font-medium text-slate-800">{detailTarget.date}</p></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Status:</span>
                            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[detailTarget.status]}`}>
                                {detailTarget.status}
                            </span>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => { setShowDetailModal(false); openModal(detailTarget); }} className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100">
                                {icons.edit} Edit
                            </button>
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
