<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\BankSoalResource;
use App\Models\EducationLevel;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BankSoalManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_hierarchy_exposes_levels_classes_subjects_and_items_in_separate_steps(): void
    {
        [$level, $class, $subject] = $this->taxonomy();
        BankSoal::factory()->create(['education_class_id' => $class->id, 'subject_id' => $subject->id]);
        $admin = $this->admin();

        $this->actingAs($admin, PermissionCatalog::GUARD)->get('/admin/bank-soal')->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/BankSoal', false)->has('levels', 4));
        $this->actingAs($admin, PermissionCatalog::GUARD)->get("/admin/bank-soal/{$level->id}")->assertSuccessful()
            ->assertInertia(fn ($page) => $page->where('selection.education_level_id', $level->id)->has('classes', 6));
        $this->actingAs($admin, PermissionCatalog::GUARD)->get("/admin/bank-soal/{$level->id}/{$class->id}")->assertSuccessful()
            ->assertInertia(fn ($page) => $page->where('selection.education_class_id', $class->id)->has('subjects', 1));
        $this->actingAs($admin, PermissionCatalog::GUARD)->get("/admin/bank-soal/{$level->id}/{$class->id}/{$subject->id}")->assertSuccessful()
            ->assertInertia(fn ($page) => $page->where('selection.subject_id', $subject->id)->has('bankSoalItems', 1));
    }

    public function test_uploaded_file_and_destination_can_live_on_the_same_resource(): void
    {
        Storage::fake('public');
        [$level, $class, $subject] = $this->taxonomy();

        $this->actingAs($this->admin(), PermissionCatalog::GUARD)->post('/admin/bank-soal', [
            'education_level_id' => $level->id,
            'education_class_id' => $class->id,
            'subject_id' => $subject->id,
            'name' => 'Paket Kombinasi',
            'format' => 'PDF',
            'resources' => [[
                'label' => 'Paket utama',
                'file' => UploadedFile::fake()->create('paket.pdf', 100, 'application/pdf'),
                'destination_url' => 'https://example.com/lebih-lengkap',
            ]],
            'is_active' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $resource = BankSoal::query()->firstOrFail()->resources()->firstOrFail();
        $this->assertSame('paket.pdf', $resource->file_name);
        $this->assertSame('https://example.com/lebih-lengkap', $resource->destination_url);
        Storage::disk('public')->assertExists($resource->file_path);
    }

    public function test_resource_without_file_or_destination_is_rejected(): void
    {
        [$level, $class, $subject] = $this->taxonomy();

        $this->actingAs($this->admin(), PermissionCatalog::GUARD)->post('/admin/bank-soal', [
            'education_level_id' => $level->id,
            'education_class_id' => $class->id,
            'subject_id' => $subject->id,
            'name' => 'Kosong',
            'format' => 'PDF',
            'resources' => [['label' => 'Kosong']],
        ])->assertSessionHasErrors('resources.0.file');
    }

    public function test_shared_backfilled_file_is_only_deleted_after_its_last_bank_soal_is_deleted(): void
    {
        Storage::fake('public');
        [, $class, $subject] = $this->taxonomy();
        $path = 'bank-soals/files/shared-package.pdf';
        Storage::disk('public')->put($path, 'pdf contents');

        $first = BankSoal::factory()->create(['education_class_id' => $class->id, 'subject_id' => $subject->id]);
        $second = BankSoal::factory()->create(['education_class_id' => $class->id, 'subject_id' => $subject->id]);

        foreach ([$first, $second] as $bankSoal) {
            BankSoalResource::factory()->create([
                'bank_soal_id' => $bankSoal->id,
                'file_path' => $path,
                'file_name' => 'shared-package.pdf',
            ]);
        }

        $admin = $this->admin();
        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->delete("/admin/bank-soal/{$first->id}")
            ->assertRedirect();
        Storage::disk('public')->assertExists($path);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->delete("/admin/bank-soal/{$second->id}")
            ->assertRedirect();
        Storage::disk('public')->assertMissing($path);
    }

    private function admin(): User
    {
        $role = Role::query()->firstOrCreate(['name' => 'administrator', 'guard_name' => PermissionCatalog::GUARD], ['label' => 'Administrator']);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function taxonomy(): array
    {
        $level = EducationLevel::query()->where('name', 'SD / MI')->firstOrFail();
        $class = $level->educationClasses()->where('name', 'Kelas 1')->firstOrFail();
        $subject = Subject::query()->firstOrCreate(['name' => 'Matematika']);
        $level->subjects()->syncWithoutDetaching($subject);

        return [$level, $class, $subject];
    }
}
