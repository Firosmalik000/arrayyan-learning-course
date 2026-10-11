<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Package;
use App\Models\Program;
use App\Models\Role;
use App\Models\StudentRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Database\Seeders\ProgramPricingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramPackageTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_manage_a_program_price_option(): void
    {
        $admin = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Privat',
            'level' => 'TK - SMA',
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin, PermissionCatalog::GUARD)->post(route('admin.packages.store'), [
            'program_id' => $program->id,
            'level' => 'SD',
            'sessions' => 8,
            'intensity' => '2x / minggu',
            'price' => 400000,
            'max_participants' => 1,
            'mode' => 'offline',
            'sort_order' => 1,
            'is_active' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('packages', [
            'program_id' => $program->id,
            'level' => 'SD',
            'sessions' => 8,
            'price' => 400000,
            'max_participants' => 1,
        ]);
    }

    public function test_public_pages_expose_active_program_price_options(): void
    {
        $program = Program::create([
            'name' => 'Reguler',
            'slug' => 'reguler',
            'level' => 'TK - SMA',
            'mode' => 'offline',
            'is_active' => true,
        ]);
        Package::create([
            'program_id' => $program->id,
            'name' => 'Reguler SD - 8 Pertemuan',
            'slug' => 'reguler-sd-8-pertemuan',
            'level' => 'SD',
            'sessions' => 8,
            'price' => 150000,
            'max_participants' => 5,
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $this->get(route('programs.detail', $program->slug))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->where('program.packages.0.level', 'SD')
                ->where('program.packages.0.price', '150000.00')
                ->where('program.price', '150000.00'));

        $this->get(route('register'))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->where('programs.0.packages.0.sessions', 8)
                ->where('programs.0.packages.0.max_participants', 5));
    }

    public function test_duplicate_program_level_and_session_option_is_rejected(): void
    {
        $admin = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Privat', 'level' => 'SD', 'mode' => 'offline', 'is_active' => true]);
        Package::create([
            'program_id' => $program->id,
            'name' => 'Privat SD - 8 Pertemuan',
            'slug' => 'privat-sd-8-pertemuan',
            'level' => 'SD',
            'sessions' => 8,
            'price' => 400000,
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $this->actingAs($admin, PermissionCatalog::GUARD)->post(route('admin.packages.store'), [
            'program_id' => $program->id,
            'level' => 'SD',
            'sessions' => 8,
            'price' => 450000,
            'mode' => 'offline',
            'is_active' => 1,
        ])->assertSessionHasErrors('sessions');

        $this->assertSame(1, Package::query()->count());
    }

    public function test_selected_price_option_is_stored_and_used_for_the_invoice(): void
    {
        $admin = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Privat',
            'level' => 'SD',
            'mode' => 'offline',
            'price' => 100000,
            'is_active' => true,
        ]);
        $package = Package::create([
            'program_id' => $program->id,
            'name' => 'Privat SD - 12 Pertemuan',
            'slug' => 'privat-sd-12-pertemuan',
            'level' => 'SD',
            'sessions' => 12,
            'intensity' => '3x / minggu',
            'price' => 500000,
            'max_participants' => 1,
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $this->post(route('registrations.student'), $this->registrationPayload($program, $package))
            ->assertSessionHasNoErrors();

        $registration = StudentRegistration::query()->where('student_name', 'Anak Paket')->firstOrFail();
        $this->assertSame($package->id, $registration->package_id);
        $this->assertStringContainsString('SD', $registration->package);
        $this->assertStringContainsString('12 pertemuan/bulan', $registration->package);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.registrations.student.approve', $registration))
            ->assertSessionHasNoErrors();

        $invoice = Invoice::query()->where('student_registration_id', $registration->id)->firstOrFail();
        $this->assertSame($package->id, $invoice->package_id);
        $this->assertSame('500000.00', $invoice->amount);
    }

    public function test_price_option_from_another_program_is_rejected(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SD', 'mode' => 'offline', 'is_active' => true]);
        $otherProgram = Program::create(['name' => 'Privat', 'level' => 'SD', 'mode' => 'offline', 'is_active' => true]);
        $package = Package::create([
            'program_id' => $otherProgram->id,
            'name' => 'Privat SD',
            'slug' => 'privat-sd',
            'level' => 'SD',
            'sessions' => 8,
            'price' => 400000,
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $this->post(route('registrations.student'), $this->registrationPayload($program, $package))
            ->assertSessionHasErrors('package_id');
    }

    public function test_program_pricing_seeder_is_idempotent_and_matches_client_prices(): void
    {
        $this->seed(ProgramPricingSeeder::class);
        $this->seed(ProgramPricingSeeder::class);

        $this->assertSame(28, Package::query()->count());
        $this->assertDatabaseHas('packages', [
            'level' => 'TK',
            'sessions' => 8,
            'price' => 100000,
            'max_participants' => 5,
        ]);
        $this->assertDatabaseHas('packages', [
            'level' => 'SMA',
            'sessions' => 24,
            'intensity' => '6x / minggu',
            'price' => 1000000,
            'max_participants' => 1,
        ]);
    }

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

    private function registrationPayload(Program $program, Package $package): array
    {
        return [
            'student_name' => 'Anak Paket',
            'address' => 'Jl. Belajar',
            'school_name' => 'SD Harapan',
            'level' => 'Kelas 5 SD',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package_id' => $package->id,
            'package' => $package->name,
            'parent_contact' => '081234567890',
            'parent_email' => 'package.parent@example.com',
            'preferred_mode' => 'offline',
        ];
    }
}
