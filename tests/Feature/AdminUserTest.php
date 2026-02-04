<?php

namespace Tests\Feature;

use App\Mail\InviteUserMail;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_page_displays_users_and_roles(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $user = User::factory()->create([
            'name' => 'Admin Utama',
            'email' => 'admin@example.com',
        ]);
        $user->assignRole($role);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.users'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users', false)
            ->has('users', 1)
            ->has('roles', 1)
            ->where('users.0.email', 'admin@example.com')
            ->where('users.0.primary_role', 'Administrator')
        );
    }

    public function test_admin_can_invite_user_and_email_is_sent(): void
    {
        Mail::fake();

        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $admin = User::factory()->create();
        $admin->assignRole($role);

        $payload = [
            'name' => 'Admin Baru',
            'email' => 'baru@example.com',
            'role_id' => $role->id,
        ];

        $response = $this->actingAs($admin, PermissionCatalog::GUARD)->post(route('admin.users.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'baru@example.com',
        ]);

        Mail::assertSent(InviteUserMail::class, function (InviteUserMail $mail) use ($payload) {
            return $mail->hasTo($payload['email']);
        });
    }

    public function test_admin_can_stop_impersonation(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $admin = User::factory()->create();
        $admin->assignRole($role);

        $target = User::factory()->create();
        $target->assignRole($role);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.users.impersonate', $target))
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($target, PermissionCatalog::GUARD);

        $this->post(route('admin.impersonate.stop'))
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($admin, PermissionCatalog::GUARD);
    }

    public function test_admin_can_switch_impersonation_while_impersonating(): void
    {
        $adminRole = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $teacherRole = Role::create([
            'name' => 'guru',
            'label' => 'Guru',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $admin = User::factory()->create();
        $admin->assignRole($adminRole);

        $first = User::factory()->create();
        $first->assignRole($teacherRole);

        $second = User::factory()->create();
        $second->assignRole($teacherRole);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.users.impersonate', $first))
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($first, PermissionCatalog::GUARD);

        $this->post(route('admin.users.impersonate', $second))
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($second, PermissionCatalog::GUARD);
        $this->assertSame($admin->id, session('impersonator_id'));
    }
}
