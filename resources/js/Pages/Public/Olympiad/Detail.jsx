import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';

// Shared data
import { fadeUp, stagger, toneStyles } from '@/data';
import { contactInfo } from '@/data/content/site';

// Page-specific data
import { events, pageContent, olympiadPasskey } from './data';

const detailContent = {
    id: {
        backToList: 'Kembali ke Info Olimpiade',
        eventInfo: 'Informasi Olimpiade',
        schedule: 'Jadwal',
        level: 'Jenjang',
        category: 'Kategori',
        fee: 'Biaya',
        selection: 'Sistem Seleksi',
        benefits: 'Keuntungan Mengikuti',
        benefitsList: [
            'Pembinaan oleh mentor berpengalaman',
            'Materi persiapan yang komprehensif',
            'Simulasi dan latihan soal berkala',
            'Sertifikat keikutsertaan',
        ],
        register: 'Daftar Sekarang',
        contact: 'Hubungi Kami',
        contactDesc: 'Butuh informasi lebih lanjut? Hubungi kami melalui WhatsApp.',
        notFound: 'Olimpiade tidak ditemukan',
        notFoundDesc: 'Maaf, olimpiade yang Anda cari tidak tersedia.',
        free: 'Gratis',
    },
    en: {
        backToList: 'Back to Olympiad Info',
        eventInfo: 'Olympiad Information',
        schedule: 'Schedule',
        level: 'Level',
        category: 'Category',
        fee: 'Fee',
        selection: 'Selection System',
        benefits: 'Benefits of Joining',
        benefitsList: [
            'Coaching by experienced mentors',
            'Comprehensive preparation materials',
            'Regular simulations and practice',
            'Participation certificate',
        ],
        register: 'Register Now',
        contact: 'Contact Us',
        contactDesc: 'Need more information? Contact us via WhatsApp.',
        notFound: 'Olympiad not found',
        notFoundDesc: 'Sorry, the olympiad you are looking for is not available.',
        free: 'Free',
    },
};

