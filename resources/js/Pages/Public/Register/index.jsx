import { useForm, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
} from '@/Components/Public';
import { pageContent, formFields, initialStudentForm, initialTeacherForm, packageOptions, honeypotStyle } from './data';

const localizeField = (value, lang) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const localized = value[lang] ?? value.id ?? value.en ?? '';
    if (localized && typeof localized === 'object') {
        return localized[lang] ?? localized.id ?? localized.en ?? '';
    }
    return localized;
};

export default function Register() {
    const { props, url } = usePage();
    const programs = props.programs ?? [];
    const { language } = useI18n();
    const flashSuccess = props.flash?.success;
    const flashTicket = props.flash?.ticket;
    const [copied, setCopied] = useState(false);

    const copyTicket = async () => {
        if (!flashTicket) return;
        try {
            await navigator.clipboard.writeText(flashTicket);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialTab = urlParams.get('tab') === 'teacher' ? 'teacher' : 'student';
    const prefilledProgramId = urlParams.get('program_id') || '';

    const [activeTab, setActiveTab] = useState(initialTab);

    const text = pageContent[language] || pageContent.id;
    const studentFields = formFields.student[language] || formFields.student.id;
    const teacherFields = formFields.teacher[language] || formFields.teacher.id;

    const labelClass = 'mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide';

    const inputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100';

    const selectClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100';

    const studentForm = useForm(initialStudentForm);

    const teacherForm = useForm(initialTeacherForm);

    // ── Wizard langkah + draft tersimpan ──
    const DRAFT_KEY = 'alc-student-draft-v1';
    const [savedDraft] = useState(() => {
        try {
            const raw = window.localStorage.getItem(DRAFT_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });
    const [step, setStep] = useState(1);
    const [stepErrors, setStepErrors] = useState({});

    useEffect(() => {
        const merged = { ...savedDraft };
        // Prefill dari URL (tombol "Daftar Program Ini") selalu menang atas draft lama.
        if (prefilledProgramId) merged.program_id = prefilledProgramId;
        if (Object.keys(merged).length > 0) {
            studentForm.setData({ ...studentForm.data, ...merged });
        }
        const startedAt = String(Math.floor(Date.now() / 1000));
        studentForm.setData('form_started_at', startedAt);
        teacherForm.setData('form_started_at', startedAt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(studentForm.data));
        } catch {
            // abaikan: draft hanya peningkatan UX
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentForm.data]);

    const waValid = (value) =>
        /^(?:\+62|62|0)8[0-9]{5,13}$/.test(String(value || '').replace(/[\s\-.()]/g, ''));

    const validateStep = (current) => {
        const errs = {};
        const d = studentForm.data;
        if (current === 1) {
            if (!d.student_name?.trim()) errs.student_name = 'Nama siswa wajib diisi.';
            if (!d.parent_contact?.trim()) errs.parent_contact = 'Kontak WhatsApp wajib diisi.';
            else if (!waValid(d.parent_contact)) errs.parent_contact = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
            if (!d.address?.trim()) errs.address = 'Alamat wajib diisi.';
        }
        if (current === 2) {
            if (!d.school_name?.trim()) errs.school_name = 'Nama sekolah wajib diisi.';
            if (!d.level?.trim()) errs.level = 'Jenjang wajib diisi.';
            if (!d.subjects?.trim()) errs.subjects = 'Mata pelajaran wajib diisi.';
        }
        if (current === 3) {
            if (!d.program_id) errs.program_id = 'Program wajib dipilih.';
            if (!d.package) errs.package = 'Paket wajib dipilih.';
        }
        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep((s) => Math.min(4, s + 1));
    };
    const prevStep = () => {
        setStepErrors({});
        setStep((s) => Math.max(1, s - 1));
    };

    const fieldError = (key) => stepErrors[key] || studentForm.errors[key];

    const stepLabels = ['Data Diri', 'Sekolah', 'Program', 'Review'];
    const serverErrorStep = {
        student_name: 1, parent_contact: 1, address: 1,
        school_name: 2, level: 2, subjects: 2,
        program_id: 3, package: 3, preferred_mode: 3,
        notes: 4,
    };
    const serverErrorSteps = [...new Set(Object.keys(studentForm.errors).map((k) => serverErrorStep[k]).filter(Boolean))];

    const programOptions = programs.map((program) => {
        const programName = localizeField(program.name, language);
        const programLevel = localizeField(program.level, language);
        const base = programLevel ? `${programName} (${programLevel})` : programName;
        const isFull = !!program.is_full;
        return {
            value: program.id,
            label: isFull
                ? `${base} — Kuota Penuh`
                : program.quota_remaining != null
                    ? `${base} — Sisa ${program.quota_remaining}`
                    : base,
            disabled: isFull,
        };
    });
    const selectedProgramLabel =
        programOptions.find((o) => String(o.value) === String(studentForm.data.program_id))?.label || '-';
    const selectedPackageLabel =
        packageOptions.find((o) => String(o.value) === String(studentForm.data.package))?.label || studentForm.data.package || '-';

    const handleStudentSubmit = (event) => {
        event.preventDefault();
        studentForm.post('/pendaftaran/murid', {
            preserveScroll: true,
            onSuccess: () => {
                studentForm.reset();
                setStep(1);
                setStepErrors({});
                try {
                    window.localStorage.removeItem(DRAFT_KEY);
                } catch {
                    // abaikan
                }
            },
        });
    };

    const handleTeacherSubmit = (event) => {
        event.preventDefault();
        router.post('/pendaftaran/pengajar', {
            ...teacherForm.data,
            cv: teacherForm.data.cv,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => teacherForm.reset(),
            onError: (errors) => teacherForm.setError(errors),
        });
    };

    return (
        <>
            <SeoHead
                title={text.title || 'Pendaftaran Siswa & Pengajar ALC'}
                description={
                    language === 'id'
                        ? 'Form pendaftaran murid dan pengajar resmi Ar Rayyan Learning Course.'
                        : 'Official student and teacher registration form for Ar Rayyan Learning Course.'
                }
            />

            {/* Header Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pt-10 pb-12 border-b border-slate-200/60">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="text-brand-primary font-bold">Pendaftaran Online</span>
                    </nav>

                    <SectionHeader
                        eyebrow="Bergabung Bersama ALC"
                        title={text.title || 'Formulir Pendaftaran Siswa & Pengajar'}
                        subtitle={text.subtitle || 'Langkah awal untuk memulai perjalanan belajar yang terarah, berkarakter, dan penuh prestasi.'}
                        align="center"
                    />
                </Container>
            </section>

            {/* Form & Value Proposition Section */}
            <section className="py-12 sm:py-16 bg-slate-50/40">
                <Container>
                    {/* Success Flash Banner */}
                    {flashSuccess && (
                        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-md">
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-200 text-emerald-800 font-bold">
                                    ✓
                                </span>
                                <div>
                                    <h4 className="text-base font-bold">Pendaftaran Berhasil Dikirim!</h4>
                                    <p className="mt-1 text-sm text-emerald-800 leading-relaxed">{flashSuccess}</p>
                                    {flashTicket && (
                                        <div className="mt-4 rounded-2xl border border-emerald-300 bg-white p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                                Nomor Tiket Pendaftaran
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <span className="rounded-xl bg-emerald-100 px-4 py-2 font-mono text-lg font-bold tracking-wider text-emerald-900">
                                                    {flashTicket}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={copyTicket}
                                                    className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    {copied ? 'Tersalin!' : 'Salin'}
                                                </button>
                                                <Link
                                                    href={`/cek-status?ticket=${encodeURIComponent(flashTicket)}`}
                                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                                                >
                                                    Cek Status
                                                </Link>
                                            </div>
                                            <p className="mt-2 text-xs text-emerald-700">
                                                Simpan nomor tiket ini. Anda membutuhkannya + nomor WhatsApp untuk melacak status pendaftaran.
                                            </p>
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-emerald-700">
                                        Tim administrasi ALC akan segera menghubungi Anda melalui nomor WhatsApp yang terdaftar untuk verifikasi dan langkah selanjutnya.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
                        {/* Left Column: Benefits & Steps (4 cols) */}
                        <div className="lg:col-span-5 space-y-8">
                            {/* Steps Card */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                                <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
                                    Alur Mudah Pendaftaran
                                </h3>

                                <div className="space-y-4 text-xs">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-brand-primary font-bold">
                                            1
                                        </span>
                                        <div>
                                            <p className="font-bold text-slate-900">Isi Formulir Online</p>
                                            <p className="text-slate-500 mt-0.5">Lengkapi biodata diri dan pilihan program belajar dengan teliti.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                                            2
                                        </span>
                                        <div>
                                            <p className="font-bold text-slate-900">Konsultasi & Asesmen Awal</p>
                                            <p className="text-slate-500 mt-0.5">Tim kami akan menghubungi via WhatsApp untuk jadwal placement test gratis.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                                            3
                                        </span>
                                        <div>
                                            <p className="font-bold text-slate-900">Penentuan Jadwal & Mulai Belajar</p>
                                            <p className="text-slate-500 mt-0.5">Pilih sesi waktu belajar yang nyaman dan mulai proses bimbingan.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Perks */}
                            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-violet-50/40 to-white p-6 sm:p-8 shadow-xs">
                                <h4 className="font-display text-base font-bold text-slate-900 mb-3">
                                    Benefit Belajar di ALC
                                </h4>
                                <ul className="space-y-2.5 text-xs text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-primary font-bold">✓</span>
                                        <span>Pendampingan tutor sabar, komunikatif, dan terverifikasi</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-primary font-bold">✓</span>
                                        <span>Modul belajar terstruktur dan latihan soal berkala</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-primary font-bold">✓</span>
                                        <span>Laporan evaluasi belajar rutin untuk orang tua</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-primary font-bold">✓</span>
                                        <span>Akses bank soal dan konsultasi tugas sekolah</span>
                                    </li>
                                </ul>
                            </div>

                            {/* WhatsApp Assistance */}
                            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                                <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Butuh Bantuan Pendaftaran?</p>
                                <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                                    Hubungi tim admin kami via WhatsApp jika mengalami kesulitan mengisi formulir.
                                </p>
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20butuh%20panduan%20mengisi%20formulir%20pendaftaran"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                >
                                    <span>Chat WhatsApp Admin</span>
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Registration Form (7 cols) */}
                        <div className="lg:col-span-7">
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xl">
                                {/* Tab Switcher */}
                                <div className="mb-8 flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('student')}
                                        className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
                                            activeTab === 'student'
                                                ? 'bg-white text-brand-primary shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Pendaftaran Siswa Baru
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('teacher')}
                                        className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
                                            activeTab === 'teacher'
                                                ? 'bg-white text-amber-700 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Pendaftaran Guru / Pengajar
                                    </button>
                                </div>

                                {/* STUDENT REGISTRATION FORM (WIZARD) */}
                                {activeTab === 'student' && (
                                    <form onSubmit={handleStudentSubmit} className="space-y-5">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-slate-900">
                                                {text.studentTitle || 'Data Pendaftaran Siswa'}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Lengkapi data diri calon siswa dan pilihan paket belajar.
                                            </p>
                                        </div>

                                        {/* Step indicator */}
                                        <ol className="flex items-center gap-1 sm:gap-2">
                                            {stepLabels.map((label, idx) => {
                                                const n = idx + 1;
                                                const active = n === step;
                                                const done = n < step;
                                                const hasError = serverErrorSteps.includes(n);
                                                return (
                                                    <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
                                                        <span
                                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                                                                done
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : active
                                                                        ? 'bg-brand-primary text-white'
                                                                        : 'bg-slate-100 text-slate-500'
                                                            }`}
                                                        >
                                                            {done ? '✓' : n}
                                                        </span>
                                                        <span className={`hidden text-xs font-semibold sm:block ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                                                            {label}
                                                            {hasError && <span className="text-rose-500"> •</span>}
                                                        </span>
                                                        {n < 4 && <span className="h-px flex-1 bg-slate-200" />}
                                                    </li>
                                                );
                                            })}
                                        </ol>

                                        {serverErrorSteps.length > 0 && (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                                                Ada field yang perlu diperbaiki (tanda • pada langkah di atas). Periksa kembali isian Anda.
                                            </div>
                                        )}

                                        {step === 1 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Nama Siswa */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{studentFields.name} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: Muhammad Rayyan"
                                                    value={studentForm.data.student_name}
                                                    onChange={(e) => studentForm.setData('student_name', e.target.value)}
                                                    required
                                                />
                                                {fieldError('student_name') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('student_name')}</p>
                                                )}
                                            </div>

                                            {/* Kontak Orang Tua (WhatsApp) */}
                                            <div>
                                                <label className={labelClass}>{studentFields.parentContact} *</label>
                                                <input
                                                    type="tel"
                                                    className={inputClass}
                                                    placeholder="Contoh: 08123456789"
                                                    value={studentForm.data.parent_contact}
                                                    onChange={(e) => studentForm.setData('parent_contact', e.target.value)}
                                                />
                                                {fieldError('parent_contact') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('parent_contact')}</p>
                                                )}
                                            </div>

                                            {/* Alamat Rumah */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{studentFields.address} *</label>
                                                <textarea
                                                    rows="2"
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="Alamat domisili lengkap..."
                                                    value={studentForm.data.address}
                                                    onChange={(e) => studentForm.setData('address', e.target.value)}
                                                />
                                                {fieldError('address') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('address')}</p>
                                                )}
                                            </div>
                                        </div>
                                        )}

                                        {step === 2 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Asal Sekolah */}
                                            <div>
                                                <label className={labelClass}>{studentFields.schoolName} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Nama Sekolah Asal"
                                                    value={studentForm.data.school_name}
                                                    onChange={(e) => studentForm.setData('school_name', e.target.value)}
                                                    required
                                                />
                                                {fieldError('school_name') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('school_name')}</p>
                                                )}
                                            </div>

                                            {/* Jenjang / Kelas */}
                                            <div>
                                                <label className={labelClass}>{studentFields.level} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: Kelas 4 SD / Kelas 8 SMP"
                                                    value={studentForm.data.level}
                                                    onChange={(e) => studentForm.setData('level', e.target.value)}
                                                    required
                                                />
                                                {fieldError('level') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('level')}</p>
                                                )}
                                            </div>

                                            {/* Mata Pelajaran yang Dibutuhkan */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{studentFields.subjects} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: Matematika, IPA, Bahasa Inggris"
                                                    value={studentForm.data.subjects}
                                                    onChange={(e) => studentForm.setData('subjects', e.target.value)}
                                                />
                                                {fieldError('subjects') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('subjects')}</p>
                                                )}
                                            </div>
                                        </div>
                                        )}

                                        {step === 3 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Program Belajar */}
                                            <div>
                                                <label className={labelClass}>{studentFields.program} *</label>
                                                <select
                                                    className={selectClass}
                                                    value={studentForm.data.program_id}
                                                    onChange={(e) => studentForm.setData('program_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="" disabled>Pilih Program Belajar</option>
                                                    {programOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {fieldError('program_id') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('program_id')}</p>
                                                )}
                                            </div>

                                            {/* Paket Belajar */}
                                            <div>
                                                <label className={labelClass}>{studentFields.package} *</label>
                                                <select
                                                    className={selectClass}
                                                    value={studentForm.data.package}
                                                    onChange={(e) => studentForm.setData('package', e.target.value)}
                                                    required
                                                >
                                                    <option value="" disabled>Pilih Tipe Paket</option>
                                                    {packageOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {fieldError('package') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('package')}</p>
                                                )}
                                            </div>

                                            {/* Preferensi Mode Belajar */}
                                            <div>
                                                <label className={labelClass}>{studentFields.preferredMode} *</label>
                                                <select
                                                    className={selectClass}
                                                    value={studentForm.data.preferred_mode}
                                                    onChange={(e) => studentForm.setData('preferred_mode', e.target.value)}
                                                >
                                                    <option value="" disabled>Pilih Mode Belajar</option>
                                                    <option value="offline">Tatap Muka (Offline di ALC)</option>
                                                    <option value="online">Daring (Online Interaktif)</option>
                                                </select>
                                            </div>
                                        </div>
                                        )}

                                        {step === 4 && (
                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-slate-900">Ringkasan Pendaftaran</h4>
                                                    <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-brand-primary hover:underline">
                                                        Ubah
                                                    </button>
                                                </div>
                                                <dl className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Nama Siswa</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.student_name || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Kontak WA</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.parent_contact || '-'}</dd></div>
                                                    <div className="sm:col-span-2"><dt className="font-semibold uppercase tracking-wide text-slate-500">Alamat</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.address || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Sekolah</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.school_name || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Jenjang</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.level || '-'}</dd></div>
                                                    <div className="sm:col-span-2"><dt className="font-semibold uppercase tracking-wide text-slate-500">Mata Pelajaran</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.subjects || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Program</dt><dd className="mt-0.5 font-bold text-slate-900">{selectedProgramLabel}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Paket & Mode</dt><dd className="mt-0.5 font-bold text-slate-900">{selectedPackageLabel} • {studentForm.data.preferred_mode || '-'}</dd></div>
                                                </dl>
                                            </div>

                                            {/* Catatan Tambahan */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{studentFields.notes}</label>
                                                <textarea
                                                    rows="2"
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="Informasi target belajar atau kondisi khusus siswa (opsional)..."
                                                    value={studentForm.data.notes}
                                                    onChange={(e) => studentForm.setData('notes', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        )}

                                        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                                            <div aria-hidden="true" style={honeypotStyle}>
                                                <input
                                                    type="text"
                                                    tabIndex={-1}
                                                    autoComplete="off"
                                                    value={studentForm.data.website}
                                                    onChange={(e) => studentForm.setData('website', e.target.value)}
                                                />
                                            </div>
                                            {step > 1 ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={prevStep}
                                                    className="sm:w-auto"
                                                >
                                                    ← Kembali
                                                </Button>
                                            ) : <span />}
                                            {step < 4 ? (
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="lg"
                                                    onClick={nextStep}
                                                    className="sm:w-auto"
                                                    iconRight={
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                        </svg>
                                                    }
                                                >
                                                    Lanjut
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    loading={studentForm.processing}
                                                    className="sm:w-auto"
                                                    iconRight={
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                        </svg>
                                                    }
                                                >
                                                    {text.submitStudent || 'Kirim Pendaftaran Siswa'}
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* TEACHER RECRUITMENT FORM */}
                                {activeTab === 'teacher' && (
                                    <form onSubmit={handleTeacherSubmit} className="space-y-5">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-slate-900">
                                                {text.teacherTitle || 'Formulir Pendaftaran Pengajar ALC'}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Mari bergabung menjadi bagian dari pendidik berkarakter dan profesional di ALC.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Nama Lengkap Pengajar */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{teacherFields.name} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Nama Lengkap beserta Gelar (jika ada)"
                                                    value={teacherForm.data.name}
                                                    onChange={(e) => teacherForm.setData('name', e.target.value)}
                                                    required
                                                />
                                                {teacherForm.errors.name && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.name}</p>
                                                )}
                                            </div>

                                            {/* Kontak / WhatsApp */}
                                            <div>
                                                <label className={labelClass}>{teacherFields.contact} *</label>
                                                <input
                                                    type="tel"
                                                    className={inputClass}
                                                    placeholder="No. WhatsApp Aktif"
                                                    value={teacherForm.data.contact}
                                                    onChange={(e) => teacherForm.setData('contact', e.target.value)}
                                                    required
                                                />
                                                {teacherForm.errors.contact && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.contact}</p>
                                                )}
                                            </div>

                                            {/* Pendidikan Terakhir */}
                                            <div>
                                                <label className={labelClass}>{teacherFields.education} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: S1 Pendidikan Matematika, UPI"
                                                    value={teacherForm.data.education}
                                                    onChange={(e) => teacherForm.setData('education', e.target.value)}
                                                    required
                                                />
                                                {teacherForm.errors.education && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.education}</p>
                                                )}
                                            </div>

                                            {/* Bidang Mata Pelajaran yang Dikuasai */}
                                            <div>
                                                <label className={labelClass}>{teacherFields.subjects} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: Matematika SD/SMP, Fisika SMA"
                                                    value={teacherForm.data.subjects}
                                                    onChange={(e) => teacherForm.setData('subjects', e.target.value)}
                                                    required
                                                />
                                                {teacherForm.errors.subjects && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.subjects}</p>
                                                )}
                                            </div>

                                            {/* Pengalaman Mengajar */}
                                            <div>
                                                <label className={labelClass}>{teacherFields.experience}</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: 2 Tahun Guru Bimbel"
                                                    value={teacherForm.data.experience}
                                                    onChange={(e) => teacherForm.setData('experience', e.target.value)}
                                                />
                                            </div>

                                            {/* Upload CV File */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{teacherFields.cv} (.pdf/.docx)</label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2 text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-violet-200"
                                                    onChange={(e) => teacherForm.setData('cv', e.target.files[0])}
                                                />
                                                {teacherForm.errors.cv && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.cv}</p>
                                                )}
                                            </div>

                                            {/* Alamat Domisili */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{teacherFields.address} *</label>
                                                <textarea
                                                    rows="2"
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="Alamat domisili saat ini..."
                                                    value={teacherForm.data.address}
                                                    onChange={(e) => teacherForm.setData('address', e.target.value)}
                                                    required
                                                />
                                                {teacherForm.errors.address && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.address}</p>
                                                )}
                                            </div>

                                            {/* Catatan Tambahan */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{teacherFields.notes}</label>
                                                <textarea
                                                    rows="2"
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="Waktu ketersediaan mengajar atau catatan lainnya (opsional)..."
                                                    value={teacherForm.data.notes}
                                                    onChange={(e) => teacherForm.setData('notes', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <div aria-hidden="true" style={honeypotStyle}>
                                                <input
                                                    type="text"
                                                    tabIndex={-1}
                                                    autoComplete="off"
                                                    value={teacherForm.data.website}
                                                    onChange={(e) => teacherForm.setData('website', e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                size="lg"
                                                loading={teacherForm.processing}
                                                className="w-full"
                                                iconRight={
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                    </svg>
                                                }
                                            >
                                                {text.submitTeacher || 'Kirim Lamaran Pengajar'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
