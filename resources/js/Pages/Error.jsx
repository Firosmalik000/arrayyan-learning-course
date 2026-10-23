import { Head, Link, usePage } from '@inertiajs/react';
import { useI18n } from '../lib/i18n';
import LanguageSelector from '../Components/LanguageSelector';

export default function ErrorPage({ status = 404, message = null }) {
    const { t, language } = useI18n();
    const { props } = usePage();

    const logoSrc = props?.appLogo || '/images/logo.jpeg';
    const seoContact = props?.seoSettings?.contact || {};
    const rawPhone = seoContact?.phone || '+62 812-3456-7890';
    const cleanPhone = typeof rawPhone === 'string' ? rawPhone.replace(/[^0-9]/g, '') : '6281234567890';
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo Admin Ar Rayyan Learning Course, saya mengalami kendala ${status} pada website.`)}`;

    const authUser = props?.auth?.user;
    const authPortal = props?.auth?.portal;

    const errorDetails = {
        404: {
            badgeId: '404 • Halaman Tidak Ditemukan',
            badgeEn: '404 • Page Not Found',
            titleId: 'Oops! Jejak Halaman Belum Ditemukan',
            titleEn: 'Oops! Page Could Not Be Found',
            descId: 'Halaman yang Anda tuju mungkin telah dipindahkan, diganti tautannya, atau alamat URL yang dimasukkan kurang tepat. Mari kami pandu kembali ke materi yang tepat.',
            descEn: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let us guide you back.',
            color: 'violet',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-violet-600 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-violet-200 fill-violet-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <circle cx="56" cy="52" r="26" className="stroke-violet-600 fill-white shadow-lg" strokeWidth="4" />
                    <path d="M75 71L94 90" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    <path d="M46 52H66M56 42V62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                    <circle cx="88" cy="36" r="4" className="fill-amber-400 animate-ping opacity-75" />
                    <circle cx="88" cy="36" r="3" className="fill-amber-400" />
                    <circle cx="28" cy="74" r="2.5" className="fill-emerald-400" />
                </svg>
            ),
        },
        403: {
            badgeId: '403 • Akses Terbatas',
            badgeEn: '403 • Access Forbidden',
            titleId: 'Area Terbatas atau Akses Ditolak',
            titleEn: 'Restricted Area or Access Denied',
            descId: 'Maaf, Anda tidak memiliki izin atau hak akses untuk membuka halaman ini. Pastikan Anda telah masuk dengan akun resmi yang berwenang.',
            descEn: 'Sorry, you do not have permission to access this page. Please make sure you are logged in with the appropriate authorized account.',
            color: 'amber',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-amber-500 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-amber-200 fill-amber-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <rect x="42" y="52" width="36" height="36" rx="8" className="fill-white stroke-amber-500" strokeWidth="4" />
                    <path d="M48 52V42C48 35.3726 53.3726 30 60 30C66.6274 30 72 35.3726 72 42V52" className="stroke-amber-500" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="60" cy="68" r="4" className="fill-amber-500" />
                    <path d="M60 72V78" className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="32" cy="40" r="3" className="fill-violet-400" />
                    <circle cx="88" cy="76" r="3.5" className="fill-amber-400" />
                </svg>
            ),
        },
        419: {
            badgeId: '419 • Sesi Berakhir',
            badgeEn: '419 • Page Session Expired',
            titleId: 'Sesi Halaman Telah Berakhir',
            titleEn: 'Your Page Session Has Expired',
            descId: 'Demi perlindungan keamanan data, sesi formulir atau halaman ini telah berakhir karena tidak ada aktivitas dalam beberapa saat. Silakan muat ulang halaman.',
            descEn: 'For your security, your session has timed out due to inactivity. Please refresh the page and try again.',
            color: 'sky',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-sky-600 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-sky-200 fill-sky-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <circle cx="60" cy="60" r="28" className="stroke-sky-500 fill-white" strokeWidth="4" />
                    <path d="M60 44V60L72 68" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M92 48A36 36 0 1 0 96 66" className="stroke-sky-400" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
                    <path d="M96 42V48H90" className="stroke-sky-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="28" cy="38" r="3" className="fill-amber-400" />
                </svg>
            ),
        },
        500: {
            badgeId: '500 • Kendala Server',
            badgeEn: '500 • Internal Server Error',
            titleId: 'Terjadi Kendala Teknis Internal',
            titleEn: 'An Internal Technical Issue Occurred',
            descId: 'Sistem kami sedang mengalami gangguan sementara di balik layar. Tim teknis Ar Rayyan sedang menangani kendala ini. Silakan coba kembali beberapa saat lagi.',
            descEn: 'We are experiencing an unexpected technical issue on our end. Our engineering team is currently fixing it. Please try again shortly.',
            color: 'rose',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-rose-500 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-rose-200 fill-rose-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <rect x="36" y="44" width="48" height="34" rx="8" className="fill-white stroke-rose-500" strokeWidth="4" />
                    <circle cx="48" cy="61" r="3" className="fill-rose-500" />
                    <circle cx="60" cy="61" r="3" className="fill-rose-500" />
                    <path d="M72 61L77 56M77 66L72 61" className="stroke-rose-500" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M50 78V88M70 78V88M42 88H78" className="stroke-rose-400" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="88" cy="36" r="3" className="fill-amber-400" />
                </svg>
            ),
        },
        503: {
            badgeId: '503 • Pemeliharaan Sistem',
            badgeEn: '503 • Service Maintenance',
            titleId: 'Sistem Sedang Ditingkatkan',
            titleEn: 'System Under Scheduled Maintenance',
            descId: 'Kami sedang melakukan pemeliharaan berkala untuk meningkatkan kehandalan dan performa platform belajar. Kami akan kembali secepatnya!',
            descEn: 'We are performing routine maintenance to enhance platform performance and security. We will be back online shortly!',
            color: 'amber',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-amber-500 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-amber-200 fill-amber-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <path d="M46 76L64 58M70 52C72.5 49.5 73.5 46 72.5 43C71.5 40 68 38.5 65 39.5C62 40.5 58.5 39.5 56 37C52.5 33.5 53 28 53 28C53 28 47.5 28.5 44 32C41.5 34.5 40.5 38 41.5 41C42.5 44 41 47.5 38 48.5C35 49.5 33.5 53 34.5 56C35.5 59 39 60 41.5 57.5L46 62" className="stroke-amber-600 fill-white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M60 84L82 62M78 86L86 78" className="stroke-amber-500" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="88" cy="40" r="3.5" className="fill-emerald-400" />
                </svg>
            ),
        },
        401: {
            badgeId: '401 • Perlu Masuk Akun',
            badgeEn: '401 • Unauthorized',
            titleId: 'Silakan Masuk Terlebih Dahulu',
            titleEn: 'Authentication Required',
            descId: 'Halaman ini memerlukan autentikasi login. Silakan masuk ke akun Portal Siswa atau Akun Pengajar Anda untuk melanjutkan.',
            descEn: 'You must be logged in to view this page. Please log in with your account to continue.',
            color: 'violet',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-violet-600 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-violet-200 fill-violet-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <circle cx="60" cy="48" r="16" className="stroke-violet-600 fill-white" strokeWidth="3.5" />
                    <path d="M38 88C38 76 48 70 60 70C72 70 82 76 82 88" className="stroke-violet-600" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
            ),
        },
        429: {
            badgeId: '429 • Batas Akses Terlampaui',
            badgeEn: '429 • Too Many Requests',
            titleId: 'Terlalu Banyak Permintaan',
            titleEn: 'Too Many Requests',
            descId: 'Sistem mendeteksi terlalu banyak aktivitas dalam waktu singkat. Mohon istirahat sejenak dan coba kembali dalam 1 menit.',
            descEn: 'You have sent too many requests in a short period. Please take a breath and try again in a minute.',
            color: 'amber',
            icon: (
                <svg className="w-24 h-24 sm:w-28 sm:h-28 text-amber-500 transition-transform duration-500 hover:scale-105" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" className="stroke-amber-200 fill-amber-50/60" strokeWidth="2.5" strokeDasharray="6 6" />
                    <circle cx="60" cy="60" r="28" className="stroke-amber-500 fill-white" strokeWidth="4" />
                    <path d="M60 42V60" className="stroke-amber-500" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="60" cy="72" r="3" className="fill-amber-500" />
                </svg>
            ),
        },
    };

    const currentConfig = errorDetails[status] || {
        badgeId: `${status} • Terjadi Kendala`,
        badgeEn: `${status} • Error Occurred`,
        titleId: 'Terjadi Kendala pada Halaman',
        titleEn: 'An Unexpected Error Occurred',
        descId: 'Terjadi kesalahan saat memproses permintaan Anda. Silakan muat ulang halaman atau kembali ke beranda.',
        descEn: 'An unexpected issue occurred while processing your request. Please reload or return home.',
        color: 'violet',
        icon: errorDetails[404].icon,
    };

    const isIndo = language === 'id';
    const badgeText = isIndo ? currentConfig.badgeId : currentConfig.badgeEn;
    const titleText = isIndo ? currentConfig.titleId : currentConfig.titleEn;
    const descText = message || (isIndo ? currentConfig.descId : currentConfig.descEn);

    const handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    const quickLinks = [
        {
            title: isIndo ? 'Beranda Utama' : 'Home Page',
            desc: isIndo ? 'Kembali ke pintu masuk utama ALC' : 'Return to main entrance',
            href: '/',
            icon: (
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            title: isIndo ? 'Program Belajar' : 'Learning Programs',
            desc: isIndo ? 'Eksplorasi kelas TK, SD, SMP, & SMA' : 'Explore classes & tutoring',
            href: '/program',
            icon: (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            ),
        },
        {
            title: isIndo ? 'Bank Soal' : 'Question Bank',
            desc: isIndo ? 'Latihan ujian & pembahasan lengkap' : 'Practice tests & solutions',
            href: '/bank-soal',
            icon: (
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            title: isIndo ? 'Cek Pendaftaran' : 'Check Status',
            desc: isIndo ? 'Pantau tiket status pendaftaran murid' : 'Track admission tickets',
            href: '/cek-status',
            icon: (
                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col justify-between selection:bg-violet-100 selection:text-violet-900 relative overflow-x-hidden font-sans">
            <Head title={`${status} - ${titleText}`} />

            {/* Ambient Background Decorative Effects */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl" />
                <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
                <div className="absolute -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full bg-emerald-100/30 blur-3xl" />
                <div className="absolute inset-0 alc-pattern opacity-60" />
            </div>

            {/* Minimalist Top Brand Header */}
            <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-transform">
                            <img
                                src={logoSrc}
                                alt="Ar Rayyan Logo"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                        e.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                }}
                            />
                            <div className="hidden h-full w-full items-center justify-center bg-violet-700 font-bold text-white text-xs rounded-xl">
                                ALC
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-black text-slate-900 text-base sm:text-lg leading-tight group-hover:text-violet-700 transition-colors">
                                Ar Rayyan
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                                Learning Course
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <LanguageSelector variant="topbar" />
                        <Link
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-violet-700 hover:bg-violet-50 transition border border-slate-200/80"
                        >
                            <span>{isIndo ? 'Beranda' : 'Home'}</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Central Error Showcase Canvas */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
                <div className="max-w-3xl w-full mx-auto">
                    {/* Glowing Error Card */}
                    <div className="relative rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/50 text-center">
                        {/* Decorative Top Pill Status */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200/80 px-4 py-1.5 text-xs font-bold text-violet-800 shadow-2xs mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600" />
                            </span>
                            <span>{badgeText}</span>
                        </div>

                        {/* Visual Centerpiece Illustration */}
                        <div className="flex justify-center mb-6">
                            <div className="relative p-3 rounded-full bg-linear-to-b from-slate-50 to-violet-50/50 border border-slate-100 shadow-inner">
                                {currentConfig.icon}
                                <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-black tracking-wider text-slate-700 shadow-xs">
                                    ERR {status}
                                </div>
                            </div>
                        </div>

                        {/* Typography & Messaging */}
                        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">
                            {titleText}
                        </h1>
                        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
                            {descText}
                        </p>

                        {/* Interactive Main Action Controls */}
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-700 to-indigo-600 hover:from-violet-800 hover:to-indigo-700 text-white font-bold px-6 py-3 text-sm shadow-md shadow-violet-500/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>{isIndo ? 'Kembali ke Beranda' : 'Return to Home'}</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleReload}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-3 text-sm shadow-2xs hover:border-violet-300 hover:text-violet-700 active:scale-95 transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{isIndo ? 'Muat Ulang Halaman' : 'Refresh Page'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold px-4 py-3 text-sm active:scale-95 transition cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>{isIndo ? 'Kembali' : 'Go Back'}</span>
                            </button>
                        </div>

                        {/* Dedicated Shortcuts Grid */}
                        <div className="pt-8 border-t border-slate-100 text-left">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
                                {isIndo ? 'Akses Cepat Layanan ALC' : 'Quick Access Navigation'}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {quickLinks.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-violet-50/80 hover:border-violet-200/80 transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-xs transition">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                                                {item.title}
                                            </div>
                                            <div className="text-[11px] text-slate-500 truncate">
                                                {item.desc}
                                            </div>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Help Desk & Assistance Banner */}
                        <div className="mt-8 rounded-2xl bg-linear-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-emerald-900">
                                        {isIndo ? 'Butuh bantuan dengan akun atau materi Anda?' : 'Need urgent assistance with your account?'}
                                    </div>
                                    <div className="text-[11px] text-emerald-700">
                                        {isIndo ? 'Customer Care & Admin ALC siap membantu setiap hari kerja.' : 'Our customer support team is ready to assist you.'}
                                    </div>
                                </div>
                            </div>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 transition shadow-xs"
                            >
                                <span>{isIndo ? 'Hubungi WhatsApp' : 'Contact Support'}</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Minimalist Branded Footer */}
            <footer className="relative z-10 w-full border-t border-slate-200/60 bg-white/70 backdrop-blur-xs py-5 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>&copy; {new Date().getFullYear()} Ar Rayyan Learning Course. Hak Cipta Dilindungi.</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                        <Link href="/faq" className="hover:text-violet-700 transition">FAQ</Link>
                        <span>•</span>
                        <Link href="/program" className="hover:text-violet-700 transition">{isIndo ? 'Program' : 'Programs'}</Link>
                        <span>•</span>
                        <Link href="/cek-status" className="hover:text-violet-700 transition">{isIndo ? 'Status Pendaftaran' : 'Check Status'}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Dedicated standalone layout so this page never fails even if parent layouts break
ErrorPage.layout = (page) => page;
