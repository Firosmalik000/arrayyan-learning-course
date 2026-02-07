<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BankSoalManagementTest extends TestCase
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

    public function test_store_bank_soal_with_links(): void
    {
        $user = $this->actingAsAdmin();

        $payload = [
            'name' => 'Matematika SD - Paket 1',
            'category' => 'Matematika',
            'level' => 'SD',
            'format' => 'Online',
            'questions' => 120,
            'description' => 'Latihan soal matematika SD.',
            'links' => [
                ['id' => 1, 'label' => 'Kelas 1', 'link' => 'https://example.com/kelas-1'],
                ['id' => 2, 'label' => 'Kelas 2', 'link' => 'https://example.com/kelas-2'],
            ],
            'is_active' => 1,
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post('/admin/bank-soal', $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('bank_soals', ['slug' => 'matematika-sd-paket-1']);

        $bankSoal = BankSoal::where('slug', 'matematika-sd-paket-1')->first();
        $this->assertNotNull($bankSoal);
        $this->assertCount(2, $bankSoal->links);
        $this->assertSame('Kelas 1', $bankSoal->links[0]['label']);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post('/admin/bank-soal', []);

        $response->assertSessionHasErrors(['name', 'category', 'level', 'format']);
    }

    public function test_update_bank_soal_links(): void
    {
        $user = $this->actingAsAdmin();
        $bankSoal = BankSoal::create([
            'slug' => 'modul-lama',
            'name' => ['id' => 'Modul Lama', 'en' => 'Modul Lama'],
            'category' => ['id' => 'Matematika', 'en' => 'Matematika'],
            'level' => ['id' => 'SD', 'en' => 'SD'],
            'format' => 'Online',
            'questions' => 50,
            'description' => ['id' => '', 'en' => ''],
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->put("/admin/bank-soal/{$bankSoal->id}", [
                'name' => 'Modul Baru',
                'category' => 'Matematika',
                'level' => 'SMP',
                'format' => 'Offline',
                'questions' => 60,
                'links' => [
                    ['id' => 1, 'label' => 'Kelas 7', 'link' => 'https://example.com/kelas-7'],
                ],
                'is_active' => 0,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $bankSoal->refresh();
        $this->assertSame('modul-baru', $bankSoal->slug);
        $this->assertFalse($bankSoal->is_active);
        $this->assertCount(1, $bankSoal->links);
    }

    public function test_delete_bank_soal(): void
    {
        $user = $this->actingAsAdmin();
        $bankSoal = BankSoal::create([
            'slug' => 'modul-hapus',
            'name' => ['id' => 'Modul Hapus', 'en' => 'Modul Hapus'],
            'category' => ['id' => 'Matematika', 'en' => 'Matematika'],
            'level' => ['id' => 'SD', 'en' => 'SD'],
            'format' => 'Online',
            'questions' => 20,
            'description' => ['id' => '', 'en' => ''],
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->delete("/admin/bank-soal/{$bankSoal->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('bank_soals', ['id' => $bankSoal->id]);
    }

    public function test_admin_bank_soal_routes_require_auth(): void
    {
        $this->post('/admin/bank-soal', [])->assertRedirect('/login');
        $this->put('/admin/bank-soal/1', [])->assertRedirect('/login');
        $this->delete('/admin/bank-soal/1')->assertRedirect('/login');
    }
}
