<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_page_displays_roles(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.roles'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Roles', false)
            ->has('roles', 1)
            ->has('stats', 4)
        );
    }

    public function test_can_create_role(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.roles.store'), [
            'label' => 'Koordinator Akademik',
            'description' => 'Mengelola akademik.',
            'group' => 'Akademik',
            'access_type' => 'custom',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'name' => 'koordinator-akademik',
            'guard_name' => PermissionCatalog::GUARD,
            'label' => 'Koordinator Akademik',
            'group' => 'Akademik',
        ]);
    }

    public function test_can_update_role(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');
        $role = Role::create([
            'name' => 'editor-konten',
            'label' => 'Editor Konten',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->put(route('admin.roles.update', $role), [
            'label' => 'Editor Website',
            'description' => 'Mengelola konten website.',
            'group' => 'Konten',
            'access_type' => 'custom',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'editor-website',
            'label' => 'Editor Website',
            'group' => 'Konten',
        ]);
    }

    public function test_can_delete_role(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');
        $role = Role::create([
            'name' => 'reviewer',
            'label' => 'Reviewer',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->delete(route('admin.roles.destroy', $role));

        $response->assertRedirect();
        $this->assertDatabaseMissing('roles', [
            'id' => $role->id,
        ]);
    }
}
