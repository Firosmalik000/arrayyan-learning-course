/**
 * Home page data
 * All content specific to the home/landing page
 */

export const heroContent = {
    badges: {
        id: [
            { title: 'Aman & Nyaman', detail: 'Lingkungan belajar' },
            { title: 'Personal', detail: 'Sesuai kebutuhan anak' },
            { title: 'Berkarakter', detail: 'Akademik & adab' },
        ],
        en: [
            { title: 'Safe & Comfortable', detail: 'Learning environment' },
            { title: 'Personal', detail: 'Tailored to each child' },
            { title: 'Character-focused', detail: 'Academic & manners' },
        ],
    },
    panels: {
        left: {
            id: { title: '15+ kelas aktif', subtitle: 'Senin - Sabtu' },
            en: { title: '15+ active classes', subtitle: 'Monday - Saturday' },
        },
        right: {
            id: { title: '98% orang tua', subtitle: 'Puas dengan progres' },
            en: { title: '98% of parents', subtitle: 'Satisfied with progress' },
        },
    },
};

export const featureCards = {
    id: [
        {
            title: 'Pembelajaran Personal',
            description: 'Metode pembelajaran disesuaikan dengan kebutuhan masing-masing anak.',
            icon: 'user',
            tone: 'violet',
        },
        {
            title: 'Interaktif & Terarah',
            description: 'Pendampingan belajar yang sabar, fokus, dan menyenangkan.',
            icon: 'book',
            tone: 'amber',
        },
        {
            title: 'Pembentukan Karakter',
            description: 'Menanamkan nilai adab, akhlak, dan semangat belajar.',
            icon: 'heart',
            tone: 'rose',
        },
    ],
    en: [
        {
            title: 'Personal Learning',
            description: "Learning methods tailored to each child's needs.",
            icon: 'user',
            tone: 'violet',
        },
        {
            title: 'Interactive & Guided',
            description: 'Patient, focused, and enjoyable learning support.',
            icon: 'book',
            tone: 'amber',
        },
        {
            title: 'Character Building',
            description: 'Instilling values of manners, character, and passion for learning.',
            icon: 'heart',
            tone: 'rose',
        },
    ],
};

export const aboutContent = {
    id: {
        title: 'Tentang Kami',
        description:
            'Ar Rayyan Learning Course menghadirkan bimbingan belajar personal yang memadukan penguasaan akademik terarah dengan pembiasaan adab dan akhlak mulia. Kami mendampingi setiap anak memahami konsep pelajaran secara mendalam, percaya diri, dan mencintai proses belajar.',
        valuesTitle: 'Nilai Utama',
        values: ['Aman & Nyaman', 'Terarah & Personal', 'Berkarakter'],
        panelTitle: '25+ aktivitas belajar',
        panelSubtitle: 'Per pekan bersama ALC',
    },
    en: {
        title: 'About Us',
        description:
            'Ar Rayyan Learning Course delivers personalized tutoring that harmonizes academic mastery with strong Islamic character building. We empower every child to understand concepts deeply, build confidence, and cultivate a genuine love for learning.',
        valuesTitle: 'Core Values',
        values: ['Safe & Comfortable', 'Guided & Personal', 'Character-focused'],
        panelTitle: '25+ learning activities',
        panelSubtitle: 'Per week with ALC',
    },
};

export const visionMission = {
    id: {
        visionTitle: 'Visi',
        vision:
            'Menjadi lembaga bimbingan belajar yang aman, terpercaya, dan berkualitas dalam mendampingi anak berkembang secara akademik dan berkarakter.',
        missionTitle: 'Misi',
        missionList: [
            'Memberikan pendampingan belajar yang personal, sabar, dan terarah sesuai kebutuhan setiap anak.',
            'Menciptakan lingkungan belajar yang nyaman dan menyenangkan agar anak percaya diri dan termotivasi.',
            'Menanamkan nilai adab, akhlak, dan semangat belajar dalam setiap proses pembelajaran.',
        ],
    },
    en: {
        visionTitle: 'Vision',
        vision:
            'To be a safe, trusted, and quality tutoring institution in supporting children to grow academically and build strong character.',
        missionTitle: 'Mission',
        missionList: [
            "Provide personal, patient, and guided learning support according to each child's needs.",
            'Create a comfortable and enjoyable learning environment so children feel confident and motivated.',
            'Instill values of manners, character, and passion for learning in every learning process.',
        ],
    },
};

