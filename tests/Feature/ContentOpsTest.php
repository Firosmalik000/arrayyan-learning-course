<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\NotificationLog;
use App\Models\PageContent;
use App\Models\PageContentRevision;
use App\Models\Post;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentOpsTest extends TestCase
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

    private function makePost(array $overrides = []): Post
    {
        return Post::create(array_merge([
            'type' => 'blog',
            'slug' => 'artikel-test-'.fake()->unique()->numberBetween(1, 99999),
            'title' => 'Artikel Test',
            'excerpt' => 'Ringkasan.',
            'content' => "Paragraf satu.\n\nParagraf dua.",
            'published_at' => now()->subDay(),
            'is_active' => true,
        ], $overrides));
    }

    // ── CMS: posts ─────────────────────────────────────────────

    public function test_admin_creates_post_with_unique_slug_and_logs_activity(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.content.posts.store'),
            [
                'type' => 'blog',
                'title' => 'Tips Belajar Efektif',
                'excerpt' => 'Ringkasan.',
                'content' => 'Isi.',
                'published_at' => now()->toDateTimeString(),
                'is_active' => 1,
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('posts', [
            'title' => 'Tips Belajar Efektif',
            'slug' => 'tips-belajar-efektif',
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'konten.post.buat',
            'caused_by' => $user->id,
        ]);
    }

    public function test_admin_post_slug_stays_unique(): void
    {
        $user = $this->actingAsAdmin();
        $this->makePost(['title' => 'Judul Sama', 'slug' => 'judul-sama']);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.content.posts.store'),
            ['type' => 'blog', 'title' => 'Judul Sama', 'is_active' => 1]
        );

        $this->assertDatabaseHas('posts', ['slug' => 'judul-sama-2']);
    }

    public function test_admin_updates_and_deletes_post(): void
    {
        $user = $this->actingAsAdmin();
        $post = $this->makePost(['title' => 'Lama']);
        $guard = PermissionCatalog::GUARD;

        $this->actingAs($user, $guard)->put(
            route('admin.content.posts.update', $post),
            ['type' => 'pengumuman', 'title' => 'Baru', 'is_active' => 1]
        );

        $this->assertDatabaseHas('posts', ['id' => $post->id, 'title' => 'Baru', 'type' => 'pengumuman']);

        $this->actingAs($user, $guard)->delete(route('admin.content.posts.destroy', $post));

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    // ── CMS: testimoni & FAQ ───────────────────────────────────

    public function test_admin_manages_testimonials_and_faqs(): void
    {
        $user = $this->actingAsAdmin();
        $guard = PermissionCatalog::GUARD;

        $this->actingAs($user, $guard)->post(route('admin.content.testimonials.store'), [
            'name' => 'Ortu A',
            'message' => 'Bagus sekali.',
            'rating' => 5,
        ]);
        $this->assertDatabaseHas('testimonials', ['name' => 'Ortu A']);

        $this->actingAs($user, $guard)->post(route('admin.content.faqs.store'), [
            'question' => 'Berapa biaya?',
            'answer' => 'Tergantung program.',
            'category' => 'Biaya',
        ]);
        $this->assertDatabaseHas('faqs', ['question' => 'Berapa biaya?']);

        $page = $this->actingAs($user, $guard)->get(route('admin.content'));
        $page->assertSuccessful();
        $page->assertInertia(fn ($page) => $page
            ->component('Admin/Content', false)
            ->has('posts')
            ->has('testimonials', 1)
            ->has('faqs', 1)
        );
    }

    // ── Publik: blog & FAQ ─────────────────────────────────────

    public function test_public_blog_lists_only_published(): void
    {
        $this->makePost(['title' => 'Terbit', 'slug' => 'terbit']);
        $this->makePost(['title' => 'Draf', 'slug' => 'draf', 'is_active' => false]);
        $this->makePost(['title' => 'Masa Depan', 'slug' => 'masa-depan', 'published_at' => now()->addWeek()]);

        $response = $this->get(route('blog'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Blog/Index', false)
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Terbit')
        );
    }

    public function test_public_blog_detail_and_related(): void
    {
        $this->makePost(['title' => 'Utama', 'slug' => 'utama']);
        $this->makePost(['title' => 'Terkait', 'slug' => 'terkait']);

        $response = $this->get(route('blog.detail', 'utama'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Blog/Detail', false)
            ->where('post.title', 'Utama')
            ->where('post.reading_minutes', 1)
            ->has('related', 1)
        );
    }

    public function test_public_faq_lists_active_only(): void
    {
        Faq::create(['question' => 'Q1', 'answer' => 'A1', 'is_active' => true]);
        Faq::create(['question' => 'Q2', 'answer' => 'A2', 'is_active' => false]);

        $response = $this->get(route('faq'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Faq', false)
            ->has('faqs', 1)
        );
    }

    public function test_sitemap_includes_posts(): void
    {
        $this->makePost(['slug' => 'masuk-sitemap']);

        $response = $this->get(route('sitemap'));

        $response->assertSuccessful();
        $response->assertSee('masuk-sitemap', false);
    }

    // ── Ops: notifikasi, aktivitas, export, kartu, revisi ──────

    public function test_notifications_center_renders(): void
    {
        $user = $this->actingAsAdmin();
        NotificationLog::create([
            'event' => 'received',
            'channel' => 'whatsapp',
            'recipient' => '081234567890',
            'message' => 'Halo',
            'status' => 'sent',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.notifications'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Notifications', false)
            ->has('logs.data', 1)
        );
    }

    public function test_activities_recorded_on_approve(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Audit',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.student.approve', $reg)
        );

        $this->assertDatabaseHas('activity_logs', [
            'event' => 'pendaftaran.murid.setujui',
            'caused_by' => $user->id,
        ]);

        $page = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.activities'));
        $page->assertSuccessful();
        $page->assertInertia(fn ($page) => $page
            ->component('Admin/Activities', false)
            ->has('logs.data', 1)
        );
    }

    public function test_export_registrations_csv(): void
    {
        $user = $this->actingAsAdmin();
        StudentRegistration::factory()->create(['student_name' => 'Export Me', 'status' => 'pending']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(
            route('admin.registrations.export', 'murid')
        );

        $response->assertSuccessful();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('Export Me', $response->streamedContent());
    }

    public function test_student_card_renders(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $student = Student::create([
            'name' => 'Anak Kartu',
            'program_id' => $program->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(
            route('admin.students.card', $student)
        );

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Students/Card', false)
            ->where('student.name', 'Anak Kartu')
        );
    }

    public function test_landing_revision_restore(): void
    {
        $user = $this->actingAsAdmin();
        PageContent::create(['slug' => 'hero', 'content' => ['baru' => true]]);
        $revision = PageContentRevision::create([
            'slug' => 'hero',
            'content' => ['lama' => true],
            'note' => 'Test',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.content.revisions.restore', $revision)
        );

        $response->assertRedirect();
        $this->assertEquals(
            ['lama' => true],
            PageContent::where('slug', 'hero')->first()->content
        );
    }
}
