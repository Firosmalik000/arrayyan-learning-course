<?php

namespace Database\Seeders;

use App\Models\PortalAccount;
use App\Models\Student;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parent1 = PortalAccount::query()->where('id', 1)->first()
            ?? PortalAccount::query()->where('type', 'parent')->first();

        $student1 = $parent1?->students()->first()
            ?? Student::query()->where('name', 'Albi')->first()
            ?? Student::query()->first();

        $parent2 = PortalAccount::query()->where('id', 2)->first();
        $student2 = $parent2?->students()->first()
            ?? Student::query()->where('name', 'Firos Malik')->first()
            ?? Student::query()->skip(1)->first();

        $testimonials = [
            [
                'portal_account_id' => $parent1?->id,
                'student_id' => $student1?->id,
                'name' => $parent1?->name ?? 'Orang Tua Albi',
                'role' => 'Orang Tua Siswa',
                'student_name' => $student1 ? "Orang Tua dari {$student1->name}" : 'Orang Tua dari Albi',
                'rating' => 5,
                'highlight' => 'Siswa Berprestasi',
                'message' => 'Alhamdulillah sejak belajar di ALC, anak kami jadi jauh lebih mandiri dan antusias belajar. Tutornya sangat sabar, ramah, dan selalu membiasakan adab belajar yang baik.',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'portal_account_id' => $parent2?->id,
                'student_id' => $student2?->id,
                'name' => $parent2?->name ?? 'Orang Tua Firos Malik',
                'role' => 'Orang Tua Siswa',
                'student_name' => $student2 ? "Orang Tua dari {$student2->name}" : 'Orang Tua dari Firos Malik',
                'rating' => 5,
                'highlight' => 'Perkembangan Pesat',
                'message' => 'Pendekatan bimbingannya personal dan komunikatif. Materi pelajaran yang tadinya dirasa sulit kini bisa dipahami dengan lancar. Laporan progres berkalanya juga sangat informatif bagi orang tua.',
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($testimonials as $data) {
            Testimonial::updateOrCreate(
                [
                    'name' => $data['name'],
                    'student_name' => $data['student_name'],
                ],
                $data
            );
        }
    }
}
