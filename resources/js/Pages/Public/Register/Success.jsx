import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import { Button, Container, Badge } from '@/Components/Public';

export default function RegistrationSuccess({ registrationType, ticket, registration }) {
    const { props } = usePage();
    const [copied, setCopied] = useState(false);
    const isStudent = registrationType === 'murid';

    // Ambil kontak WhatsApp admin dari settings
    const seoContact = props.seoSettings?.contact || {};
    const socials = seoContact.socials || [];
    const waSocial = socials.find((s) => s.key === 'whatsapp') || {};
    const rawPhone = seoContact.phone || '081234567890';
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    const defaultWa = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const adminWaLink =
        waSocial.link ||
        `https://wa.me/${defaultWa}?text=${encodeURIComponent(
            `Halo Admin ALC, saya ingin konfirmasi pendaftaran ${isStudent ? 'murid' : 'pengajar'} dengan No. Tiket: ${ticket}`
        )}`;

    const copyTicket = async () => {
        try {
            await navigator.clipboard.writeText(ticket);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <>
            <SeoHead
                title={`Pendaftaran Berhasil - ${ticket}`}
                description="Pendaftaran Ar Rayyan Learning Course berhasil dikirim. Simpan nomor tiket untuk melacak status pendaftaran Anda."
                noIndex
            />

            <section className="relative min-h-[90vh] py-10 sm:py-16 px-4 bg-gradient-to-b from-slate-50 via-violet-50/20 to-white overflow-hidden">
                {/* Background decorative glows */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-violet-200/40 via-amber-100/30 to-emerald-100/30 blur-3xl rounded-full"
                />

                <Container className="relative z-10 max-w-3xl mx-auto">
                    {/* Alur Proses Pendaftaran (Progress Tracker) */}
                    <div className="mb-8">
                        <div className="mx-auto max-w-xl flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0" />
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0" />

                            {/* Step 1: Selesai */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span className="mt-1.5 text-[11px] font-bold text-slate-700">Isi Formulir</span>
                            </div>

                            {/* Step 2: Sedang Berjalan */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm animate-pulse">
                                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                                </div>
                                <span className="mt-1.5 text-[11px] font-bold text-brand-primary">Verifikasi Data</span>
                            </div>

                            {/* Step 3: Langkah Akhir */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm">
                                    3
                                </div>
                                <span className="mt-1.5 text-[11px] font-medium text-slate-400">Mulai Belajar</span>
                            </div>
                        </div>
                    </div>

                    {/* Digital Admission Pass (Main Card) */}
                    <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(91,42,134,0.15)]">
                        {/* Header Kartu: Nuansa Mewah Brand ALC */}
                        <div className="relative bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 px-6 py-8 text-white sm:px-10 sm:py-10">
                            {/* Watermark aksen geometri */}
                            <div className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-white/5 blur-2xl" />
                            <div className="pointer-events-none absolute top-4 right-6 text-white/10 font-black text-6xl tracking-widest select-none font-mono">
                                ALC
                            </div>

                            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold tracking-wide text-amber-300 ring-1 ring-white/15">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                                    TANDA PENDAFTARAN RESMI
                                </span>
                                <span className="text-xs text-violet-200 font-mono">
                                    {registration?.createdAt ? `${registration.createdAt} WIB` : 'Baru saja'}
                                </span>
                            </div>

                            <div className="relative z-10 mt-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
                                        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                            Alhamdulillah, Pendaftaran Berhasil Dikirim!
                                        </h1>
                                        <p className="mt-1 text-xs sm:text-sm text-violet-200 leading-relaxed">
                                            Terima kasih telah mempercayakan pendidikan ananda bersama <strong>Ar Rayyan Learning Course</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Perforated Ticket Cut-Out Divider */}
                        <div className="relative flex items-center bg-white px-4 py-1">
                            <div className="absolute -left-3 h-6 w-6 rounded-full bg-slate-100 border-r border-slate-200" />
                            <div className="w-full border-t-2 border-dashed border-slate-200" />
                            <div className="absolute -right-3 h-6 w-6 rounded-full bg-slate-100 border-l border-slate-200" />
                        </div>

                        {/* Body Tiket: Nomor Tiket & Metadata */}
                        <div className="px-4 xs:px-6 py-6 sm:px-10 sm:py-8 bg-white">
                            {/* Kotak Nomor Tiket Utama */}
                            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/40 p-4 xs:p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                            Nomor Tiket Registrasi
                                        </span>
                                        <Badge variant={isStudent ? 'primary' : 'secondary'} size="xs">
                                            {isStudent ? 'Murid Baru' : 'Calon Pengajar'}
                                        </Badge>
                                    </div>

                                    <Badge variant="accent" size="xs">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Menunggu Verifikasi (1x24 Jam)
                                    </Badge>
                                </div>

                                <div className="mt-3 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                                    <div className="font-mono text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-wider text-slate-900 select-all break-all">
                                        {ticket}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={copyTicket}
                                        className={`w-full xs:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                            copied
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-brand-primary shadow-2xs active:scale-95'
                                        }`}
                                        aria-label="Salin nomor tiket"
                                    >
                                        {copied ? (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                <span>Nomor Tiket Tersalin!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                                <span>Salin Tiket</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Ringkasan Data Pendaftar */}
                                {registration && (
                                    <div className="mt-5 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60">
                                            <span className="block text-[11px] text-slate-400 font-medium">Nama Peserta</span>
                                            <span className="font-bold text-slate-800 text-sm truncate block mt-0.5">
                                                {registration.name || '-'}
                                            </span>
                                        </div>

                                        <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60">
                                            <span className="block text-[11px] text-slate-400 font-medium">Program & Jenjang</span>
                                            <span className="font-bold text-slate-800 text-sm truncate block mt-0.5">
                                                {registration.program || 'Reguler'}
                                                {registration.level ? ` • ${registration.level}` : ''}
                                            </span>
                                        </div>

                                        <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60">
                                            <span className="block text-[11px] text-slate-400 font-medium">Kontak WhatsApp</span>
                                            <span className="font-bold text-slate-800 text-sm truncate block mt-0.5 font-mono">
                                                {registration.phone || '-'}
                                            </span>
                                        </div>

                                        {registration.package && (
                                            <div className="sm:col-span-2 lg:col-span-3 bg-white/80 rounded-xl p-3 border border-slate-200/60 flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400 font-medium">Pilihan Paket:</span>
                                                <span className="font-semibold text-slate-700 text-xs">
                                                    {registration.package}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Alur Langkah Berikutnya (What to Expect - Teks Indah & Bermanfaat) */}
                            <div className="mt-8">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
                                    Langkah Selanjutnya dari Tim Akademik ALC
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 transition hover:bg-slate-50">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.874-.954 4.475 4.475 0 00.32-1.222C3.21 17.37 2.25 14.82 2.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">1. Konfirmasi & Verifikasi WhatsApp (1x24 Jam)</h3>
                                            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                                                Admin akademik ALC akan menghubungi nomor WhatsApp terdaftar untuk memvalidasi data dan mendiskusikan target belajar ananda.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 transition hover:bg-slate-50">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-brand-primary mt-0.5">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">2. Placement Test & Penyesuaian Tutor</h3>
                                            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                                                Tersedia pemetaan awal kemampuan belajar secara gratis untuk menentukan modul dan tutor yang paling cocok bagi kebutuhan siswa.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 transition hover:bg-slate-50">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 mt-0.5">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">3. Aktivasi Kelas & Akun Portal Murid</h3>
                                            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                                                Setelah verifikasi selesai, akun portal murid akan aktif untuk mengakses jadwal sesi belajar, materi pelajaran, dan laporan absensi.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Bantuan WhatsApp Cepat */}
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80 text-emerald-950">
                                <div className="flex items-center gap-3 text-center sm:text-left">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.33 7.03 9 7.1 8.73 7.4C8.45 7.7 7.69 8.42 7.69 9.87C7.69 11.32 8.75 12.72 8.9 12.92C9.05 13.12 10.97 16.08 13.92 17.35C14.62 17.65 15.17 17.84 15.6 17.97C16.3 18.2 16.94 18.17 17.44 18.09C18 18 19.16 17.39 19.4 16.71C19.65 16.03 19.65 15.45 19.57 15.33C19.5 15.21 19.3 15.14 19 14.99C18.7 14.84 17.23 14.12 16.96 14.02C16.68 13.92 16.48 13.87 16.29 14.17C16.09 14.47 15.51 15.14 15.34 15.34C15.16 15.54 14.99 15.56 14.69 15.41C14.39 15.26 13.43 14.95 12.3 13.94C11.41 13.15 10.82 12.18 10.64 11.88C10.47 11.58 10.62 11.42 10.77 11.27C10.91 11.13 11.08 10.91 11.23 10.74C11.38 10.57 11.43 10.44 11.53 10.24C11.63 10.04 11.58 9.87 11.5 9.72C11.43 9.57 10.85 8.14 10.6 7.56C10.37 6.99 10.13 7.07 9.96 7.06C9.8 7.05 9.61 7.03 9.53 7.03Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-950">Ada pertanyaan seputar pendaftaran?</p>
                                        <p className="text-[11px] text-emerald-800">Konsultasikan jadwal atau konfirmasi tiket langsung dengan Admin ALC.</p>
                                    </div>
                                </div>

                                <a
                                    href={adminWaLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition shrink-0"
                                >
                                    <span>Chat WhatsApp Admin</span>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                            </div>

                            {/* Tombol Aksi Utama */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    href={`/cek-status?ticket=${encodeURIComponent(ticket)}`}
                                    variant="primary"
                                    size="lg"
                                    className="w-full sm:w-auto shadow-md shadow-violet-600/20"
                                    iconRight={
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    }
                                >
                                    Cek Status Pendaftaran
                                </Button>
                                <Button href="/" variant="outline" size="lg" className="w-full sm:w-auto">
                                    Kembali ke Beranda
                                </Button>
                            </div>

                            {/* Footer Link */}
                            <div className="mt-7 text-center text-xs text-slate-500">
                                Ingin mendaftarkan peserta atau saudara lainnya?{' '}
                                <Link
                                    href="/pendaftaran"
                                    className="font-bold text-brand-primary underline-offset-4 hover:underline"
                                >
                                    Buka formulir pendaftaran baru
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
