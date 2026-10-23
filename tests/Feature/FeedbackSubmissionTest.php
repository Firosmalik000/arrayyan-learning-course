<?php

namespace Tests\Feature;

use App\Models\FeedbackSubmission;
use App\Models\Permission;
use App\Models\PortalAccount;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackSubmissionTest extends TestCase
{
    use RefreshDatabase;

    private PortalAccount $parentAccount;

    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->parentAccount = PortalAccount::create([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Bunda Rafi',
            'email' => 'bunda@example.com',
            'contact' => '081234567890',
            'password' => bcrypt('password'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this->student = Student::create([
            'name' => 'Rafi',
            'parent_portal_account_id' => $this->parentAccount->id,
            'parent_email' => $this->parentAccount->email,
            'parent_contact' => $this->parentAccount->contact,
            'is_active' => true,
        ]);
    }

    public function test_parent_can_open_feedback_page_and_submit_feedback(): void
    {
        $this->actingAs($this->parentAccount, 'portal')
            ->get(route('portal.feedback.index'))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Portal/Feedback', false)
                ->has('students', 1)
                ->where('students.0.name', 'Rafi')
                ->has('categories')
                ->has('submissions.data', 0));

        $response = $this->actingAs($this->parentAccount, 'portal')
            ->post(route('portal.feedback.store'), [
                'student_id' => $this->student->id,
                'category' => 'schedule',
                'rating' => 4,
                'subject' => 'Informasi perubahan jadwal',
                'message' => 'Mohon perubahan jadwal disampaikan lebih awal kepada orang tua.',
            ]);

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseHas('feedback_submissions', [
            'portal_account_id' => $this->parentAccount->id,
            'student_id' => $this->student->id,
            'submitter_name' => 'Bunda Rafi',
            'submitter_email' => 'bunda@example.com',
            'category' => 'schedule',
            'rating' => 4,
            'status' => FeedbackSubmission::STATUS_NEW,
        ]);
    }

    public function test_feedback_validation_prevents_selecting_another_parents_child(): void
    {
        $otherStudent = Student::create([
            'name' => 'Anak Lain',
            'parent_contact' => '089999999999',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->parentAccount, 'portal')
            ->post(route('portal.feedback.store'), [
                'student_id' => $otherStudent->id,
                'category' => 'invalid-category',
                'rating' => 6,
                'subject' => '',
                'message' => 'pendek',
            ]);

        $response->assertSessionHasErrors(['student_id', 'category', 'rating', 'subject', 'message']);
        $this->assertSame(0, FeedbackSubmission::query()->count());
    }

    public function test_teacher_cannot_use_parent_feedback(): void
    {
        $teacher = PortalAccount::create([
            'type' => PortalAccount::TYPE_TEACHER,
            'name' => 'Pengajar',
            'contact' => '081222222222',
            'password' => bcrypt('password'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this->actingAs($teacher, 'portal')
            ->get(route('portal.feedback.index'))
            ->assertForbidden();

        $this->actingAs($teacher, 'portal')
            ->post(route('portal.feedback.store'), [
                'category' => 'service',
                'rating' => 5,
                'subject' => 'Masukan pengajar',
                'message' => 'Pengajar tidak seharusnya dapat mengirim melalui fitur ini.',
            ])
            ->assertForbidden();
    }

    public function test_authorized_admin_can_filter_and_reply_feedback(): void
    {
        $feedback = FeedbackSubmission::factory()->create([
            'portal_account_id' => $this->parentAccount->id,
            'student_id' => $this->student->id,
            'submitter_name' => $this->parentAccount->name,
            'category' => 'teacher',
            'rating' => 2,
            'subject' => 'Evaluasi cara mengajar',
            'admin_reply' => null,
        ]);

        $role = Role::create([
            'name' => 'evaluator',
            'label' => 'Evaluator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $role->givePermissionTo([
            Permission::findOrCreate('kritik-saran.view', PermissionCatalog::GUARD),
            Permission::findOrCreate('kritik-saran.edit', PermissionCatalog::GUARD),
        ]);
        $admin = User::factory()->create();
        $admin->assignRole($role);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->get(route('admin.feedback.index', ['status' => 'unreplied', 'category' => 'teacher', 'rating' => 2]))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Feedback', false)
                ->has('submissions.data', 1)
                ->where('stats.unreplied', 1)
                ->where('submissions.data.0.subject', 'Evaluasi cara mengajar'));

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->patch(route('admin.feedback.update', $feedback), [
                'admin_reply' => str_repeat('x', 3001),
                'admin_notes' => str_repeat('y', 2001),
            ])
            ->assertSessionHasErrors(['admin_reply', 'admin_notes']);

        $this->assertNull($feedback->fresh()->admin_reply);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->patch(route('admin.feedback.update', $feedback), [
                'admin_reply' => 'Terima kasih atas masukannya, kami akan tingkatkan koordinasi pengajar.',
                'admin_notes' => 'Sudah dibahas bersama koordinator pengajar.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('feedback_submissions', [
            'id' => $feedback->id,
            'admin_reply' => 'Terima kasih atas masukannya, kami akan tingkatkan koordinasi pengajar.',
            'admin_notes' => 'Sudah dibahas bersama koordinator pengajar.',
            'replied_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'feedback.replied',
            'subject_id' => $feedback->id,
            'caused_by' => $admin->id,
        ]);

        // Verify parent can view admin reply on portal
        $this->actingAs($this->parentAccount, 'portal')
            ->get(route('portal.feedback.index'))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Portal/Feedback', false)
                ->where('submissions.data.0.admin_reply', 'Terima kasih atas masukannya, kami akan tingkatkan koordinasi pengajar.'));
    }

    public function test_admin_without_feedback_permission_is_forbidden(): void
    {
        $admin = User::factory()->create();

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->get(route('admin.feedback.index'))
            ->assertForbidden();
    }

    public function test_application_uses_only_the_unified_login_endpoint(): void
    {
        $this->get('/portal/login')->assertNotFound();
        $this->post('/portal/login')->assertNotFound();

        $this->assertStringEndsWith('/login', route('login'));
    }

    public function test_parent_can_submit_public_review_and_it_displays_on_landing_page(): void
    {
        $response = $this->actingAs($this->parentAccount, 'portal')
            ->post(route('portal.feedback.review.store'), [
                'student_id' => $this->student->id,
                'rating' => 5,
                'highlight' => 'Tutor Sangat Sabar',
                'message' => 'Alhamdulillah belajar di ALC sangat membantu anak saya memahami pelajaran dengan senang.',
            ]);

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseHas('testimonials', [
            'portal_account_id' => $this->parentAccount->id,
            'name' => $this->parentAccount->name,
            'rating' => 5,
            'highlight' => 'Tutor Sangat Sabar',
            'is_active' => true,
        ]);

        // Verify landing page gets this customer review
        $homeResponse = $this->get(route('home'));
        $homeResponse->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Home', false)
                ->where('landingContent.testimonials.id.0.name', 'Bunda Rafi')
                ->where('landingContent.testimonials.id.0.highlight', 'Tutor Sangat Sabar')
                ->where('landingContent.testimonials.id.0.quote', 'Alhamdulillah belajar di ALC sangat membantu anak saya memahami pelajaran dengan senang.'));
    }
}
