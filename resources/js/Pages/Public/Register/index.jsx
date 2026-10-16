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
import {
    pageContent,
    formFields,
    initialStudentForm,
    initialTeacherForm,
    packageOptions,
    honeypotStyle,
    LEVEL_OPTIONS,
    CLASS_OPTIONS_BY_LEVEL,
} from './data';

const localizeField = (value, lang) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const localized = value[lang] ?? value.id ?? value.en ?? '';
    if (localized && typeof localized === 'object') {
        return localized[lang] ?? localized.id ?? localized.en ?? '';
    }
    return localized;
};

const formatCurrency = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const DRAFT_KEY = 'alc-student-draft-v2';
const STEP_KEY = 'alc-student-step-v2';
const OLD_DRAFT_KEY = 'alc-student-draft-v1';

const getInitialStudentData = (prefilledProgramId) => ({
    ...initialStudentForm,
    ...(prefilledProgramId ? { program_id: prefilledProgramId } : {}),
    form_started_at: String(Math.floor(Date.now() / 1000)),
});

const matchesPackageLevel = (pkgLevel, tab) => {
    if (!tab || tab === 'Semua') return true;
    if (!pkgLevel) return false;
    const p = String(pkgLevel).toUpperCase().trim();
    const t = String(tab).toUpperCase().trim();
    if (t === 'TK') return p === 'TK' || p.includes('TK') || p.includes('PAUD');
    if (t === 'SD') return p === 'SD' || p.includes('SD');
    if (t === 'SMP') return p === 'SMP' || p.includes('SMP');
    if (t === 'SMA') return p === 'SMA' || p.includes('SMA') || p.includes('SMK');
    return p === t;
};

