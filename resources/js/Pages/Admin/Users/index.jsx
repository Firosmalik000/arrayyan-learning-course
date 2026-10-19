import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FlashMessage, Modal, ActionDropdown, Pagination } from '@/Components/Admin';

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
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    edit: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            />
        </svg>
    ),
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
        </svg>
    ),
    masquerade: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 0a2.25 2.25 0 00-2.25 2.25v1.5a4.5 4.5 0 009 0v-1.5a2.25 2.25 0 00-2.25-2.25m-9 0V7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0118.75 7.5v.75m-3 6.75h.008v.008h-.008v-.008z"
            />
        </svg>
    ),
    key: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 11-4.243 4.243L5.25 15.75H3v2.25H.75v2.25H6l7.007-7.007A3 3 0 0015.75 5.25z" />
        </svg>
    ),
};

export default function Users() {
    const { stats = [], users = [], portalAccounts = {}, roles = [], invites = [], canImpersonate, flash, allowedActions = {} } = usePage().props;
    const [activeTab, setActiveTab] = useState('admin');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [detailModal, setDetailModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [inviteModal, setInviteModal] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

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

    const resetPasswordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const can = (action) => (allowedActions.users ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canView = can('view');
    const canApprove = can('approve');
    const canExport = can('export');

    const accountTabs = [
        { key: 'admin', label: 'Admin', count: users.length },
        {
            key: 'teachers',
            label: 'Guru',
            count: portalAccounts.teachers?.length ?? 0,
        },
        {
            key: 'parents',
            label: 'Orang Tua',
            count: portalAccounts.parents?.length ?? 0,
        },
    ];

    const activeAccounts = activeTab === 'admin' ? users : (portalAccounts[activeTab] ?? []);

    const filteredUsers = useMemo(() => {
        return activeAccounts.filter((user) => {
            const matchRole = activeTab !== 'admin' || !filterRole || user.primary_role === filterRole;
            const matchStatus = !filterStatus || user.status === filterStatus;
            return matchRole && matchStatus;
        });
    }, [activeAccounts, activeTab, filterRole, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / perPage) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredUsers.slice(start, start + perPage);
    }, [filteredUsers, currentPage, perPage]);

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

    const openResetPasswordModal = (account) => {
        resetPasswordForm.reset();
        resetPasswordForm.clearErrors();
        setResetPasswordModal(account);
    };

    const closeResetPasswordModal = () => {
        setResetPasswordModal(null);
        resetPasswordForm.reset();
        resetPasswordForm.clearErrors();
    };

    const handleResetPortalPassword = (event) => {
        event.preventDefault();

        if (!resetPasswordModal) {
            return;
        }

        resetPasswordForm.patch(`/admin/users/portal-accounts/${resetPasswordModal.id}/password`, {
            preserveScroll: true,
            onSuccess: closeResetPasswordModal,
        });
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setFilterRole('');
        setFilterStatus('');
        setCurrentPage(1);
        setDetailModal(null);
    };

    const activeTabLabel = accountTabs.find((tab) => tab.key === activeTab)?.label ?? 'Admin';

    return (
        <>
            <Head title="Manajemen Akun" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">Manajemen Akun</h2>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">Lihat akun berdasarkan portal yang digunakan oleh admin, guru, dan orang tua.</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                        {activeTab === 'admin' && canExport && (
                            <button
                                type="button"
                                className="hidden rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:inline-flex sm:px-4 sm:py-2"
                            >
                                Export User
                            </button>
                        )}
                        {activeTab === 'admin' && canCreate && (
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

                <FlashMessage flash={flash} />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
                            <div
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${toneStyles[item.tone] ?? toneStyles.violet}`}
                            >
                                {item.label}
                            </div>
                            <p className="mt-2 text-xl font-semibold text-slate-800 sm:mt-3 sm:text-2xl">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                    <div role="tablist" aria-label="Jenis akun berdasarkan portal" className="flex min-w-max gap-1">
                        {accountTabs.map((tab) => {
                            const isActive = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    id={`account-tab-${tab.key}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls="account-panel"
                                    onClick={() => switchTab(tab.key)}
                                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:px-5 ${isActive ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    {tab.label}
                                    <span
                                        className={`ml-2 inline-flex min-w-6 justify-center rounded-full px-2 py-0.5 text-xs tabular-nums ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div
                    id="account-panel"
                    role="tabpanel"
                    aria-labelledby={`account-tab-${activeTab}`}
                    className={`grid gap-4 sm:gap-6 ${activeTab === 'admin' ? 'lg:grid-cols-[1.3fr_0.7fr]' : ''}`}
                >
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">Akun Portal {activeTabLabel}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {activeTab === 'admin'
                                        ? 'Akun untuk mengelola dashboard dan operasional.'
                                        : activeTab === 'teachers'
                                          ? 'Akun guru untuk jadwal, absensi, dan aktivitas mengajar.'
                                          : 'Akun orang tua untuk memantau pembelajaran dan tagihan anak.'}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                                {activeTab === 'admin' && (
                                    <select
                                        aria-label="Filter role"
                                        value={filterRole}
                                        onChange={(event) => {
                                            setFilterRole(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                    >
                                        <option value="">Semua role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.label}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <select
                                    aria-label="Filter status akun"
                                    value={filterStatus}
                                    onChange={(event) => {
                                        setFilterStatus(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="">Semua status</option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:mt-5 sm:px-6">
                            <table className="w-full min-w-[680px] text-left text-xs text-slate-600 sm:text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs sm:tracking-[0.2em]">
                                        <th className="w-12 whitespace-nowrap pb-2 pr-3 text-center sm:pb-3">No</th>
                                        <th className="w-14 whitespace-nowrap pb-2 pr-3 text-center sm:pb-3">Aksi</th>
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">Nama</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 md:table-cell">Email</th>
                                        <th className="whitespace-nowrap pb-2 pr-3 sm:pb-3">{activeTab === 'admin' ? 'Role' : 'Kontak'}</th>
                                        <th className="hidden whitespace-nowrap pb-3 pr-3 lg:table-cell">{activeTab === 'admin' ? 'Dibuat' : 'Terhubung'}</th>
                                        {activeTab !== 'admin' && <th className="hidden whitespace-nowrap pb-3 pr-3 xl:table-cell">Login Terakhir</th>}
                                        <th className="whitespace-nowrap pb-2 text-right sm:pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map((user, idx) => {
                                        const rowNum = (currentPage - 1) * perPage + idx + 1;
                                        const actions = [
                                            canView && {
                                                label: 'Detail Info',
                                                icon: icons.eye,
                                                onClick: () =>
                                                    setDetailModal({
                                                        ...user,
                                                        accountTab: activeTab,
                                                    }),
                                            },
                                            activeTab === 'admin' &&
                                                canEdit && {
                                                    label: 'Edit User',
                                                    icon: icons.edit,
                                                    onClick: () => openEditModal(user),
                                                },
                                            activeTab !== 'admin' &&
                                                canEdit && {
                                                    label: 'Reset Password',
                                                    icon: icons.key,
                                                    onClick: () => openResetPasswordModal(user),
                                                },
                                            activeTab === 'admin' &&
                                                canImpersonate &&
                                                canApprove && {
                                                    label: 'Impersonate',
                                                    icon: icons.masquerade,
                                                    onClick: () => handleImpersonate(user),
                                                },
                                            activeTab === 'admin' &&
                                                canDelete && {
                                                    label: 'Hapus User',
                                                    icon: icons.trash,
                                                    danger: true,
                                                    onClick: () => setDeleteModal(user),
                                                },
                                        ].filter(Boolean);

                                        return (
                                            <tr key={`${activeTab}-${user.id}`} className="border-t border-slate-100 hover:bg-slate-50/50">
                                                <td className="whitespace-nowrap py-2 pr-3 text-center text-xs font-semibold text-slate-400 sm:py-3">{rowNum}</td>
                                                <td className="whitespace-nowrap py-2 pr-3 text-center sm:py-3">
                                                    <ActionDropdown actions={actions} />
                                                </td>
                                                <td className="whitespace-nowrap py-2 pr-3 font-semibold text-slate-800 sm:py-3">{user.name}</td>
                                                <td className="hidden whitespace-nowrap py-3 pr-3 md:table-cell">{user.email || '-'}</td>
                                                <td className="whitespace-nowrap py-2 pr-3 sm:py-3">{activeTab === 'admin' ? user.primary_role : user.contact}</td>
                                                <td className="hidden whitespace-nowrap py-3 pr-3 lg:table-cell">
                                                    {activeTab === 'admin'
                                                        ? user.created_at
                                                            ? new Date(user.created_at).toLocaleDateString('id-ID')
                                                            : '-'
                                                        : user.linked_names?.length > 0
                                                          ? user.linked_names.join(', ')
                                                          : 'Belum terhubung'}
                                                </td>
                                                {activeTab !== 'admin' && (
                                                    <td className="hidden whitespace-nowrap py-3 pr-3 xl:table-cell">
                                                        {user.last_login_at
                                                            ? new Date(user.last_login_at).toLocaleString('id-ID', {
                                                                  dateStyle: 'medium',
                                                                  timeStyle: 'short',
                                                              })
                                                            : 'Belum pernah'}
                                                    </td>
                                                )}
                                                <td className="whitespace-nowrap py-2 text-right sm:py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${statusStyles[user.status] ?? statusStyles.Aktif}`}
                                                    >
                                                        {user.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && (
                                        <tr className="border-t border-slate-100">
                                            <td colSpan={activeTab === 'admin' ? 7 : 8} className="py-6 text-center text-xs text-slate-500 sm:text-sm">
                                                Tidak ada akun {activeTabLabel.toLowerCase()} yang cocok dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredUsers.length}
                                perPage={perPage}
                                onPageChange={setCurrentPage}
                                onPerPageChange={(val) => {
                                    setPerPage(val);
                                    setCurrentPage(1);
                                }}
                            />
                        )}
                    </div>

                    {activeTab === 'admin' && (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                            <p className="text-sm font-semibold text-slate-800">Pending Invite</p>
                            <div className="mt-4 space-y-2 text-sm text-slate-600 sm:mt-5 sm:space-y-3">
                                {invites.length > 0 ? (
                                    invites.map((invite) => (
                                        <div key={invite.email} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                                            <p className="truncate font-semibold text-slate-800">{invite.email}</p>
                                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
                                                <span>{invite.role}</span>
                                                <span className={`rounded-full px-2 py-0.5 font-semibold sm:px-3 sm:py-1 ${statusStyles[invite.status] ?? statusStyles.Menunggu}`}>
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
                    )}
                </div>
            </div>

            <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Akun">
                {detailModal && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="text-xs text-slate-400">Nama</p>
                            <p className="font-semibold text-slate-800">{detailModal.name}</p>
                            <p className="mt-3 text-xs text-slate-400">Email</p>
                            <p className="font-semibold text-slate-800">{detailModal.email || '-'}</p>
                            {detailModal.accountTab === 'admin' ? (
                                <>
                                    <p className="mt-3 text-xs text-slate-400">Role</p>
                                    <p className="font-semibold text-slate-800">{detailModal.primary_role}</p>
                                </>
                            ) : (
                                <>
                                    <p className="mt-3 text-xs text-slate-400">Portal</p>
                                    <p className="font-semibold text-slate-800">{detailModal.portal}</p>
                                    <p className="mt-3 text-xs text-slate-400">Kontak</p>
                                    <p className="font-semibold text-slate-800">{detailModal.contact}</p>
                                    <p className="mt-3 text-xs text-slate-400">{detailModal.accountTab === 'teachers' ? 'Data guru' : 'Anak terhubung'}</p>
                                    <p className="font-semibold text-slate-800">{detailModal.linked_names?.length > 0 ? detailModal.linked_names.join(', ') : 'Belum terhubung'}</p>
                                    <p className="mt-3 text-xs text-slate-400">Login terakhir</p>
                                    <p className="font-semibold text-slate-800">
                                        {detailModal.last_login_at
                                            ? new Date(detailModal.last_login_at).toLocaleString('id-ID', {
                                                  dateStyle: 'medium',
                                                  timeStyle: 'short',
                                              })
                                            : 'Belum pernah'}
                                    </p>
                                    <p className="mt-3 text-xs text-slate-400">Password awal</p>
                                    <p className="font-semibold text-slate-800">{detailModal.must_change_password ? 'Belum diganti' : 'Sudah diganti'}</p>
                                </>
                            )}
                            <p className="mt-3 text-xs text-slate-400">Status</p>
                            <p className="font-semibold text-slate-800">{detailModal.status}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit User">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama</label>
                        <input
                            type="text"
                            value={editForm.data.name}
                            onChange={(event) => editForm.setData('name', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {editForm.errors.name && <p className="mt-1 text-xs text-red-600">{editForm.errors.name}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
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
                        {editForm.errors.role_id && <p className="mt-1 text-xs text-red-600">{editForm.errors.role_id}</p>}
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

            <Modal isOpen={!!resetPasswordModal} onClose={closeResetPasswordModal} title="Reset Password Akun" size="sm">
                {resetPasswordModal && (
                    <form onSubmit={handleResetPortalPassword} className="space-y-4">
                        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                            <p className="font-semibold">{resetPasswordModal.name}</p>
                            <p className="mt-1 text-xs leading-5 text-amber-800">Password lama tidak akan berlaku. Pengguna wajib mengganti password baru ini setelah login.</p>
                        </div>
                        <div>
                            <label htmlFor="portal-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Password baru
                            </label>
                            <input
                                id="portal-password"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                                value={resetPasswordForm.data.password}
                                onChange={(event) => resetPasswordForm.setData('password', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                            <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter.</p>
                            {resetPasswordForm.errors.password && <p className="mt-1 text-xs text-red-600">{resetPasswordForm.errors.password}</p>}
                        </div>
                        <div>
                            <label htmlFor="portal-password-confirmation" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Konfirmasi password baru
                            </label>
                            <input
                                id="portal-password-confirmation"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                                value={resetPasswordForm.data.password_confirmation}
                                onChange={(event) => resetPasswordForm.setData('password_confirmation', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={closeResetPasswordModal}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={resetPasswordForm.processing}
                                className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {resetPasswordForm.processing ? 'Menyimpan...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={inviteModal} onClose={() => setInviteModal(false)} title="Undang User">
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama lengkap</label>
                        <input
                            type="text"
                            value={inviteForm.data.name}
                            onChange={(event) => inviteForm.setData('name', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {inviteForm.errors.name && <p className="mt-1 text-xs text-red-600">{inviteForm.errors.name}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={inviteForm.data.email}
                            onChange={(event) => inviteForm.setData('email', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        {inviteForm.errors.email && <p className="mt-1 text-xs text-red-600">{inviteForm.errors.email}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
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
                        {inviteForm.errors.role_id && <p className="mt-1 text-xs text-red-600">{inviteForm.errors.role_id}</p>}
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

            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Konfirmasi Hapus" size="sm">
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
                    <button type="button" onClick={handleDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </Modal>
        </>
    );
}
