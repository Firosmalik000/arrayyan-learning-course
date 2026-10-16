<?php

namespace Tests\Feature;

use App\Models\PageContent;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BankSoalGlobalPasskeyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('administrator');
    }

    public function test_admin_can_manage_the_global_passkey_from_bank_soal(): void
    {
        PageContent::create([
            'slug' => 'bank-soal',
            'content' => [
                'bankSoalPasskey' => 'PASSKEY-LAMA',
                'bankSoalContent' => ['id' => ['title' => 'Bank Soal']],
            ],
        ]);

        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->get('/admin/bank-soal')
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/BankSoal', false)
                ->where('globalPasskey', 'PASSKEY-LAMA')
            );

        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->put('/admin/bank-soal/passkey', ['passkey' => 'PASSKEY-BARU'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $content = PageContent::query()->where('slug', 'bank-soal')->firstOrFail()->content;

        $this->assertSame('PASSKEY-BARU', $content['bankSoalPasskey']);
        $this->assertSame('Bank Soal', $content['bankSoalContent']['id']['title']);

        $this->get('/bank-soal')
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Public/BankSoal', false)
                ->where('landingContent.bankSoalPasskey', 'PASSKEY-BARU')
            );
    }

    public function test_admin_can_disable_the_global_passkey(): void
    {
        PageContent::create([
            'slug' => 'bank-soal',
            'content' => ['bankSoalPasskey' => 'PASSKEY-LAMA'],
        ]);

        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->put('/admin/bank-soal/passkey', ['passkey' => ''])
            ->assertRedirect()
            ->assertSessionHas('success');

        $content = PageContent::query()->where('slug', 'bank-soal')->firstOrFail()->content;

        $this->assertSame('', $content['bankSoalPasskey']);
    }

    public function test_global_passkey_is_validated(): void
    {
        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->put('/admin/bank-soal/passkey', ['passkey' => str_repeat('a', 101)])
            ->assertSessionHasErrors('passkey');
    }

    public function test_landing_update_cannot_overwrite_the_global_passkey(): void
    {
        PageContent::create([
            'slug' => 'bank-soal',
            'content' => [
                'bankSoalPasskey' => 'PASSKEY-AKTIF',
                'bankSoalContent' => ['id' => ['title' => 'Judul Lama']],
            ],
        ]);

        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->put('/admin/landing', [
                'content' => [
                    'bankSoalPasskey' => 'PASSKEY-DARI-FORM-LAMA',
                    'bankSoalContent' => ['id' => ['title' => 'Judul Baru']],
                ],
            ])
            ->assertRedirect();

        $content = PageContent::query()->where('slug', 'bank-soal')->firstOrFail()->content;

        $this->assertSame('PASSKEY-AKTIF', $content['bankSoalPasskey']);
        $this->assertSame('Judul Baru', $content['bankSoalContent']['id']['title']);
    }

    public function test_global_passkey_route_requires_admin_authentication(): void
    {
        $this->put('/admin/bank-soal/passkey', ['passkey' => 'RAHASIA'])
            ->assertRedirect('/login');
    }
}
