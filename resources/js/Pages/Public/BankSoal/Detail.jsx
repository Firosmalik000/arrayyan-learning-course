import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
} from '@/Components/Public';
import { bankSoalItems } from '../Home/data';

const pageContent = {
    id: {
        backToList: 'Kembali ke Bank Soal',
        moduleInfo: 'Informasi Modul & Soal',
        category: 'Kategori',
        level: 'Jenjang',
        format: 'Format Soal',
        description: 'Deskripsi Modul',
        links: 'Akses Link Materi & Soal',
        openLink: 'Buka / Unduh Modul',
        noLinks: 'Link modul sedang dipersiapkan oleh tim pengajar.',
        features: 'Keunggulan Modul ALC',
        featuresList: [
            'Disusun secara terstruktur oleh tim pengajar berpengalaman',
            'Dilengkapi kunci jawaban dan pembahasan komprehensif',
            'Sesuai dengan standar kurikulum dan kisi-kisi ujian terbaru',
            'Dapat dicetak atau dikerjakan secara mandiri di rumah',
        ],
        lockedTitle: 'Materi Terproteksi Passkey',
        lockedDesc: 'Modul ini dikhususkan bagi siswa dan pengajar terdaftar Ar Rayyan Learning Course. Silakan masukkan passkey Anda di bawah ini.',
        submitPasskey: 'Buka Materi Sekarang',
        wrongPasskey: 'Passkey salah. Silakan coba lagi atau hubungi admin.',
        askAdmin: 'Belum memiliki passkey? Hubungi Admin WhatsApp',
        notFound: 'Modul Tidak Ditemukan',
        notFoundDesc: 'Maaf, materi bank soal yang Anda cari tidak tersedia atau telah diarsipkan.',
    },
    en: {
        backToList: 'Back to Question Bank',
        moduleInfo: 'Module & Question Info',
        category: 'Category',
        level: 'Level',
        format: 'Question Format',
        description: 'Module Description',
        links: 'Access Materials & Questions',
        openLink: 'Open / Download Module',
        noLinks: 'Module link is being prepared by our teaching team.',
        features: 'ALC Module Advantages',
        featuresList: [
            'Structured by experienced educators',
            'Equipped with answer keys and in-depth explanations',
            'Aligned with the latest curriculum standards',
            'Suitable for self-study and printout',
        ],
        lockedTitle: 'Passkey Protected Material',
        lockedDesc: 'This module is dedicated to registered students and teachers of Ar Rayyan Learning Course. Please enter your passkey below.',
        submitPasskey: 'Unlock Material Now',
        wrongPasskey: 'Incorrect passkey. Please try again or contact admin.',
        askAdmin: "Don't have a passkey? Contact Admin via WhatsApp",
        notFound: 'Module Not Found',
        notFoundDesc: 'Sorry, the question module you are looking for is not available or has been archived.',
    },
};

