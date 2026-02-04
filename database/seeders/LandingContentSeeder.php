<?php

namespace Database\Seeders;

use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\PageContent;
use App\Models\Program;
use Illuminate\Database\Seeder;

class LandingContentSeeder extends Seeder
{
    public function run(): void
    {
        $content = [
            'siteConfig' => [
                'name' => 'Ar Rayyan Learning Course',
                'shortName' => 'ALC',
                'tagline' => [
                    'id' => 'Pendampingan Belajar yang Aman, Nyaman, dan Terarah',
                    'en' => 'Safe, Comfortable, and Guided Learning Support',
                ],
            ],
            'contactInfo' => [
                'whatsapp' => [
                    'number' => '+62 812-3456-7890',
                    'link' => 'https://wa.me/6281234567890',
                ],
                'instagram' => [
                    'handle' => '@alclearning',
                    'link' => 'https://instagram.com/alclearning',
                ],
                'email' => [
                    'address' => 'info@alclearning.id',
                    'link' => 'mailto:info@alclearning.id',
                ],
                'socials' => [
                    [
                        'key' => 'whatsapp',
                        'label' => ['id' => 'WhatsApp', 'en' => 'WhatsApp'],
                        'value' => '+62 812-3456-7890',
                        'link' => 'https://wa.me/6281234567890',
                        'icon' => 'whatsapp',
                        'tone' => 'green',
                    ],
                    [
                        'key' => 'instagram',
                        'label' => ['id' => 'Instagram', 'en' => 'Instagram'],
                        'value' => '@alclearning',
                        'link' => 'https://instagram.com/alclearning',
                        'icon' => 'instagram',
                        'tone' => 'rose',
                    ],
                    [
                        'key' => 'email',
                        'label' => ['id' => 'Email', 'en' => 'Email'],
                        'value' => 'info@alclearning.id',
                        'link' => 'mailto:info@alclearning.id',
                        'icon' => 'mail',
                        'tone' => 'violet',
                    ],
                ],
                'address' => [
                    'id' => 'Jl. Pendidikan Islami No. 8, Bandung, Jawa Barat 40123',
                    'en' => 'Jl. Pendidikan Islami No. 8, Bandung, West Java 40123',
                    'mapLink' => 'https://maps.google.com',
                ],
            ],
            'operatingHours' => [
                'id' => [
                    'weekday' => 'Sen - Jum: 08:00 - 20:00',
                    'weekend' => 'Sabtu: 08:00 - 16:00',
                ],
                'en' => [
                    'weekday' => 'Mon - Fri: 08:00 - 20:00',
                    'weekend' => 'Sat: 08:00 - 16:00',
                ],
            ],
            'stats' => [
                'id' => [
                    ['value' => '50+', 'label' => 'Pengajar Aktif', 'icon' => 'users', 'tone' => 'violet'],
                    ['value' => '500+', 'label' => 'Siswa Terbimbing', 'icon' => 'trophy', 'tone' => 'amber'],
                    ['value' => '30+', 'label' => 'Program Belajar', 'icon' => 'book', 'tone' => 'violet'],
                    ['value' => '10+', 'label' => 'Tahun Berpengalaman', 'icon' => 'clock', 'tone' => 'amber'],
                ],
                'en' => [
                    ['value' => '50+', 'label' => 'Active Tutors', 'icon' => 'users', 'tone' => 'violet'],
                    ['value' => '500+', 'label' => 'Students Guided', 'icon' => 'trophy', 'tone' => 'amber'],
                    ['value' => '30+', 'label' => 'Learning Programs', 'icon' => 'book', 'tone' => 'violet'],
                    ['value' => '10+', 'label' => 'Years of Experience', 'icon' => 'clock', 'tone' => 'amber'],
                ],
            ],
            'heroContent' => [
                'badges' => [
                    'id' => [
                        ['title' => 'Aman & Nyaman', 'detail' => 'Lingkungan belajar'],
                        ['title' => 'Personal', 'detail' => 'Sesuai kebutuhan anak'],
                        ['title' => 'Berkarakter', 'detail' => 'Akademik & adab'],
                    ],
                    'en' => [
                        ['title' => 'Safe & Comfortable', 'detail' => 'Learning environment'],
                        ['title' => 'Personal', 'detail' => 'Tailored to each child'],
                        ['title' => 'Character-focused', 'detail' => 'Academic & manners'],
                    ],
                ],
                'panels' => [
                    'left' => [
                        'id' => ['title' => '15+ kelas aktif', 'subtitle' => 'Senin - Sabtu'],
                        'en' => ['title' => '15+ active classes', 'subtitle' => 'Monday - Saturday'],
                    ],
                    'right' => [
                        'id' => ['title' => '98% orang tua', 'subtitle' => 'Puas dengan progres'],
                        'en' => ['title' => '98% of parents', 'subtitle' => 'Satisfied with progress'],
                    ],
                ],
            ],
            'featureCards' => [
                'id' => [
                    [
                        'title' => 'Pembelajaran Personal',
                        'description' => 'Metode pembelajaran disesuaikan dengan kebutuhan masing-masing anak.',
                        'icon' => 'user',
                        'tone' => 'violet',
                    ],
                    [
                        'title' => 'Interaktif & Terarah',
                        'description' => 'Pendampingan belajar yang sabar, fokus, dan menyenangkan.',
                        'icon' => 'book',
                        'tone' => 'amber',
                    ],
                    [
                        'title' => 'Pembentukan Karakter',
                        'description' => 'Menanamkan nilai adab, akhlak, dan semangat belajar.',
                        'icon' => 'heart',
                        'tone' => 'rose',
                    ],
                ],
                'en' => [
                    [
                        'title' => 'Personal Learning',
                        'description' => "Learning methods tailored to each child's needs.",
                        'icon' => 'user',
                        'tone' => 'violet',
                    ],
                    [
                        'title' => 'Interactive & Guided',
                        'description' => 'Patient, focused, and enjoyable learning support.',
                        'icon' => 'book',
                        'tone' => 'amber',
                    ],
                    [
                        'title' => 'Character Building',
                        'description' => 'Instilling values of manners, character, and passion for learning.',
                        'icon' => 'heart',
                        'tone' => 'rose',
                    ],
                ],
            ],
            'aboutContent' => [
                'id' => [
                    'title' => 'Tentang Kami',
                    'description' => "Ar Rayyan Learning Course adalah lembaga bimbingan belajar yang berfokus pada pendampingan belajar anak secara menyeluruh. Kami hadir untuk membantu siswa memahami pelajaran dengan lebih baik melalui metode pembelajaran yang terarah, interaktif, dan disesuaikan dengan kebutuhan masing-masing anak.\n\nKami meyakini bahwa setiap anak memiliki potensi unik. Oleh karena itu, Ar Rayyan Learning Course tidak hanya menekankan pada peningkatan akademik, tetapi juga pada pembentukan karakter, adab, dan semangat belajar. Dengan lingkungan belajar yang aman, nyaman, dan penuh perhatian, kami berupaya menumbuhkan rasa percaya diri serta kecintaan anak terhadap proses belajar.\n\nBersama Ar Rayyan Learning Course, mari kita siapkan generasi yang berilmu, berakhlak, dan siap menghadapi masa depan.",
                    'valuesTitle' => 'Nilai Utama',
                    'values' => ['Aman & Nyaman', 'Terarah & Personal', 'Berkarakter'],
                    'panelTitle' => '25+ aktivitas belajar',
                    'panelSubtitle' => 'Per pekan bersama ALC',
                ],
                'en' => [
                    'title' => 'About Us',
                    'description' => "Ar Rayyan Learning Course is a tutoring institution focused on comprehensive learning support for children. We help students understand their lessons better through guided, interactive, and personalized learning methods tailored to each child's needs.\n\nWe believe every child has unique potential. Therefore, Ar Rayyan Learning Course emphasizes not only academic improvement but also character building, manners, and a passion for learning. With a safe, comfortable, and caring learning environment, we strive to nurture self-confidence and a love for learning in every child.\n\nTogether with Ar Rayyan Learning Course, let's prepare a generation that is knowledgeable, well-mannered, and ready to face the future.",
                    'valuesTitle' => 'Core Values',
                    'values' => ['Safe & Comfortable', 'Guided & Personal', 'Character-focused'],
                    'panelTitle' => '25+ learning activities',
                    'panelSubtitle' => 'Per week with ALC',
                ],
            ],
            'visionMission' => [
                'id' => [
                    'visionTitle' => 'Visi',
                    'vision' => 'Menjadi lembaga bimbingan belajar yang aman, terpercaya, dan berkualitas dalam mendampingi anak berkembang secara akademik dan berkarakter.',
                    'missionTitle' => 'Misi',
                    'missionList' => [
                        'Memberikan pendampingan belajar yang personal, sabar, dan terarah sesuai kebutuhan setiap anak.',
                        'Menciptakan lingkungan belajar yang nyaman dan menyenangkan agar anak percaya diri dan termotivasi.',
                        'Menanamkan nilai adab, akhlak, dan semangat belajar dalam setiap proses pembelajaran.',
                    ],
                ],
                'en' => [
                    'visionTitle' => 'Vision',
                    'vision' => 'To be a safe, trusted, and quality tutoring institution in supporting children to grow academically and build strong character.',
                    'missionTitle' => 'Mission',
                    'missionList' => [
                        "Provide personal, patient, and guided learning support according to each child's needs.",
                        'Create a comfortable and enjoyable learning environment so children feel confident and motivated.',
                        'Instill values of manners, character, and passion for learning in every learning process.',
                    ],
                ],
            ],
            'educationLevels' => [
                'id' => [
                    'title' => 'Jenjang Pendidikan',
                    'levels' => ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'],
                ],
                'en' => [
                    'title' => 'Education Levels',
                    'levels' => ['Pre-K', 'Kindergarten', 'Elementary', 'Junior High', 'Senior High'],
                ],
            ],
            'subjects' => [
                'id' => [
                    'title' => 'Mata Pelajaran',
                    'list' => ['Calistung', 'Mengaji', 'Matematika', 'Bahasa Inggris', 'IPA', 'IPS', 'Pelajaran Umum'],
                ],
                'en' => [
                    'title' => 'Subjects',
                    'list' => [
                        'Reading, Writing, Counting',
                        'Quran Recitation',
                        'Mathematics',
                        'English',
                        'Science',
                        'Social Studies',
                        'General Subjects',
                    ],
                ],
            ],
            'bankSoalContent' => [
                'id' => [
                    'eyebrow' => 'Fitur Unggulan',
                    'title' => 'Bank Soal Unggulan',
                    'subtitle' => 'Latihan soal berkualitas yang memperkuat pemahaman dan kesiapan ujian.',
                    'offline' => [
                        'title' => 'Bank Soal Offline',
                        'description' => 'Modul latihan dan evaluasi saat pembelajaran tatap muka.',
                    ],
                    'online' => [
                        'title' => 'Bank Soal Online',
                        'description' => 'Latihan mandiri, try out, dan persiapan olimpiade.',
                    ],
                    'viewDetail' => 'Lihat Detail',
                    'filterAll' => 'Semua',
                    'questionCount' => 'soal',
                ],
                'en' => [
                    'eyebrow' => 'Featured',
                    'title' => 'Featured Question Bank',
                    'subtitle' => 'Quality practice modules that strengthen mastery and exam readiness.',
                    'offline' => [
                        'title' => 'Offline Question Bank',
                        'description' => 'Practice modules and evaluation during face-to-face sessions.',
                    ],
                    'online' => [
                        'title' => 'Online Question Bank',
                        'description' => 'Self-practice, try outs, and olympiad preparation.',
                    ],
                    'viewDetail' => 'View Detail',
                    'filterAll' => 'All',
                    'questionCount' => 'questions',
                ],
            ],
            'bankSoalPasskey' => 'ALCBANKSOAL2024',
            'bankSoalCategories' => [
                'id' => ['Matematika', 'Bahasa Inggris', 'IPA', 'Try Out', 'Olimpiade'],
                'en' => ['Mathematics', 'English', 'Science', 'Try Out', 'Olympiad'],
            ],
            'bankSoalItems' => [
                [
                    'id' => 1,
                    'slug' => 'matematika-sd-paket-1',
                    'name' => ['id' => 'Matematika SD - Paket 1', 'en' => 'Elementary Math - Package 1'],
                    'category' => ['id' => 'Matematika', 'en' => 'Mathematics'],
                    'level' => ['id' => 'SD', 'en' => 'Elementary'],
                    'format' => 'Offline',
                    'questions' => 120,
                    'description' => [
                        'id' => 'Latihan soal matematika dasar untuk siswa SD kelas 1-3.',
                        'en' => 'Basic mathematics practice for elementary students grade 1-3.',
                    ],
                    'tone' => 'violet',
                ],
                [
                    'id' => 2,
                    'slug' => 'bahasa-inggris-smp-paket-2',
                    'name' => ['id' => 'Bahasa Inggris SMP - Paket 2', 'en' => 'Junior High English - Package 2'],
                    'category' => ['id' => 'Bahasa Inggris', 'en' => 'English'],
                    'level' => ['id' => 'SMP', 'en' => 'Junior High'],
                    'format' => 'Online',
                    'questions' => 90,
                    'description' => [
                        'id' => 'Latihan grammar, vocabulary, dan reading comprehension.',
                        'en' => 'Practice grammar, vocabulary, and reading comprehension.',
                    ],
                    'tone' => 'amber',
                ],
                [
                    'id' => 3,
                    'slug' => 'try-out-olimpiade-ipa',
                    'name' => ['id' => 'Try Out Olimpiade IPA', 'en' => 'Science Olympiad Try Out'],
                    'category' => ['id' => 'Olimpiade', 'en' => 'Olympiad'],
                    'level' => ['id' => 'SMA', 'en' => 'Senior High'],
                    'format' => 'Online',
                    'questions' => 75,
                    'description' => [
                        'id' => 'Simulasi soal olimpiade IPA tingkat nasional.',
                        'en' => 'National level science olympiad simulation.',
                    ],
                    'tone' => 'rose',
                ],
                [
                    'id' => 4,
                    'slug' => 'ipa-sd-paket-1',
                    'name' => ['id' => 'IPA SD - Paket 1', 'en' => 'Elementary Science - Package 1'],
                    'category' => ['id' => 'IPA', 'en' => 'Science'],
                    'level' => ['id' => 'SD', 'en' => 'Elementary'],
                    'format' => 'Hybrid',
                    'questions' => 100,
                    'description' => [
                        'id' => 'Soal IPA tematik untuk siswa SD kelas 4-6.',
                        'en' => 'Thematic science questions for elementary grade 4-6.',
                    ],
                    'tone' => 'green',
                ],
                [
                    'id' => 5,
                    'slug' => 'try-out-un-smp',
                    'name' => ['id' => 'Try Out UN SMP', 'en' => 'Junior High National Exam Try Out'],
                    'category' => ['id' => 'Try Out', 'en' => 'Try Out'],
                    'level' => ['id' => 'SMP', 'en' => 'Junior High'],
                    'format' => 'Online',
                    'questions' => 150,
                    'description' => [
                        'id' => 'Simulasi ujian nasional lengkap untuk siswa SMP.',
                        'en' => 'Complete national exam simulation for junior high students.',
                    ],
                    'tone' => 'blue',
                ],
                [
                    'id' => 6,
                    'slug' => 'matematika-olimpiade-sd',
                    'name' => ['id' => 'Matematika Olimpiade SD', 'en' => 'Elementary Math Olympiad'],
                    'category' => ['id' => 'Olimpiade', 'en' => 'Olympiad'],
                    'level' => ['id' => 'SD', 'en' => 'Elementary'],
                    'format' => 'Hybrid',
                    'questions' => 80,
                    'description' => [
                        'id' => 'Persiapan olimpiade matematika tingkat SD.',
                        'en' => 'Elementary level math olympiad preparation.',
                    ],
                    'tone' => 'violet',
                ],
            ],
            'sectionTitles' => [
                'id' => [
                    'hero' => [
                        'title' => 'Pendampingan Belajar yang Aman, Nyaman, dan Terarah',
                        'description' => 'Kami hadir dengan metode pembelajaran yang personal, interaktif, dan penuh perhatian untuk membantu anak berkembang secara akademik dan berkarakter.',
                    ],
                    'why' => [
                        'eyebrow' => 'ALC',
                        'title' => 'Kenapa Memilih Ar Rayyan Learning Course',
                        'subtitle' => 'Pendampingan belajar yang aman, nyaman, dan terarah dengan metode personal dan penuh perhatian.',
                    ],
                    'profile' => [
                        'eyebrow' => 'ALC',
                        'title' => 'Profil Lembaga',
                        'subtitle' => 'Ar Rayyan Learning Course membangun lingkungan belajar yang aman, nyaman, dan penuh perhatian.',
                    ],
                    'education' => [
                        'eyebrow' => 'Akademik',
                        'title' => 'Jenjang Pendidikan & Mata Pelajaran',
                        'subtitle' => 'Layanan pendidikan untuk berbagai jenjang dengan beragam mata pelajaran.',
                    ],
                    'program' => [
                        'eyebrow' => 'Program',
                        'title' => 'Program & Paket Belajar',
                        'subtitle' => 'Paket belajar yang fleksibel untuk kebutuhan siswa dan keluarga.',
                    ],
                    'gallery' => [
                        'eyebrow' => 'Galeri',
                        'title' => 'Galeri Kegiatan',
                        'subtitle' => 'Dokumentasi aktivitas belajar dan kegiatan ALC.',
                    ],
                    'olympiad' => [
                        'eyebrow' => 'Prestasi',
                        'title' => 'Info Olimpiade',
                        'subtitle' => 'Pantau jadwal lomba dan persiapan prestasi siswa.',
                    ],
                    'register' => [
                        'eyebrow' => 'Join Us',
                        'title' => 'Pendaftaran',
                        'subtitle' => 'Ajak anak belajar bersama ALC atau bergabung menjadi pengajar.',
                    ],
                    'contact' => [
                        'eyebrow' => 'Hubungi Kami',
                        'title' => 'Kontak & Informasi',
                        'subtitle' => 'Hubungi kami untuk konsultasi program belajar terbaik.',
                    ],
                ],
                'en' => [
                    'hero' => [
                        'title' => 'Safe, Comfortable, and Guided Learning Support',
                        'description' => 'We provide personal, interactive, and caring learning methods to help children grow academically and build strong character.',
                    ],
                    'why' => [
                        'eyebrow' => 'ALC',
                        'title' => 'Why Choose Ar Rayyan Learning Course',
                        'subtitle' => 'Safe, comfortable, and guided learning support with personal and caring methods.',
                    ],
                    'profile' => [
                        'eyebrow' => 'ALC',
                        'title' => 'Institution Profile',
                        'subtitle' => 'Ar Rayyan Learning Course builds a safe, comfortable, and caring learning environment.',
                    ],
                    'education' => [
                        'eyebrow' => 'Academic',
                        'title' => 'Education Levels & Subjects',
                        'subtitle' => 'Education services across various levels with a wide range of subjects.',
                    ],
                    'program' => [
                        'eyebrow' => 'Program',
                        'title' => 'Learning Programs & Packages',
                        'subtitle' => 'Flexible learning packages tailored to every student.',
                    ],
                    'gallery' => [
                        'eyebrow' => 'Gallery',
                        'title' => 'Activity Gallery',
                        'subtitle' => 'Snapshots of learning activities and ALC events.',
                    ],
                    'olympiad' => [
                        'eyebrow' => 'Achievement',
                        'title' => 'Olympiad Info',
                        'subtitle' => 'Stay updated with competitions and schedules.',
                    ],
                    'register' => [
                        'eyebrow' => 'Join Us',
                        'title' => 'Registration',
                        'subtitle' => 'Enroll your child or join as an inspiring teacher at ALC.',
                    ],
                    'contact' => [
                        'eyebrow' => 'Contact Us',
                        'title' => 'Contact & Information',
                        'subtitle' => 'Reach us anytime for the best learning consultation.',
                    ],
                ],
            ],
            'ctaButtons' => [
                'id' => [
                    'primary' => 'Daftar Sekarang',
                    'secondary' => 'Lihat Program Belajar',
                    'studentRegister' => 'Pendaftaran Murid',
                    'teacherRegister' => 'Pendaftaran Pengajar',
                    'viewMap' => 'Lihat Peta',
                    'viewOlympiad' => 'Lihat detail olimpiade',
                ],
                'en' => [
                    'primary' => 'Enroll Now',
                    'secondary' => 'Explore Programs',
                    'studentRegister' => 'Student Registration',
                    'teacherRegister' => 'Teacher Registration',
                    'viewMap' => 'View Map',
                    'viewOlympiad' => 'View olympiad details',
                ],
            ],
            'packages' => [
                [
                    'id' => 'reguler',
                    'name' => [
                        'id' => 'Reguler (Kelompok)',
                        'en' => 'Regular (Group)',
                    ],
                    'level' => [
                        'id' => 'Pra TK - SMA',
                        'en' => 'Pre-K - Senior High',
                    ],
                    'sessions' => [
                        'id' => '8 pertemuan / bulan',
                        'en' => '8 sessions / month',
                    ],
                    'mode' => [
                        'id' => 'Offline',
                        'en' => 'Offline',
                    ],
                    'description' => [
                        'id' => 'Program belajar berkelompok dengan jumlah terbatas (maksimal 5 murid) untuk menjaga kualitas pembelajaran. Didesain interaktif dan terarah.',
                        'en' => 'Group learning program with limited students (max 5) to maintain quality. Designed to be interactive and guided.',
                    ],
                    'highlights' => [
                        'id' => ['Maksimal 5 murid per kelompok', 'Interaktif dan terarah', 'Biaya terjangkau'],
                        'en' => ['Maximum 5 students per group', 'Interactive and guided', 'Affordable pricing'],
                    ],
                ],
                [
                    'id' => 'privat',
                    'name' => [
                        'id' => 'Privat',
                        'en' => 'Private',
                    ],
                    'level' => [
                        'id' => 'Pra TK - SMA',
                        'en' => 'Pre-K - Senior High',
                    ],
                    'sessions' => [
                        'id' => 'Fleksibel (8, 12, 16, atau 20 pertemuan / bulan)',
                        'en' => 'Flexible (8, 12, 16, or 20 sessions / month)',
                    ],
                    'mode' => [
                        'id' => 'Offline / Online',
                        'en' => 'Offline / Online',
                    ],
                    'description' => [
                        'id' => 'Layanan belajar eksklusif satu guru satu murid. Tentor berpengalaman datang langsung ke rumah siswa untuk pendampingan yang fokus dan optimal.',
                        'en' => "Exclusive one-on-one learning. Experienced tutors come directly to the student's home for focused and optimal guidance.",
                    ],
                    'highlights' => [
                        'id' => ['Satu guru satu murid', 'Jadwal fleksibel', 'Bisa ke rumah atau online'],
                        'en' => ['One tutor per student', 'Flexible schedule', 'Home visit or online'],
                    ],
                ],
                [
                    'id' => 'olimpiade',
                    'name' => [
                        'id' => 'Persiapan Ujian / Olimpiade',
                        'en' => 'Exam / Olympiad Preparation',
                    ],
                    'level' => [
                        'id' => 'SD - SMA',
                        'en' => 'Elementary - Senior High',
                    ],
                    'sessions' => [
                        'id' => 'Fleksibel',
                        'en' => 'Flexible',
                    ],
                    'mode' => [
                        'id' => 'Offline / Online',
                        'en' => 'Offline / Online',
                    ],
                    'description' => [
                        'id' => 'Program intensif dan terstruktur untuk siswa yang ingin hasil maksimal. Fokus pada pendalaman materi, latihan soal berkualitas, dan strategi pengerjaan secara sistematis.',
                        'en' => 'Intensive and structured program for students aiming for maximum results. Focus on in-depth material, quality practice questions, and systematic problem-solving strategies.',
                    ],
                    'highlights' => [
                        'id' => ['Pendalaman materi', 'Latihan soal berkualitas', 'Strategi pengerjaan sistematis'],
                        'en' => ['In-depth material', 'Quality practice questions', 'Systematic strategies'],
                    ],
                ],
            ],
            'gallery' => [
                'items' => [],
            ],
            'olympiadHighlights' => [
                [
                    'id' => 'osn',
                    'name' => [
                        'id' => 'Olimpiade Sains Nasional',
                        'en' => 'National Science Olympiad',
                    ],
                    'level' => [
                        'id' => 'SD - SMA',
                        'en' => 'Elementary - Senior High',
                    ],
                    'schedule' => [
                        'id' => 'Februari - April',
                        'en' => 'February - April',
                    ],
                    'category' => [
                        'id' => 'Gratis',
                        'en' => 'Free',
                    ],
                ],
                [
                    'id' => 'mic',
                    'name' => [
                        'id' => 'Matematika Islami Challenge',
                        'en' => 'Islamic Mathematics Challenge',
                    ],
                    'level' => [
                        'id' => 'SD / SMP',
                        'en' => 'Elementary / Junior High',
                    ],
                    'schedule' => [
                        'id' => 'Mei - Juni',
                        'en' => 'May - June',
                    ],
                    'category' => [
                        'id' => 'Berbayar',
                        'en' => 'Paid',
                    ],
                ],
                [
                    'id' => 'eco',
                    'name' => [
                        'id' => 'English Creative Olympiad',
                        'en' => 'English Creative Olympiad',
                    ],
                    'level' => [
                        'id' => 'SMP / SMA',
                        'en' => 'Junior High / Senior High',
                    ],
                    'schedule' => [
                        'id' => 'Agustus',
                        'en' => 'August',
                    ],
                    'category' => [
                        'id' => 'Gratis',
                        'en' => 'Free',
                    ],
                ],
            ],
            'media' => [
                'heroImage' => [
                    'path' => null,
                    'alt' => [
                        'id' => 'Siswa ALC',
                        'en' => 'ALC student',
                    ],
                ],
                'aboutImage' => [
                    'path' => null,
                    'alt' => [
                        'id' => 'Kelas ALC',
                        'en' => 'ALC class',
                    ],
                ],
            ],
        ];

        $content['media']['logo'] = [
            'path' => null,
        ];

        $sections = $this->buildSectionPayloads($content);

        foreach ($sections as $slug => $payload) {
            PageContent::updateOrCreate(
                ['slug' => $slug],
                ['content' => $payload],
            );
        }

        foreach ($content['bankSoalItems'] ?? [] as $item) {
            if (! isset($item['slug'])) {
                continue;
            }
            BankSoal::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name' => $item['name'] ?? ['id' => '', 'en' => ''],
                    'category' => $item['category'] ?? ['id' => '', 'en' => ''],
                    'level' => $item['level'] ?? ['id' => '', 'en' => ''],
                    'format' => $item['format'] ?? null,
                    'questions' => $item['questions'] ?? 0,
                    'description' => $item['description'] ?? ['id' => '', 'en' => ''],
                    'tone' => $item['tone'] ?? 'violet',
                    'is_active' => true,
                ],
            );
        }

        foreach ($content['packages'] ?? [] as $package) {
            $name = $package['name']['id'] ?? ($package['name'] ?? null);
            if (! $name) {
                continue;
            }

            Program::updateOrCreate(
                ['name' => $name],
                [
                    'level' => $package['level']['id'] ?? ($package['level'] ?? null),
                    'description' => $package['description']['id'] ?? ($package['description'] ?? null),
                    'subjects' => $package['highlights']['id'] ?? ($package['highlights'] ?? []),
                    'is_active' => true,
                ],
            );
        }

        foreach ($content['olympiadHighlights'] ?? [] as $item) {
            $name = $item['name']['id'] ?? ($item['name'] ?? null);
            if (! $name) {
                continue;
            }

            $categoryLabel = strtolower((string) ($item['category']['id'] ?? ($item['category'] ?? 'free')));
            $category = in_array($categoryLabel, ['berbayar', 'paid'], true) ? 'paid' : 'free';

            Olympiad::updateOrCreate(
                ['name' => $name],
                [
                    'level' => $item['level']['id'] ?? ($item['level'] ?? 'Semua Jenjang'),
                    'schedule' => $item['schedule']['id'] ?? ($item['schedule'] ?? null),
                    'category' => $category,
                    'is_active' => true,
                ],
            );
        }
    }

    private function buildSectionPayloads(array $content): array
    {
        $sectionTitles = $content['sectionTitles'] ?? [];
        $media = $content['media'] ?? [];

        $payloads = [
            'hero' => array_filter([
                'siteConfig' => $content['siteConfig'] ?? null,
                'heroContent' => $content['heroContent'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['hero']),
                'media' => $this->pickMedia($media, ['heroImage']),
            ]),
            'why' => array_filter([
                'featureCards' => $content['featureCards'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['why']),
            ]),
            'profile' => array_filter([
                'aboutContent' => $content['aboutContent'] ?? null,
                'visionMission' => $content['visionMission'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['profile']),
                'media' => $this->pickMedia($media, ['aboutImage']),
            ]),
            'education' => array_filter([
                'educationLevels' => $content['educationLevels'] ?? null,
                'subjects' => $content['subjects'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['education']),
            ]),
            'program' => array_filter([
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['program']),
            ]),
            'gallery' => array_filter([
                'gallery' => $content['gallery'] ?? null,
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['gallery']),
            ]),
            'stats' => array_filter([
                'stats' => $content['stats'] ?? null,
            ]),
            'bank-soal' => array_filter([
                'bankSoalContent' => $content['bankSoalContent'] ?? null,
                'bankSoalPasskey' => $content['bankSoalPasskey'] ?? null,
                'bankSoalCategories' => $content['bankSoalCategories'] ?? null,
            ]),
            'cta' => array_filter([
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['olympiad', 'register']),
                'ctaButtons' => $content['ctaButtons'] ?? null,
            ]),
            'contact' => array_filter([
                'sectionTitles' => $this->pickSectionTitles($sectionTitles, ['contact']),
                'contactInfo' => $content['contactInfo'] ?? null,
                'operatingHours' => $content['operatingHours'] ?? null,
            ]),
            'logo' => array_filter([
                'media' => $this->pickMedia($media, ['logo']),
            ]),
        ];

        return array_filter($payloads);
    }

    private function pickSectionTitles(array $sectionTitles, array $keys): array
    {
        $result = [];
        foreach (['id', 'en'] as $lang) {
            foreach ($keys as $key) {
                $value = $sectionTitles[$lang][$key] ?? null;
                if ($value !== null) {
                    $result[$lang][$key] = $value;
                }
            }
        }

        return $result;
    }

    private function pickMedia(array $media, array $keys): array
    {
        $picked = [];
        foreach ($keys as $key) {
            if (isset($media[$key])) {
                $picked[$key] = $media[$key];
            }
        }

        return $picked;
    }
}
