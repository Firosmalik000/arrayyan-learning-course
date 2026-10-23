<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\EducationClass;
use App\Models\EducationLevel;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BankSoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_update_and_delete_a_relational_bank_soal(): void
    {
        Storage::fake('public');
        [$level, $class, $subject] = $this->taxonomy();
        $admin = $this->admin();

        $this->actingAs($admin, PermissionCatalog::GUARD)->post('/admin/bank-soal', [
            'education_level_id' => $level->id,
            'education_class_id' => $class->id,
            'subject_id' => $subject->id,
            'name' => 'Matematika SD',
            'format' => 'PDF',
            'questions' => 50,
            'description' => 'Soal latihan matematika',
            'image' => UploadedFile::fake()->image('bank-soal.jpg'),
            'resources' => [['label' => 'Paket', 'destination_url' => 'https://example.com/paket']],
            'is_active' => true,
        ])->assertRedirect()->assertSessionHasNoErrors()->assertSessionHas('success');

        $bankSoal = BankSoal::query()->firstOrFail();
        $this->assertSame('Matematika SD', $bankSoal->name['id']);
        $this->assertSame($class->id, $bankSoal->education_class_id);
        $this->assertDatabaseCount('bank_soal_resources', 1);
        Storage::disk('public')->assertExists($bankSoal->image_path);

        $this->actingAs($admin, PermissionCatalog::GUARD)->put("/admin/bank-soal/{$bankSoal->id}", [
            'education_level_id' => $level->id,
            'education_class_id' => $class->id,
            'subject_id' => $subject->id,
            'name' => 'Matematika SD Baru',
            'format' => 'PDF',
            'questions' => 75,
            'description' => 'Diperbarui',
            'resources' => [['id' => $bankSoal->resources()->firstOrFail()->id, 'label' => 'Paket Baru', 'destination_url' => 'https://example.com/baru']],
            'is_active' => false,
        ])->assertRedirect()->assertSessionHasNoErrors()->assertSessionHas('success');

        $bankSoal->refresh();
        $this->assertSame('Matematika SD Baru', $bankSoal->name['id']);
        $this->assertFalse($bankSoal->is_active);

        $this->actingAs($admin, PermissionCatalog::GUARD)->delete("/admin/bank-soal/{$bankSoal->id}")
            ->assertRedirect()->assertSessionHas('success');
        $this->assertDatabaseMissing('bank_soals', ['id' => $bankSoal->id]);
    }

    public function test_store_validates_required_relational_fields(): void
    {
        $this->actingAs($this->admin(), PermissionCatalog::GUARD)->post('/admin/bank-soal', [])
            ->assertSessionHasErrors(['name', 'education_level_id', 'education_class_id', 'subject_id', 'format', 'resources']);
    }

    public function test_public_hierarchy_only_shows_active_ready_items(): void
    {
        [$level, $class, $subject] = $this->taxonomy();
        BankSoal::factory()->create(['education_class_id' => $class->id, 'subject_id' => $subject->id, 'is_active' => true]);
        BankSoal::factory()->create(['education_class_id' => $class->id, 'subject_id' => $subject->id, 'is_active' => false]);
        BankSoal::factory()->create(['education_class_id' => null, 'subject_id' => $subject->id, 'classification_status' => 'needs_review']);

        $this->get('/bank-soal')->assertSuccessful()->assertInertia(fn ($page) => $page
            ->component('Public/BankSoal', false)
            ->where('stage', 'levels')
            ->has('items', 4)
            ->where('items.1.name', 'SD / MI')
            ->where('items.1.count', 1));
        $this->get("/bank-soal/{$level->id}")->assertSuccessful()->assertInertia(fn ($page) => $page
            ->where('stage', 'classes')
            ->where('items.0.name', 'Kelas 1')
            ->where('items.0.count', 1));
        $this->get("/bank-soal/{$level->id}/{$class->id}/{$subject->id}")->assertSuccessful()
            ->assertInertia(fn ($page) => $page->where('stage', 'bankSoals')->has('items', 1));
    }

    private function admin(): User
    {
        $role = Role::query()->firstOrCreate(['name' => 'administrator', 'guard_name' => PermissionCatalog::GUARD], ['label' => 'Administrator']);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    /** @return array{EducationLevel, EducationClass, Subject} */
    private function taxonomy(): array
    {
        $level = EducationLevel::query()->where('name', 'SD / MI')->firstOrFail();
        $class = $level->educationClasses()->where('name', 'Kelas 1')->firstOrFail();
        $subject = Subject::query()->firstOrCreate(['name' => 'Matematika']);
        $level->subjects()->syncWithoutDetaching($subject);

        return [$level, $class, $subject];
    }
}
