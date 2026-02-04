import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
};

export default function AccessMenu() {
    const {
        roles = [],
        permissions = [],
        menuSections = [],
        roleAccess: initialRoleAccess = {},
        flash,
        allowedActions = {},
    } = usePage().props;
    const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id ?? '');
    const [roleAccess, setRoleAccess] = useState(initialRoleAccess);

    const activeRole =
        roles.find((role) => role.id === activeRoleId) ?? roles[0];

    const getMenuAccess = (menuId) =>
        roleAccess[activeRoleId]?.[menuId] ?? [];

    const permissionKeys = permissions.map((permission) => permission.key);

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

    const canEdit = (allowedActions['akses-menu'] ?? []).includes('edit');
    const canView = (allowedActions['akses-menu'] ?? []).includes('view');

    const handleSave = () => {
        if (!activeRoleId) {
            return;
        }

        router.put(
            '/admin/akses-menu',
            {
                role_id: activeRoleId,
                access: roleAccess[activeRoleId] ?? {},
            },
            { preserveScroll: true }
        );
    };

    const handleReset = () => {
        if (!activeRoleId) {
            return;
        }

        setRoleAccess((prev) => ({
            ...prev,
            [activeRoleId]: initialRoleAccess[activeRoleId] ?? {},
        }));
    };

    useEffect(() => {
        setActiveRoleId(roles[0]?.id ?? '');
    }, [roles]);

    useEffect(() => {
        setRoleAccess(initialRoleAccess);
    }, [initialRoleAccess]);

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
                    {canEdit && (
                        <button
                            type="button"
                            onClick={handleSave}
                            className="shrink-0 rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                        >
                            Simpan Akses
                        </button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.4fr]">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">
                                Role Administrator
                            </p>
                            {canView && (
                                <Link
                                    href="/admin/roles"
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-4 sm:py-1.5 sm:text-xs"
                                >
                                    Kelola Role
                                </Link>
                            )}
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
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-3 sm:py-1 sm:text-xs"
                                >
                                    Reset
                                </button>
                            )}
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
                                                                disabled={!canEdit}
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
                                                                        disabled={!canEdit}
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
