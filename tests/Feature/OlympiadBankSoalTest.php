<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\OlympiadRegistration;
use App\Models\PageContent;
use App\Models\PortalAccount;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OlympiadBankSoalTest extends TestCase
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

    private function makeOlympiad(array $overrides = []): Olympiad
    {
        return Olympiad::create(array_merge([
            'name' => 'OSN Matematika',
            'slug' => 'osn-matematika',
            'level' => 'SMP',
            'schedule' => now()->addMonth()->toDateString(),
            'category' => 'free',
            'fee' => 0,
            'is_active' => true,
            'is_registration_open' => true,
        ], $overrides));
    }

    private function makeBankSoal(array $overrides = []): BankSoal
    {
        $resources = $overrides['links'] ?? [];
        unset($overrides['links'], $overrides['slug']);
        $bankSoal = BankSoal::factory()->create(array_merge(['is_active' => true], $overrides));
        foreach ($resources as $index => $resource) {
            $bankSoal->resources()->create([
                'label' => $resource['label'] ?? null,
                'destination_url' => $resource['link'] ?? null,
                'file_path' => $resource['file_path'] ?? null,
                'file_name' => $resource['file_name'] ?? null,
                'sort_order' => ($index + 1) * 10,
            ]);
        }

        return $bankSoal;
    }

    private function bankSoalRouteParameters(BankSoal $bankSoal): array
    {
        return [$bankSoal->educationClass->educationLevel, $bankSoal->educationClass, $bankSoal->subject, $bankSoal];
    }

    private function enableGlobalBankSoalPasskey(): void
    {
        PageContent::create([
            'slug' => 'bank-soal',
            'content' => ['bankSoalPasskey' => 'Rahasia123'],
        ]);
    }

    private function makePortalAccount(): PortalAccount
    {
        return PortalAccount::create([
            'type' => 'student',
            'name' => 'Murid Portal',
            'contact' => '081234567890',
            'password' => Hash::make('secret123'),
            'must_change_password' => false,
            'is_active' => true,
        ]);
    }

    // ── Olimpiade: pendaftaran publik ────────────────────────────

    public function test_olympiad_registration_stores_with_ticket(): void
    {
        $this->makeOlympiad();

        $response = $this->post(route('olympiad.register.store', 'osn-matematika'), [
            'name' => 'Peserta Satu',
            'school' => 'SMP 1',
            'level' => 'Kelas 8',
            'contact' => '081234567890',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('ticket');

        $ticket = session('ticket');
        $this->assertMatchesRegularExpression('/^OLS-\d{4}-\d{5}$/', $ticket);
        $this->assertDatabaseHas('olympiad_registrations', [
            'ticket_no' => $ticket,
            'name' => 'Peserta Satu',
            'fee_status' => 'free',
            'status' => 'pending',
        ]);
    }

    public function test_paid_olympiad_marks_fee_unpaid(): void
    {
        $this->makeOlympiad(['category' => 'paid', 'fee' => 50000]);

        $this->post(route('olympiad.register.store', 'osn-matematika'), [
            'name' => 'Peserta Bayar',
            'contact' => '081234567890',
        ]);

        $this->assertDatabaseHas('olympiad_registrations', [
            'name' => 'Peserta Bayar',
            'fee_status' => 'unpaid',
        ]);
    }

    public function test_olympiad_registration_blocked_when_full_or_closed(): void
    {
        $full = $this->makeOlympiad(['slug' => 'penuh', 'quota' => 1]);
        OlympiadRegistration::create([
            'olympiad_id' => $full->id,
            'ticket_no' => 'OLS-2026-00001',
            'name' => 'Sudah Ada',
            'contact' => '081111111111',
            'status' => 'pending',
        ]);

        $blocked = $this->post(route('olympiad.register.store', 'penuh'), [
            'name' => 'Telat',
            'contact' => '081234567890',
        ]);
        $blocked->assertSessionHas('error');

        $closed = $this->makeOlympiad(['slug' => 'tutup', 'is_registration_open' => false]);
        $closedResponse = $this->post(route('olympiad.register.store', 'tutup'), [
            'name' => 'Telat',
            'contact' => '081234567890',
        ]);
        $closedResponse->assertSessionHas('error');

        $past = $this->makeOlympiad([
            'slug' => 'lewat',
            'registration_deadline' => now()->subDay()->toDateString(),
        ]);
        $pastResponse = $this->post(route('olympiad.register.store', 'lewat'), [
            'name' => 'Telat',
            'contact' => '081234567890',
        ]);
        $pastResponse->assertSessionHas('error');

        $this->assertDatabaseMissing('olympiad_registrations', ['name' => 'Telat']);
    }

    // ── Olimpiade: admin ─────────────────────────────────────────

    public function test_admin_manages_olympiad_registrations(): void
    {
        $user = $this->actingAsAdmin();
        $olympiad = $this->makeOlympiad(['category' => 'paid', 'fee' => 75000]);
        $reg = OlympiadRegistration::create([
            'olympiad_id' => $olympiad->id,
            'ticket_no' => 'OLS-2026-00010',
            'name' => 'Peserta Admin',
            'contact' => '081234567890',
            'fee_status' => 'unpaid',
            'status' => 'pending',
        ]);
        $guard = PermissionCatalog::GUARD;

        $page = $this->actingAs($user, $guard)->get(route('admin.olympiad-registrations'));
        $page->assertSuccessful();
        $page->assertInertia(fn ($page) => $page
            ->component('Admin/OlympiadRegistrations', false)
            ->has('registrations.data', 1)
        );

        $this->actingAs($user, $guard)->post(route('admin.olympiad-registrations.fee-paid', $reg));
        $this->assertEquals('paid', $reg->fresh()->fee_status);

        $this->actingAs($user, $guard)->post(route('admin.olympiad-registrations.approve', $reg));
        $this->assertEquals('approved', $reg->fresh()->status);

        $second = $this->actingAs($user, $guard)->post(route('admin.olympiad-registrations.approve', $reg->fresh()));
        $second->assertSessionHas('error');
    }

    public function test_admin_rejects_with_note(): void
    {
        $user = $this->actingAsAdmin();
        $olympiad = $this->makeOlympiad();
        $reg = OlympiadRegistration::create([
            'olympiad_id' => $olympiad->id,
            'ticket_no' => 'OLS-2026-00011',
            'name' => 'Peserta Tolak',
            'contact' => '081234567890',
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.olympiad-registrations.reject', $reg),
            ['admin_note' => 'Berkas kurang.']
        );

        $this->assertDatabaseHas('olympiad_registrations', [
            'id' => $reg->id,
            'status' => 'rejected',
            'admin_note' => 'Berkas kurang.',
        ]);
    }

    public function test_winners_shown_and_certificate_matches(): void
    {
        $this->makeOlympiad(['winners' => ['Ahmad Juara', 'Siti Runner']]);

        $detail = $this->get(route('olympiad.detail', 'osn-matematika'));
        $detail->assertSuccessful();
        $detail->assertInertia(fn ($page) => $page
            ->where('olympiad.winners', ['Ahmad Juara', 'Siti Runner'])
        );

        $cert = $this->get(route('olympiad.certificate', ['slug' => 'osn-matematika', 'name' => 'ahmad juara']));
        $cert->assertSuccessful();
        $cert->assertInertia(fn ($page) => $page
            ->where('matched_name', 'Ahmad Juara')
        );

        $miss = $this->get(route('olympiad.certificate', ['slug' => 'osn-matematika', 'name' => 'Bukan Siapa']));
        $miss->assertSuccessful();
        $miss->assertInertia(fn ($page) => $page->where('matched_name', null));
    }

    // ── Bank soal: gate server ───────────────────────────────────

    public function test_guest_detail_hides_links_and_counts_views(): void
    {
        $this->enableGlobalBankSoalPasskey();
        $bankSoal = $this->makeBankSoal([
            'links' => [['id' => 11, 'label' => 'Modul A', 'link' => 'https://example.com/a.pdf']],
        ]);

        $response = $this->get(route('banksoal.detail', $this->bankSoalRouteParameters($bankSoal)));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->where('bankSoal.resources', [])
            ->where('bankSoal.unlocked', false)
            ->where('bankSoal.has_lock', true)
            ->where('bankSoal.passkey_verified', false)
            ->where('bankSoal.authenticated', false)
        );
        $this->assertEquals(1, BankSoal::query()->first()->view_count);
    }

    public function test_correct_global_passkey_requires_login_before_links_are_revealed(): void
    {
        $this->enableGlobalBankSoalPasskey();
        $bankSoal = $this->makeBankSoal([
            'links' => [['id' => 11, 'label' => 'Modul A', 'link' => 'https://example.com/a.pdf']],
        ]);

        $parameters = $this->bankSoalRouteParameters($bankSoal);
        $wrong = $this->post(route('banksoal.unlock', $parameters), ['passkey' => 'Salah']);
        $wrong->assertSessionHas('error');

        $right = $this->post(route('banksoal.unlock', $parameters), ['passkey' => 'Rahasia123']);
        $right->assertSessionHasNoErrors();
        $right->assertSessionHas('success');

        $detail = $this->get(route('banksoal.detail', $parameters));
        $detail->assertInertia(fn ($page) => $page
            ->where('bankSoal.unlocked', false)
            ->where('bankSoal.passkey_verified', true)
            ->where('bankSoal.authenticated', false)
            ->where('bankSoal.resources', [])
        );

        $this->actingAs($this->makePortalAccount(), 'portal')
            ->get(route('banksoal.detail', $parameters))
            ->assertInertia(fn ($page) => $page
                ->where('bankSoal.unlocked', true)
                ->has('bankSoal.resources', 1)
                ->where('bankSoal.resources.0.label', 'Modul A')
            );
    }

    public function test_download_requires_unlock_and_counts(): void
    {
        $this->enableGlobalBankSoalPasskey();
        $bankSoal = $this->makeBankSoal([
            'links' => [['id' => 11, 'label' => 'Modul A', 'link' => 'https://example.com/a.pdf']],
        ]);

        $parameters = $this->bankSoalRouteParameters($bankSoal);
        $resource = $bankSoal->resources()->firstOrFail();
        $downloadParameters = [...$parameters, $resource];
        $locked = $this->get(route('banksoal.download', $downloadParameters));
        $locked->assertRedirect(route('banksoal.detail', $parameters));

        $this->post(route('banksoal.unlock', $parameters), ['passkey' => 'Rahasia123']);

        $stillLocked = $this->get(route('banksoal.download', $downloadParameters));
        $stillLocked->assertRedirect(route('banksoal.detail', $parameters));

        $open = $this->actingAs($this->makePortalAccount(), 'portal')
            ->get(route('banksoal.download', $downloadParameters));
        $open->assertRedirect('https://example.com/a.pdf');
        $this->assertEquals(1, BankSoal::query()->first()->download_count);
    }

    public function test_portal_student_still_needs_the_global_passkey(): void
    {
        $this->enableGlobalBankSoalPasskey();
        $bankSoal = $this->makeBankSoal([
            'links' => [['id' => 11, 'label' => 'Modul A', 'link' => 'https://example.com/a.pdf']],
        ]);
        $account = $this->makePortalAccount();

        $response = $this->actingAs($account, 'portal')->get(route('banksoal.detail', $this->bankSoalRouteParameters($bankSoal)));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->where('bankSoal.unlocked', false)
            ->where('bankSoal.passkey_verified', false)
            ->where('bankSoal.authenticated', true)
            ->where('bankSoal.resources', [])
        );
    }
}
