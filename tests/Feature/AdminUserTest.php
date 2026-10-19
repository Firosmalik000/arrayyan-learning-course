<?php

namespace Tests\Feature;

use App\Mail\InviteUserMail;
use App\Models\PortalAccount;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_admin_users_page_separates_admin_teacher_and_parent_accounts(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin Utama',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole($role);

        PortalAccount::create([
            'type' => PortalAccount::TYPE_TEACHER,
            'name' => 'Guru Portal',
            'email' => 'guru@example.com',
            'contact' => '081111111111',
            'password' => bcrypt('password'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        PortalAccount::create([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Orang Tua Portal',
            'email' => 'orangtua@example.com',
            'contact' => '082222222222',
            'password' => bcrypt('password'),
            'must_change_password' => true,
            'is_active' => false,
        ]);

        $response = $this->actingAs($admin, PermissionCatalog::GUARD)->get(route('admin.users'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('users', 1)
            ->where('users.0.email', 'admin@example.com')
            ->has('portalAccounts.teachers', 1)
            ->where('portalAccounts.teachers.0.email', 'guru@example.com')
            ->where('portalAccounts.teachers.0.portal', 'Portal Guru')
            ->has('portalAccounts.parents', 1)
            ->where('portalAccounts.parents.0.email', 'orangtua@example.com')
            ->where('portalAccounts.parents.0.portal', 'Portal Orang Tua')
            ->where('portalAccounts.parents.0.status', 'Nonaktif')
            ->where('stats.0.value', 3)
        );
    }

    public function test_administrator_can_reset_a_portal_account_password(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $admin = User::factory()->create();
        $admin->assignRole($role);
        $portalAccount = PortalAccount::create([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Orang Tua Portal',
            'email' => 'orangtua@example.com',
            'contact' => '081234567890',
            'password' => Hash::make('password-lama'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($admin, PermissionCatalog::GUARD)
            ->patch(route('admin.users.portal-accounts.password', $portalAccount), [
                'password' => 'password-baru',
                'password_confirmation' => 'password-baru',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $portalAccount->refresh();

        $this->assertTrue(Hash::check('password-baru', $portalAccount->password));
        $this->assertTrue($portalAccount->must_change_password);
        $this->assertNotNull($portalAccount->getRememberToken());
    }

    public function test_resetting_a_portal_account_password_requires_confirmation(): void
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $admin = User::factory()->create();
        $admin->assignRole($role);
        $portalAccount = PortalAccount::create([
            'type' => PortalAccount::TYPE_TEACHER,
            'name' => 'Guru Portal',
            'email' => 'guru@example.com',
            'contact' => '081234567891',
            'password' => Hash::make('password-lama'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($admin, PermissionCatalog::GUARD)
            ->from(route('admin.users'))
            ->patch(route('admin.users.portal-accounts.password', $portalAccount), [
                'password' => 'password-baru',
                'password_confirmation' => 'password-lain',
            ]);

        $response->assertRedirect(route('admin.users'));
        $response->assertSessionHasErrors('password');
        $this->assertTrue(Hash::check('password-lama', $portalAccount->fresh()->password));
    }

    public function test_user_without_edit_access_cannot_reset_a_portal_account_password(): void
    {
        $role = Role::create([
            'name' => 'viewer',
            'label' => 'Viewer',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $viewer = User::factory()->create();
        $viewer->assignRole($role);
        $portalAccount = PortalAccount::create([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Orang Tua Portal',
            'email' => 'orangtua@example.com',
            'contact' => '081234567890',
            'password' => Hash::make('password-lama'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this
            ->actingAs($viewer, PermissionCatalog::GUARD)
            ->patch(route('admin.users.portal-accounts.password', $portalAccount), [
                'password' => 'password-baru',
                'password_confirmation' => 'password-baru',
            ])
            ->assertForbidden();

        $this->assertTrue(Hash::check('password-lama', $portalAccount->fresh()->password));
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
