import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import SectionTitle from '../../Components/SectionTitle';
import { useI18n } from '../../lib/i18n';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const packages = [
    {
        name: 'Reguler',
        level: 'Pra TK - SMA',
        subjects: 'Calistung, Matematika, Bahasa Inggris',
        sessions: '8 pertemuan / bulan',
        mode: 'Offline / Online',
    },
    {
        name: 'Intensif',
        level: 'SD - SMA',
        subjects: 'Penguatan konsep + latihan soal',
        sessions: '12 pertemuan / bulan',
        mode: 'Offline / Hybrid',
    },
    {
        name: 'Privat / Semi Privat',
        level: 'TK - SMA',
        subjects: 'Menyesuaikan kebutuhan siswa',
        sessions: 'Fleksibel',
        mode: 'Offline / Online',
    },
    {
        name: 'Persiapan Ujian / Olimpiade',
        level: 'SD - SMA',
        subjects: 'Try out, pembahasan, strategi',
        sessions: 'Program khusus',
        mode: 'Offline / Online',
    },
];

const olympiadHighlights = [
    {
        name: 'Olimpiade Sains Nasional',
        level: 'SD - SMA',
        schedule: 'Februari - April',
        category: 'Gratis',
    },
    {
        name: 'Matematika Islami Challenge',
        level: 'SD / SMP',
        schedule: 'Mei - Juni',
        category: 'Berbayar',
    },
    {
        name: 'English Creative Olympiad',
        level: 'SMP / SMA',
        schedule: 'Agustus',
        category: 'Gratis',
    },
];

const icons = {
    book: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5H20v14H6.5A2.5 2.5 0 0 0 4 20V6.5Z" />
            <path d="M12 4v14" />
        </svg>
    ),
    user: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
    ),
    heart: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.5-7 9-7 9Z" />
        </svg>
    ),
    chat: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 6h14v9H8l-3 3V6Z" />
        </svg>
    ),
    list: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M8 6h12M8 12h12M8 18h12" />
            <path d="M4 6h1M4 12h1M4 18h1" />
        </svg>
    ),
    check: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 13l4 4L19 7" />
        </svg>
    ),
    users: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="9" cy="9" r="3" />
            <circle cx="17" cy="10" r="2.5" />
            <path d="M2 20a7 7 0 0 1 14 0" />
            <path d="M14.5 20a5 5 0 0 1 7 0" />
        </svg>
    ),
    trophy: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M8 5h8v4a4 4 0 0 1-8 0V5Z" />
            <path d="M6 6H4a2 2 0 0 0 2 2" />
            <path d="M18 6h2a2 2 0 0 1-2 2" />
            <path d="M12 13v3" />
            <path d="M8 20h8" />
        </svg>
    ),
    clock: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
        </svg>
    ),
    phone: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6.5 4.5h3l1 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1v3c0 1.1-.9 2-2 2-8.3 0-15-6.7-15-15 0-1.1.9-2 2-2Z" />
        </svg>
    ),
    mail: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    ),
    mapPin: (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
            <circle cx="12" cy="11" r="2" />
        </svg>
    ),
};

const toneStyles = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-700',
};

const heroBadges = {
    id: [
        { title: '50+ Pengajar', detail: 'Berpengalaman' },
        { title: 'Belajar Islami', detail: 'Nilai dan karakter' },
        { title: 'Fleksibel', detail: 'Offline / Online' },
    ],
    en: [
        { title: '50+ Tutors', detail: 'Experienced' },
        { title: 'Islamic Values', detail: 'Character first' },
        { title: 'Flexible', detail: 'Offline / Online' },
    ],
};

