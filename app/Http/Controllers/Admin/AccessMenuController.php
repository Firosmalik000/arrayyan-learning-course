<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAccessMenuRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Support\PermissionCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class AccessMenuController extends Controller
{
    public function index(): Response
    {
        $permissionNames = PermissionCatalog::permissionNames();
        $totalPermissions = count($permissionNames);

        $roles = Role::query()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->with(['permissions'])
            ->withCount('users')
            ->orderBy('id')
            ->get();

        $roleAccess = [];

        $rolesPayload = $roles->map(function (Role $role) use ($totalPermissions, &$roleAccess) {
            $permissionList = $role->permissions->pluck('name')->values()->all();
            $roleAccess[$role->id] = $this->mapRoleAccess($permissionList);

            $hasPermissions = count($permissionList) > 0;
            $isFullAccess = $hasPermissions && count($permissionList) === $totalPermissions;

            return [
                'id' => $role->id,
                'key' => $role->name,
                'name' => $role->label ?: Str::title(str_replace('-', ' ', $role->name)),
                'description' => $role->description ?: 'Kelola hak akses untuk role ini.',
                'group' => $role->group ?: 'Custom',
                'users' => $role->users_count,
                'tag' => $isFullAccess ? 'Full Access' : ($hasPermissions ? 'Custom' : 'No Access'),
                'tone' => $isFullAccess ? 'violet' : ($hasPermissions ? 'amber' : 'rose'),
            ];
        })->values()->all();

        return Inertia::render('Admin/AccessMenu', [
            'roles' => $rolesPayload,
            'permissions' => PermissionCatalog::actions(),
            'menuSections' => PermissionCatalog::menuSections(),
            'roleAccess' => $roleAccess,
        ]);
    }

    public function update(UpdateAccessMenuRequest $request): RedirectResponse
    {
        $role = Role::query()
            ->where('guard_name', PermissionCatalog::GUARD)
            ->findOrFail($request->integer('role_id'));

        $access = $request->input('access', []);
        $menuIds = collect(PermissionCatalog::MENUS)->pluck('id')->all();
        $actions = PermissionCatalog::ACTIONS;
        $permissionNames = [];

        foreach ($access as $menuId => $menuActions) {
            if (! in_array($menuId, $menuIds, true)) {
                continue;
            }

            foreach ((array) $menuActions as $action) {
                if (! in_array($action, $actions, true)) {
                    continue;
                }

                $permissionNames[] = PermissionCatalog::buildPermissionName($menuId, $action);
            }
        }

        $permissionNames = array_values(array_unique($permissionNames));
        $permissions = collect($permissionNames)
            ->map(fn (string $name) => Permission::findOrCreate($name, PermissionCatalog::GUARD));

        $role->syncPermissions($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return back()->with('success', 'Akses role berhasil disimpan.');
    }

    /**
     * @param  array<int, string>  $permissionNames
     * @return array<string, array<int, string>>
     */
    private function mapRoleAccess(array $permissionNames): array
    {
        $access = [];

        foreach ($permissionNames as $permissionName) {
            [$menuId, $action] = array_pad(explode('.', $permissionName, 2), 2, null);
            if (! $menuId || ! $action) {
                continue;
            }

            $access[$menuId] ??= [];
            $access[$menuId][] = $action;
        }

        foreach ($access as $menuId => $actions) {
            $access[$menuId] = array_values(array_unique($actions));
        }

        return $access;
    }
}
