<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = PermissionCatalog::GUARD;
        $allPermissions = collect(PermissionCatalog::permissionNames())
            ->map(fn (string $name) => Permission::findOrCreate($name, $guard));

        $roleDefinitions = [
            'administrator' => [
                'label' => 'Administrator',
                'description' => 'Akses penuh ke seluruh modul dan pengaturan.',
                'group' => 'Manajemen',
                'access' => PermissionCatalog::permissionNames(),
            ],
            'admin-konten' => [
                'label' => 'Admin Konten',
                'description' => 'Kelola konten publik dan pendaftaran.',
                'group' => 'Konten',
                'access' => $this->buildAccessPermissions([
                    'dashboard' => ['view'],
                    'landing' => ['view', 'create', 'edit', 'delete', 'export', 'import'],
                    'program' => ['view', 'create', 'edit', 'delete'],
                    'bank-soal' => ['view', 'create', 'edit', 'delete', 'export', 'import'],
                    'olimpiade' => ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
                    'pendaftaran' => ['view', 'approve', 'reject', 'export'],
                    'pelajar' => ['view', 'create', 'edit', 'delete'],
                    'pengajar' => ['view', 'create', 'edit', 'delete'],
                ]),
            ],
            'editor' => [
                'label' => 'Editor',
                'description' => 'Edit copy dan jadwal konten.',
                'group' => 'Konten',
                'access' => $this->buildAccessPermissions([
                    'dashboard' => ['view'],
                    'landing' => ['view', 'edit'],
                    'program' => ['view'],
                    'bank-soal' => ['view', 'edit'],
                    'olimpiade' => ['view'],
                    'pendaftaran' => ['view'],
                    'pelajar' => ['view'],
                    'pengajar' => ['view'],
                ]),
            ],
        ];

        foreach ($roleDefinitions as $name => $definition) {
            $role = Role::updateOrCreate(
                ['name' => $name, 'guard_name' => $guard],
                [
                    'label' => $definition['label'],
                    'description' => $definition['description'],
                    'group' => $definition['group'],
                ]
            );

            $permissions = collect($definition['access'])
                ->map(fn (string $permissionName) => $allPermissions->firstWhere('name', $permissionName))
                ->filter();

            $role->syncPermissions($permissions);
        }

        $administrator = User::query()
            ->where('email', env('SUPER_ADMIN_EMAIL', 'superadmin@alclearning.id'))
            ->first();

        if ($administrator) {
            $administrator->syncRoles(['administrator']);
        }

        $adminContent = User::query()
            ->where('email', env('ADMIN_SEED_EMAIL', 'admin@alclearning.id'))
            ->first();

        if ($adminContent) {
            $adminContent->syncRoles(['admin-konten']);
        }
    }

    /**
     * @param  array<string, array<int, string>>  $accessMap
     * @return array<int, string>
     */
    private function buildAccessPermissions(array $accessMap): array
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