const featureCards = {
    id: [
        {
            title: 'Bank Soal Terstruktur',
            description:
                'Latihan bertahap untuk memperkuat pemahaman dan evaluasi.',
            icon: 'book',
            tone: 'violet',
        },
        {
            title: 'Pengajar Berpengalaman',
            description:
                'Pendampingan sabar, fokus pada kebutuhan belajar anak.',
            icon: 'user',
            tone: 'amber',
        },
        {
            title: 'Ramah Anak & Orang Tua',
            description:
                'Komunikasi terbuka agar orang tua selalu terlibat.',
            icon: 'heart',
            tone: 'rose',
        },
    ],
    en: [
        {
            title: 'Structured Question Bank',
            description:
                'Step-by-step exercises to strengthen mastery and evaluation.',
            icon: 'book',
            tone: 'violet',
        },
        {
            title: 'Experienced Teachers',
            description:
                'Patient guidance focused on each student learning needs.',
            icon: 'user',
            tone: 'amber',
        },
        {
            title: 'Friendly for Families',
            description:
                'Open communication so parents stay informed and involved.',
            icon: 'heart',
            tone: 'rose',
        },
    ],
};

const stats = {
    id: [
        { value: '50+', label: 'Pengajar Aktif', icon: 'users', tone: 'violet' },
        { value: '500+', label: 'Siswa Terbimbing', icon: 'trophy', tone: 'amber' },
        { value: '30+', label: 'Program Belajar', icon: 'book', tone: 'violet' },
        { value: '10+', label: 'Tahun Berpengalaman', icon: 'clock', tone: 'amber' },
    ],
    en: [
        { value: '50+', label: 'Active Tutors', icon: 'users', tone: 'violet' },
        { value: '500+', label: 'Students Guided', icon: 'trophy', tone: 'amber' },
        { value: '30+', label: 'Learning Programs', icon: 'book', tone: 'violet' },
        { value: '10+', label: 'Years of Experience', icon: 'clock', tone: 'amber' },
    ],
};