export const educationLevels = {
    id: {
        title: 'Jenjang Pendidikan',
        levels: ['Pra TK', 'TK', 'SD', 'SMP', 'SMA'],
    },
    en: {
        title: 'Education Levels',
        levels: ['Pre-K', 'Kindergarten', 'Elementary', 'Junior High', 'Senior High'],
    },
};

export const subjects = {
    id: {
        title: 'Mata Pelajaran',
        list: ['Calistung', 'Mengaji', 'Matematika', 'Bahasa Inggris', 'IPA', 'IPS', 'Pelajaran Umum'],
    },
    en: {
        title: 'Subjects',
        list: [
            'Reading, Writing, Counting',
            'Quran Recitation',
            'Mathematics',
            'English',
            'Science',
            'Social Studies',
            'General Subjects',
        ],
    },
};

export const programContent = {
    id: {
        fallbackDescription: 'Informasi program belajar.',
        levelLabel: 'Jenjang',
        sessionsLabel: 'Pertemuan',
    },
    en: {
        fallbackDescription: 'Learning program information.',
        levelLabel: 'Level',
        sessionsLabel: 'Sessions',
    },
};

export const bankSoalContent = {
    id: {
        eyebrow: 'Fitur Unggulan',
        title: 'Bank Soal Unggulan',
        subtitle: 'Latihan soal berkualitas yang memperkuat pemahaman dan kesiapan ujian.',
        offline: {
            title: 'Bank Soal Offline',
            description: 'Modul latihan dan evaluasi saat pembelajaran tatap muka.',
        },
        online: {
            title: 'Bank Soal Online',
            description: 'Latihan mandiri, try out, dan persiapan olimpiade.',
        },
        viewDetail: 'Lihat Detail',
        filterAll: 'Semua',
        questionCount: 'soal',
    },
    en: {
        eyebrow: 'Featured',
        title: 'Featured Question Bank',
        subtitle: 'Quality practice modules that strengthen mastery and exam readiness.',
        offline: {
            title: 'Offline Question Bank',
            description: 'Practice modules and evaluation during face-to-face sessions.',
        },
        online: {
            title: 'Online Question Bank',
            description: 'Self-practice, try outs, and olympiad preparation.',
        },
        viewDetail: 'View Detail',
        filterAll: 'All',
        questionCount: 'questions',
    },
};

export const bankSoalPageContent = {
    id: {
        title: 'Bank Soal',
        description: 'Koleksi lengkap soal latihan untuk semua jenjang pendidikan',
        searchPlaceholder: 'Cari soal...',
        noResults: 'Tidak ada soal yang ditemukan',
        backToHome: 'Kembali ke Beranda',
        formatAll: 'Semua Format',
        categoryAll: 'Semua Kategori',
    },
    en: {
        title: 'Question Bank',
        description: 'Complete collection of practice questions for all education levels',
        searchPlaceholder: 'Search questions...',
        noResults: 'No questions found',
        backToHome: 'Back to Home',
        formatAll: 'All Formats',
        categoryAll: 'All Categories',
    },
};

export const olympiadContent = {
    id: {
        free: {
            badge: 'Gratis',
            title: 'Olimpiade Gratis',
            description:
                'Program persiapan olimpiade nasional dan internasional tanpa biaya pendaftaran.',
        },
        paid: {
            badge: 'Berbayar',
            title: 'Olimpiade Premium',
            description:
                'Program kompetisi eksklusif dengan mentoring intensif dan materi persiapan yang komprehensif.',
        },
    },
    en: {
        free: {
            badge: 'Free',
            title: 'Free Olympiad',
            description:
                'National and international olympiad preparation programs without registration fees.',
        },
        paid: {
            badge: 'Paid',
            title: 'Premium Olympiad',
            description:
                'Exclusive competition programs with intensive mentoring and comprehensive preparation materials.',
        },
    },
};

