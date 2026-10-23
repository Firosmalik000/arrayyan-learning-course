<?php

namespace Tests\Feature;

use App\Models\PortalAccount;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortalProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_profile_shows_complete_registration_information(): void
    {
        $account = $this->makeAccount();
        $this->makeStudent($account, ['photo_path' => 'profile-photos/students/ahmad.jpg']);

        $this->actingAs($account, 'portal')
            ->get(route('portal.profile'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Portal/Profile')
                ->where('account_type', 'parent')
                ->where('account.email', 'orangtua@example.com')
                ->where('students.0.address', 'Jalan Melati Nomor 1')
                ->where('students.0.school_name', 'SMP Negeri 1')
                ->where('students.0.class_level', 'Kelas 7')
                ->where('students.0.subjects', 'Matematika')
                ->where('students.0.program', 'Reguler')
                ->where('students.0.package', '8 pertemuan')
                ->where('students.0.preferred_mode', 'offline')
                ->where('students.0.notes', 'Perlu pendampingan aljabar.'));
    }

    public function test_parent_can_upload_student_photo_and_it_becomes_the_portal_and_review_photo(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('profile-photos/students/old.jpg', 'old-photo');

        $account = $this->makeAccount();
        $student = $this->makeStudent($account, ['photo_path' => 'profile-photos/students/old.jpg']);
        $testimonial = Testimonial::create([
            'portal_account_id' => $account->id,
            'student_id' => $student->id,
            'name' => $account->name,
            'role' => 'Orang Tua Siswa',
            'message' => 'Pelayanan belajar sangat membantu perkembangan anak.',
            'rating' => 5,
            'is_active' => true,
        ]);

        $this->actingAs($account, 'portal')
            ->post(route('portal.profile.student.update', $student), [
                '_method' => 'put',
                'name' => $student->name,
                'address' => $student->address,
                'school_name' => $student->school_name,
                'level' => $student->level,
                'class_level' => $student->class_level,
                'subjects' => $student->subjects,
                'preferred_mode' => $student->preferred_mode,
                'notes' => $student->notes,
                'photo' => UploadedFile::fake()->image('ahmad-baru.jpg', 600, 600),
            ])
            ->assertSessionHasNoErrors();

        $student->refresh();
        $this->assertNotNull($student->photo_path);
        $this->assertNotSame('profile-photos/students/old.jpg', $student->photo_path);
        Storage::disk('public')->assertExists($student->photo_path);
        Storage::disk('public')->assertMissing('profile-photos/students/old.jpg');
        $this->assertStringContainsString($student->photo_path, $testimonial->fresh()->avatar_url);

        $this->actingAs($account, 'portal')
            ->get(route('portal.profile'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('portalAuth.selected_student_id', $student->id)
                ->where('portalAuth.students.0.photo_url', fn ($url) => str_contains($url, $student->photo_path)));
    }

    public function test_parent_can_update_account_and_sync_contact_to_linked_students(): void
    {
        $account = $this->makeAccount();
        $firstStudent = $this->makeStudent($account);
        $secondStudent = $this->makeStudent($account, ['name' => 'Aisyah Fauzi']);

        $this->actingAs($account, 'portal')
            ->put(route('portal.profile.update'), [
                'name' => 'Bunda Ahmad',
                'email' => 'bunda.ahmad@example.com',
                'contact' => '0812-9999-8888',
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $account->refresh();
        $this->assertSame('Bunda Ahmad', $account->name);
        $this->assertSame('bunda.ahmad@example.com', $account->email);
        $this->assertSame('081299998888', $account->contact);

        foreach ([$firstStudent, $secondStudent] as $student) {
            $student->refresh();
            $this->assertSame('bunda.ahmad@example.com', $student->parent_email);
            $this->assertSame('081299998888', $student->parent_contact);
        }
    }

    public function test_profile_photo_rejects_non_image_and_oversized_files(): void
    {
        Storage::fake('public');
        $account = $this->makeAccount();
        $student = $this->makeStudent($account);
        $payload = [
            '_method' => 'put',
            'name' => $student->name,
            'address' => $student->address,
            'school_name' => $student->school_name,
            'level' => $student->level,
            'class_level' => $student->class_level,
            'subjects' => $student->subjects,
            'preferred_mode' => $student->preferred_mode,
            'notes' => $student->notes,
        ];

        $this->actingAs($account, 'portal')
            ->post(route('portal.profile.student.update', $student), [
                ...$payload,
                'photo' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('photo');

        $this->actingAs($account, 'portal')
            ->post(route('portal.profile.student.update', $student), [
                ...$payload,
                'photo' => UploadedFile::fake()->image('terlalu-besar.jpg')->size(2500),
            ])
            ->assertSessionHasErrors('photo');

        $this->assertNull($student->fresh()->photo_path);
    }

    public function test_parent_can_update_only_their_own_linked_student(): void
    {
        $account = $this->makeAccount();
        $student = $this->makeStudent($account);
        $otherAccount = $this->makeAccount([
            'email' => 'other@example.com',
            'contact' => '081277776666',
        ]);
        $otherStudent = $this->makeStudent($otherAccount, ['name' => 'Murid Lain']);

        $payload = [
            'name' => 'Ahmad Fauzi Baru',
            'address' => 'Jalan Mawar Nomor 2',
            'school_name' => 'SMP Negeri 2',
            'level' => 'SMP',
            'class_level' => 'Kelas 8',
            'subjects' => 'Matematika dan IPA',
            'preferred_mode' => 'online',
            'notes' => 'Jadwal sore hari.',
        ];

        $this->actingAs($account, 'portal')
            ->put(route('portal.profile.student.update', $student), $payload)
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $student->refresh();
        $this->assertSame('Ahmad Fauzi Baru', $student->name);
        $this->assertSame('SMP Negeri 2', $student->school_name);
        $this->assertSame('online', $student->preferred_mode);
        $this->assertSame('Reguler', $student->program);

        $this->actingAs($account, 'portal')
            ->put(route('portal.profile.student.update', $otherStudent), $payload)
            ->assertForbidden();
    }

    public function test_teacher_can_update_account_and_teaching_information_together(): void
    {
        Storage::fake('public');
        $teacher = Teacher::create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi@example.com',
            'contact' => '081233344455',
            'address' => 'Jalan Guru',
            'city' => 'Kota Padang',
            'district' => 'Kuranji',
            'teacher_role' => 'Guru SMP',
            'education' => 'S1 Pendidikan Matematika',
            'subjects' => 'Matematika',
            'experience' => '3 tahun',
            'notes' => 'Tersedia sore hari.',
            'is_active' => true,
        ]);
        $account = $this->makeAccount([
            'type' => PortalAccount::TYPE_TEACHER,
            'teacher_id' => $teacher->id,
            'name' => $teacher->name,
            'email' => $teacher->email,
            'contact' => $teacher->contact,
        ]);

        $this->actingAs($account, 'portal')
            ->post(route('portal.profile.update'), [
                '_method' => 'put',
                'name' => 'Dewi Lestari, S.Pd.',
                'email' => 'dewi.baru@example.com',
                'contact' => '0812-1111-2222',
                'address' => 'Jalan Guru Baru',
                'city' => 'Kota Padang',
                'district' => 'Pauh',
                'teacher_role' => 'Guru SMP dan SMA',
                'education' => 'S2 Pendidikan Matematika',
                'subjects' => 'Matematika dan Statistika',
                'experience' => '5 tahun',
                'notes' => 'Tersedia malam hari.',
                'photo' => UploadedFile::fake()->image('dewi.jpg', 600, 600),
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $account->refresh();
        $this->assertSame('Dewi Lestari, S.Pd.', $account->name);
        $this->assertSame('dewi.baru@example.com', $account->email);
        $this->assertSame('081211112222', $account->contact);

        $teacher->refresh();
        $this->assertSame('Dewi Lestari, S.Pd.', $teacher->name);
        $this->assertSame('Pauh', $teacher->district);
        $this->assertSame('S2 Pendidikan Matematika', $teacher->education);
        $this->assertSame('Matematika dan Statistika', $teacher->subjects);
        $this->assertNotNull($teacher->photo_path);
        Storage::disk('public')->assertExists($teacher->photo_path);
    }

    private function makeAccount(array $overrides = []): PortalAccount
    {
        return PortalAccount::create(array_merge([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Orang Tua Ahmad',
            'email' => 'orangtua@example.com',
            'contact' => '081234567890',
            'password' => Hash::make('password123'),
            'must_change_password' => false,
            'is_active' => true,
        ], $overrides));
    }

    private function makeStudent(PortalAccount $account, array $overrides = []): Student
    {
        return Student::create(array_merge([
            'name' => 'Ahmad Fauzi',
            'address' => 'Jalan Melati Nomor 1',
            'school_name' => 'SMP Negeri 1',
            'level' => 'SMP',
            'class_level' => 'Kelas 7',
            'subjects' => 'Matematika',
            'program' => 'Reguler',
            'package' => '8 pertemuan',
            'parent_contact' => $account->contact,
            'parent_email' => $account->email,
            'parent_portal_account_id' => $account->id,
            'preferred_mode' => 'offline',
            'notes' => 'Perlu pendampingan aljabar.',
            'is_active' => true,
        ], $overrides));
    }
}
