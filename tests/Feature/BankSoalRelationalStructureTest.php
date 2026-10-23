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
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BankSoalRelationalStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_schema_uses_relations_without_slug_or_legacy_json_columns(): void
    {
        $this->assertTrue(Schema::hasColumns('bank_soals', ['education_class_id', 'subject_id', 'classification_status']));
        $this->assertFalse(Schema::hasColumn('bank_soals', 'slug'));
        $this->assertFalse(Schema::hasColumn('bank_soals', 'education_levels'));
        $this->assertFalse(Schema::hasColumn('bank_soals', 'grades'));
        $this->assertFalse(Schema::hasColumn('bank_soals', 'links'));
    }

    public function test_store_uses_one_class_and_relational_resources(): void
    {
        Storage::fake('public');
        [$level, $class, $subject] = $this->taxonomy();

        $this->actingAs($this->admin(), PermissionCatalog::GUARD)->post('/admin/bank-soal', [
            'education_level_id' => $level->id,
            'education_class_id' => $class->id,
            'subject_id' => $subject->id,
            'name' => 'Matematika Paket 1',
            'description' => 'Latihan kelas satu',
            'format' => 'PDF',
            'questions' => 20,
            'resources' => [
                ['label' => 'PDF Soal', 'file' => UploadedFile::fake()->create('soal.pdf', 50, 'application/pdf')],
                ['label' => 'Latihan Tambahan', 'destination_url' => 'https://example.com/latihan'],
            ],
            'is_active' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $bankSoal = BankSoal::query()->with('resources')->firstOrFail();
        $this->assertSame($class->id, $bankSoal->education_class_id);
        $this->assertSame($subject->id, $bankSoal->subject_id);
        $this->assertSame('ready', $bankSoal->classification_status);
        $this->assertCount(2, $bankSoal->resources);
        $this->assertSame('https://example.com/latihan', $bankSoal->resources[1]->destination_url);
        Storage::disk('public')->assertExists($bankSoal->resources[0]->file_path);
    }

    public function test_store_rejects_a_class_from_another_level(): void
    {
        [$level, $class, $subject] = $this->taxonomy();
        $otherLevel = EducationLevel::query()->where('name', 'SMP / MTs')->firstOrFail();
        $otherClass = $otherLevel->educationClasses()->where('name', 'Kelas 7')->firstOrFail();

        $this->actingAs($this->admin(), PermissionCatalog::GUARD)->post('/admin/bank-soal', [
            'education_level_id' => $level->id,
            'education_class_id' => $otherClass->id,
            'subject_id' => $subject->id,
            'name' => 'Salah Kelas',
            'format' => 'PDF',
            'resources' => [['destination_url' => 'https://example.com']],
        ])->assertSessionHasErrors('education_class_id');

        $this->assertDatabaseCount('bank_soals', 0);
    }

    public function test_nested_id_route_rejects_a_mismatched_hierarchy(): void
    {
        [$level, $class, $subject] = $this->taxonomy();
        $bankSoal = BankSoal::factory()->create(['education_class_id' => $class->id, 'subject_id' => $subject->id]);

        $this->get("/bank-soal/{$level->id}/{$class->id}/{$subject->id}/{$bankSoal->id}")
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Public/BankSoal/Detail', false)
                ->where('bankSoal.class.id', $class->id)
                ->where('bankSoal.subject.id', $subject->id));

        $otherClass = $level->educationClasses()->where('name', 'Kelas 2')->firstOrFail();
        $this->get("/bank-soal/{$level->id}/{$otherClass->id}/{$subject->id}/{$bankSoal->id}")->assertNotFound();
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
        $level->subjects()->attach($subject);

        return [$level, $class, $subject];
    }
}