export const bankSoalItems = [
    {
        id: 1,
        slug: 'matematika-sd-paket-1',
        name: { id: 'Matematika SD - Paket 1', en: 'Elementary Math - Package 1' },
        category: { id: 'Matematika', en: 'Mathematics' },
        level: { id: 'SD', en: 'Elementary' },
        format: 'Offline',
        questions: 120,
        description: {
            id: 'Latihan soal matematika dasar untuk siswa SD kelas 1-3.',
            en: 'Basic mathematics practice for elementary students grade 1-3.',
        },
        tone: 'violet',
    },
    {
        id: 2,
        slug: 'bahasa-inggris-smp-paket-2',
        name: { id: 'Bahasa Inggris SMP - Paket 2', en: 'Junior High English - Package 2' },
        category: { id: 'Bahasa Inggris', en: 'English' },
        level: { id: 'SMP', en: 'Junior High' },
        format: 'Online',
        questions: 90,
        description: {
            id: 'Latihan grammar, vocabulary, dan reading comprehension.',
            en: 'Practice grammar, vocabulary, and reading comprehension.',
        },
        tone: 'amber',
    },
    {
        id: 3,
        slug: 'try-out-olimpiade-ipa',
        name: { id: 'Try Out Olimpiade IPA', en: 'Science Olympiad Try Out' },
        category: { id: 'Olimpiade', en: 'Olympiad' },
        level: { id: 'SMA', en: 'Senior High' },
        format: 'Online',
        questions: 75,
        description: {
            id: 'Simulasi soal olimpiade IPA tingkat nasional.',
            en: 'National level science olympiad simulation.',
        },
        tone: 'rose',
    },
    {
        id: 4,
        slug: 'ipa-sd-paket-1',
        name: { id: 'IPA SD - Paket 1', en: 'Elementary Science - Package 1' },
        category: { id: 'IPA', en: 'Science' },
        level: { id: 'SD', en: 'Elementary' },
        format: 'Hybrid',
        questions: 100,
        description: {
            id: 'Soal IPA tematik untuk siswa SD kelas 4-6.',
            en: 'Thematic science questions for elementary grade 4-6.',
        },
        tone: 'green',
    },
    {
        id: 5,
        slug: 'try-out-un-smp',
        name: { id: 'Try Out UN SMP', en: 'Junior High National Exam Try Out' },
        category: { id: 'Try Out', en: 'Try Out' },
        level: { id: 'SMP', en: 'Junior High' },
        format: 'Online',
        questions: 150,
        description: {
            id: 'Simulasi ujian nasional lengkap untuk siswa SMP.',
            en: 'Complete national exam simulation for junior high students.',
        },
        tone: 'blue',
    },
    {
        id: 6,
        slug: 'matematika-olimpiade-sd',
        name: { id: 'Matematika Olimpiade SD', en: 'Elementary Math Olympiad' },
        category: { id: 'Olimpiade', en: 'Olympiad' },
        level: { id: 'SD', en: 'Elementary' },
        format: 'Hybrid',
        questions: 80,
        description: {
            id: 'Persiapan olimpiade matematika tingkat SD.',
            en: 'Elementary level math olympiad preparation.',
        },
        tone: 'violet',
    },
];

