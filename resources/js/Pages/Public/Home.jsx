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

const steps = {
    id: [
        {
            title: 'Konsultasi Kebutuhan',
            description:
                'Diskusikan target belajar dan karakter anak bersama tim ALC.',
            icon: 'chat',
            tone: 'violet',
        },
        {
            title: 'Pilih Program',
            description:
                'Tentukan jenjang, mata pelajaran, dan paket belajar terbaik.',
            icon: 'list',
            tone: 'amber',
        },
        {
            title: 'Mulai Belajar',
            description:
                'Dapatkan pendampingan rutin dengan evaluasi terukur.',
            icon: 'check',
            tone: 'violet',
        },
    ],
    en: [
        {
            title: 'Consult the Needs',
            description:
                'Discuss goals and student character with the ALC team.',
            icon: 'chat',
            tone: 'violet',
        },
        {
            title: 'Pick a Program',
            description:
                'Choose level, subjects, and the most fitting learning plan.',
            icon: 'list',
            tone: 'amber',
        },
        {
            title: 'Start Learning',
            description: 'Enjoy consistent guidance with measurable progress.',
            icon: 'check',
            tone: 'violet',
        },
    ],
};

export default function Home() {
    const { language } = useI18n();
    const stepLabel = language === 'en' ? 'Step' : 'Langkah';
    const formInputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

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
            stepsEyebrow: 'Cara Belajar',
            stepsTitle: 'Langkah Mudah Bersama ALC',
            stepsSubtitle:
                'Mulai dari konsultasi sampai pendampingan rutin yang terukur.',
            stepsFormTitle: 'Konsultasi Cepat',
            stepsFormSubtitle:
                'Isi data singkat agar tim ALC bisa menghubungi Anda.',
            stepsFormName: 'Nama orang tua',
            stepsFormContact: 'WhatsApp aktif',
            stepsFormButton: 'Jadwalkan Konsultasi',
            stepsFormNote: 'Respon maksimal 1x24 jam pada hari kerja.',
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
            contactFormTitle: 'Konsultasi Program',
            contactFormSubtitle:
                'Isi form singkat agar tim ALC dapat menghubungi Anda.',
            contactFormName: 'Nama orang tua',
            contactFormPhone: 'WhatsApp aktif',
            contactFormProgram: 'Program yang diminati',
            contactFormMessage: 'Kebutuhan belajar anak',
            contactFormButton: 'Kirim Permintaan',
            contactFormNote:
                'Tim kami akan menghubungi Anda maksimal 1x24 jam.',
            contactProgramOptions: [
                'Pra TK / TK',
                'SD / MI',
                'SMP',
                'SMA',
                'Privat / Semi Privat',
                'Persiapan Olimpiade',
            ],
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
            stepsEyebrow: 'Learning Steps',
            stepsTitle: 'Start Learning with ALC',
            stepsSubtitle:
                'From consultation to consistent guidance with clear progress.',
            stepsFormTitle: 'Quick Consultation',
            stepsFormSubtitle:
                'Share a few details so our team can reach you.',
            stepsFormName: 'Parent name',
            stepsFormContact: 'Active WhatsApp',
            stepsFormButton: 'Schedule Consultation',
            stepsFormNote: 'We respond within 24 hours on weekdays.',
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
            contactFormTitle: 'Program Consultation',
            contactFormSubtitle:
                'Fill in the short form so our team can contact you.',
            contactFormName: 'Parent name',
            contactFormPhone: 'Active WhatsApp',
            contactFormProgram: 'Interested program',
            contactFormMessage: 'Student learning needs',
            contactFormButton: 'Send Request',
            contactFormNote:
                'We will reach out within 24 hours on business days.',
            contactProgramOptions: [
                'Pre-K / Kindergarten',
                'Elementary',
                'Junior High',
                'Senior High',
                'Private / Semi Private',
                'Olympiad Preparation',
            ],
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

            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern">
                <div className="absolute -left-24 top-10 h-52 w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-amber-200/70 blur-3xl" />

                <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="space-y-6"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-600"
                        >
                            Ar Rayyan Learning Course
                        </motion.p>
                        <motion.h1
                            variants={fadeUp}
                            className="font-display text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl"
                        >
                            {text.title}
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="max-w-xl text-base text-slate-600 sm:text-lg"
                        >
                            {text.description}
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                href="/pendaftaran"
                                className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-amber-500"
                            >
                                {text.ctaPrimary}
                            </Link>
                            <Link
                                href="/#program"
                                className="rounded-full border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800"
                            >
                                {text.ctaSecondary}
                            </Link>
                        </motion.div>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap gap-3 text-xs text-slate-600"
                        >
                            {(heroBadges[language] ?? heroBadges.id).map(
                                (badge) => (
                                    <div
                                        key={badge.title}
                                        className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 shadow-sm"
                                    >
                                        <span className="font-semibold text-violet-700">
                                            {badge.title}
                                        </span>
                                        <span className="text-slate-500">
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
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border border-violet-100/80 bg-white/90 shadow-2xl">
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
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-violet-900/20 to-transparent" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="absolute -left-6 bottom-8 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm shadow-lg"
                        >
                            <p className="font-semibold text-slate-800">
                                15+ kelas aktif
                            </p>
                            <p className="text-xs text-slate-500">
                                Senin - Sabtu
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.6 }}
                            className="absolute -right-8 top-8 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm shadow-lg"
                        >
                            <p className="font-semibold text-slate-800">
                                98% orang tua
                            </p>
                            <p className="text-xs text-slate-500">
                                Puas dengan progres
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-white pb-12">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="ALC"
                        title={text.whyTitle}
                        subtitle={text.whySubtitle}
                        align="center"
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
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
                                        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                                    >
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}
                                        >
                                            {icons[feature.icon]}
                                        </div>
                                        <h3 className="mt-4 font-display text-base font-semibold text-slate-800">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                );
                            }
                        )}
                    </div>
                </div>
            </section>

            <section id="profil" className="bg-white py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="ALC"
                        title={text.profileTitle}
                        subtitle={text.profileSubtitle}
                    />

                    <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border border-violet-100/70 bg-white shadow-xl">
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
                            <div className="absolute -bottom-6 left-6 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-xs shadow-lg">
                                <p className="font-semibold text-slate-800">
                                    25+ aktivitas belajar
                                </p>
                                <p className="text-slate-500">
                                    Per pekan bersama ALC
                                </p>
                            </div>
                        </motion.div>

                        <div className="space-y-6">
                            <div className="rounded-3xl border border-violet-100 bg-violet-50/60 p-6">
                                <h3 className="font-display text-lg font-semibold text-slate-800">
                                    {text.aboutTitle}
                                </h3>
                                <p className="mt-3 text-sm text-slate-600">
                                    {text.aboutDescription}
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <p className="font-display text-sm font-semibold text-slate-800">
                                        {text.valuesTitle}
                                    </p>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                        {text.values.map((value) => (
                                            <li key={value}>- {value}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <p className="font-display text-sm font-semibold text-slate-800">
                                        {text.levelsTitle}
                                    </p>
                                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                        {text.levels.map((level) => (
                                            <li key={level}>- {level}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                <p className="font-display text-sm font-semibold text-slate-800">
                                    {text.subjectsTitle}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {text.subjects.map((subject) => (
                                        <span
                                            key={subject}
                                            className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-6 space-y-3">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="font-display text-sm font-semibold text-slate-800">
                                            {text.visionTitle}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {text.vision}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="font-display text-sm font-semibold text-slate-800">
                                            {text.missionTitle}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {text.mission}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="program" className="bg-slate-50 py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
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
                        className="mt-10 grid gap-6 md:grid-cols-2"
                    >
                        {packages.map((item) => (
                            <motion.div
                                key={item.name}
                                variants={fadeUp}
                                whileHover={{ y: -6 }}
                                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-display text-lg font-semibold text-slate-800">
                                        {item.name}
                                    </h3>
                                    <span className="rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-700">
                                        {item.mode}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-slate-600">
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

            <section className="bg-white py-10">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="grid gap-6 rounded-3xl bg-gradient-to-r from-violet-700 to-amber-400 px-6 py-8 text-white shadow-lg md:grid-cols-4">
                        {(stats[language] ?? stats.id).map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white">
                                    {icons[item.icon]}
                                </div>
                                <p className="mt-3 text-2xl font-semibold">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs text-white/80">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                        <div className="space-y-6">
                            <SectionTitle
                                eyebrow={text.stepsEyebrow}
                                title={text.stepsTitle}
                                subtitle={text.stepsSubtitle}
                            />
                            <div className="relative overflow-hidden rounded-[32px] border border-violet-100/70 bg-white shadow-xl">
                                <img
                                    src="/images/steps-learning.jpg"
                                    alt="Proses belajar bersama ALC"
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
                                    Foto proses belajar
                                </div>
                                <div className="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-xs shadow-lg">
                                    <p className="font-semibold text-slate-800">
                                        Pendampingan personal
                                    </p>
                                    <p className="text-slate-500">
                                        Evaluasi rutin setiap minggu
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        src: '/images/hero-student.jpg',
                                        alt: 'Siswa ALC',
                                    },
                                    {
                                        src: '/images/about-class.jpg',
                                        alt: 'Kelas ALC',
                                    },
                                ].map((image) => (
                                    <div
                                        key={image.src}
                                        className="relative h-36 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
                                    >
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    'none';
                                                if (
                                                    event.currentTarget.nextSibling
                                                ) {
                                                    event.currentTarget.nextSibling.style.display =
                                                        'flex';
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-violet-200/60 to-amber-200/60 text-xs font-semibold text-violet-700">
                                            Foto ALC
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
                                            {text.stepsFormTitle}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {text.stepsFormSubtitle}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                        {icons.chat}
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3">
                                    <input
                                        type="text"
                                        placeholder={text.stepsFormName}
                                        className={formInputClass}
                                    />
                                    <input
                                        type="tel"
                                        placeholder={text.stepsFormContact}
                                        className={formInputClass}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="mt-5 w-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500"
                                >
                                    {text.stepsFormButton}
                                </button>
                                <p className="mt-3 text-xs text-slate-500">
                                    {text.stepsFormNote}
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-0 h-full w-px bg-violet-100" />
                            <div className="space-y-6">
                                {(steps[language] ?? steps.id).map(
                                    (step, index) => {
                                        const toneClass =
                                            toneStyles[step.tone] ??
                                            toneStyles.violet;
                                        const offset =
                                            index === 1
                                                ? 'lg:ml-10'
                                                : index === 2
                                                ? 'lg:ml-4'
                                                : '';

                                        return (
                                            <motion.div
                                                key={step.title}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                viewport={{ once: true, amount: 0.2 }}
                                                transition={{ duration: 0.5 }}
                                                className={`relative pl-12 ${offset}`}
                                            >
                                                <div
                                                    className={`absolute left-0 top-6 flex h-9 w-9 items-center justify-center rounded-2xl ${toneClass}`}
                                                >
                                                    {icons[step.icon]}
                                                </div>
                                                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                                        <span>
                                                            {stepLabel}{' '}
                                                            {index + 1}
                                                        </span>
                                                        <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-500">
                                                            0{index + 1}
                                                        </span>
                                                    </div>
                                                    <h3 className="mt-3 font-display text-base font-semibold text-slate-800">
                                                        {step.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="banksoal" className="bg-white py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="Fitur Unggulan"
                        title={text.bankTitle}
                        subtitle={text.bankSubtitle}
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6">
                            <h3 className="font-display text-lg font-semibold text-slate-800">
                                {text.bankOfflineTitle}
                            </h3>
                            <p className="mt-3 text-sm text-slate-600">
                                {text.bankOfflineDescription}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6">
                            <h3 className="font-display text-lg font-semibold text-slate-800">
                                {text.bankOnlineTitle}
                            </h3>
                            <p className="mt-3 text-sm text-slate-600">
                                {text.bankOnlineDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-white via-white to-amber-50 py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="Prestasi"
                        title={text.olympiadTitle}
                        subtitle={text.olympiadSubtitle}
                    />
                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {olympiadHighlights.map((item) => (
                            <div
                                key={item.name}
                                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                            >
                                <p className="text-sm font-semibold text-slate-800">
                                    {item.name}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    {item.level}
                                </p>
                                <p className="mt-3 text-xs font-semibold text-violet-600">
                                    {item.schedule}
                                </p>
                                <span className="mt-4 inline-flex rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-700">
                                    {item.category}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <Link
                            href="/olimpiade"
                            className="inline-flex rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800"
                        >
                            Lihat detail olimpiade
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                    <div className="space-y-4">
                        <SectionTitle
                            eyebrow="Join Us"
                            title={text.registerTitle}
                            subtitle={text.registerSubtitle}
                        />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/pendaftaran"
                            className="rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-amber-500"
                        >
                            Pendaftaran Murid
                        </Link>
                        <Link
                            href="/pendaftaran"
                            className="rounded-full border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800"
                        >
                            Pendaftaran Pengajar
                        </Link>
                    </div>
                </div>
            </section>

            <section id="kontak" className="bg-slate-50 py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                        <div className="space-y-6">
                            <SectionTitle
                                eyebrow="Hubungi Kami"
                                title={text.contactTitle}
                                subtitle={text.contactSubtitle}
                            />

                            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
                                            {text.contactFormTitle}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {text.contactFormSubtitle}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                        {icons.chat}
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3">
                                    <input
                                        type="text"
                                        placeholder={text.contactFormName}
                                        className={formInputClass}
                                    />
                                    <input
                                        type="tel"
                                        placeholder={text.contactFormPhone}
                                        className={formInputClass}
                                    />
                                    <select className={formInputClass}>
                                        <option value="">
                                            {text.contactFormProgram}
                                        </option>
                                        {(
                                            text.contactProgramOptions ?? []
                                        ).map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <textarea
                                        rows="3"
                                        placeholder={text.contactFormMessage}
                                        className={`${formInputClass} resize-none`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="mt-5 w-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500"
                                >
                                    {text.contactFormButton}
                                </button>
                                <p className="mt-3 text-xs text-slate-500">
                                    {text.contactFormNote}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative overflow-hidden rounded-[32px] border border-violet-100/70 bg-white shadow-xl">
                                <img
                                    src="/images/contact-team.jpg"
                                    alt="Tim ALC"
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
                                    Foto tim ALC
                                </div>
                                <div className="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-xs shadow-lg">
                                    <p className="font-semibold text-slate-800">
                                        Konsultasi hangat & cepat
                                    </p>
                                    <p className="text-slate-500">
                                        Respon dalam jam kerja
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                            {icons.mapPin}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Alamat
                                        </p>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        Jl. Pendidikan Islami No. 8, Bandung
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                            {icons.phone}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            WhatsApp
                                        </p>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        +62 812-3456-7890
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                            {icons.mail}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Email
                                        </p>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        info@alclearning.id
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                            {icons.clock}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Jam Operasional
                                        </p>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        Senin - Jumat: 08:00 - 20:00
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Sabtu: 08:00 - 16:00
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