export default function Register() {
    const { props, url } = usePage();
    const programs = props.programs ?? [];
    const { language } = useI18n();

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

    // ── Wizard langkah siswa (form bersih setiap muat ulang / refresh) ──
    const initialStudentData = getInitialStudentData(prefilledProgramId);
    const studentForm = useForm(initialStudentData);
    const teacherForm = useForm(initialTeacherForm);

    const [step, setStep] = useState(1);
    const [stepErrors, setStepErrors] = useState({});
    const [packageTab, setPackageTab] = useState(initialStudentData.level || 'Semua');

    useEffect(() => {
        const startedAt = String(Math.floor(Date.now() / 1000));
        teacherForm.setData('form_started_at', startedAt);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(DRAFT_KEY);
                window.localStorage.removeItem(STEP_KEY);
                window.localStorage.removeItem(OLD_DRAFT_KEY);
            } catch {
                // abaikan
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const waValid = (value) =>
        /^(?:\+62|62|0)8[0-9]{5,13}$/.test(String(value || '').replace(/[\s\-.()]/g, ''));

    const validateStep = (current) => {
        const errs = {};
        const d = studentForm.data;
        if (current === 1) {
            if (!d.student_name?.trim()) errs.student_name = 'Nama siswa wajib diisi.';
            if (!d.parent_contact?.trim()) errs.parent_contact = 'Kontak WhatsApp wajib diisi.';
            else if (!waValid(d.parent_contact)) errs.parent_contact = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
            if (!d.parent_email?.trim()) errs.parent_email = 'Email orang tua wajib diisi.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.parent_email)) errs.parent_email = 'Format email orang tua tidak valid.';
            if (!d.address?.trim()) errs.address = 'Alamat wajib diisi.';
        }
        if (current === 2) {
            if (!d.school_name?.trim()) errs.school_name = 'Nama sekolah wajib diisi.';
            if (!d.level?.trim()) errs.level = 'Jenjang wajib dipilih.';
            if (!d.class_level?.trim()) errs.class_level = 'Kelas wajib dipilih.';
            if (!d.subjects?.trim()) errs.subjects = 'Mata pelajaran wajib diisi.';
        }
        if (current === 3) {
            if (!d.program_id) errs.program_id = 'Program wajib dipilih.';
            if (!d.package_id && !d.package) errs.package_id = 'Pilihan harga wajib dipilih.';
        }
        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = (event) => {
        event?.preventDefault();

        if (validateStep(step)) setStep((s) => Math.min(4, s + 1));
    };
    const prevStep = () => {
        setStepErrors({});
        setStep((s) => Math.max(1, s - 1));
    };

    const fieldError = (key) => stepErrors[key] || studentForm.errors[key];

    const stepLabels = ['Data Diri', 'Sekolah', 'Program', 'Review'];
    const serverErrorStep = {
        student_name: 1, parent_contact: 1, parent_email: 1, address: 1,
        school_name: 2, level: 2, class_level: 2, subjects: 2,
        program_id: 3, package_id: 3, package: 3, preferred_mode: 3,
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
    const selectedProgram = programs.find((program) => String(program.id) === String(studentForm.data.program_id));
    const selectedProgramLabel =
        programOptions.find((o) => String(o.value) === String(studentForm.data.program_id))?.label || '-';
    const dynamicPackageOptions = (selectedProgram?.packages ?? []).map((pkg) => ({
        id: pkg.id,
        value: String(pkg.id),
        label: pkg.display_name || pkg.name,
        level: pkg.level,
        sessions: pkg.sessions,
        intensity: pkg.intensity,
        price: pkg.price,
        maxParticipants: pkg.max_participants,
        mode: pkg.mode,
    }));
    const availablePackageOptions = dynamicPackageOptions.length > 0
        ? dynamicPackageOptions
        : packageOptions.map((option) => ({ ...option, id: null, value: option.value, level: null }));
    const selectedPackage = dynamicPackageOptions.find((option) => String(option.id) === String(studentForm.data.package_id));
    const selectedPackageLabel = selectedPackage?.label ||
        packageOptions.find((option) => String(option.value) === String(studentForm.data.package))?.label ||
        studentForm.data.package || '-';

    // ── Pengelompokan Tab Jenjang untuk Paket ──
    const levelTabsList = ['TK', 'SD', 'SMP', 'SMA'];
    const availableLevelTabs = levelTabsList.filter((lvl) =>
        dynamicPackageOptions.some((pkg) => matchesPackageLevel(pkg.level, lvl))
    );
    const hasLevelTabs = availableLevelTabs.length > 0;
    const displayedTabs = hasLevelTabs ? ['Semua', ...availableLevelTabs] : [];
    const activeTabResolved = displayedTabs.includes(packageTab) ? packageTab : 'Semua';

    const filteredPackageOptions = hasLevelTabs && activeTabResolved !== 'Semua'
        ? availablePackageOptions.filter((pkg) => matchesPackageLevel(pkg.level, activeTabResolved))
        : availablePackageOptions;

    const handleLevelChange = (newLevel) => {
        const validClasses = CLASS_OPTIONS_BY_LEVEL[newLevel] || [];
        const isCurrentClassValid = validClasses.some((opt) => opt.value === studentForm.data.class_level);

        studentForm.setData({
            ...studentForm.data,
            level: newLevel,
            class_level: isCurrentClassValid ? studentForm.data.class_level : '',
        });
        setStepErrors((errors) => ({ ...errors, level: undefined, class_level: undefined }));
        if (availableLevelTabs.includes(newLevel)) {
            setPackageTab(newLevel);
        }
    };

    const handleProgramChange = (programId) => {
        const prog = programs.find((p) => String(p.id) === String(programId));
        const progPackages = prog?.packages ?? [];
        const validLevelTabs = levelTabsList.filter((lvl) =>
            progPackages.some((pkg) => matchesPackageLevel(pkg.level, lvl))
        );

        studentForm.setData({
            ...studentForm.data,
            program_id: programId,
            package_id: '',
            package: '',
        });
        setStepErrors((errors) => ({ ...errors, program_id: undefined, package_id: undefined }));

        // Sesuaikan tab paket jika jenjang siswa tersedia di program tersebut
        if (studentForm.data.level && validLevelTabs.includes(studentForm.data.level)) {
            setPackageTab(studentForm.data.level);
        } else if (validLevelTabs.length > 0) {
            setPackageTab('Semua');
        }
    };

    const handlePackageChange = (option) => {
        studentForm.setData({
            ...studentForm.data,
            package_id: option.id ? String(option.id) : '',
            package: option.label,
        });
        setStepErrors((errors) => ({ ...errors, package_id: undefined }));
    };


    const handleStudentSubmit = (event) => {
        event.preventDefault();

        if (step < 4) {
            nextStep();

            return;
        }

        studentForm.post('/pendaftaran/murid', {
            onSuccess: () => {
                studentForm.reset();
                setStep(1);
                setStepErrors({});
                setPackageTab('Semua');
                try {
                    window.localStorage.removeItem(DRAFT_KEY);
                    window.localStorage.removeItem(STEP_KEY);
                    window.localStorage.removeItem(OLD_DRAFT_KEY);
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
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 xs:p-6 sm:p-10 shadow-xl">
                                {/* Tab Switcher */}
                                <div className="mb-6 sm:mb-8 flex flex-col xs:flex-row rounded-2xl border border-slate-200 bg-slate-100 p-1 gap-1 xs:gap-0">
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
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-display text-lg font-bold text-slate-900">
                                                    {text.studentTitle || 'Data Pendaftaran Siswa'}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Lengkapi data diri calon siswa dan pilihan paket belajar.
                                                </p>
                                            </div>
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

                                            {/* Email Orang Tua */}
                                            <div>
                                                <label className={labelClass}>{studentFields.parentEmail} *</label>
                                                <input
                                                    type="email"
                                                    className={inputClass}
                                                    placeholder="Contoh: orangtua@email.com"
                                                    value={studentForm.data.parent_email}
                                                    onChange={(e) => studentForm.setData('parent_email', e.target.value)}
                                                    autoComplete="email"
                                                />
                                                {fieldError('parent_email') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('parent_email')}</p>
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
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{studentFields.schoolName} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Nama Sekolah Asal (cth: SDN 1 Bandung / SMPN 5)"
                                                    value={studentForm.data.school_name}
                                                    onChange={(e) => studentForm.setData('school_name', e.target.value)}
                                                    required
                                                />
                                                {fieldError('school_name') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('school_name')}</p>
                                                )}
                                            </div>

                                            {/* Jenjang */}
                                            <div>
                                                <label className={labelClass}>{studentFields.level} *</label>
                                                <select
                                                    className={selectClass}
                                                    value={studentForm.data.level}
                                                    onChange={(e) => handleLevelChange(e.target.value)}
                                                    required
                                                >
                                                    <option value="" disabled>Pilih Jenjang Sekolah</option>
                                                    {LEVEL_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {fieldError('level') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('level')}</p>
                                                )}
                                            </div>

                                            {/* Kelas */}
                                            <div>
                                                <label className={labelClass}>{studentFields.classLevel || 'Kelas'} *</label>
                                                <select
                                                    className={selectClass}
                                                    value={studentForm.data.class_level}
                                                    onChange={(e) => {
                                                        studentForm.setData('class_level', e.target.value);
                                                        setStepErrors((errors) => ({ ...errors, class_level: undefined }));
                                                    }}
                                                    disabled={!studentForm.data.level}
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        {studentForm.data.level ? 'Pilih Kelas' : 'Pilih Jenjang Terlebih Dahulu'}
                                                    </option>
                                                    {(CLASS_OPTIONS_BY_LEVEL[studentForm.data.level] || []).map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {fieldError('class_level') && (
                                                    <p className="mt-1 text-xs text-rose-500">{fieldError('class_level')}</p>
                                                )}
                                            </div>

                                            {/* Mata Pelajaran yang Dibutuhkan */}
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>{studentFields.subjects} *</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    placeholder="Contoh: Matematika, IPA, Bahasa Inggris, Calistung"
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
                                        <div className="space-y-5">
                                            {/* Program Belajar */}
                                            <div>
                                                <label className={labelClass}>{studentFields.program} *</label>
                                                <select
                                                    className={selectClass}
                                                    value={studentForm.data.program_id}
                                                    onChange={(e) => handleProgramChange(e.target.value)}
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

                                            {/* Pilihan Pertemuan & Harga */}
                                            <div>
                                                <div className="mb-3 flex items-end justify-between gap-3">
                                                    <div>
                                                        <label className={labelClass}>Pilihan Pertemuan & Harga *</label>
                                                        <p className="text-xs text-slate-500">
                                                            Pilih sesuai jenjang siswa dan frekuensi belajar yang diinginkan.
                                                        </p>
                                                    </div>
                                                    {selectedProgram?.packages?.length > 0 && (
                                                        <span className="shrink-0 text-xs font-semibold text-slate-500">
                                                            {selectedProgram.packages.length} pilihan
                                                        </span>
                                                    )}
                                                </div>

                                                {!studentForm.data.program_id ? (
                                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                                        Pilih program terlebih dahulu untuk melihat pilihan paket dan harga yang tersedia.
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {/* Tab Jenjang Paket */}
                                                        {hasLevelTabs && (
                                                            <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/90 p-1.5">
                                                                {displayedTabs.map((tab) => {
                                                                    const isActive = activeTabResolved === tab;
                                                                    const count = tab === 'Semua'
                                                                        ? dynamicPackageOptions.length
                                                                        : dynamicPackageOptions.filter((p) => matchesPackageLevel(p.level, tab)).length;
                                                                    const hasSelectedInTab = selectedPackage && (
                                                                        tab === 'Semua' || matchesPackageLevel(selectedPackage.level, tab)
                                                                    );
                                                                    return (
                                                                        <button
                                                                            key={tab}
                                                                            type="button"
                                                                            onClick={() => setPackageTab(tab)}
                                                                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                                                                                isActive
                                                                                    ? 'bg-white text-brand-primary shadow-xs'
                                                                                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                                                                            }`}
                                                                        >
                                                                            <span>{tab === 'Semua' ? 'Semua Jenjang' : tab}</span>
                                                                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                                                                                isActive ? 'bg-violet-100 text-violet-800' : 'bg-slate-200/80 text-slate-600'
                                                                            }`}>
                                                                                {count}
                                                                            </span>
                                                                            {hasSelectedInTab && !isActive && (
                                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Paket terpilih ada di tab ini" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {filteredPackageOptions.length === 0 ? (
                                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                                                                Tidak ada pilihan paket untuk jenjang ini pada program yang dipilih. Silakan pilih tab jenjang lain atau tab "Semua Jenjang".
                                                            </div>
                                                        ) : (
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                {filteredPackageOptions.map((option) => {
                                                                    const isSelected = option.id
                                                                        ? String(studentForm.data.package_id) === String(option.id)
                                                                        : studentForm.data.package === option.label;

                                                                    return (
                                                                        <button
                                                                            key={option.id ?? option.value}
                                                                            type="button"
                                                                            onClick={() => handlePackageChange(option)}
                                                                            aria-pressed={isSelected}
                                                                            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                                                                                isSelected
                                                                                    ? 'border-violet-500 bg-violet-50 shadow-sm'
                                                                                    : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-3">
                                                                                <div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <p className="text-sm font-bold text-slate-900">
                                                                                            {option.level || option.label}
                                                                                        </p>
                                                                                        {option.level && (
                                                                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                                                                                {option.level}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {option.sessions && (
                                                                                        <p className="mt-1 text-xs text-slate-600">
                                                                                            {option.sessions} pertemuan/bulan
                                                                                            {selectedProgram?.duration ? ` • ${selectedProgram.duration}` : ''}
                                                                                            {option.intensity ? ` • ${option.intensity}` : ''}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                                                                                    isSelected ? 'border-violet-600 bg-violet-600' : 'border-slate-300 bg-white'
                                                                                }`}>
                                                                                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                                                                                </span>
                                                                            </div>
                                                                            {option.price != null && (
                                                                                <p className="mt-3 font-display text-lg font-extrabold tabular-nums text-violet-700">
                                                                                    {formatCurrency(option.price)}
                                                                                    <span className="ml-1 text-[11px] font-medium text-slate-500">/ bulan</span>
                                                                                </p>
                                                                            )}
                                                                            {option.maxParticipants && (
                                                                                <p className="mt-2 text-[11px] font-medium text-slate-500">
                                                                                    Maksimal {option.maxParticipants} siswa
                                                                                </p>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {(fieldError('package_id') || fieldError('package')) && (
                                                    <p className="mt-2 text-xs text-rose-500">{fieldError('package_id') || fieldError('package')}</p>
                                                )}
                                            </div>

                                            {/* Preferensi Mode Belajar */}
                                            <div className="max-w-sm">
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
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Email Orang Tua</dt><dd className="mt-0.5 break-all font-bold text-slate-900">{studentForm.data.parent_email || '-'}</dd></div>
                                                    <div className="sm:col-span-2"><dt className="font-semibold uppercase tracking-wide text-slate-500">Alamat</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.address || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Sekolah</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.school_name || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Jenjang & Kelas</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.level ? `${studentForm.data.level}${studentForm.data.class_level ? ` • ${studentForm.data.class_level}` : ''}` : '-'}</dd></div>
                                                    <div className="sm:col-span-2"><dt className="font-semibold uppercase tracking-wide text-slate-500">Mata Pelajaran</dt><dd className="mt-0.5 font-bold text-slate-900">{studentForm.data.subjects || '-'}</dd></div>
                                                    <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Program</dt><dd className="mt-0.5 font-bold text-slate-900">{selectedProgramLabel}{selectedProgram?.duration ? ` (${selectedProgram.duration})` : ''}</dd></div>
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
                                                    key="student-next-step"
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
                                                    {step === 3 ? 'Review Pendaftaran' : 'Lanjut'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    key="student-submit"
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

                                            {/* Email Pengajar */}
                                            <div>
                                                <label className={labelClass}>{teacherFields.email || 'Email'} *</label>
                                                <input
                                                    type="email"
                                                    className={inputClass}
                                                    placeholder="emailanda@contoh.com"
                                                    value={teacherForm.data.email}
                                                    onChange={(e) => teacherForm.setData('email', e.target.value)}
                                                    required
                                                />
                                                {teacherForm.errors.email && (
                                                    <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.email}</p>
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