export const sectionTitles = {
    id: {
        hero: {
            title: 'Pendampingan Belajar yang Aman, Nyaman, dan Terarah',
            description:
                'Kami hadir dengan metode pembelajaran yang personal, interaktif, dan penuh perhatian untuk membantu anak berkembang secara akademik dan berkarakter.',
        },
        why: {
            eyebrow: 'Keunggulan ALC',
            title: 'Keunggulan Belajar di Ar Rayyan Learning Course',
            subtitle: 'Kombinasi pendampingan akademik personal, lingkungan belajar yang nyaman, dan pembiasaan adab islami.',
        },
        profile: {
            eyebrow: 'Profil Lembaga',
            title: 'Membangun Generasi Cerdas & Berakhlak Mulia',
            subtitle: 'Berkomitmen mendampingi setiap anak menemukan potensi terbaiknya melalui bimbingan yang terarah.',
        },
        education: {
            eyebrow: 'Kurikulum & Jenjang',
            title: 'Jenjang Pendidikan & Bidang Studi Terpadu',
            subtitle: 'Pendampingan komprehensif dari tingkat usia dini hingga persiapan kelulusan dan seleksi sekolah favorit.',
        },
        program: {
            eyebrow: 'Program Pilihan',
            title: 'Pilihan Program Belajar Unggulan',
            subtitle: 'Pilihan kelas privat dan kelompok dengan metode fleksibel secara tatap muka maupun daring.',
        },
        gallery: {
            eyebrow: 'Galeri Kegiatan',
            title: 'Potret Aktivitas Belajar ALC',
            subtitle: 'Dokumentasi nyata antusiasme belajar siswa dalam suasana kelas yang suportif dan inspiratif.',
        },
        olympiad: {
            eyebrow: 'Pusat Prestasi',
            title: 'Pusat Prestasi & Pembinaan Lomba',
            subtitle: 'Jadwal kompetisi terkurasi dan program pendampingan intensif untuk mengukir prestasi gemilang.',
        },
        register: {
            eyebrow: 'Pendaftaran',
            title: 'Mulai Perjalanan Prestasi Bersama ALC',
            subtitle: 'Daftarkan putra-putri Anda sekarang atau bergabunglah menjadi tenaga pendidik berdedikasi.',
        },
        journey: {
            eyebrow: 'Metode & Alur Belajar',
            title: '4 Langkah Pendampingan Belajar di ALC',
            subtitle: 'Alur terstruktur dan terukur untuk memastikan setiap anak berkembang dengan bahagia dan berprestasi.',
        },
        testimonials: {
            eyebrow: 'Cerita Orang Tua',
            title: 'Kisah Sukses & Kepercayaan Keluarga ALC',
            subtitle: 'Dukungan nyata kami yang telah membantu ratusan siswa mencapai potensi terbaik dan prestasi impian.',
        },
        faqs: {
            eyebrow: 'Tanya Jawab',
            title: 'Pertanyaan yang Sering Diajukan',
            subtitle: 'Jawaban lengkap atas pertanyaan yang paling sering diajukan orang tua sebelum memulai bimbingan.',
        },
        contact: {
            eyebrow: 'Hubungi Kami',
            title: 'Konsultasi & Informasi Pembelajaran',
            subtitle: 'Tim kami siap membantu menjawab pertanyaan dan merancang program belajar terbaik untuk anak Anda.',
        },
    },
    en: {
        hero: {
            title: 'Safe, Comfortable, and Guided Learning Support',
            description:
                'We provide personal, interactive, and caring learning methods to help children grow academically and build strong character.',
        },
        why: {
            eyebrow: 'ALC',
            title: 'Why Choose Ar Rayyan Learning Course',
            subtitle: 'Safe, comfortable, and guided learning support with personal and caring methods.',
        },
        profile: {
            eyebrow: 'ALC',
            title: 'Institution Profile',
            subtitle: 'Ar Rayyan Learning Course builds a safe, comfortable, and caring learning environment.',
        },
        education: {
            eyebrow: 'Academic',
            title: 'Education Levels & Subjects',
            subtitle: 'Education services across various levels with a wide range of subjects.',
        },
        program: {
            eyebrow: 'Program',
            title: 'Learning Programs & Packages',
            subtitle: 'Flexible learning packages tailored to every student.',
        },
        gallery: {
            eyebrow: 'Gallery',
            title: 'Activity Gallery',
            subtitle: 'Snapshots of learning activities and ALC events.',
        },
        olympiad: {
            eyebrow: 'Achievement',
            title: 'Olympiad Info',
            subtitle: 'Stay updated with competitions and schedules.',
        },
        register: {
            eyebrow: 'Join Us',
            title: 'Registration',
            subtitle: 'Enroll your child or join as an inspiring teacher at ALC.',
        },
        journey: {
            eyebrow: 'Learning Method',
            title: '4-Step Learning Journey at ALC',
            subtitle: 'A structured, measurable process to ensure every child learns happily and excels.',
        },
        testimonials: {
            eyebrow: 'Parent Stories',
            title: 'Success Stories & Family Trust',
            subtitle: 'Real stories from parents who have witnessed their children thrive and achieve their dreams.',
        },
        faqs: {
            eyebrow: 'FAQ',
            title: 'Frequently Asked Questions',
            subtitle: 'Comprehensive answers to common questions asked by parents before enrolling.',
        },
        contact: {
            eyebrow: 'Contact Us',
            title: 'Contact & Information',
            subtitle: 'Reach us anytime for the best learning consultation.',
        },
    },
};

