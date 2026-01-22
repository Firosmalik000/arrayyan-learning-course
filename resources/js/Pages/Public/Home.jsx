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

            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 alc-pattern">
                <div className="absolute -left-24 top-10 h-52 w-52 rounded-full bg-emerald-100 blur-3xl" />
                <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />

                <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="space-y-6"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600"
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
                                className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-sky-600"
                            >
                                {text.ctaPrimary}
                            </Link>
                            <Link
                                href="/#program"
                                className="rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800"
                            >
                                {text.ctaSecondary}
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="rounded-[32px] border border-emerald-100/80 bg-white/90 p-6 shadow-xl alc-glow"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-700">
                                    Kelas Hari Ini
                                </p>
                                <span className="rounded-full bg-emerald-100/60 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Live
                                </span>
                            </div>
                            <div className="rounded-2xl bg-emerald-500/10 p-4">
                                <p className="text-sm font-semibold text-emerald-700">
                                    Matematika Ceria
                                </p>
                                <p className="text-xs text-slate-500">
                                    SD / MI - 16:00 WIB
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-100 p-4">
                                <p className="text-sm font-semibold text-slate-700">
                                    Calistung Islami
                                </p>
                                <p className="text-xs text-slate-500">
                                    Pra TK - 09:00 WIB
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-100 p-4">
                                <p className="text-sm font-semibold text-slate-700">
                                    English Fun Class
                                </p>
                                <p className="text-xs text-slate-500">
                                    SMP - 18:30 WIB
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section id="profil" className="bg-white py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="ALC"
                        title={text.profileTitle}
                        subtitle={text.profileSubtitle}
                    />

                    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6">
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
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <p className="font-display text-sm font-semibold text-slate-800">
                                {text.subjectsTitle}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {text.subjects.map((subject) => (
                                    <span
                                        key={subject}
                                        className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
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
                                    <span className="rounded-full bg-emerald-100/60 px-3 py-1 text-xs font-semibold text-emerald-700">
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

            <section id="banksoal" className="bg-white py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="Fitur Unggulan"
                        title={text.bankTitle}
                        subtitle={text.bankSubtitle}
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
                            <h3 className="font-display text-lg font-semibold text-slate-800">
                                {text.bankOfflineTitle}
                            </h3>
                            <p className="mt-3 text-sm text-slate-600">
                                {text.bankOfflineDescription}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6">
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

            <section className="bg-gradient-to-br from-white via-white to-emerald-50 py-16">
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
                                <p className="mt-3 text-xs font-semibold text-emerald-600">
                                    {item.schedule}
                                </p>
                                <span className="mt-4 inline-flex rounded-full bg-emerald-100/60 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {item.category}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <Link
                            href="/olimpiade"
                            className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-800"
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
                            className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-sky-600"
                        >
                            Pendaftaran Murid
                        </Link>
                        <Link
                            href="/pendaftaran"
                            className="rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800"
                        >
                            Pendaftaran Pengajar
                        </Link>
                    </div>
                </div>
            </section>

            <section id="kontak" className="bg-slate-50 py-16">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="Hubungi Kami"
                        title={text.contactTitle}
                        subtitle={text.contactSubtitle}
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold text-slate-800">
                                Alamat
                            </p>
                            <p className="mt-3 text-sm text-slate-600">
                                Jl. Pendidikan Islami No. 8, Bandung
                            </p>
                        </div>
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold text-slate-800">
                                Kontak
                            </p>
                            <p className="mt-3 text-sm text-slate-600">
                                WhatsApp: +62 812-3456-7890
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                Email: info@alclearning.id
                            </p>
                        </div>
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold text-slate-800">
                                Jam Operasional
                            </p>
                            <p className="mt-3 text-sm text-slate-600">
                                Senin - Jumat: 08:00 - 20:00
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                Sabtu: 08:00 - 16:00
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
