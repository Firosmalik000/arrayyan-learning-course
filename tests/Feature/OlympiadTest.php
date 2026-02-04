<?php

namespace Tests\Feature;

use App\Models\Olympiad;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OlympiadTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): User
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $user = User::factory()->create();
        $user->assignRole('administrator');

        return $user;
    }

    public function test_store_olympiad(): void
    {
        $user = $this->actingAsAdmin();

        $payload = [
            'name' => 'Olimpiade Matematika',
            'level' => 'SMP',
            'schedule' => '2026-03-01',
            'selection_system' => 'Babak Penyisihan',
            'category' => 'free',
            'fee' => 0,
            'notes' => 'Catatan test',
            'is_active' => true,
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post('/admin/olimpiade', $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('olympiads', ['name' => 'Olimpiade Matematika', 'level' => 'SMP']);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post('/admin/olimpiade', []);

        $response->assertSessionHasErrors(['name', 'level', 'category']);
    }

    public function test_update_olympiad(): void
    {
        $user = $this->actingAsAdmin();
        $olympiad = Olympiad::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->put("/admin/olimpiade/{$olympiad->id}", [
            'name' => 'New Name',
            'level' => 'SMA',
            'category' => 'paid',
            'fee' => 150000,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('olympiads', ['id' => $olympiad->id, 'name' => 'New Name', 'level' => 'SMA']);
    }

    public function test_delete_olympiad(): void
    {
        $user = $this->actingAsAdmin();
        $olympiad = Olympiad::factory()->create();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->delete("/admin/olimpiade/{$olympiad->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('olympiads', ['id' => $olympiad->id]);
    }

    public function test_public_page_shows_only_active_olympiads(): void
    {
        Olympiad::factory()->create(['name' => 'Active One', 'is_active' => true]);
        Olympiad::factory()->create(['name' => 'Inactive One', 'is_active' => false]);

        $response = $this->get('/olimpiade');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Olympiad', false)
            ->has('olympiads', 1)
            ->where('olympiads.0.name', 'Active One')
        );
    }

    public function test_admin_olympiad_routes_require_auth(): void
    {
        $this->post('/admin/olimpiade', [])->assertRedirect('/login');
        $this->put('/admin/olimpiade/1', [])->assertRedirect('/login');
        $this->delete('/admin/olimpiade/1')->assertRedirect('/login');
    }
}
