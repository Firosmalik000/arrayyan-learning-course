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
            'Ar Rayyan Learning Course adalah lembaga bimbingan belajar yang berfokus pada pendampingan belajar anak secara menyeluruh. Kami hadir untuk membantu siswa memahami pelajaran dengan lebih baik melalui metode pembelajaran yang terarah, interaktif, dan disesuaikan dengan kebutuhan masing-masing anak.\n\nKami meyakini bahwa setiap anak memiliki potensi unik. Oleh karena itu, Ar Rayyan Learning Course tidak hanya menekankan pada peningkatan akademik, tetapi juga pada pembentukan karakter, adab, dan semangat belajar. Dengan lingkungan belajar yang aman, nyaman, dan penuh perhatian, kami berupaya menumbuhkan rasa percaya diri serta kecintaan anak terhadap proses belajar.\n\nBersama Ar Rayyan Learning Course, mari kita siapkan generasi yang berilmu, berakhlak, dan siap menghadapi masa depan.',
        valuesTitle: 'Nilai Utama',
        values: ['Aman & Nyaman', 'Terarah & Personal', 'Berkarakter'],
        panelTitle: '25+ aktivitas belajar',
        panelSubtitle: 'Per pekan bersama ALC',
    },
    en: {
        title: 'About Us',
        description:
            "Ar Rayyan Learning Course is a tutoring institution focused on comprehensive learning support for children. We help students understand their lessons better through guided, interactive, and personalized learning methods tailored to each child's needs.\n\nWe believe every child has unique potential. Therefore, Ar Rayyan Learning Course emphasizes not only academic improvement but also character building, manners, and a passion for learning. With a safe, comfortable, and caring learning environment, we strive to nurture self-confidence and a love for learning in every child.\n\nTogether with Ar Rayyan Learning Course, let's prepare a generation that is knowledgeable, well-mannered, and ready to face the future.",
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

// Single passkey for accessing all Bank Soal (for subscribers)
export const bankSoalPasskey = 'ALCBANKSOAL2024';

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
            eyebrow: 'ALC',
            title: 'Kenapa Memilih Ar Rayyan Learning Course',
            subtitle: 'Pendampingan belajar yang aman, nyaman, dan terarah dengan metode personal dan penuh perhatian.',
        },
        profile: {
            eyebrow: 'ALC',
            title: 'Profil Lembaga',
            subtitle: 'Ar Rayyan Learning Course membangun lingkungan belajar yang aman, nyaman, dan penuh perhatian.',
        },
        education: {
            eyebrow: 'Akademik',
            title: 'Jenjang Pendidikan & Mata Pelajaran',
            subtitle: 'Layanan pendidikan untuk berbagai jenjang dengan beragam mata pelajaran.',
        },
        program: {
            eyebrow: 'Program',
            title: 'Program & Paket Belajar',
            subtitle: 'Paket belajar yang fleksibel untuk kebutuhan siswa dan keluarga.',
        },
        gallery: {
            eyebrow: 'Galeri',
            title: 'Galeri Kegiatan',
            subtitle: 'Dokumentasi aktivitas belajar dan kegiatan ALC.',
        },
        olympiad: {
            eyebrow: 'Prestasi',
            title: 'Info Olimpiade',
            subtitle: 'Pantau jadwal lomba dan persiapan prestasi siswa.',
        },
        register: {
            eyebrow: 'Join Us',
            title: 'Pendaftaran',
            subtitle: 'Ajak anak belajar bersama ALC atau bergabung menjadi pengajar.',
        },
        contact: {
            eyebrow: 'Hubungi Kami',
            title: 'Kontak & Informasi',
            subtitle: 'Hubungi kami untuk konsultasi program belajar terbaik.',
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
        contact: {
            eyebrow: 'Contact Us',
            title: 'Contact & Information',
            subtitle: 'Reach us anytime for the best learning consultation.',
        },
    },
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
