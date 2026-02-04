<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_access_menu_page_displays_roles_and_permissions(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $permission = Permission::findOrCreate('dashboard.view', PermissionCatalog::GUARD);
        $role->givePermissionTo($permission);
        $user->assignRole($role);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.access-menu'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/AccessMenu', false)
            ->has('roles', 1)
            ->has('permissions')
            ->has('menuSections')
            ->has('roleAccess')
        );
    }

    public function test_access_menu_update_syncs_permissions(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole($role);

        $role = Role::create([
            'name' => 'editor',
            'label' => 'Editor',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $payload = [
            'role_id' => $role->id,
            'access' => [
                'dashboard' => ['view'],
                'landing' => ['view', 'edit'],
            ],
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->put(route('admin.access-menu.update'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('permissions', [
            'name' => 'dashboard.view',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $role->refresh();
        $this->assertTrue($role->hasPermissionTo('landing.edit', PermissionCatalog::GUARD));
    }
}