export default function Home() {
    const { language } = useI18n();

    const copy = {
        id: {
            title: 'Membimbing dengan Hati, Mencetak Generasi Berprestasi',
            description:
                'Ar Rayyan Learning Course (ALC) hadir sebagai mitra belajar yang hangat, islami, dan profesional. Kami mendampingi anak-anak mencapai prestasi terbaik dengan metode yang terstruktur, menyenangkan, dan mudah dipahami orang tua.',
            ctaPrimary: 'Daftar Sekarang',
            ctaSecondary: 'Lihat Program Belajar',
            profileTitle: 'Profil Lembaga',
            profileSubtitle:
                'ALC membangun lingkungan belajar yang aman, hangat, dan berorientasi prestasi.',
            aboutTitle: 'Tentang Kami',
            aboutDescription:
                'ALC adalah lembaga pendidikan yang memadukan nilai islami, pendekatan edukatif, dan kepedulian pada karakter anak.',
            valuesTitle: 'Nilai Utama',
            values: ['Edukatif', 'Islami', 'Peduli anak'],
            levelsTitle: 'Jenjang Pendidikan',
            levels: ['Pra TK', 'TK', 'SD / MI', 'SMP', 'SMA'],
            subjectsTitle: 'Mata Pelajaran',
            subjects: [
                'Calistung',
                'Matematika',
                'Bahasa Inggris',
                'IPA',
                'IPS',
                'Pelajaran umum (fleksibel)',
            ],
            visionTitle: 'Visi',
            vision:
                'Menjadi lembaga pendidikan terpercaya yang membentuk generasi berakhlak, cerdas, dan berdaya saing.',
            missionTitle: 'Misi',
            mission:
                'Memberikan pendampingan belajar berkualitas, mendekatkan anak dengan nilai islami, serta membangun komunikasi aktif dengan orang tua.',
            programTitle: 'Program & Paket Belajar',
            programSubtitle:
                'Paket belajar yang fleksibel untuk kebutuhan siswa dan keluarga.',
            whyTitle: 'Kenapa Memilih ALC',
            whySubtitle:
                'Layanan belajar dengan sistem rapi, ramah anak, dan mudah dipahami orang tua.',
            bankTitle: 'Bank Soal Unggulan',
            bankSubtitle:
                'Latihan soal berkualitas yang memperkuat pemahaman dan kesiapan ujian.',
            bankOfflineTitle: 'Bank Soal Offline',
            bankOfflineDescription:
                'Modul latihan dan evaluasi saat pembelajaran tatap muka.',
            bankOnlineTitle: 'Bank Soal Online',
            bankOnlineDescription:
                'Latihan mandiri, try out, dan persiapan olimpiade.',
            olympiadTitle: 'Info Olimpiade',
            olympiadSubtitle:
                'Pantau jadwal lomba dan persiapan prestasi siswa.',
            registerTitle: 'Pendaftaran',
            registerSubtitle:
                'Ajak anak belajar bersama ALC atau bergabung menjadi pengajar.',
            contactTitle: 'Kontak & Informasi',
            contactSubtitle:
                'Hubungi kami untuk konsultasi program belajar terbaik.',
        },
        en: {
            title: 'Guiding with Heart, Shaping Achieving Generations',
            description:
                'Ar Rayyan Learning Course (ALC) is a warm, Islamic, and professional learning partner. We help children achieve their best through structured, engaging lessons that parents can easily follow.',
            ctaPrimary: 'Enroll Now',
            ctaSecondary: 'Explore Programs',
            profileTitle: 'Institution Profile',
            profileSubtitle:
                'ALC builds a safe, caring, and achievement-oriented learning environment.',
            aboutTitle: 'About Us',
            aboutDescription:
                'ALC combines Islamic values, educational methods, and deep care for every child.',
            valuesTitle: 'Core Values',
            values: ['Educational', 'Islamic', 'Child-focused'],
            levelsTitle: 'Education Levels',
            levels: ['Pre-K', 'Kindergarten', 'Elementary', 'Junior High', 'Senior High'],
            subjectsTitle: 'Subjects',
            subjects: [
                'Reading, Writing, Counting',
                'Mathematics',
                'English',
                'Science',
                'Social Studies',
                'General subjects (flexible)',
            ],
            visionTitle: 'Vision',
            vision:
                'To be a trusted education partner that shapes faithful, intelligent, and competitive generations.',
            missionTitle: 'Mission',
            mission:
                'Deliver quality learning guidance, bring children closer to Islamic values, and build strong communication with parents.',
            programTitle: 'Learning Programs & Packages',
            programSubtitle:
                'Flexible learning packages tailored to every student.',
            whyTitle: 'Why Choose ALC',
            whySubtitle:
                'A well-structured learning system that supports students and parents.',
            bankTitle: 'Featured Question Bank',
            bankSubtitle:
                'Quality practice modules that strengthen mastery and exam readiness.',
            bankOfflineTitle: 'Offline Question Bank',
            bankOfflineDescription:
                'Practice modules and evaluation during face-to-face sessions.',
            bankOnlineTitle: 'Online Question Bank',
            bankOnlineDescription:
                'Self-practice, try outs, and olympiad preparation.',
            olympiadTitle: 'Olympiad Info',
            olympiadSubtitle: 'Stay updated with competitions and schedules.',
            registerTitle: 'Registration',
            registerSubtitle:
                'Enroll your child or join as an inspiring teacher at ALC.',
            contactTitle: 'Contact & Information',
            contactSubtitle:
                'Reach us anytime for the best learning consultation.',
        },
    };

    const text = copy[language] ?? copy.id;

    return (
        <>
            <Head>
                <title>Home</title>
                <meta
                    name="description"
                    content="Ar Rayyan Learning Course (ALC) adalah lembaga pendidikan islami yang ramah anak dengan program belajar fleksibel untuk berbagai jenjang."
                />
            </Head>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern">
                <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />

                <div className="mx-auto grid w-full max-w-6xl gap-8 sm:gap-10 lg:gap-12 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="space-y-4 sm:space-y-6"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-violet-600"
                        >
                            Ar Rayyan Learning Course
                        </motion.p>
                        <motion.h1
                            variants={fadeUp}
                            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900"
                        >
                            {text.title}
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="max-w-xl text-sm sm:text-base lg:text-lg text-slate-600"
                        >
                            {text.description}
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                        >
                            <Link
                                href="/pendaftaran"
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-amber-500 min-h-[44px]"
                            >
                                {text.ctaPrimary}
                            </Link>
                            <Link
                                href="/#program"
                                className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800 min-h-[44px]"
                            >
                                {text.ctaSecondary}
                            </Link>
                        </motion.div>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap gap-2 sm:gap-3 text-xs text-slate-600"
                        >
                            {(heroBadges[language] ?? heroBadges.id).map(
                                (badge) => (
                                    <div
                                        key={badge.title}
                                        className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/60 bg-white/80 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm"
                                    >
                                        <span className="font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            {badge.title}
                                        </span>
                                        <span className="text-slate-500 text-[10px] sm:text-xs">
                                            {badge.detail}
                                        </span>
                                    </div>
                                )
                            )}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="relative mt-6 lg:mt-0"
                    >
                        <div className="relative aspect-[4/5] sm:aspect-[4/4] lg:aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-violet-100/80 bg-white/90 shadow-xl sm:shadow-2xl">
                            <img
                                src="/images/hero-student.jpg"
                                alt="Siswa ALC"
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                    if (event.currentTarget.nextSibling) {
                                        event.currentTarget.nextSibling.style.display =
                                            'flex';
                                    }
                                }}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-violet-200/60 to-amber-200/60 text-sm font-semibold text-violet-700">
                                Foto kegiatan ALC
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-violet-900/20 to-transparent" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="absolute -left-2 sm:-left-6 bottom-4 sm:bottom-8 rounded-xl sm:rounded-2xl border border-white/70 bg-white/90 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg"
                        >
                            <p className="font-semibold text-slate-800">
                                15+ kelas aktif
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500">
                                Senin - Sabtu
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.6 }}
                            className="absolute -right-2 sm:-right-8 top-4 sm:top-8 rounded-xl sm:rounded-2xl border border-white/70 bg-white/90 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg"
                        >
                            <p className="font-semibold text-slate-800">
                                98% orang tua
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500">
                                Puas dengan progres
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Why ALC Section */}
            <section className="bg-white py-10 sm:py-12 lg:pb-12">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        eyebrow="ALC"
                        title={text.whyTitle}
                        subtitle={text.whySubtitle}
                        align="center"
                    />
                    <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {(featureCards[language] ?? featureCards.id).map(
                            (feature) => {
                                const toneClass =
                                    toneStyles[feature.tone] ??
                                    toneStyles.violet;

                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.5 }}
                                        className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition hover:shadow-md"
                                    >
                                        <div
                                            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${toneClass}`}
                                        >
                                            {icons[feature.icon]}
                                        </div>
                                        <h3 className="mt-3 sm:mt-4 font-display text-sm sm:text-base font-semibold text-slate-800">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                );
                            }
                        )}
                    </div>
                </div>
            </section>

            {/* Profile Section */}
            <section id="profil" className="bg-white py-12 sm:py-14 lg:py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        eyebrow="ALC"
                        title={text.profileTitle}
                        subtitle={text.profileSubtitle}
                    />

                    <div className="mt-8 sm:mt-10 grid gap-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-violet-100/70 bg-white shadow-lg sm:shadow-xl">
                                <img
                                    src="/images/about-class.jpg"
                                    alt="Kelas ALC"
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                        if (event.currentTarget.nextSibling) {
                                            event.currentTarget.nextSibling.style.display =
                                                'flex';
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-amber-200/60 to-violet-200/60 text-sm font-semibold text-violet-700">
                                    Foto kegiatan belajar
                                </div>
                            </div>
                            <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:left-6 rounded-xl sm:rounded-2xl border border-white/70 bg-white/90 px-3 sm:px-4 py-2 sm:py-3 text-xs shadow-lg">
                                <p className="font-semibold text-slate-800">
                                    25+ aktivitas belajar
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-500">
                                    Per pekan bersama ALC
                                </p>
                            </div>
                        </motion.div>

                        <div className="space-y-4 sm:space-y-6 mt-6 lg:mt-0">
                            <div className="rounded-2xl sm:rounded-3xl border border-violet-100 bg-violet-50/60 p-4 sm:p-6">
                                <h3 className="font-display text-base sm:text-lg font-semibold text-slate-800">
                                    {text.aboutTitle}
                                </h3>
                                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">
                                    {text.aboutDescription}
                                </p>
                            </div>
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                                    <p className="font-display text-xs sm:text-sm font-semibold text-slate-800">
                                        {text.valuesTitle}
                                    </p>
                                    <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                                        {text.values.map((value) => (
                                            <li key={value}>- {value}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                                    <p className="font-display text-xs sm:text-sm font-semibold text-slate-800">
                                        {text.levelsTitle}
                                    </p>
                                    <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                                        {text.levels.map((level) => (
                                            <li key={level}>- {level}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-3 sm:space-y-4 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
                                <p className="font-display text-xs sm:text-sm font-semibold text-slate-800">
                                    {text.subjectsTitle}
                                </p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {text.subjects.map((subject) => (
                                        <span
                                            key={subject}
                                            className="rounded-full bg-amber-50 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-amber-700"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                                        <p className="font-display text-xs sm:text-sm font-semibold text-slate-800">
                                            {text.visionTitle}
                                        </p>
                                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600">
                                            {text.vision}
                                        </p>
                                    </div>
                                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                                        <p className="font-display text-xs sm:text-sm font-semibold text-slate-800">
                                            {text.missionTitle}
                                        </p>
                                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600">
                                            {text.mission}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Program Section */}
            <section id="program" className="bg-slate-50 py-12 sm:py-14 lg:py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        eyebrow="Program"
                        title={text.programTitle}
                        subtitle={text.programSubtitle}
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2"
                    >
                        {packages.map((item) => (
                            <motion.div
                                key={item.name}
                                variants={fadeUp}
                                whileHover={{ y: -6 }}
                                className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                    <h3 className="font-display text-base sm:text-lg font-semibold text-slate-800">
                                        {item.name}
                                    </h3>
                                    <span className="self-start sm:self-auto rounded-full bg-amber-100/70 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-amber-700">
                                        {item.mode}
                                    </span>
                                </div>
                                <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Jenjang:
                                        </span>{' '}
                                        {item.level}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Mata pelajaran:
                                        </span>{' '}
                                        {item.subjects}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Pertemuan:
                                        </span>{' '}
                                        {item.sessions}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-8 sm:py-10">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-violet-700 to-amber-400 px-4 sm:px-6 py-6 sm:py-8 text-white shadow-lg md:grid-cols-4">
                        {(stats[language] ?? stats.id).map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="mx-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 text-white">
                                    {icons[item.icon]}
                                </div>
                                <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold">
                                    {item.value}
                                </p>
                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-white/80">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bank Soal Section */}
            <section id="banksoal" className="bg-white py-12 sm:py-14 lg:py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        eyebrow="Fitur Unggulan"
                        title={text.bankTitle}
                        subtitle={text.bankSubtitle}
                    />
                    <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2">
                        <div className="rounded-2xl sm:rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 sm:p-6">
                            <h3 className="font-display text-base sm:text-lg font-semibold text-slate-800">
                                {text.bankOfflineTitle}
                            </h3>
                            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">
                                {text.bankOfflineDescription}
                            </p>
                        </div>
                        <div className="rounded-2xl sm:rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 sm:p-6">
                            <h3 className="font-display text-base sm:text-lg font-semibold text-slate-800">
                                {text.bankOnlineTitle}
                            </h3>
                            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">
                                {text.bankOnlineDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Olympiad Section */}
            <section className="bg-gradient-to-br from-white via-white to-amber-50 py-12 sm:py-14 lg:py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        eyebrow="Prestasi"
                        title={text.olympiadTitle}
                        subtitle={text.olympiadSubtitle}
                    />
                    <div className="mt-8 sm:mt-10 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        {olympiadHighlights.map((item) => (
                            <div
                                key={item.name}
                                className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm"
                            >
                                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                    {item.name}
                                </p>
                                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-500">
                                    {item.level}
                                </p>
                                <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold text-violet-600">
                                    {item.schedule}
                                </p>
                                <span className="mt-3 sm:mt-4 inline-flex rounded-full bg-amber-100/70 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-amber-700">
                                    {item.category}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 sm:mt-8">
                        <Link
                            href="/olimpiade"
                            className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-4 sm:px-5 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 min-h-[44px]"
                        >
                            Lihat detail olimpiade
                        </Link>
                    </div>
                </div>
            </section>

            {/* Registration CTA Section */}
            <section className="bg-white py-12 sm:py-14 lg:py-16">
                <div className="mx-auto grid w-full max-w-6xl gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                    <div className="space-y-3 sm:space-y-4">
                        <SectionTitle
                            eyebrow="Join Us"
                            title={text.registerTitle}
                            subtitle={text.registerSubtitle}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                        <Link
                            href="/pendaftaran"
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-amber-500 min-h-[44px]"
                        >
                            Pendaftaran Murid
                        </Link>
                        <Link
                            href="/pendaftaran"
                            className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800 min-h-[44px]"
                        >
                            Pendaftaran Pengajar
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="kontak" className="bg-gradient-to-br from-violet-50 via-white to-amber-50 py-12 sm:py-14 lg:py-16">
                <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle
                        eyebrow="Hubungi Kami"
                        title={text.contactTitle}
                        subtitle={text.contactSubtitle}
                        align="center"
                    />

                    <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <motion.a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                            className="group flex flex-col items-center rounded-2xl sm:rounded-3xl border border-green-100 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 hover:border-green-200"
                        >
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition group-hover:bg-green-100 group-hover:scale-110">
                                <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-slate-800">WhatsApp</p>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500">+62 812-3456-7890</p>
                        </motion.a>

                        <motion.a
                            href="https://instagram.com/alclearning"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group flex flex-col items-center rounded-2xl sm:rounded-3xl border border-pink-100 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 hover:border-pink-200"
                        >
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-pink-600 transition group-hover:from-pink-100 group-hover:to-purple-100 group-hover:scale-110">
                                <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-slate-800">Instagram</p>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500">@alclearning</p>
                        </motion.a>

                        <motion.a
                            href="mailto:info@alclearning.id"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group flex flex-col items-center rounded-2xl sm:rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 hover:border-violet-200"
                        >
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100 group-hover:scale-110">
                                {icons.mail}
                            </div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-slate-800">Email</p>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500">info@alclearning.id</p>
                        </motion.a>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col items-center rounded-2xl sm:rounded-3xl border border-amber-100 bg-white p-5 sm:p-6 shadow-sm"
                        >
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                {icons.clock}
                            </div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-slate-800">Jam Operasional</p>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 text-center">Sen - Jum: 08:00 - 20:00</p>
                            <p className="text-xs sm:text-sm text-slate-500">Sabtu: 08:00 - 16:00</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 sm:mt-10 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 flex-shrink-0">
                                {icons.mapPin}
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-sm sm:text-base font-semibold text-slate-800">Alamat Kantor</p>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500">Jl. Pendidikan Islami No. 8, Bandung, Jawa Barat 40123</p>
                            </div>
                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-violet-700 transition hover:bg-violet-50 hover:border-violet-300 min-h-[44px] flex-shrink-0"
                            >
                                Lihat Peta
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
