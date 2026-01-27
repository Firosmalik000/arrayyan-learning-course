/**
 * Olympiad page data
 * All content specific to the olympiad page
 */

export const events = [
    {
        id: 'osn',
        slug: 'olimpiade-sains-nasional',
        name: {
            id: 'Olimpiade Sains Nasional',
            en: 'National Science Olympiad',
        },
        level: {
            id: 'SD - SMA',
            en: 'Elementary - Senior High',
        },
        schedule: {
            id: 'Februari - April',
            en: 'February - April',
        },
        selection: {
            id: 'Seleksi internal ALC + pembinaan',
            en: 'ALC internal selection + coaching',
        },
        category: {
            id: 'Gratis',
            en: 'Free',
        },
        fee: null,
        description: {
            id: 'Kompetisi sains bergengsi tingkat nasional yang diselenggarakan oleh Kementerian Pendidikan. Meliputi bidang Matematika, IPA, dan bidang lainnya.',
            en: 'Prestigious national science competition organized by the Ministry of Education. Covers Mathematics, Science, and other fields.',
        },
        tone: 'violet',
    },
    {
        id: 'mic',
        slug: 'matematika-islami-challenge',
        name: {
            id: 'Matematika Islami Challenge',
            en: 'Islamic Mathematics Challenge',
        },
        level: {
            id: 'SD / SMP',
            en: 'Elementary / Junior High',
        },
        schedule: {
            id: 'Mei - Juni',
            en: 'May - June',
        },
        selection: {
            id: 'Tes kemampuan + mentoring',
            en: 'Skill test + mentoring',
        },
        category: {
            id: 'Berbayar',
            en: 'Paid',
        },
        fee: {
            id: 'Rp 150.000',
            en: 'IDR 150,000',
        },
        description: {
            id: 'Kompetisi matematika dengan nuansa islami yang menggabungkan kemampuan berhitung dengan nilai-nilai keislaman.',
            en: 'Mathematics competition with Islamic nuances that combines mathematical skills with Islamic values.',
        },
        tone: 'amber',
    },
    {
        id: 'eco',
        slug: 'english-creative-olympiad',
        name: {
            id: 'English Creative Olympiad',
            en: 'English Creative Olympiad',
        },
        level: {
            id: 'SMP / SMA',
            en: 'Junior High / Senior High',
        },
        schedule: {
            id: 'Agustus',
            en: 'August',
        },
        selection: {
            id: 'Portofolio + simulasi',
            en: 'Portfolio + simulation',
        },
        category: {
            id: 'Gratis',
            en: 'Free',
        },
        fee: null,
        description: {
            id: 'Kompetisi bahasa Inggris kreatif yang menguji kemampuan writing, speaking, dan creative thinking.',
            en: 'Creative English competition testing writing, speaking, and creative thinking skills.',
        },
        tone: 'blue',
    },
    {
        id: 'kmnr',
        slug: 'kompetisi-matematika-nalaria-realistik',
        name: {
            id: 'Kompetisi Matematika Nalaria Realistik',
            en: 'Realistic Reasoning Math Competition',
        },
        level: {
            id: 'SD / SMP',
            en: 'Elementary / Junior High',
        },
        schedule: {
            id: 'Oktober - November',
            en: 'October - November',
        },
        selection: {
            id: 'Tes logika + pembinaan intensif',
            en: 'Logic test + intensive coaching',
        },
        category: {
            id: 'Berbayar',
            en: 'Paid',
        },
        fee: {
            id: 'Rp 175.000',
            en: 'IDR 175,000',
        },
        description: {
            id: 'Kompetisi matematika yang mengutamakan penalaran logis dan pemecahan masalah realistik.',
            en: 'Mathematics competition emphasizing logical reasoning and realistic problem solving.',
        },
        tone: 'green',
    },
    {
        id: 'imo',
        slug: 'international-math-olympiad-prep',
        name: {
            id: 'Persiapan IMO (International Math Olympiad)',
            en: 'IMO Preparation (International Math Olympiad)',
        },
        level: {
            id: 'SMA',
            en: 'Senior High',
        },
        schedule: {
            id: 'Sepanjang Tahun',
            en: 'Year-round',
        },
        selection: {
            id: 'Seleksi ketat + pembinaan jangka panjang',
            en: 'Strict selection + long-term coaching',
        },
        category: {
            id: 'Gratis',
            en: 'Free',
        },
        fee: null,
        description: {
            id: 'Program persiapan untuk olimpiade matematika internasional paling prestisius di dunia.',
            en: 'Preparation program for the most prestigious international mathematics olympiad in the world.',
        },
        tone: 'rose',
    },
];

// Single passkey for accessing all Olympiad info (for subscribers)
export const olympiadPasskey = 'ALCOLIMPIADE2024';

export const olympiadCategories = {
    id: ['Gratis', 'Berbayar'],
    en: ['Free', 'Paid'],
};

export const olympiadLevels = {
    id: ['SD', 'SMP', 'SMA'],
    en: ['Elementary', 'Junior High', 'Senior High'],
};

export const pageContent = {
    id: {
        title: 'Info Olimpiade',
        subtitle: 'Daftar lomba yang mendukung prestasi siswa ALC, lengkap dengan jadwal dan sistem seleksi.',
        labels: {
            schedule: 'Jadwal:',
            selection: 'Sistem seleksi:',
            fee: 'Biaya:',
        },
        filterAll: 'Semua',
        viewDetail: 'Lihat Detail',
        searchPlaceholder: 'Cari olimpiade...',
        noResults: 'Tidak ada olimpiade yang ditemukan',
        backToHome: 'Kembali ke Beranda',
        categoryAll: 'Semua Kategori',
        levelAll: 'Semua Jenjang',
    },
    en: {
        title: 'Olympiad Information',
        subtitle: 'Competitions curated for ALC students, complete with schedules and selection systems.',
        labels: {
            schedule: 'Schedule:',
            selection: 'Selection:',
            fee: 'Fee:',
        },
        filterAll: 'All',
        viewDetail: 'View Detail',
        searchPlaceholder: 'Search olympiad...',
        noResults: 'No olympiad found',
        backToHome: 'Back to Home',
        categoryAll: 'All Categories',
        levelAll: 'All Levels',
    },
};

// Helper function to get localized events
export const getLocalizedEvents = (language = 'id') => {
    return events.map((event) => ({
        id: event.id,
        slug: event.slug,
        name: event.name[language] || event.name.id,
        level: event.level[language] || event.level.id,
        schedule: event.schedule[language] || event.schedule.id,
        selection: event.selection[language] || event.selection.id,
        category: event.category[language] || event.category.id,
        fee: event.fee ? (event.fee[language] || event.fee.id) : null,
        description: event.description[language] || event.description.id,
        tone: event.tone,
    }));
};
