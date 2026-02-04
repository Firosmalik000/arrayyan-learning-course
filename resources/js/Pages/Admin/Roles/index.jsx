import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
};

const icons = {
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
    search: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
};

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

export default function Roles() {
    const {
        stats = [],
        roles = [],
        groups = [],
        accessTypes = [],
        flash,
        allowedActions = {},
    } = usePage().props;
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [detailRole, setDetailRole] = useState(null);
    const [deleteRole, setDeleteRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const roleForm = useForm({
        label: '',
        description: '',
        group: '',
        access_type: '',
    });

    const can = (action) => (allowedActions.roles ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canView = can('view');
    const canAccessMenu = (allowedActions['akses-menu'] ?? []).includes('view');

    const normalizedRoles = roles.map((role) => ({
        id: role.id,
        name: role.name ?? role.label ?? '',
        label: role.label ?? role.name ?? '',
        key: role.key ?? '',
        raw_name: role.raw_name ?? '',
        description: role.description ?? '',
        group: role.group ?? 'Custom',
        users: role.users ?? 0,
        tag: role.tag ?? 'Custom',
        tone: role.tone ?? 'violet',
        permissions: role.permissions ?? [],
    }));

    const filteredRoles = normalizedRoles.filter((role) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return role.name.toLowerCase().includes(keyword) || role.key.toLowerCase().includes(keyword);
    });

    const sortedRoles = [...filteredRoles].sort((a, b) => a.name.localeCompare(b.name));
    const totalPages = Math.max(1, Math.ceil(sortedRoles.length / pageSize));

    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);

    useEffect(() => {
        setPage((current) => Math.min(Math.max(current, 1), totalPages));
    }, [totalPages]);

    const startIndex = sortedRoles.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = Math.min(sortedRoles.length, page * pageSize);
    const paginatedRoles = sortedRoles.slice((page - 1) * pageSize, page * pageSize);

    const openCreateModal = () => {
        setEditingRole(null);
        roleForm.reset();
        roleForm.clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (role) => {
        setEditingRole(role);
        roleForm.setData({
            label: role.label,
            description: role.description ?? '',
            group: role.group ?? '',
            access_type: '',
        });
        roleForm.clearErrors();
        setIsModalOpen(true);
    };

    const accessPlaceholder = editingRole ? 'Biarkan akses saat ini' : 'Pilih tipe akses';

    const handleSubmit = (event) => {
        event.preventDefault();
        if (editingRole) {
            roleForm.put(`/admin/roles/${editingRole.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingRole(null);
                    roleForm.reset();
                },
            });
            return;
        }

        roleForm.post('/admin/roles', {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                roleForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deleteRole) return;
        router.delete(`/admin/roles/${deleteRole.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteRole(null),
        });
    };

    return (
        <>
            <Head title="Role Admin" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            Role Administrator
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Kelola role admin dan atur akses di menu Akses Menu.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                        {canAccessMenu && (
                            <Link
                                href="/admin/akses-menu"
                                className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:px-4 sm:py-2"
                            >
                                Atur Akses Menu
                            </Link>
                        )}
                        {canCreate && (
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                            >
                                Tambah Role
                            </button>
                        )}
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5"
                        >
                            <div
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                    toneStyles[item.tone] ?? toneStyles.violet
                                }`}
                            >
                                {item.label}
                            </div>
                            <p className="mt-2 text-xl font-semibold text-slate-800 sm:mt-3 sm:text-2xl">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Daftar Role</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Menampilkan {startIndex}-{endIndex} dari {sortedRoles.length} role
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {icons.search}
                                </span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Filter nama role"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:text-sm"
                                />
                            </div>
                            <select
                                value={pageSize}
                                onChange={(event) => setPageSize(Number(event.target.value))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none sm:text-sm"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size} baris
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 font-medium">Nama Role</th>
                                    <th className="px-5 py-3 font-medium">Grup</th>
                                    <th className="px-5 py-3 font-medium">Admin</th>
                                    <th className="px-5 py-3 font-medium">Akses</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedRoles.map((role) => {
                                    const isLocked = role.raw_name === 'administrator' || role.key === 'administrator';

                                    return (
                                        <tr key={role.id} className="transition hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">{role.name}</p>
                                                <p className="text-xs text-slate-500">{role.description}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{role.group}</td>
                                            <td className="px-5 py-4 text-slate-600">{role.users}</td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                                        toneStyles[role.tone] ?? toneStyles.violet
                                                    }`}
                                                >
                                                    {role.tag}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                {canView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailRole(role)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                        title="Detail"
                                                    >
                                                        {icons.eye}
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(role)}
                                                        disabled={isLocked}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Edit"
                                                    >
                                                        {icons.edit}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteRole(role)}
                                                        disabled={isLocked}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                                {paginatedRoles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                                            Tidak ada role yang cocok dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
                        <p className="text-xs text-slate-500">
                            Menampilkan {startIndex}-{endIndex} dari {sortedRoles.length} role
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setPage(pageNumber)}
                                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                        pageNumber === page
                                            ? 'bg-violet-600 text-white shadow-sm'
                                            : 'border border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-700'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRole ? 'Edit Role' : 'Tambah Role'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nama Role
                        </label>
                        <input
                            type="text"
                            value={roleForm.data.label}
                            onChange={(event) => roleForm.setData('label', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {roleForm.errors.label && (
                            <p className="mt-1 text-xs text-red-600">{roleForm.errors.label}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Deskripsi
                        </label>
                        <textarea
                            rows="3"
                            value={roleForm.data.description}
                            onChange={(event) => roleForm.setData('description', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {roleForm.errors.description && (
                            <p className="mt-1 text-xs text-red-600">{roleForm.errors.description}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Grup
                        </label>
                        <select
                            value={roleForm.data.group}
                            onChange={(event) => roleForm.setData('group', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Pilih grup role</option>
                            {groups.map((group) => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Tipe Akses Default
                        </label>
                        <select
                            value={roleForm.data.access_type}
                            onChange={(event) => roleForm.setData('access_type', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">{accessPlaceholder}</option>
                            {accessTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        {roleForm.errors.access_type && (
                            <p className="mt-1 text-xs text-red-600">{roleForm.errors.access_type}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={roleForm.processing}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-violet-800"
                        >
                            {editingRole ? 'Simpan Perubahan' : 'Simpan Role'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={!!detailRole}
                onClose={() => setDetailRole(null)}
                title="Detail Role"
                size="lg"
            >
                {detailRole && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="text-xs text-slate-400">Nama</p>
                            <p className="font-semibold text-slate-800">{detailRole.name}</p>
                            <p className="mt-3 text-xs text-slate-400">Deskripsi</p>
                            <p className="font-semibold text-slate-800">{detailRole.description || '-'}</p>
                            <p className="mt-3 text-xs text-slate-400">Grup</p>
                            <p className="font-semibold text-slate-800">{detailRole.group}</p>
                            <p className="mt-3 text-xs text-slate-400">Jumlah Admin</p>
                            <p className="font-semibold text-slate-800">{detailRole.users}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Daftar Permission</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {detailRole.permissions.length > 0 ? (
                                    detailRole.permissions.map((permission) => (
                                        <span
                                            key={permission}
                                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                                        >
                                            {permission}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-500">Belum ada permission.</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!deleteRole}
                onClose={() => setDeleteRole(null)}
                title="Konfirmasi Hapus"
                size="sm"
            >
                <div className="text-center">
                    <p className="text-slate-600">
                        Hapus role <span className="font-semibold text-slate-800">{deleteRole?.name}</span>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setDeleteRole(null)}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
