import { Link, usePage } from '@inertiajs/react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/formatDate';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
} from '@/Components/Public';

const formatCurrency = (value, lang = 'id') => {
    if (!value || value === 0) return lang === 'en' ? 'Free' : 'Gratis';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function OlympiadDetail() {
    const { language } = useI18n();
    const { props } = usePage();

    const olympiad = props.olympiad;
    const isEnglish = language === 'en';

    if (!olympiad) {
        return (
            <div className="py-24 bg-slate-50 min-h-[60vh] flex items-center justify-center">
                <Container>
                    <div className="mx-auto max-w-md text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEnglish ? 'Olympiad Not Found' : 'Olimpiade Tidak Ditemukan'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {isEnglish
                                ? 'Sorry, the olympiad you are looking for is not available or has been removed.'
                                : 'Maaf, informasi kompetisi atau olimpiade yang Anda cari tidak tersedia.'}
                        </p>
                        <div className="mt-6">
                            <Button href="/olimpiade" variant="primary">
                                {isEnglish ? 'Back to Olympiads' : 'Kembali ke Info Olimpiade'}
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    const name = olympiad.name;
    const level = olympiad.level || '-';
    const scheduleFormatted = formatDate(olympiad.schedule, language);
    const selection = olympiad.selection_system || '-';
    const isPaid =
        String(olympiad.category).toLowerCase() === 'paid' ||
        String(olympiad.category).toLowerCase() === 'berbayar';
    const feeText = isPaid ? formatCurrency(olympiad.fee, language) : (isEnglish ? 'Free' : 'Gratis');
    const description = olympiad.notes || 'Informasi lengkap kompetisi dan olimpiade berprestasi ALC.';
    const imageUrl = olympiad.image_url;

    const quota = olympiad.quota ?? null;
    const quotaFilled = olympiad.quota_filled ?? 0;
    const quotaRemaining = olympiad.quota_remaining ?? null;
    const isFull = quota != null && (quotaRemaining ?? 1) <= 0;
    const closedReason = olympiad.closed_reason || (isFull ? 'Kuota peserta sudah penuh.' : null);
    const canRegister = !closedReason;
    const winners = Array.isArray(olympiad.winners) ? olympiad.winners : [];
    const deadline = olympiad.registration_deadline || null;

    const daysUntil = (() => {
        if (!olympiad.schedule) return null;
        const diff = Math.ceil((new Date(olympiad.schedule) - new Date()) / 86400000);
        return diff;
    })();

    const waRegistrationLink = `https://wa.me/6281234567890?text=${encodeURIComponent(
        `Halo Admin ALC, saya ingin mendaftar / berkonsultasi mengenai persiapan lomba: ${name}`
    )}`;

    return (
        <>
            <SeoHead
                title={name}
                description={description}
                type="event"
                structuredData={{
                    '@type': 'Event',
                    name: name,
                    description: description,
                    startDate: olympiad.schedule,
                    image: imageUrl || undefined,
                }}
            />

            {/* Header Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-slate-50/40 pt-10 pb-12 border-b border-slate-200/60">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <Link href="/olimpiade" className="hover:text-brand-primary transition">
                            Pusat Olimpiade
                        </Link>
                        <span>/</span>
                        <span className="text-amber-700 font-bold line-clamp-1">{name}</span>
                    </nav>

                    <div className="max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant={isPaid ? 'warning' : 'accent'} size="md">
                                {feeText}
                            </Badge>
                            {level && <Badge variant="primary" size="md">Jenjang {level}</Badge>}
                            {daysUntil != null && daysUntil >= 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                    {daysUntil === 0 ? 'Hari ini!' : `${daysUntil} hari lagi`}
                                </span>
                            )}
                            {quota != null && (
                                <Badge variant={isFull ? 'rose' : 'secondary'} size="md">
                                    {isFull ? 'Kuota Penuh' : `Sisa ${quotaRemaining} kursi`}
                                </Badge>
                            )}
                            {scheduleFormatted && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{scheduleFormatted}</span>
                                </span>
                            )}
                        </div>

                        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {name}
                        </h1>

                        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                            {description}
                        </p>
                    </div>
                </Container>
            </section>

            {/* Detail Content */}
            <section className="py-12 sm:py-16 bg-white">
                <Container>
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
                        {/* Left Main (8 cols) */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Poster / Media Area */}
                            <div className="aspect-16/9 w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-amber-100 via-orange-50 to-violet-50 shadow-xs">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-amber-600">
                                        <div className="text-center p-8">
                                            <svg className="mx-auto h-16 w-16 opacity-40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.982-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.25h13.5v1.986m-13.5 0A23.515 23.515 0 0112 3.75c2.617 0 5.12.395 7.5 1.125m-1.125.361c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.396 4.972m2.48-5.492V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.01 6.01 0 01-4.75 0" />
                                            </svg>
                                            <p className="text-xl font-bold text-slate-900">{name}</p>
                                            <p className="text-xs text-slate-500 mt-1">Pusat Prestasi Ar Rayyan Learning Course</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sistem Seleksi & Mekanisme */}
                            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/60 p-6 sm:p-8">
                                <h3 className="font-display text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                        </svg>
                                    </span>
                                    <span>Sistem Seleksi & Alur Kompetisi</span>
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {selection !== '-' ? selection : 'Seleksi dilakukan secara terbuka dengan pembinaan intensif dari tutor ALC.'}
                                </p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <span className="font-bold text-amber-600">Tahap 1</span>
                                        <p className="font-bold text-slate-900 mt-1">Pendaftaran & Seleksi</p>
                                        <p className="text-slate-500 mt-0.5">Asesmen kemampuan awal siswa</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <span className="font-bold text-amber-600">Tahap 2</span>
                                        <p className="font-bold text-slate-900 mt-1">Pembinaan Intensif</p>
                                        <p className="text-slate-500 mt-0.5">Latihan soal olimpiade terpadu</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <span className="font-bold text-amber-600">Tahap 3</span>
                                        <p className="font-bold text-slate-900 mt-1">Pelaksanaan Lomba</p>
                                        <p className="text-slate-500 mt-0.5">Pendampingan saat hari kejuaraan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Winners announcement */}
                            {winners.length > 0 && (
                                <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
                                    <h3 className="font-display text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5h8v4a4 4 0 01-8 0V5Zm-2 0H5a1 1 0 00-1 1c0 2.5 2 4.5 4.5 4.5M18 5h1a1 1 0 011 1c0 2.5-2 4.5-4.5 4.5M12 13v4m-3 4h6m-6 0-1 3m7-3-1 3" />
                                            </svg>
                                        </span>
                                        <span>Pengumuman Pemenang</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Selamat kepada para juara! Klik nama untuk melihat sertifikat.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {winners.map((w, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/olimpiade/${olympiad.slug}/sertifikat?name=${encodeURIComponent(w)}`}
                                                className="rounded-full border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                                            >
                                                {idx + 1}. {w}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Keuntungan Mengikuti */}
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-primary">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <span>Fasilitas Pembinaan ALC</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {[
                                        'Mentor berprestasi dan berpengalaman membimbing lomba',
                                        'Kumpulan paket soal olimpiade tahun-tahun sebelumnya',
                                        'Simulasi try out berkala dengan sistem penilaian standar',
                                        'Sertifikat keikutsertaan dan pendampingan psikologis bertanding',
                                    ].map((benefit, idx) => (
                                        <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary text-xs font-bold mt-0.5">
                                                ✓
                                            </span>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar (4 cols - Sticky Card) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xl">
                                <h4 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                                    Ringkasan Event
                                </h4>

                                <div className="my-4 space-y-3.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Jadwal Event</span>
                                        <span className="font-bold text-slate-900">{scheduleFormatted || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Jenjang Peserta</span>
                                        <span className="font-bold text-slate-900">{level}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Biaya Lomba</span>
                                        <span className={`font-bold ${isPaid ? 'text-amber-700' : 'text-emerald-700'}`}>
                                            {feeText}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Sistem Seleksi</span>
                                        <span className="font-bold text-slate-900 truncate max-w-[140px] text-right">{selection}</span>
                                    </div>
                                    {quota != null && (
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 font-medium">Kuota Peserta</span>
                                                <span className="font-bold text-slate-900">{quotaFilled}/{quota}</span>
                                            </div>
                                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${Math.min(100, Math.round((quotaFilled / quota) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {deadline && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Batas Daftar</span>
                                            <span className="font-bold text-slate-900">{formatDate(deadline, language)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-2">
                                    {canRegister ? (
                                        <Button
                                            href={`/olimpiade/${olympiad.slug}/daftar`}
                                            variant="secondary"
                                            size="lg"
                                            className="w-full"
                                            iconRight={
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            }
                                        >
                                            Daftar Sekarang
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="lg" className="w-full opacity-60" disabled>
                                            {closedReason || 'Pendaftaran Ditutup'}
                                        </Button>
                                    )}
                                    <Button
                                        href={waRegistrationLink}
                                        variant="outline"
                                        size="md"
                                        className="w-full"
                                    >
                                        Tanya via WhatsApp
                                    </Button>

                                    <Button
                                        href="/olimpiade"
                                        variant="outline"
                                        size="md"
                                        className="w-full"
                                    >
                                        ← Kembali ke Semua Lomba
                                    </Button>
                                </div>
                            </div>

                            {/* Assistance Info */}
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                                <h5 className="text-sm font-bold text-slate-900">Ingin Mengajukan Lomba Baru?</h5>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Hubungi tim ALC jika ada informasi lomba dari sekolah atau universitas yang ingin didampingi.
                                </p>
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20ingin%20mengajukan%20pendampingan%20lomba"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
                                >
                                    <span>Hubungi Koordinator Lomba</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