export const learningJourney = {
    id: [
        {
            step: '01',
            title: 'Konsultasi & Asesmen Awal',
            description: 'Kami memetakan kemampuan akademik, gaya belajar (visual/auditori/kinestetik), serta target prestasi spesifik anak.',
            icon: 'clipboard',
            badge: 'Gratis',
        },
        {
            step: '02',
            title: 'Penyusunan Kurikulum Personal',
            description: 'Rencana belajar disusun sinkron dengan kurikulum sekolah (Merdeka/K13/Cambridge) dan dipasangkan dengan tutor yang paling cocok.',
            icon: 'target',
            badge: 'Personal',
        },
        {
            step: '03',
            title: 'Pendampingan Intensif & Adab',
            description: 'Sesi belajar interaktif, sabar, dan kontekstual dengan penguatan adab Islami di setiap awal dan akhir pembelajaran.',
            icon: 'book',
            badge: 'Interaktif',
        },
        {
            step: '04',
            title: 'Laporan Progres Berkala',
            description: 'Orang tua menerima laporan berkala perkembangan pemahaman materi, nilai kuis, dan catatan adab anak secara transparan.',
            icon: 'trophy',
            badge: 'Transparan',
        },
    ],
    en: [
        {
            step: '01',
            title: 'Consultation & Initial Assessment',
            description: 'We map academic mastery, learning styles (visual/auditory/kinesthetic), and specific achievement targets.',
            icon: 'clipboard',
            badge: 'Free',
        },
        {
            step: '02',
            title: 'Personalized Learning Plan',
            description: 'Syllabus is tailored to your school curriculum (Merdeka/National/Cambridge) and matched with the ideal tutor.',
            icon: 'target',
            badge: 'Tailored',
        },
        {
            step: '03',
            title: 'Intensive Mentoring & Character',
            description: 'Interactive, patient, and engaging sessions with Islamic values infused into every lesson.',
            icon: 'book',
            badge: 'Interactive',
        },
        {
            step: '04',
            title: 'Periodic Progress Reporting',
            description: 'Parents receive detailed periodic reports on concept mastery, test scores, and positive behavioral milestones.',
            icon: 'trophy',
            badge: 'Transparent',
        },
    ],
};

export const testimonials = {
    id: [
        {
            name: 'Ibu Nuraeni, S.Pd.',
            role: 'Orang Tua Siswa',
            student: 'Farhan (Kelas 5 SD - Finalis OSN IPA)',
            rating: 5,
            quote: 'Alhamdulillah sejak belajar di ALC, Farhan jadi jauh lebih mandiri dan tidak lagi takut menghadapi soal penalaran tinggi (HOTS). Tutornya luar biasa sabar dan selalu membiasakan adab belajar yang baik.',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
            highlight: 'Juara OSN IPA',
        },
        {
            name: 'Bapak Hendra Kusuma',
            role: 'Orang Tua Siswa',
            student: 'Alya (Kelas 9 SMP - Lolos SMA Negeri Favorit)',
            rating: 5,
            quote: 'Pendekatan tutor ALC sangat personal. Alya yang tadinya merasa sulit di Matematika dan Fisika justru sekarang jadi mata pelajaran favoritnya. Nilai rapornya naik signifikan dan alhamdulillah diterima di SMA impian.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
            highlight: 'Lolos SMA Favorit',
        },
        {
            name: 'dr. Siti Rahmawati',
            role: 'Orang Tua Siswa',
            student: 'Rayyan (Kelas 2 SD - Calistung & Mengaji)',
            rating: 5,
            quote: 'Metode belajarnya sangat ramah anak dan tidak bikin stres. Rayyan selalu antusias setiap hari bimbingan tiba. Kemampuan membaca dan mengaji Al-Qurannya berkembang sangat pesat dalam 3 bulan.',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
            highlight: 'Perkembangan Pesat',
        },
    ],
    en: [
        {
            name: 'Mrs. Nuraeni, S.Pd.',
            role: 'Parent',
            student: 'Farhan (5th Grade - Science Olympiad Finalist)',
            rating: 5,
            quote: 'Farhan has become noticeably more independent and confident with advanced analytical problems. The ALC tutors are remarkably patient and instill wonderful learning ethics.',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
            highlight: 'Olympiad Finalist',
        },
        {
            name: 'Mr. Hendra Kusuma',
            role: 'Parent',
            student: 'Alya (9th Grade - Accepted into Top High School)',
            rating: 5,
            quote: 'ALC personal approach made all the difference. Math and Physics used to be intimidating for Alya, but now they are her favorite subjects. Her GPA jumped and she got into her dream school.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
            highlight: 'Accepted to Top School',
        },
        {
            name: 'Dr. Siti Rahmawati',
            role: 'Parent',
            student: 'Rayyan (2nd Grade - Literacy & Quran Recitation)',
            rating: 5,
            quote: 'The learning environment is so warm and engaging without overwhelming young learners. Rayyan genuinely looks forward to his tutoring sessions. His Quran recitation improved dramatically.',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
            highlight: 'Rapid Progress',
        },
    ],
};

