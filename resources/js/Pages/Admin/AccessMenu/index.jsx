import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const roles = [
    {
        id: 'super-admin',
        name: 'Super Admin',
        description: 'Akses penuh ke seluruh modul dan pengaturan.',
        tag: 'Full Access',
        tone: 'violet',
    },
    {
        id: 'admin-konten',
        name: 'Admin Konten',
        description: 'Kelola konten publik dan pendaftaran.',
        tag: 'Content',
        tone: 'amber',
    },
    {
        id: 'editor',
        name: 'Editor',
        description: 'Edit copy dan jadwal konten.',
        tag: 'Limited',
        tone: 'rose',
    },
];

const permissions = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'approve', label: 'Approve' },
    { key: 'reject', label: 'Reject' },
    { key: 'export', label: 'Export' },
    { key: 'import', label: 'Import' },
];

const menuSections = [
    {
        title: 'Core',
        description: 'Navigasi utama admin.',
        items: [
            { id: 'dashboard', label: 'Dashboard', description: 'Ringkasan data admin.' },
        ],
    },
    {
        title: 'Content',
        description: 'Konten publik dan landing.',
        items: [
            { id: 'landing', label: 'Landing Page', description: 'Hero, copy, dan CTA.' },
        ],
    },
    {
        title: 'Master Data',
        description: 'Pengelolaan data akademik.',
        items: [
            { id: 'program', label: 'Program', description: 'Data program belajar.' },
            { id: 'bank-soal', label: 'Bank Soal', description: 'Soal dan arsip.' },
            { id: 'olimpiade', label: 'Olimpiade', description: 'Event dan jadwal.' },
            { id: 'pendaftaran', label: 'Pendaftaran', description: 'Pendaftar masuk.' },
            { id: 'pengajar', label: 'Pengajar', description: 'Data pengajar.' },
        ],
    },
    {
        title: 'Administrator',
        description: 'Manajemen role dan akses.',
        items: [
            { id: 'akses-menu', label: 'Akses Menu', description: 'Pengaturan akses role.' },
            { id: 'roles', label: 'Role', description: 'Kelompok role admin.' },
            { id: 'users', label: 'User', description: 'Akun administrator.' },
        ],
    },
    {
        title: 'System',
        description: 'Pengaturan dan konfigurasi.',
        items: [
            { id: 'pengaturan', label: 'Pengaturan', description: 'Konfigurasi aplikasi.' },
        ],
    },
];

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
};

const permissionKeys = permissions.map((permission) => permission.key);
const menuIds = menuSections.flatMap((section) =>
    section.items.map((item) => item.id)
);

const buildFullAccessMap = () =>
    Object.fromEntries(menuIds.map((id) => [id, [...permissionKeys]]));

const initialRoleAccess = {
    'super-admin': buildFullAccessMap(),
    'admin-konten': {
        dashboard: ['view'],
        landing: ['view', 'create', 'edit', 'delete', 'export', 'import'],
        program: ['view', 'create', 'edit', 'delete'],
        'bank-soal': ['view', 'create', 'edit', 'delete', 'export', 'import'],
        olimpiade: ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
        pendaftaran: ['view', 'approve', 'reject', 'export'],
        pengajar: ['view', 'create', 'edit', 'delete'],
    },
    editor: {
        dashboard: ['view'],
        landing: ['view', 'edit'],
        program: ['view'],
        'bank-soal': ['view', 'edit'],
        olimpiade: ['view'],
        pendaftaran: ['view'],
        pengajar: ['view'],
    },
};

export default function AccessMenu() {
    const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id ?? '');
    const [roleAccess, setRoleAccess] = useState(initialRoleAccess);

    const activeRole =
        roles.find((role) => role.id === activeRoleId) ?? roles[0];

    const getMenuAccess = (menuId) =>
        roleAccess[activeRoleId]?.[menuId] ?? [];

    const isFullAccess = (menuId) =>
        permissionKeys.every((key) => getMenuAccess(menuId).includes(key));

    const updateMenuAccess = (menuId, updater) => {
        if (!activeRoleId) {
            return;
        }

        setRoleAccess((prev) => {
            const roleData = prev[activeRoleId] ?? {};
            const current = roleData[menuId] ?? [];
            const next = updater(current);

            return {
                ...prev,
                [activeRoleId]: {
                    ...roleData,
                    [menuId]: next,
                },
            };
        });
    };

    const handleTogglePermission = (menuId, permissionKey) => {
        updateMenuAccess(menuId, (current) => {
            const nextSet = new Set(current);

            if (nextSet.has(permissionKey)) {
                nextSet.delete(permissionKey);
            } else {
                nextSet.add(permissionKey);
            }

            return permissionKeys.filter((key) => nextSet.has(key));
        });
    };

    const handleToggleFullAccess = (menuId) => {
        updateMenuAccess(menuId, () =>
            isFullAccess(menuId) ? [] : [...permissionKeys]
        );
    };

    return (
        <>
            <Head title="Akses Menu Admin" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            Akses Menu
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Atur role dan hak akses menu. Full access mencakup
                            create, view, edit, delete, approve, reject, export,
                            import.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                    >
                        Simpan Akses
                    </button>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.4fr]">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">
                                Role Administrator
                            </p>
                            <Link
                                href="/admin/roles"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-4 sm:py-1.5 sm:text-xs"
                            >
                                Kelola Role
                            </Link>
                        </div>
                        {roles.map((role) => {
                            const isActive = role.id === activeRoleId;

                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setActiveRoleId(role.id)}
                                    className={`w-full rounded-2xl border p-4 text-left shadow-sm transition sm:rounded-3xl sm:p-6 ${
                                        isActive
                                            ? 'border-violet-200 bg-violet-50/40 ring-1 ring-violet-100'
                                            : 'border-slate-100 bg-white hover:border-violet-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-base font-semibold text-slate-800 sm:text-lg">
                                                {role.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                                                {role.description}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                                toneStyles[role.tone] ??
                                                toneStyles.violet
                                            }`}
                                        >
                                            {role.tag}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Akses untuk {activeRole?.name ?? 'Role'}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Pilih menu dan action yang tersedia.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-3 sm:py-1 sm:text-xs"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {menuSections.map((section) => (
                                <div
                                    key={section.title}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                {section.title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {section.description}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400">
                                            {section.items.length} menu
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        {section.items.map((item) => {
                                            const isMenuFullAccess =
                                                isFullAccess(item.id);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {item.label}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isMenuFullAccess
                                                                }
                                                                onChange={() =>
                                                                    handleToggleFullAccess(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                                            />
                                                            Full Access
                                                        </label>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                                                        {permissions.map(
                                                            (permission) => (
                                                                <label
                                                                    key={
                                                                        permission.key
                                                                    }
                                                                    className="flex items-center gap-2 text-xs text-slate-600"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={getMenuAccess(
                                                                            item.id
                                                                        ).includes(
                                                                            permission.key
                                                                        )}
                                                                        onChange={() =>
                                                                            handleTogglePermission(
                                                                                item.id,
                                                                                permission.key
                                                                            )
                                                                        }
                                                                        className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                                                    />
                                                                    {
                                                                        permission.label
                                                                    }
                                                                </label>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
