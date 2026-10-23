<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\EducationLevel;
use App\Models\Olympiad;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use App\Support\EducationCatalog;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EducationTargetingTest extends TestCase
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

    public function test_admin_targets_a_bank_soal_to_exactly_one_class_and_subject(): void
    {
        $level = EducationLevel::query()->where('name', 'SD / MI')->firstOrFail();
        $class = $level->educationClasses()->where('name', 'Kelas 3')->firstOrFail();
        $subject = Subject::query()->firstOrCreate(['name' => 'Matematika']);
        $level->subjects()->attach($subject);

        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->post(route('admin.banksoal.store'), [
                'name' => 'Latihan Pecahan',
                'education_level_id' => $level->id,
                'education_class_id' => $class->id,
                'subject_id' => $subject->id,
                'format' => 'PDF',
                'questions' => 25,
                'resources' => [['destination_url' => 'https://example.com/pecahan']],
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $bankSoal = BankSoal::query()->sole();

        $this->assertSame($class->id, $bankSoal->education_class_id);
        $this->assertSame($subject->id, $bankSoal->subject_id);
        $this->assertSame($level->id, $bankSoal->educationClass->education_level_id);
    }

    public function test_admin_can_target_an_olympiad_to_multiple_levels_and_grades(): void
    {
        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->post(route('admin.olympiads.store'), [
                'name' => 'Olimpiade Sains Nasional',
                'education_levels' => ['SMP', 'SMA'],
                'grades' => ['8', '11'],
                'category' => 'free',
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $olympiad = Olympiad::query()->sole();

        $this->assertSame(['SMP', 'SMA'], $olympiad->education_levels);
        $this->assertSame(['8', '11'], $olympiad->grades);
        $this->assertSame('SMP / SMA', $olympiad->level);
    }

    public function test_class_must_belong_to_the_selected_level(): void
    {
        $sd = EducationLevel::query()->where('name', 'SD / MI')->firstOrFail();
        $sma = EducationLevel::query()->where('name', 'SMA / MA')->firstOrFail();
        $class = $sma->educationClasses()->where('name', 'Kelas 10')->firstOrFail();
        $subject = Subject::query()->firstOrCreate(['name' => 'Matematika']);
        $sd->subjects()->attach($subject);

        $this->actingAs($this->admin, PermissionCatalog::GUARD)
            ->post(route('admin.banksoal.store'), [
                'name' => 'Latihan Tidak Valid',
                'education_level_id' => $sd->id,
                'education_class_id' => $class->id,
                'subject_id' => $subject->id,
                'format' => 'PDF',
                'resources' => [['destination_url' => 'https://example.com']],
                'is_active' => true,
            ])
            ->assertSessionHasErrors('education_class_id');

        $this->assertDatabaseCount('bank_soals', 0);
    }

    public function test_public_bank_soal_exposes_relational_hierarchy_while_olympiad_keeps_its_targeting(): void
    {
        $bankSoal = BankSoal::factory()->create();
        Olympiad::factory()->create([
            'education_levels' => ['SMP'],
            'grades' => ['8'],
        ]);

        $this->get(route('banksoal'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stage', 'levels')
                ->has('items', 5)
            );

        $this->get(route('banksoal.detail', [
            $bankSoal->educationClass->educationLevel, $bankSoal->educationClass, $bankSoal->subject, $bankSoal,
        ]))->assertSuccessful()->assertInertia(fn (Assert $page) => $page
            ->where('bankSoal.class.id', $bankSoal->education_class_id)
            ->where('bankSoal.subject.id', $bankSoal->subject_id));

        $this->get(route('olympiad'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->where('olympiads.0.education_levels', ['SMP'])
                ->where('olympiads.0.grades', ['8'])
                ->has('educationOptions', 4)
            );
    }

    public function test_targets_can_be_inferred_from_localized_names_and_class_ranges(): void
    {
        $this->assertSame([
            'education_levels' => ['SD'],
            'grades' => ['3'],
        ], EducationCatalog::resolveTargets([
            'id' => 'Latihan Matematika Kelas 3',
            'en' => 'Mathematics Grade 3',
        ]));

        $this->assertSame([
            'education_levels' => ['SMP'],
            'grades' => ['7', '8', '9'],
        ], EducationCatalog::resolveTargets('Bank Soal SMP Kelas 7-9'));

        $this->assertSame([
            'education_levels' => ['SMA'],
            'grades' => ['11'],
        ], EducationCatalog::resolveTargets('Fisika SMA Kelas XI'));

        $this->assertSame([
            'education_levels' => ['SD'],
            'grades' => [],
        ], EducationCatalog::resolveTargets('Paket Latihan Umum', ['id' => 'SD', 'en' => 'Elementary']));
    }
}
