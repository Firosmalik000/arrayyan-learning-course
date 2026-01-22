import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import SectionTitle from '../../Components/SectionTitle';
import { useI18n } from '../../lib/i18n';

const events = [
    {
        name: 'Olimpiade Sains Nasional',
        level: 'SD - SMA',
        schedule: 'Februari - April',
        selection: 'Seleksi internal ALC + pembinaan',
        category: 'Gratis',
    },
    {
        name: 'Matematika Islami Challenge',
        level: 'SD / SMP',
        schedule: 'Mei - Juni',
        selection: 'Tes kemampuan + mentoring',
        category: 'Berbayar',
        fee: 'Rp 150.000',
    },
    {
        name: 'English Creative Olympiad',
        level: 'SMP / SMA',
        schedule: 'Agustus',
        selection: 'Portofolio + simulasi',
        category: 'Gratis',
    },
];

export default function Olympiad() {
    const { language } = useI18n();
    const copy = {
        id: {
            title: 'Info Olimpiade',
            subtitle:
                'Daftar lomba yang mendukung prestasi siswa ALC, lengkap dengan jadwal dan sistem seleksi.',
        },
        en: {
            title: 'Olympiad Information',
            subtitle:
                'Competitions curated for ALC students, complete with schedules and selection systems.',
        },
    };
    const text = copy[language] ?? copy.id;

    return (
        <>
            <Head>
                <title>Info Olimpiade</title>
                <meta
                    name="description"
                    content="Informasi olimpiade dan lomba prestasi siswa ALC, termasuk jadwal, jenjang, dan biaya."
                />
            </Head>

            <section className="bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-16 alc-pattern">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="Prestasi"
                        title={text.title}
                        subtitle={text.subtitle}
                    />

                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {events.map((event) => (
                            <motion.div
                                key={event.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-display text-sm font-semibold text-slate-800">
                                            {event.name}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {event.level}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100/60 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        {event.category}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-slate-600">
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Jadwal:
                                        </span>{' '}
                                        {event.schedule}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Sistem seleksi:
                                        </span>{' '}
                                        {event.selection}
                                    </p>
                                    {event.fee ? (
                                        <p>
                                            <span className="font-semibold text-slate-700">
                                                Biaya:
                                            </span>{' '}
                                            {event.fee}
                                        </p>
                                    ) : null}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
