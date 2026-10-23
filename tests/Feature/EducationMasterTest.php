<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\EducationLevel;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EducationMasterTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_update_education_master_data(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin, PermissionCatalog::GUARD)->post('/admin/master-pendidikan/jenjang', [
            'name' => 'Perguruan Tinggi', 'sort_order' => 50, 'is_active' => true,
        ])->assertSessionHasNoErrors();
        $level = EducationLevel::query()->where('name', 'Perguruan Tinggi')->firstOrFail();

        $this->actingAs($admin, PermissionCatalog::GUARD)->post('/admin/master-pendidikan/kelas', [
            'education_level_id' => $level->id, 'name' => 'Semester 1', 'sort_order' => 10, 'is_active' => true,
        ])->assertSessionHasNoErrors();
        $this->actingAs($admin, PermissionCatalog::GUARD)->post('/admin/master-pendidikan/mapel', [
            'name' => 'Kalkulus', 'education_level_ids' => [$level->id], 'sort_order' => 10, 'is_active' => true,
        ])->assertSessionHasNoErrors();

        $subject = Subject::query()->where('name', 'Kalkulus')->firstOrFail();
        $this->actingAs($admin, PermissionCatalog::GUARD)->put("/admin/master-pendidikan/mapel/{$subject->id}", [
            'name' => 'Kalkulus Dasar', 'education_level_ids' => [$level->id], 'sort_order' => 20, 'is_active' => true,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('subjects', ['id' => $subject->id, 'name' => 'Kalkulus Dasar']);
        $this->assertDatabaseHas('education_level_subject', ['education_level_id' => $level->id, 'subject_id' => $subject->id]);
    }

    public function test_master_rows_in_use_are_protected_from_deletion(): void
    {
        $admin = $this->admin();
        $bankSoal = BankSoal::factory()->create();

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->delete("/admin/master-pendidikan/kelas/{$bankSoal->education_class_id}")
            ->assertSessionHasErrors('class');
        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->delete("/admin/master-pendidikan/mapel/{$bankSoal->subject_id}")
            ->assertSessionHasErrors('subject');

        $this->assertDatabaseHas('education_classes', ['id' => $bankSoal->education_class_id]);
        $this->assertDatabaseHas('subjects', ['id' => $bankSoal->subject_id]);
    }

    private function admin(): User
    {
        $role = Role::query()->firstOrCreate(['name' => 'administrator', 'guard_name' => PermissionCatalog::GUARD], ['label' => 'Administrator']);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