export default function BankSoalDetail({ slug }) {
    const { language } = useI18n();
    const { props } = usePage();
    const t = pageContent[language] || pageContent.id;

    const normalizeLocalized = (value) => {
        if (value && typeof value === 'object') {
            return {
                id: value.id ?? value.en ?? '',
                en: value.en ?? value.id ?? '',
            };
        }
        const stringValue = value ?? '';
        return { id: stringValue, en: stringValue };
    };

    const dbItem = props.bankSoal
        ? {
              ...props.bankSoal,
              name: normalizeLocalized(props.bankSoal.name),
              category: normalizeLocalized(props.bankSoal.category),
              level: normalizeLocalized(props.bankSoal.level),
              description: normalizeLocalized(props.bankSoal.description),
              links: Array.isArray(props.bankSoal.links) ? props.bankSoal.links : [],
              image_url: props.bankSoal.image_url || null,
              tone: props.bankSoal.tone || 'violet',
          }
        : null;

    const item = dbItem || bankSoalItems.find((i) => i.slug === slug);
    const serverUnlocked = !!props.bankSoal?.unlocked;
    const hasLock = props.bankSoal ? !!props.bankSoal.has_lock : false;
    const [passkeyInput, setPasskeyInput] = useState('');

    const unlockForm = useForm({ passkey: '' });
    const flashError = props.flash?.error;
    const flashSuccess = props.flash?.success;

    const hasAccess = serverUnlocked || !dbItem || !hasLock;

    const handleUnlock = (e) => {
        e.preventDefault();
        unlockForm.transform(() => ({ passkey: passkeyInput }));
        unlockForm.post(`/bank-soal/${slug}/unlock`, {
            preserveScroll: true,
            onSuccess: () => setPasskeyInput(''),
        });
    };

    if (!item) {
        return (
            <div className="py-24 bg-slate-50 min-h-[60vh] flex items-center justify-center">
                <Container>
                    <div className="mx-auto max-w-md text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{t.notFound}</h2>
                        <p className="mt-2 text-sm text-slate-600">{t.notFoundDesc}</p>
                        <div className="mt-6">
                            <Button href="/bank-soal" variant="primary">
                                {t.backToList}
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    const name = item.name[language] || item.name.id || '';
    const category = item.category[language] || item.category.id || '';
    const level = item.level[language] || item.level.id || '';
    const description = item.description[language] || item.description.id || '';
    const format = item.format || 'PDF';
    const questions = item.questions;
    const links = item.links || [];

    const isPdf = String(format).toLowerCase().includes('pdf');

    return (
        <>
            <SeoHead title={name} description={description} />

            {/* Header Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/40 pt-10 pb-12 border-b border-slate-200/60">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <Link href="/bank-soal" className="hover:text-brand-primary transition">
                            Bank Soal
                        </Link>
                        <span>/</span>
                        <span className="text-emerald-700 font-bold line-clamp-1">{name}</span>
                    </nav>

                    <div className="max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {category && <Badge variant="primary" size="md">{category}</Badge>}
                            {level && <Badge variant="neutral" size="md">{level}</Badge>}
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                    isPdf
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                                        : 'bg-sky-50 text-sky-700 border border-sky-200/80'
                                }`}
                            >
                                <span>{format}</span>
                            </span>
                            {questions && (
                                <Badge variant="accent" size="md">{questions} Butir Soal</Badge>
                            )}
                        </div>

                        <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {name}
                        </h1>

                        {description && (
                            <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-3xl">
                                {description}
                            </p>
                        )}
                    </div>
                </Container>
            </section>

            {/* Detail Content */}
            <section className="py-10 sm:py-16 bg-white">
                <Container>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 2xl:gap-16 items-start">
                        {/* Left Main (8 cols) */}
                        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
                            {/* Materials / Links Box */}
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-4.5 xs:p-6 sm:p-8 shadow-xs">
                                <h3 className="font-display text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </span>
                                    <span>{t.links}</span>
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    Unduh atau buka tautan latihan untuk memulai pengerjaan modul ini.
                                    {props.bankSoal && (
                                        <span className="mt-1 block text-xs text-slate-400">
                                            Dilihat {props.bankSoal.view_count ?? 0}× • Diunduh {props.bankSoal.download_count ?? 0}×
                                        </span>
                                    )}
                                </p>

                                {hasAccess ? (
                                    /* UNLOCKED STATE */
                                    links.length > 0 ? (
                                        <div className="space-y-3">
                                            {links.map((link, index) => {
                                                const linkId = typeof link === 'object' ? link.id : null;
                                                const linkUrl = typeof link === 'string'
                                                    ? link
                                                    : (linkId != null ? `/bank-soal/${slug}/unduh/${linkId}` : link.url);
                                                const linkTitle = typeof link === 'string' ? `Dokumen Soal #${index + 1}` : (link.label || link.title || `Modul #${index + 1}`);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs hover:border-emerald-300 transition"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{linkTitle}</p>
                                                                <p className="text-xs text-slate-400 truncate max-w-xs">{linkUrl}</p>
                                                            </div>
                                                        </div>

                                                        <a
                                                            href={linkUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                                        >
                                                            <span>{t.openLink}</span>
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                            {t.noLinks}
                                        </div>
                                    )
                                ) : (
                                    /* LOCKED STATE INLINE PROMPT */
                                    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 sm:p-8 text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-900">{t.lockedTitle}</h4>
                                        <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">{t.lockedDesc}</p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Murid & pengajar yang sudah login portal otomatis mendapat akses. <Link href="/portal/login" className="font-bold text-brand-primary hover:underline">Masuk portal</Link>
                                        </p>

                                        {(flashError || unlockForm.errors.passkey) && (
                                            <p className="mt-3 text-[11px] font-semibold text-rose-600">{flashError || unlockForm.errors.passkey}</p>
                                        )}
                                        {flashSuccess && (
                                            <p className="mt-3 text-[11px] font-semibold text-emerald-600">{flashSuccess}</p>
                                        )}

                                        <form onSubmit={handleUnlock} className="mt-4 max-w-xs mx-auto flex flex-col gap-2.5">
                                            <input
                                                type="password"
                                                value={passkeyInput}
                                                onChange={(e) => setPasskeyInput(e.target.value)}
                                                placeholder="Masukkan passkey..."
                                                className={`w-full rounded-xl border px-4 py-2.5 text-center text-sm outline-none transition ${
                                                    flashError || unlockForm.errors.passkey
                                                        ? 'border-rose-400 bg-rose-50'
                                                        : 'border-slate-300 bg-white focus:border-emerald-500'
                                                }`}
                                            />
                                            <button
                                                type="submit"
                                                disabled={unlockForm.processing || !passkeyInput.trim()}
                                                className="rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
                                            >
                                                {unlockForm.processing ? 'Memproses...' : t.submitPasskey}
                                            </button>
                                        </form>

                                        <div className="mt-4 pt-3 border-t border-amber-200/60">
                                            <a
                                                href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20ingin%20meminta%20Passkey%20untuk%20mengakses%20bank%20soal"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                                            >
                                                <span>{t.askAdmin}</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Features of ALC modules */}
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-primary">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <span>{t.features}</span>
                                </h3>

                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
                                    {t.featuresList.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-2xs">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-brand-primary text-xs font-bold mt-0.5">
                                                ✓
                                            </span>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar (4 cols) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                            {/* Summary Card */}
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 xs:p-6 shadow-xl">
                                <h4 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                                    {t.moduleInfo}
                                </h4>

                                <div className="my-4 space-y-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">{t.category}</span>
                                        <span className="font-bold text-slate-900">{category || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">{t.level}</span>
                                        <span className="font-bold text-slate-900">{level || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">{t.format}</span>
                                        <span className="font-bold text-slate-900">{format}</span>
                                    </div>
                                    {questions && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Jumlah Soal</span>
                                            <span className="font-bold text-emerald-600">{questions} Butir</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Status Akses</span>
                                        <span className={`font-bold ${hasAccess ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {hasAccess ? 'Terbuka' : 'Terkunci (Passkey)'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        href="/bank-soal"
                                        variant="outline"
                                        size="md"
                                        className="w-full"
                                    >
                                        ← {t.backToList}
                                    </Button>
                                </div>
                            </div>

                            {/* Help Box */}
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                                <h5 className="text-sm font-bold text-slate-900">Kendala Mengakses Soal?</h5>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Tim admin ALC siap membantu menyediakan dokumen latihan alternatif.
                                </p>
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20mengalami%20kendala%20membuka%20materi%20bank%20soal"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                    <span>Tanya Admin via WA</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
