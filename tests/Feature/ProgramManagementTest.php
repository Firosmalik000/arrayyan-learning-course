<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProgramManagementTest extends TestCase
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

    public function test_store_program(): void
    {
        $user = $this->actingAsAdmin();
        Storage::fake('public');

        $payload = [
            'name' => 'Program Reguler',
            'level' => 'SD',
            'description' => 'Program belajar reguler untuk SD.',
            'subjects' => ['Matematika', 'IPA'],
            'mode' => 'online',
            'image' => UploadedFile::fake()->image('program.jpg'),
            'is_active' => 1,
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post('/admin/program', $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('programs', [
            'name' => 'Program Reguler',
            'level' => 'SD',
            'mode' => 'online',
        ]);

        $program = Program::where('name', 'Program Reguler')->first();
        $this->assertNotNull($program?->image_path);
        Storage::disk('public')->assertExists($program->image_path);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post('/admin/program', []);

        $response->assertSessionHasErrors(['name', 'level', 'mode']);
    }

    public function test_update_program(): void
    {
        $user = $this->actingAsAdmin();
        Storage::fake('public');
        $program = Program::create([
            'name' => 'Program Lama',
            'level' => 'SMP',
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post("/admin/program/{$program->id}", [
                '_method' => 'put',
                'name' => 'Program Baru',
                'level' => 'SMA',
                'mode' => 'online',
                'description' => 'Update deskripsi.',
                'subjects' => ['Matematika'],
                'image' => UploadedFile::fake()->image('new-program.jpg'),
                'is_active' => 0,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('programs', [
            'id' => $program->id,
            'name' => 'Program Baru',
            'level' => 'SMA',
            'mode' => 'online',
            'is_active' => false,
        ]);

        $program->refresh();
        $this->assertNotNull($program->image_path);
        Storage::disk('public')->assertExists($program->image_path);
    }

    public function test_delete_program(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Program Hapus',
            'level' => 'SD',
            'mode' => 'offline',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->delete("/admin/program/{$program->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('programs', ['id' => $program->id]);
    }

    public function test_admin_program_routes_require_auth(): void
    {
        $this->post('/admin/program', [])->assertRedirect('/login');
        $this->put('/admin/program/1', [])->assertRedirect('/login');
        $this->delete('/admin/program/1')->assertRedirect('/login');
    }
}
