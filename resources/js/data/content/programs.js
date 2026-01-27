/**
 * Programs and packages data
 * Learning programs, olympiad info
 */

export const packages = [
    {
        id: 'reguler',
        name: {
            id: 'Reguler (Kelompok)',
            en: 'Regular (Group)',
        },
        level: {
            id: 'Pra TK - SMA',
            en: 'Pre-K - Senior High',
        },
        sessions: {
            id: '8 pertemuan / bulan',
            en: '8 sessions / month',
        },
        mode: {
            id: 'Offline',
            en: 'Offline',
        },
        description: {
            id: 'Program belajar berkelompok dengan jumlah terbatas (maksimal 5 murid) untuk menjaga kualitas pembelajaran. Didesain interaktif dan terarah.',
            en: 'Group learning program with limited students (max 5) to maintain quality. Designed to be interactive and guided.',
        },
        highlights: {
            id: ['Maksimal 5 murid per kelompok', 'Interaktif dan terarah', 'Biaya terjangkau'],
            en: ['Maximum 5 students per group', 'Interactive and guided', 'Affordable pricing'],
        },
    },
    {
        id: 'privat',
        name: {
            id: 'Privat',
            en: 'Private',
        },
        level: {
            id: 'Pra TK - SMA',
            en: 'Pre-K - Senior High',
        },
        sessions: {
            id: 'Fleksibel (8, 12, 16, atau 20 pertemuan / bulan)',
            en: 'Flexible (8, 12, 16, or 20 sessions / month)',
        },
        mode: {
            id: 'Offline / Online',
            en: 'Offline / Online',
        },
        description: {
            id: 'Layanan belajar eksklusif satu guru satu murid. Tentor berpengalaman datang langsung ke rumah siswa untuk pendampingan yang fokus dan optimal.',
            en: 'Exclusive one-on-one learning. Experienced tutors come directly to the student\'s home for focused and optimal guidance.',
        },
        highlights: {
            id: ['Satu guru satu murid', 'Jadwal fleksibel', 'Bisa ke rumah atau online'],
            en: ['One tutor per student', 'Flexible schedule', 'Home visit or online'],
        },
    },
    {
        id: 'olimpiade',
        name: {
            id: 'Persiapan Ujian / Olimpiade',
            en: 'Exam / Olympiad Preparation',
        },
        level: {
            id: 'SD - SMA',
            en: 'Elementary - Senior High',
        },
        sessions: {
            id: 'Fleksibel',
            en: 'Flexible',
        },
        mode: {
            id: 'Offline / Online',
            en: 'Offline / Online',
        },
        description: {
            id: 'Program intensif dan terstruktur untuk siswa yang ingin hasil maksimal. Fokus pada pendalaman materi, latihan soal berkualitas, dan strategi pengerjaan secara sistematis.',
            en: 'Intensive and structured program for students aiming for maximum results. Focus on in-depth material, quality practice questions, and systematic problem-solving strategies.',
        },
        highlights: {
            id: ['Pendalaman materi', 'Latihan soal berkualitas', 'Strategi pengerjaan sistematis'],
            en: ['In-depth material', 'Quality practice questions', 'Systematic strategies'],
        },
    },
];

export const olympiadHighlights = [
    {
        id: 'osn',
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
        category: {
            id: 'Gratis',
            en: 'Free',
        },
    },
    {
        id: 'mic',
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
        category: {
            id: 'Berbayar',
            en: 'Paid',
        },
    },
    {
        id: 'eco',
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
        category: {
            id: 'Gratis',
            en: 'Free',
        },
    },
];

// Helper function to get localized package data
export const getLocalizedPackages = (language = 'id') => {
    return packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name[language] || pkg.name.id,
        level: pkg.level[language] || pkg.level.id,
        sessions: pkg.sessions[language] || pkg.sessions.id,
        mode: pkg.mode[language] || pkg.mode.id,
        description: pkg.description[language] || pkg.description.id,
        highlights: pkg.highlights[language] || pkg.highlights.id,
    }));
};

// Helper function to get localized olympiad data
export const getLocalizedOlympiads = (language = 'id') => {
    return olympiadHighlights.map((item) => ({
        id: item.id,
        name: item.name[language] || item.name.id,
        level: item.level[language] || item.level.id,
        schedule: item.schedule[language] || item.schedule.id,
        category: item.category[language] || item.category.id,
    }));
};