export default function OlympiadDetail({ slug }) {
    const { language } = useI18n();
    const { url } = usePage();
    const t = detailContent[language] || detailContent.id;
    const text = pageContent[language] || pageContent.id;
    const [hasAccess, setHasAccess] = useState(false);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);

    useEffect(() => {
        const access = sessionStorage.getItem('olympiad_access') === 'granted';
        setHasAccess(access);
        if (!access) {
            setShowPasskeyModal(true);
        }
    }, []);

    // Find the event by slug
    const event = events.find((e) => e.slug === slug);

    if (!event) {
        return (
            <>
                <Head>
                    <title>{t.notFound}</title>
                </Head>
                <section className="bg-gradient-to-br from-violet-50 via-white to-amber-50 min-h-screen flex items-center justify-center">
                    <div className="alc-container text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <svg
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t.notFound}</h1>
                        <p className="text-slate-600 mb-6">{t.notFoundDesc}</p>
                        <Link
                            href="/olimpiade"
                            className="inline-flex items-center gap-2 alc-button bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {t.backToList}
                        </Link>
                    </div>
                </section>
            </>
        );
    }

    const toneClass = toneStyles[event.tone] || toneStyles.violet;
    const eventName = event.name[language] || event.name.id;
    const eventLevel = event.level[language] || event.level.id;
    const eventSchedule = event.schedule[language] || event.schedule.id;
    const eventSelection = event.selection[language] || event.selection.id;
    const eventCategory = event.category[language] || event.category.id;
    const eventFee = event.fee ? (event.fee[language] || event.fee.id) : t.free;
    const eventDesc = event.description[language] || event.description.id;

    return (
        <>
            <Head>
                <title>{eventName}</title>
                <meta name="description" content={eventDesc} />
            </Head>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 alc-pattern alc-section">
                <div className="absolute -left-24 top-10 h-32 w-32 sm:h-52 sm:w-52 rounded-full bg-violet-200/60 blur-3xl" />
                <div className="absolute right-0 top-20 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-amber-200/70 blur-3xl" />

                <div className="alc-container max-w-6xl relative">
                    <Link
                        href="/olimpiade"
                        className="inline-flex items-center gap-2 alc-body-sm text-violet-600 hover:text-violet-700 transition mb-6"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {t.backToList}
                    </Link>

                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] alc-gap-lg items-start">
                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className={`alc-pill alc-caption font-medium ${
                                    eventCategory.toLowerCase() === 'gratis' || eventCategory.toLowerCase() === 'free'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {eventCategory}
                                </span>
                                <span className="alc-pill bg-violet-100 alc-caption font-medium text-violet-700">
                                    {eventLevel}
                                </span>
                            </div>

                            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                                {eventName}
                            </h1>

                            <p className="mt-4 alc-body text-slate-600 max-w-2xl">
                                {eventDesc}
                            </p>

                            {/* Info Grid */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="alc-caption text-slate-500">{t.schedule}</p>
                                        <p className="font-semibold text-slate-800">{eventSchedule}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="alc-caption text-slate-500">{t.fee}</p>
                                        <p className="font-semibold text-slate-800">{eventFee}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="alc-card border border-slate-100 bg-white shadow-lg"
                        >
                            <div className={`flex alc-icon items-center justify-center ${toneClass} mb-4`}>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                </svg>
                            </div>

                            <h3 className="font-display alc-card-title font-semibold text-slate-800 text-center">
                                {t.eventInfo}
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="alc-body-sm text-slate-500">{t.category}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">{eventCategory}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="alc-body-sm text-slate-500">{t.level}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">{eventLevel}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="alc-body-sm text-slate-500">{t.schedule}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">{eventSchedule}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="alc-body-sm text-slate-500">{t.fee}</span>
                                    <span className="alc-body-sm font-medium text-slate-800">{eventFee}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 rounded-xl bg-slate-50">
                                <p className="alc-caption font-medium text-slate-700">{t.selection}</p>
                                <p className="mt-1 alc-caption text-slate-600">{eventSelection}</p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <a
                                    href={contactInfo.whatsapp.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center alc-button bg-gradient-to-r from-violet-600 to-amber-500 alc-body-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:from-violet-700 hover:to-amber-600 min-h-[44px]"
                                >
                                    {t.register}
                                    <svg
                                        className="ml-2 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                                <a
                                    href={contactInfo.whatsapp.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center alc-button border border-green-200 bg-white alc-body-sm font-semibold text-green-700 transition hover:bg-green-50 hover:border-green-300 min-h-[44px]"
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <span className="ml-2">{t.contact}</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-white alc-section">
                <div className="alc-container max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="grid md:grid-cols-2 alc-gap-lg"
                    >
                        <motion.div variants={fadeUp}>
                            <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                                {t.benefits}
                            </h2>
                            <ul className="space-y-3">
                                {t.benefitsList.map((benefit, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 alc-body-sm text-slate-600"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0 mt-0.5">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="alc-card border border-violet-100 bg-gradient-to-br from-violet-50 to-white"
                        >
                            <h3 className="font-display alc-card-title font-semibold text-slate-800 mb-3">
                                {t.contact}
                            </h3>
                            <p className="alc-body-sm text-slate-600 mb-4">{t.contactDesc}</p>
                            <a
                                href={contactInfo.whatsapp.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 alc-body-sm font-semibold text-green-700 hover:text-green-800 transition"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                <span>{contactInfo.whatsapp.number}</span>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <PasskeyModal
                isOpen={showPasskeyModal}
                onClose={() => {
                    if (!hasAccess) {
                        window.location.href = '/';
                    } else {
                        setShowPasskeyModal(false);
                    }
                }}
                targetUrl={url}
                correctPasskey={olympiadPasskey}
                language={language}
                onSuccess={() => {
                    sessionStorage.setItem('olympiad_access', 'granted');
                    setHasAccess(true);
                    setShowPasskeyModal(false);
                }}
            />
        </>
    );
}
