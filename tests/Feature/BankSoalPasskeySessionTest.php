<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\PageContent;
use App\Models\PortalAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BankSoalPasskeySessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_passkey_remains_active_but_login_is_still_required_on_detail(): void
    {
        PageContent::create(['slug' => 'bank-soal', 'content' => ['bankSoalPasskey' => 'RAHASIA']]);
        $bankSoal = BankSoal::factory()->create();
        $bankSoal->resources()->create(['label' => 'Modul A', 'destination_url' => 'https://example.com/a.pdf']);
        $parameters = $this->routeParameters($bankSoal);

        $this->post('/bank-soal/unlock', ['passkey' => 'RAHASIA'])->assertRedirect()->assertSessionHasNoErrors();

        $this->get(route('banksoal.detail', $parameters))->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->where('bankSoal.unlocked', false)
                ->where('bankSoal.passkey_verified', true)
                ->where('bankSoal.authenticated', false)
                ->where('bankSoal.resources', []));

        $account = PortalAccount::create([
            'type' => 'student', 'name' => 'Murid Portal', 'contact' => '081234567890',
            'password' => Hash::make('secret123'), 'must_change_password' => false, 'is_active' => true,
        ]);

        $this->actingAs($account, 'portal')->get(route('banksoal.detail', $parameters))->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->where('bankSoal.unlocked', true)
                ->where('bankSoal.passkey_verified', true)
                ->where('bankSoal.authenticated', true)
                ->has('bankSoal.resources', 1));
    }

    public function test_incorrect_global_bank_soal_passkey_is_rejected(): void
    {
        PageContent::create(['slug' => 'bank-soal', 'content' => ['bankSoalPasskey' => 'RAHASIA']]);

        $this->post('/bank-soal/unlock', ['passkey' => 'SALAH'])->assertRedirect()->assertSessionHasErrors('passkey');
    }

    public function test_public_listing_only_exposes_hierarchy_not_resource_urls(): void
    {
        PageContent::create(['slug' => 'bank-soal', 'content' => ['bankSoalPasskey' => 'RAHASIA']]);
        $bankSoal = BankSoal::factory()->create();
        $bankSoal->resources()->create(['label' => 'Modul A', 'destination_url' => 'https://example.com/a.pdf']);

        $this->get(route('banksoal'))->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/BankSoal', false)
                ->where('stage', 'levels')
                ->missing('landingContent.bankSoalPasskey'));
    }

    /** @return array<int, mixed> */
    private function routeParameters(BankSoal $bankSoal): array
    {
        return [$bankSoal->educationClass->educationLevel, $bankSoal->educationClass, $bankSoal->subject, $bankSoal];
    }
}