export const faqs = {
    id: [
        {
            question: 'Apakah kurikulum bimbingan di ALC disesuaikan dengan kurikulum sekolah anak?',
            answer: 'Ya, tentu. Tim pengajar ALC menyesuaikan materi pembelajaran dengan kurikulum yang digunakan di sekolah siswa masing-masing, baik Kurikulum Merdeka, Kurikulum 2013, maupun kurikulum bilingual/internasional (Cambridge), sehingga materi bimbel selalu sejalan dan membantu tugas serta ujian sekolah anak.',
        },
        {
            question: 'Bagaimana jika anak berhalangan hadir pada sesi bimbingan yang sudah dijadwalkan?',
            answer: 'Kami menyediakan kebijakan jadwal ulang (reschedule) yang fleksibel. Cukup informasikan kepada admin atau tutor minimal beberapa jam sebelum jadwal dimulai, dan sesi pengganti akan dikoordinasikan agar target jam belajar tetap terpenuhi.',
        },
        {
            question: 'Bagaimana standar kualifikasi para tutor pengajar di Ar Rayyan Learning Course?',
            answer: 'Semua tutor ALC melalui proses rekrutmen terstandarisasi, meliputi tes penguasaan materi akademik, simulasi mengajar (microteaching), verifikasi latar belakang akademik dari universitas terkemuka, serta pembekalan metode pedagogik ramah anak dan adab Islami.',
        },
        {
            question: 'Apakah orang tua mendapatkan laporan rutin perkembangan belajar dan adab anak?',
            answer: 'Ya. ALC menyediakan Lembar Progres Belajar (Progress Report) berkala yang memuat evaluasi pemahaman konsep, hasil latihan soal, keaktifan di kelas, serta catatan perkembangan adab yang dibagikan secara langsung kepada orang tua.',
        },
        {
            question: 'Bagaimana cara mendaftar dan apakah ada sesi konsultasi awal?',
            answer: 'Pendaftaran sangat mudah, Anda dapat mengisi formulir online di halaman Pendaftaran website ini atau menghubungi WhatsApp admin kami. Kami menyediakan sesi konsultasi dan pemetaan awal gratis untuk membantu Anda memilih program yang paling tepat bagi buah hati.',
        },
    ],
    en: [
        {
            question: 'Is the tutoring curriculum aligned with my child school curriculum?',
            answer: 'Yes. ALC tutors adapt materials directly to match your child school syllabus, whether Kurikulum Merdeka, National Curriculum, or Cambridge bilingual programs, ensuring full alignment with day-to-day school coursework.',
        },
        {
            question: 'What happens if my child cannot attend a scheduled session?',
            answer: 'We provide flexible rescheduling policies. Simply notify our admin or tutor a few hours in advance, and a makeup session will be scheduled so no learning hours or concepts are missed.',
        },
        {
            question: 'What are the qualifications of tutors at Ar Rayyan Learning Course?',
            answer: 'Every tutor undergoes rigorous evaluation including subject matter testing, microteaching demonstrations, background checks from top universities, and specialized training in positive pedagogy and Islamic character building.',
        },
        {
            question: 'Do parents receive regular progress reports on their child development?',
            answer: 'Yes. ALC delivers periodic Progress Reports outlining concept mastery, quiz outcomes, class participation, and behavioral milestones directly to parents.',
        },
        {
            question: 'How do I enroll and is there an initial consultation?',
            answer: 'Enrollment is straightforward via our online registration page or WhatsApp support. We offer a complimentary initial consultation and assessment to identify the best program for your child.',
        },
    ],
};

export const ctaButtons = {
    id: {
        primary: 'Daftar Sekarang',
        secondary: 'Lihat Program Belajar',
        studentRegister: 'Pendaftaran Murid',
        teacherRegister: 'Pendaftaran Pengajar',
        viewMap: 'Lihat Peta',
        viewOlympiad: 'Lihat detail olimpiade',
    },
    en: {
        primary: 'Enroll Now',
        secondary: 'Explore Programs',
        studentRegister: 'Student Registration',
        teacherRegister: 'Teacher Registration',
        viewMap: 'View Map',
        viewOlympiad: 'View olympiad details',
    },
};

export const galleryContent = {
    items: [],
};

