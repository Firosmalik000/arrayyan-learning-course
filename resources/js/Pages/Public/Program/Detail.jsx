import { Link, usePage } from '@inertiajs/react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
    Accordion,
} from '@/Components/Public';
import { programContent, sectionTitles } from '../Home/data';

const mergeContent = (base, override) => {
    if (Array.isArray(base)) {
        return Array.isArray(override) ? override : base;
    }
    if (base && typeof base === 'object') {
        const result = { ...base };
        if (override && typeof override === 'object') {
            Object.keys(override).forEach((key) => {
                if (override[key] === undefined || override[key] === null) return;
                result[key] = mergeContent(base[key], override[key]);
            });
        }
        return result;
    }
    return override !== undefined ? override : base;
};

const localizeField = (value, lang) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.id || value.en || '';
};

export default function ProgramDetail() {
    const { language } = useI18n();
    const { props } = usePage();

    const landing = mergeContent(
        {
            programContent,
            sectionTitles,
        },
        props.landingContent || {}
    );

    const programText = landing.programContent[language] || landing.programContent.id;

    const program = props.program
        ? {
              id: props.program.id,
              slug: props.program.slug || props.program.id,
              name: localizeField(props.program.name, language),
              level: localizeField(props.program.level, language),
              description: localizeField(props.program.description, language),
              price: props.program.price ?? null,
              duration: props.program.duration || null,
              quota: props.program.quota ?? null,
              quotaFilled: props.program.quota_filled ?? 0,
              quotaRemaining: props.program.quota_remaining ?? null,
              isFull: !!props.program.is_full,
              scheduleInfo: props.program.schedule_info || null,
              syllabus: Array.isArray(props.program.syllabus) ? props.program.syllabus : [],
              teacher: props.program.teacher || null,
              subjects: Array.isArray(props.program.subjects) ? props.program.subjects : [],
              mode: localizeField(props.program.mode, language),
              imageUrl: props.program.image_url || null,
          }
        : null;

    const formatRupiah = (value) => {
        if (value == null) return null;
        return `Rp ${Number(value).toLocaleString('id-ID')}`;
    };
    const priceLabel = formatRupiah(program?.price);
    const quotaPercent = program?.quota
        ? Math.min(100, Math.round(((program.quotaFilled || 0) / program.quota) * 100))
        : null;

    const description = program?.description || programText.fallbackDescription;
    const mode = program?.mode || 'Offline & Online';
    const isOnline = String(mode).toLowerCase() === 'online';

    const waConsultationLink = `https://wa.me/6281234567890?text=${encodeURIComponent(
        `Halo Admin ALC, saya tertarik dengan informasi lebih lanjut mengenai program: ${program?.name || 'Program Belajar'}`
    )}`;

    return (
        <>
            <SeoHead
                title={program?.name || 'Detail Program Belajar'}
                description={description}
            />

            {/* Header / Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pt-10 pb-12 border-b border-slate-200/60">
                <Container>
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <Link href="/program" className="hover:text-brand-primary transition">
                            Program Belajar
                        </Link>
                        <span>/</span>
                        <span className="text-brand-primary font-bold line-clamp-1">
                            {program?.name || 'Detail'}
                        </span>
                    </nav>

                    <div className="max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {program?.level && (
                                <Badge variant="primary" size="md">
                                    Jenjang {program.level}
                                </Badge>
                            )}
                            <Badge variant={isOnline ? 'accent' : 'secondary'} size="md">
                                Pembelajaran {mode}
                            </Badge>
                            {program?.quota != null && (
                                <Badge variant={program.isFull ? 'rose' : 'warning'} size="md">
                                    {program.isFull ? 'Kuota Penuh' : `Sisa ${program.quotaRemaining} Kursi`}
                                </Badge>
                            )}
                            <Badge variant="neutral" size="md">
                                Pendaftaran {program?.isFull ? 'Ditutup' : 'Aktif'}
                            </Badge>
                        </div>

                        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {program?.name || 'Program Belajar'}
                        </h1>

                        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                            {description}
                        </p>
                    </div>
                </Container>
            </section>

            {/* Main Content & Sticky Conversion Sidebar */}
            <section className="py-12 sm:py-16 bg-white">
                <Container>
                    {!program ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
                            Program belajar tidak ditemukan atau sedang tidak aktif.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
                            {/* Left Area: Main Details (8 cols) */}
                            <div className="lg:col-span-8 space-y-10">
                                {/* Program Image */}
                                <div className="aspect-16/9 w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-violet-100 via-amber-50 to-emerald-50 shadow-xs">
                                    {program.imageUrl ? (
                                        <img
                                            src={program.imageUrl}
                                            alt={program.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-violet-400">
                                            <div className="text-center p-8">
                                                <svg className="mx-auto h-16 w-16 opacity-40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                                </svg>
                                                <p className="text-lg font-bold text-slate-800">{program.name}</p>
                                                <p className="text-sm text-slate-500 mt-1">Ar Rayyan Learning Course</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Subjects Covered */}
                                {program.subjects.length > 0 && (
                                    <div>
                                        <h3 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-primary">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                                </svg>
                                            </span>
                                            <span>Mata Pelajaran yang Dipelajari</span>
                                        </h3>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {program.subjects.map((subj, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 shadow-2xs"
                                                >
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-brand-primary text-xs font-bold">
                                                        ✓
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-800">{subj}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Syllabus */}
                                {program.syllabus.length > 0 && (
                                    <div>
                                        <h3 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-primary">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                                </svg>
                                            </span>
                                            <span>Silabus Program</span>
                                        </h3>

                                        <Accordion
                                            items={program.syllabus.map((item, idx) => ({
                                                id: `syllabus-${idx}`,
                                                question: `Materi ${idx + 1}: ${item}`,
                                                answer: `Bagian dari kurikulum terstruktur program ${program.name}. Detail pembahasan disampaikan tutor saat sesi belajar.`,
                                            }))}
                                        />
                                    </div>
                                )}

                                {/* Facilities & Program Benefits */}
                                <div>
                                    <h3 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                        <span>Fasilitas & Pendekatan Belajar</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <p className="font-bold text-slate-900 text-sm">Pendampingan Personal & Ramah</p>
                                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                                Tutor membimbing secara bertahap sesuai pemahaman dan gaya belajar siswa tanpa intimidasi.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <p className="font-bold text-slate-900 text-sm">Modul Latihan Terstandar</p>
                                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                                Materi ringkas, latihan soal bertingkat, dan persiapan ujian sekolah yang up-to-date.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <p className="font-bold text-slate-900 text-sm">Laporan Berkala ke Orang Tua</p>
                                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                                Evaluasi berkala progres pemahaman anak disampaikan secara transparan kepada orang tua.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <p className="font-bold text-slate-900 text-sm">Akses Bank Soal & Konsultasi PR</p>
                                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                                Siswa bebas bertanya pekerjaan rumah dan mengakses bank soal eksklusif ALC.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Program FAQs */}
                                <div>
                                    <h3 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                            </svg>
                                        </span>
                                        <span>Pertanyaan Seputar Program Ini</span>
                                    </h3>

                                    <Accordion
                                        items={[
                                            {
                                                question: 'Bagaimana penentuan jadwal bimbingan untuk program ini?',
                                                answer: 'Jadwal belajar dapat disesuaikan secara fleksibel dengan jadwal sekolah dan aktivitas anak. Anda dapat memilih sesi pagi, siang, atau sore sesuai ketersediaan slot tutor.',
                                            },
                                            {
                                                question: 'Apakah program ini tersedia dalam bentuk kelas privat (1-on-1)?',
                                                answer: 'Ya, seluruh program ALC mendukung format privat 1-on-1 untuk pendampingan yang lebih mendalam, maupun kelompok kecil (2-4 siswa) dengan teman sebaya.',
                                            },
                                            {
                                                question: 'Apakah ada latihan try out atau evaluasi berkala?',
                                                answer: 'Tentu. Setiap modul dilengkapi kuis pemahaman dan try out berkala untuk mengukur kesiapan anak menghadapi ujian sekolah maupun asesmen nasional.',
                                            },
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Right Area: Sticky Conversion Card (4 cols) */}
                            <div className="lg:col-span-4 lg:sticky lg:top-24">
                                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xl">
                                    <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Program</p>
                                            <p className="text-base font-bold text-slate-900 mt-0.5">Pendaftaran Dibuka</p>
                                        </div>
                                        <Badge variant="accent" size="sm">Tersedia</Badge>
                                    </div>

                                    {/* Meta highlights */}
                                    <div className="my-5 space-y-3 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Jenjang Target</span>
                                            <span className="font-bold text-slate-900">{program.level || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Metode Belajar</span>
                                            <span className="font-bold text-slate-900">{mode}</span>
                                        </div>
                                        {priceLabel && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 font-medium">Biaya Program</span>
                                                <span className="font-bold text-brand-primary">{priceLabel}</span>
                                            </div>
                                        )}
                                        {program.duration && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 font-medium">Durasi</span>
                                                <span className="font-bold text-slate-900">{program.duration}</span>
                                            </div>
                                        )}
                                        {program.scheduleInfo && (
                                            <div className="flex items-start justify-between gap-3">
                                                <span className="text-slate-500 font-medium shrink-0">Jadwal</span>
                                                <span className="font-bold text-slate-900 text-right">{program.scheduleInfo}</span>
                                            </div>
                                        )}
                                        {program.teacher && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 font-medium">Pengajar</span>
                                                <span className="font-bold text-slate-900">{program.teacher.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Jumlah Mapel</span>
                                            <span className="font-bold text-slate-900">{program.subjects.length} Bidang Studi</span>
                                        </div>
                                        {program.quota != null && (
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Keterisian Kuota</span>
                                                    <span className="font-bold text-slate-900">{program.quotaFilled}/{program.quota}</span>
                                                </div>
                                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${program.isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${quotaPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Konsultasi Awal</span>
                                            <span className="font-bold text-emerald-600">Gratis (Placement Test)</span>
                                        </div>
                                    </div>

                                    {/* CTAs */}
                                    <div className="space-y-3 pt-2">
                                        {program.isFull ? (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full opacity-60"
                                                disabled
                                            >
                                                Kuota Penuh
                                            </Button>
                                        ) : (
                                            <Button
                                                href={`/pendaftaran?program_id=${program.id}`}
                                                variant="primary"
                                                size="lg"
                                                className="w-full"
                                            iconRight={
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            }
                                        >
                                            Daftar Program Ini
                                        </Button>
                                        )}

                                        <Button
                                            href={waConsultationLink}
                                            variant="outline"
                                            size="md"
                                            className="w-full"
                                            iconLeft={
                                                <svg className="h-4 w-4 fill-emerald-600" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                            }
                                        >
                                            Tanya via WhatsApp
                                        </Button>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                                        <Link href="/program" className="text-xs font-semibold text-slate-500 hover:text-brand-primary transition">
                                            ← Kembali ke Semua Program
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Container>
            </section>
        </>
    );
}
