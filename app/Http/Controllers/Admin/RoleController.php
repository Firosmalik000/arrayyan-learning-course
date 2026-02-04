<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Support\PermissionCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function index(): Response
    {
        $permissionCount = count(PermissionCatalog::permissionNames());

        $roles = Role::query()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->with(['permissions'])
            ->withCount('users')
            ->orderBy('id')
            ->get();

        $fullAccessCount = $roles->filter(function (Role $role) use ($permissionCount) {
            return $permissionCount > 0 && $role->permissions->count() === $permissionCount;
        })->count();

        $rolesPayload = $roles->map(function (Role $role) use ($permissionCount) {
            $hasPermissions = $role->permissions->count() > 0;
            $isFullAccess = $permissionCount > 0 && $role->permissions->count() === $permissionCount;

            return [
                'id' => $role->id,
                'key' => $role->name,
                'name' => $role->label ?: Str::title(str_replace('-', ' ', $role->name)),
                'label' => $role->label ?: Str::title(str_replace('-', ' ', $role->name)),
                'raw_name' => $role->name,
                'description' => $role->description ?: 'Kelola hak akses sesuai kebutuhan.',
                'group' => $role->group ?: 'Custom',
                'users' => $role->users_count,
                'tag' => $isFullAccess ? 'Full Access' : ($hasPermissions ? 'Custom' : 'No Access'),
                'tone' => $isFullAccess ? 'violet' : ($hasPermissions ? 'amber' : 'rose'),
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ];
        })->values()->all();

        $stats = [
            ['label' => 'Total Role', 'value' => $roles->count(), 'tone' => 'violet'],
            ['label' => 'Full Access', 'value' => $fullAccessCount, 'tone' => 'emerald'],
            ['label' => 'Custom Role', 'value' => max($roles->count() - $fullAccessCount, 0), 'tone' => 'amber'],
            ['label' => 'Role Aktif', 'value' => $roles->count(), 'tone' => 'rose'],
        ];

        $groups = $roles->pluck('group')->filter()->unique()->values()->all();
        if (count($groups) === 0) {
            $groups = ['Manajemen', 'Konten', 'Akademik', 'Custom'];
        }

        $accessTypes = [
            ['value' => 'full', 'label' => 'Full Access'],
            ['value' => 'content', 'label' => 'Content'],
            ['value' => 'limited', 'label' => 'Limited'],
            ['value' => 'custom', 'label' => 'Custom'],
        ];

        return Inertia::render('Admin/Roles', [
            'stats' => $stats,
            'roles' => $rolesPayload,
            'groups' => $groups,
            'accessTypes' => $accessTypes,
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create([
            'name' => $request->string('name')->value(),
            'label' => $request->string('label')->value(),
            'description' => $request->filled('description')
                ? $request->string('description')->value()
                : null,
            'group' => $request->filled('group')
                ? $request->string('group')->value()
                : null,
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $accessType = $request->string('access_type')->value();
        $permissionNames = $this->permissionsForAccessType($accessType);
        if (count($permissionNames) > 0) {
            $permissions = collect($permissionNames)
                ->map(fn (string $name) => Permission::findOrCreate($name, PermissionCatalog::GUARD));

            $role->syncPermissions($permissions);
            app(PermissionRegistrar::class)->forgetCachedPermissions();
        }

        return back()->with('success', 'Role berhasil dibuat.');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if ($role->name === 'administrator') {
            return back()->with('success', 'Role administrator tidak bisa diubah.');
        }

        $role->update([
            'name' => $request->string('name')->value(),
            'label' => $request->string('label')->value(),
            'description' => $request->filled('description')
                ? $request->string('description')->value()
                : null,
            'group' => $request->filled('group')
                ? $request->string('group')->value()
                : null,
        ]);

        $accessType = $request->string('access_type')->value();
        if (in_array($accessType, ['full', 'content', 'limited'], true)) {
            $permissionNames = $this->permissionsForAccessType($accessType);
            $permissions = collect($permissionNames)
                ->map(fn (string $name) => Permission::findOrCreate($name, PermissionCatalog::GUARD));

            $role->syncPermissions($permissions);
            app(PermissionRegistrar::class)->forgetCachedPermissions();
        }

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'administrator') {
            return back()->with('success', 'Role administrator tidak bisa dihapus.');
        }

        if ($role->users()->exists()) {
            return back()->with('success', 'Role masih digunakan oleh user.');
        }

        $role->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return back()->with('success', 'Role berhasil dihapus.');
    }

    /**
     * @return array<int, string>
     */
    private function permissionsForAccessType(string $accessType): array
    {
        return match ($accessType) {
            'full' => PermissionCatalog::permissionNames(),
            'content' => $this->buildPermissions([
                'dashboard' => ['view'],
                'landing' => ['view', 'create', 'edit', 'delete', 'export', 'import'],
                'program' => ['view', 'create', 'edit', 'delete'],
                'bank-soal' => ['view', 'create', 'edit', 'delete', 'export', 'import'],
                'olimpiade' => ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
                'pendaftaran' => ['view', 'approve', 'reject', 'export'],
                'pelajar' => ['view', 'create', 'edit', 'delete'],
                'pengajar' => ['view', 'create', 'edit', 'delete'],
            ]),
            'limited' => $this->buildPermissions([
                'dashboard' => ['view'],
                'landing' => ['view', 'edit'],
                'program' => ['view'],
                'bank-soal' => ['view', 'edit'],
                'olimpiade' => ['view'],
                'pendaftaran' => ['view'],
                'pelajar' => ['view'],
                'pengajar' => ['view'],
            ]),
            default => [],
        };
    }

    /**
     * @param  array<string, array<int, string>>  $accessMap
     * @return array<int, string>
     */
    private function buildPermissions(array $accessMap): array
    {
        $permissions = [];
        $menuIds = collect(PermissionCatalog::MENUS)->pluck('id')->all();
        $actions = PermissionCatalog::ACTIONS;

        foreach ($accessMap as $menuId => $menuActions) {
            if (! in_array($menuId, $menuIds, true)) {
                continue;
            }

            foreach ($menuActions as $action) {
                if (! in_array($action, $actions, true)) {
                    continue;
                }

                $permissions[] = PermissionCatalog::buildPermissionName($menuId, $action);
            }
        }

        return array_values(array_unique($permissions));
    }
}
