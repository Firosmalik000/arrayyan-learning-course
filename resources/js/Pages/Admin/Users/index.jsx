import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
};

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700',
    Nonaktif: 'bg-slate-100 text-slate-600',
    Menunggu: 'bg-amber-50 text-amber-700',
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
    masquerade: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 0a2.25 2.25 0 00-2.25 2.25v1.5a4.5 4.5 0 009 0v-1.5a2.25 2.25 0 00-2.25-2.25m-9 0V7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0118.75 7.5v.75m-3 6.75h.008v.008h-.008v-.008z" />
        </svg>
    ),
    close: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

export default function Users() {
    const {
        stats = [],
        users = [],
        roles = [],
        invites = [],
        canImpersonate,
        flash,
        allowedActions = {},
    } = usePage().props;
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [detailModal, setDetailModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [inviteModal, setInviteModal] = useState(false);

    const inviteForm = useForm({
        name: '',
        email: '',
        role_id: '',
    });

    const editForm = useForm({
        name: '',
        role_id: '',
        user_id: null,
    });

    const can = (action) => (allowedActions.users ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canView = can('view');
    const canApprove = can('approve');
    const canExport = can('export');

    const filteredUsers = users.filter((user) => {
        const matchRole = !filterRole || user.primary_role === filterRole;
        const matchStatus = !filterStatus || user.status === filterStatus;
        return matchRole && matchStatus;
    });

    const openEditModal = (user) => {
        editForm.setData({
            name: user.name,
            role_id: user.roles?.[0]?.id ?? '',
            user_id: user.id,
        });
        setEditModal(user);
    };

    const handleUpdate = (event) => {
        event.preventDefault();
        if (!editForm.data.user_id) {
            return;
        }
        editForm.put(`/admin/users/${editForm.data.user_id}`, {
            preserveScroll: true,
            onSuccess: () => setEditModal(null),
        });
    };

    const handleInvite = (event) => {
        event.preventDefault();
        inviteForm.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                inviteForm.reset();
                setInviteModal(false);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteModal) return;
        router.delete(`/admin/users/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal(null),
        });
    };

    const handleImpersonate = (user) => {
        router.post(`/admin/users/${user.id}/impersonate`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="User Admin" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            User Administrator
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Kelola akun admin, role, dan status akses.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                        {canExport && (
                            <button
                                type="button"
                                className="hidden rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:inline-flex sm:px-4 sm:py-2"
                            >
                                Export User
                            </button>
                        )}
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() => setInviteModal(true)}
                                className="rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:opacity-90 sm:px-4 sm:py-2"
                            >
                                Undang User
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
                                    toneStyles[item.tone] ??
                                    toneStyles.violet
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

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Daftar User
                                </p>
                                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                    Status akses admin terbaru.
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <select
                                    value={filterRole}
                                    onChange={(event) => setFilterRole(event.target.value)}
                                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 sm:px-3 sm:py-1 sm:text-xs"
                                >
                                    <option value="">Semua role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.label}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(event) => setFilterStatus(event.target.value)}
                                    className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 sm:block"
                                >
                                    <option value="">Semua status</option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:mt-5 sm:px-6">
                            <table className="min-w-full text-left text-xs text-slate-600 sm:text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs sm:tracking-[0.2em]">
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Nama</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 md:table-cell">Email</th>
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Role</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 lg:table-cell">Last Login</th>
                                        <th className="whitespace-nowrap pb-2 text-right sm:pb-3">
                                            Status
                                        </th>
                                        <th className="whitespace-nowrap pb-2 text-right sm:pb-3">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.email}
                                            className="border-t border-slate-100"
                                        >
                                            <td className="whitespace-nowrap py-2 pr-3 font-semibold text-slate-800 sm:py-3">
                                                {user.name}
                                            </td>
                                            <td className="hidden whitespace-nowrap py-3 pr-3 md:table-cell">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap py-2 pr-3 sm:py-3">
                                                {user.primary_role}
                                            </td>
                                            <td className="hidden whitespace-nowrap py-3 pr-3 lg:table-cell">
                                                {user.created_at
                                                    ? new Date(
                                                        user.created_at
                                                    ).toLocaleDateString(
                                                        'id-ID'
                                                    )
                                                    : '-'}
                                            </td>
                                            <td className="whitespace-nowrap py-2 text-right sm:py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                                        statusStyles[
                                                            user.status
                                                        ] ??
                                                        statusStyles.Aktif
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap py-2 text-right sm:py-3">
                                                <div className="flex justify-end gap-1">
                                                    {canView && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDetailModal(user)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                            title="Detail"
                                                        >
                                                            {icons.eye}
                                                        </button>
                                                    )}
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(user)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                                                            title="Edit"
                                                        >
                                                            {icons.edit}
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteModal(user)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                                                            title="Hapus"
                                                        >
                                                            {icons.trash}
                                                        </button>
                                                    )}
                                                    {canImpersonate && canApprove && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImpersonate(user)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-100 hover:text-emerald-600"
                                                            title="Impersonate"
                                                        >
                                                            {icons.masquerade}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr className="border-t border-slate-100">
                                            <td
                                                colSpan={6}
                                                className="py-6 text-center text-xs text-slate-500 sm:text-sm"
                                            >
                                                Tidak ada user yang cocok dengan
                                                filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <p className="text-sm font-semibold text-slate-800">
                            Pending Invite
                        </p>
                        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            Daftar undangan yang belum diterima.
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-slate-600 sm:mt-5 sm:space-y-3">
                            {invites.length > 0 ? (
                                invites.map((invite) => (
                                    <div
                                        key={invite.email}
                                        className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3"
                                    >
                                        <p className="truncate font-semibold text-slate-800">
                                            {invite.email}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
                                            <span>{invite.role}</span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-semibold sm:px-3 sm:py-1 ${
                                                    statusStyles[
                                                        invite.status
                                                    ] ??
                                                    statusStyles.Menunggu
                                                }`}
                                            >
                                                {invite.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
                                    Belum ada undangan yang menunggu.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!detailModal}
                onClose={() => setDetailModal(null)}
                title="Detail User"
            >
                {detailModal && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="text-xs text-slate-400">Nama</p>
                            <p className="font-semibold text-slate-800">{detailModal.name}</p>
                            <p className="mt-3 text-xs text-slate-400">Email</p>
                            <p className="font-semibold text-slate-800">{detailModal.email}</p>
                            <p className="mt-3 text-xs text-slate-400">Role</p>
                            <p className="font-semibold text-slate-800">{detailModal.primary_role}</p>
                            <p className="mt-3 text-xs text-slate-400">Status</p>
                            <p className="font-semibold text-slate-800">{detailModal.status}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!editModal}
                onClose={() => setEditModal(null)}
                title="Edit User"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nama
                        </label>
                        <input
                            type="text"
                            value={editForm.data.name}
                            onChange={(event) => editForm.setData('name', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {editForm.errors.name && (
                            <p className="mt-1 text-xs text-red-600">{editForm.errors.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Role
                        </label>
                        <select
                            value={editForm.data.role_id}
                            onChange={(event) => editForm.setData('role_id', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Pilih role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {editForm.errors.role_id && (
                            <p className="mt-1 text-xs text-red-600">{editForm.errors.role_id}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setEditModal(null)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={inviteModal}
                onClose={() => setInviteModal(false)}
                title="Undang User"
            >
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nama lengkap
                        </label>
                        <input
                            type="text"
                            value={inviteForm.data.name}
                            onChange={(event) => inviteForm.setData('name', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {inviteForm.errors.name && (
                            <p className="mt-1 text-xs text-red-600">{inviteForm.errors.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={inviteForm.data.email}
                            onChange={(event) => inviteForm.setData('email', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {inviteForm.errors.email && (
                            <p className="mt-1 text-xs text-red-600">{inviteForm.errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Role
                        </label>
                        <select
                            value={inviteForm.data.role_id}
                            onChange={(event) => inviteForm.setData('role_id', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Pilih role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {inviteForm.errors.role_id && (
                            <p className="mt-1 text-xs text-red-600">{inviteForm.errors.role_id}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setInviteModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={inviteForm.processing}
                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            Kirim Undangan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Konfirmasi Hapus"
                size="sm"
            >
                <div className="text-center">
                    <p className="text-slate-600">
                        Hapus user <span className="font-semibold text-slate-800">{deleteModal?.name}</span>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setDeleteModal(null)}
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
