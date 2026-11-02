<?php

use App\Models\ClassGroup;
use App\Models\Package;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function (): void {
    $role = Role::create(['name' => 'administrator', 'label' => 'Administrator', 'guard_name' => PermissionCatalog::GUARD]);
    $user = User::factory()->create();
    $user->assignRole($role);
    $this->actingAs($user, PermissionCatalog::GUARD);
    $this->program = Program::create(['name' => 'Privat', 'level' => 'SD', 'is_active' => true]);
    $this->payload = ['program_id' => $this->program->id, 'level' => 'SD', 'price' => 400000, 'mode' => 'offline', 'intensity' => '2x / minggu'];
});

it('derives monthly meetings from every weekly selection and ignores manually submitted sessions', function (int $frequency): void {
    $this->post(route('admin.packages.store'), [...$this->payload, 'intensity' => "{$frequency}x / minggu", 'sessions' => 99])
        ->assertSessionHasNoErrors()->assertRedirect();
    $this->assertDatabaseHas('packages', ['program_id' => $this->program->id, 'sessions' => $frequency * 4, 'intensity' => "{$frequency}x / minggu", 'duration' => ($frequency * 4).' pertemuan / bulan']);
})->with(range(1, 6));

it('rejects missing or unsupported weekly selections', function (mixed $intensity): void {
    $this->post(route('admin.packages.store'), [...$this->payload, 'intensity' => $intensity, 'sessions' => 8])
        ->assertSessionHasErrors('intensity');
    expect(Package::query()->count())->toBe(0);
})->with([null, '', '0x / minggu', '7x / minggu', 'setiap hari', [['2x / minggu']]]);

it('updates legacy pricing through the selected frequency without changing it before saving', function (): void {
    $package = Package::create([...$this->payload, 'name' => 'Paket Lama', 'slug' => 'paket-lama', 'sessions' => 10, 'intensity' => 'fleksibel']);
    $this->get(route('admin.programs'))->assertSuccessful();
    expect($package->fresh()->sessions)->toBe(10);
    $this->put(route('admin.packages.update', $package), [...$this->payload, 'intensity' => '3x / minggu'])
        ->assertSessionHasNoErrors()->assertRedirect();
    expect($package->fresh()->sessions)->toBe(12)->and($package->fresh()->name)->toBe('Privat - SD - 12 Pertemuan');
});

it('checks duplicates against the calculated monthly meetings', function (): void {
    $this->post(route('admin.packages.store'), $this->payload)->assertSessionHasNoErrors();
    $package = Package::query()->firstOrFail();
    $this->put(route('admin.packages.update', $package), $this->payload)->assertSessionHasNoErrors();
    $this->post(route('admin.packages.store'), [...$this->payload, 'sessions' => 24])->assertSessionHasErrors('sessions');
    expect(Package::query()->count())->toBe(1);
});

it('preserves a price option referenced by a student without a registration', function (): void {
    $package = Package::create([...$this->payload, 'name' => 'Pilihan Aktif', 'slug' => 'pilihan-aktif', 'sessions' => 8]);
    Student::create(['name' => 'Murid', 'parent_contact' => '081234567890', 'package_id' => $package->id]);
    $this->delete(route('admin.packages.destroy', $package))->assertSessionHas('error');
    $this->assertDatabaseHas('packages', ['id' => $package->id]);
});

it('preserves programs and pricing used by an academic class', function (): void {
    $package = Package::create([...$this->payload, 'name' => 'Pilihan Kelas', 'slug' => 'pilihan-kelas', 'sessions' => 8]);
    $class = ClassGroup::create(['program_id' => $this->program->id, 'package_id' => $package->id, 'name' => 'Kelas Aman', 'is_active' => true]);
    $this->delete(route('admin.packages.destroy', $package))->assertSessionHas('error');
    $this->assertDatabaseHas('packages', ['id' => $package->id]);
    $class->update(['package_id' => null]);
    $package->delete();
    $this->delete(route('admin.programs.destroy', $this->program))->assertSessionHas('error');
    $this->assertDatabaseHas('class_groups', ['id' => $class->id]);
    $this->assertDatabaseHas('programs', ['id' => $this->program->id]);
});

it('allows deletion of unused price options and programs', function (): void {
    $package = Package::create([...$this->payload, 'name' => 'Pilihan Kosong', 'slug' => 'pilihan-kosong', 'sessions' => 8]);
    $this->delete(route('admin.packages.destroy', $package))->assertSessionHas('success');
    $this->assertDatabaseMissing('packages', ['id' => $package->id]);
    $this->delete(route('admin.programs.destroy', $this->program))->assertSessionHas('success');
    $this->assertDatabaseMissing('programs', ['id' => $this->program->id]);
});
