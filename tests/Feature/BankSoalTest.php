<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\PageContent;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BankSoalTest extends TestCase
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

    public function test_store_bank_soal(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post('/admin/bank-soal', [
            'name' => 'Matematika SD',
            'category' => 'Matematika',
            'level' => 'SD',
            'format' => 'Online',
            'questions' => 50,
            'slug' => 'matematika-sd',
            'description' => 'Soal latihan matematika',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('bank_soals', ['slug' => 'matematika-sd']);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post('/admin/bank-soal', []);

        $response->assertSessionHasErrors(['name', 'category', 'level', 'format']);
    }

    public function test_update_bank_soal(): void
    {
        $user = $this->actingAsAdmin();
        $bankSoal = BankSoal::factory()->create();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->put("/admin/bank-soal/{$bankSoal->id}", [
            'name' => 'Updated Name',
            'category' => 'IPA',
            'level' => 'SMP',
            'format' => 'Offline',
            'questions' => 100,
            'slug' => 'updated-name',
            'description' => 'Updated desc',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('bank_soals', ['id' => $bankSoal->id, 'slug' => 'updated-name']);
    }

    public function test_delete_bank_soal(): void
    {
        $user = $this->actingAsAdmin();
        $bankSoal = BankSoal::factory()->create();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->delete("/admin/bank-soal/{$bankSoal->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('bank_soals', ['id' => $bankSoal->id]);
    }

    public function test_public_page_shows_only_active_items(): void
    {
        PageContent::create([
            'slug' => 'bank-soal',
            'content' => [
                'bankSoalPageContent' => [
                    'id' => [
                        'title' => 'Bank Soal Publik',
                        'formatAll' => 'Semua Format',
                    ],
                ],
            ],
        ]);

        BankSoal::factory()->create(['name' => ['id' => 'Active', 'en' => 'Active'], 'is_active' => true]);
        BankSoal::factory()->create(['name' => ['id' => 'Inactive', 'en' => 'Inactive'], 'slug' => 'inactive', 'is_active' => false]);

        $response = $this->get('/bank-soal');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/BankSoal', false)
            ->has('bankSoalItems', 1)
            ->where('landingContent.bankSoalPageContent.id.title', 'Bank Soal Publik')
            ->where('landingContent.bankSoalPageContent.id.formatAll', 'Semua Format')
        );
    }

    public function test_admin_bank_soal_routes_require_auth(): void
    {
        $this->post('/admin/bank-soal', [])->assertRedirect('/login');
        $this->put('/admin/bank-soal/1', [])->assertRedirect('/login');
        $this->delete('/admin/bank-soal/1')->assertRedirect('/login');
    }
}
