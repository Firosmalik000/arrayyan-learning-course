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
    TEACHER_ROLE_OPTIONS,
    DOMICILE_CITIES,
    PADANG_DISTRICTS,
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
    const teacherLevelOptions = props.teacherLevelOptions ?? [];
    const teacherEducationOptions = props.teacherEducationOptions ?? [];
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

    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedFileSize, setSelectedFileSize] = useState('');
    const [selectedLevels, setSelectedLevels] = useState([]);

    const toggleLevel = (level) => {
        const next = selectedLevels.includes(level)
            ? selectedLevels.filter((l) => l !== level)
            : [...selectedLevels, level];
        setSelectedLevels(next);
        teacherForm.setData('teacher_role', next.join(', '));
    };

    const handleCvChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            teacherForm.setData('cv', file);
            setSelectedFileName(file.name);
            const sizeKb = file.size / 1024;
            setSelectedFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${Math.round(sizeKb)} KB`);
        } else {
            teacherForm.setData('cv', null);
            setSelectedFileName('');
            setSelectedFileSize('');
        }
    };

    const handleRemoveCv = () => {
        teacherForm.setData('cv', null);
        setSelectedFileName('');
        setSelectedFileSize('');
    };

    const handleTeacherSubmit = (event) => {
        event.preventDefault();
        teacherForm.post('/pendaftaran/pengajar', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                teacherForm.reset();
                setSelectedFileName('');
                setSelectedFileSize('');
                setSelectedLevels([]);
            },
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
                            {activeTab === 'student' ? (
                                <>
                                    {/* Steps Card Student */}
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

                                    {/* Trust Perks Student */}
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

                                    {/* WhatsApp Assistance Student */}
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
                                </>
                            ) : (
                                <>
                                    {/* Steps Card Teacher */}
                                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 mb-3">
                                            <span>Rekrutmen Pendidik ALC</span>
                                        </div>
                                        <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
                                            Tahapan Seleksi Pengajar
                                        </h3>

                                        <div className="space-y-4 text-xs">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-brand-primary font-bold">
                                                    1
                                                </span>
                                                <div>
                                                    <p className="font-bold text-slate-900">Kirim Formulir & CV</p>
                                                    <p className="text-slate-500 mt-0.5">Lengkapi profil diri, wilayah domisili, posisi mengajar, dan unggah berkas CV.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                                                    2
                                                </span>
                                                <div>
                                                    <p className="font-bold text-slate-900">Verifikasi & Wawancara</p>
                                                    <p className="text-slate-500 mt-0.5">Tim akademik ALC akan menghubungi via WhatsApp untuk jadwal interview & microteaching.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                                                    3
                                                </span>
                                                <div>
                                                    <p className="font-bold text-slate-900">Penugasan & Portal Pengajar</p>
                                                    <p className="text-slate-500 mt-0.5">Aktivasi akun portal pengajar dan penugasan kelas les privat maupun reguler.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Perks Teacher */}
                                    <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-violet-50/40 to-white p-6 sm:p-8 shadow-xs">
                                        <h4 className="font-display text-base font-bold text-slate-900 mb-3">
                                            Keuntungan Mengajar di ALC
                                        </h4>
                                        <ul className="space-y-2.5 text-xs text-slate-600">
                                            <li className="flex items-center gap-2">
                                                <span className="text-brand-primary font-bold">✓</span>
                                                <span>Honor & insentif mengajar yang kompetitif dan transparan</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-brand-primary font-bold">✓</span>
                                                <span>Jadwal mengajar fleksibel sesuai ketersediaan waktu luang Anda</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-brand-primary font-bold">✓</span>
                                                <span>Dukungan kurikulum terarah, modul belajar, dan ribuan bank soal</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-brand-primary font-bold">✓</span>
                                                <span>Akses Portal Pengajar digital untuk absensi dan rekap honor</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* WhatsApp Assistance Teacher */}
                                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                                        <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Pertanyaan Seputar Rekrutmen?</p>
                                        <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                                            Hubungi tim akademik ALC melalui WhatsApp untuk informasi seputar kualifikasi pengajar.
                                        </p>
                                        <a
                                            href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20ingin%20bertanya%20mengenai%20lowongan%20pengajar"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                        >
                                            <span>Chat WhatsApp Admin</span>
                                        </a>
                                    </div>
                                </>
                            )}
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
                                    <form onSubmit={handleTeacherSubmit} className="space-y-6">
                                        <div className="border-b border-slate-100 pb-3">
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200/60 mb-2">
                                                <span>🌟 Pendaftaran Tenaga Pendidik ALC</span>
                                            </div>
                                            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                                                {text.teacherTitle || 'Formulir Pendaftaran Pengajar ALC'}
                                            </h3>
                                        </div>

                                        {/* Global Error Notice if any */}
                                        {Object.keys(teacherForm.errors).length > 0 && (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800 flex items-start gap-3">
                                                <svg className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div>
                                                    <p className="font-bold">Mohon periksa kembali isian formulir Anda:</p>
                                                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-rose-700">
                                                        {Object.values(teacherForm.errors).map((err, i) => (
                                                             <li key={i}>{err}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* BAGIAN 1: IDENTITAS & KONTAK */}
                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5 space-y-4">
                                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-brand-primary font-bold text-xs">
                                                    1
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900">Data Pribadi & Kontak</h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Nama Lengkap */}
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>
                                                        {teacherFields.name} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`${inputClass} ${teacherForm.errors.name ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="Nama lengkap beserta gelar (contoh: Muhammad Farhan, S.Pd.)"
                                                        value={teacherForm.data.name}
                                                        onChange={(e) => teacherForm.setData('name', e.target.value)}
                                                        required
                                                    />
                                                    {teacherForm.errors.name && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.name}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Nomor WhatsApp */}
                                                <div>
                                                    <label className={labelClass}>
                                                        {teacherFields.contact} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className={`${inputClass} ${teacherForm.errors.contact ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="08xxxxxxxxxx (WhatsApp aktif)"
                                                        value={teacherForm.data.contact}
                                                        onChange={(e) => teacherForm.setData('contact', e.target.value)}
                                                        required
                                                    />
                                                    {teacherForm.errors.contact && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.contact}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Email Pengajar */}
                                                <div>
                                                    <label className={labelClass}>
                                                        {teacherFields.email} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className={`${inputClass} ${teacherForm.errors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="contoh: farhan@gmail.com"
                                                        value={teacherForm.data.email}
                                                        onChange={(e) => teacherForm.setData('email', e.target.value)}
                                                        required
                                                    />
                                                    {teacherForm.errors.email && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.email}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* BAGIAN 2: DOMISILI & LOKASI */}
                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5 space-y-4">
                                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold text-xs">
                                                    2
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900">Domisili Tempat Tinggal</h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Kota / Kabupaten */}
                                                <div>
                                                    <label className={labelClass}>
                                                        {teacherFields.city} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        list="alc-city-list"
                                                        className={`${inputClass} ${teacherForm.errors.city ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="Contoh: Kota Padang / Kab. Padang Pariaman"
                                                        value={teacherForm.data.city}
                                                        onChange={(e) => teacherForm.setData('city', e.target.value)}
                                                        required
                                                    />
                                                    <datalist id="alc-city-list">
                                                        {DOMICILE_CITIES.map((c) => (
                                                            <option key={c} value={c} />
                                                        ))}
                                                    </datalist>
                                                    {teacherForm.errors.city && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.city}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Kecamatan */}
                                                <div>
                                                    <label className={labelClass}>
                                                        {teacherFields.district} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        list="alc-district-list"
                                                        className={`${inputClass} ${teacherForm.errors.district ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="Contoh: Koto Tangah / Padang Timur / Pauh"
                                                        value={teacherForm.data.district}
                                                        onChange={(e) => teacherForm.setData('district', e.target.value)}
                                                        required
                                                    />
                                                    <datalist id="alc-district-list">
                                                        {PADANG_DISTRICTS.map((d) => (
                                                            <option key={d} value={d} />
                                                        ))}
                                                    </datalist>
                                                    {teacherForm.errors.district && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.district}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Alamat Domisili Lengkap */}
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>
                                                        {teacherFields.address} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <textarea
                                                        rows="2"
                                                        className={`${inputClass} resize-none ${teacherForm.errors.address ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="Alamat jalan, nomor rumah, RT/RW, atau patokan tempat tinggal"
                                                        value={teacherForm.data.address}
                                                        onChange={(e) => teacherForm.setData('address', e.target.value)}
                                                        required
                                                    />
                                                    {teacherForm.errors.address && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.address}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* BAGIAN 3: JENJANG & KEAHLIAN PENGAJAR */}
                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5 space-y-4">
                                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs">
                                                    3
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900">Jenjang & Keahlian Pengajar</h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Jenjang yang Diajar */}
                                                <div className="sm:col-span-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className={labelClass}>
                                                            {teacherFields.teacherRole} <span className="text-rose-500">*</span>
                                                        </label>
                                                        <span className="text-[11px] text-slate-400">Pilih satu atau lebih jenjang</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {teacherLevelOptions.map((level) => {
                                                            const isSelected = selectedLevels.includes(level);
                                                            return (
                                                                <button
                                                                    key={level}
                                                                    type="button"
                                                                    onClick={() => toggleLevel(level)}
                                                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer select-none ${
                                                                        isSelected
                                                                            ? 'bg-brand-primary text-white shadow-xs'
                                                                            : 'border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50'
                                                                    }`}
                                                                >
                                                                    {isSelected && (
                                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                        </svg>
                                                                    )}
                                                                    {level}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {teacherForm.errors.teacher_role && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.teacher_role}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Keahlian / Mata Pelajaran yang Dikuasai */}
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>
                                                        {teacherFields.subjects} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`${inputClass} ${teacherForm.errors.subjects ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="Contoh: Matematika, Fisika, Biologi, Bahasa Inggris, Tahsin Al-Qur'an"
                                                        value={teacherForm.data.subjects}
                                                        onChange={(e) => teacherForm.setData('subjects', e.target.value)}
                                                        required
                                                    />
                                                    {teacherForm.errors.subjects && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.subjects}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Pendidikan Terakhir */}
                                                <div>
                                                    <label className={labelClass}>
                                                        {teacherFields.education} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        list="teacher-education-options"
                                                        className={`${inputClass} ${teacherForm.errors.education ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                                        placeholder="Pilih atau ketik pendidikan terakhir"
                                                        value={teacherForm.data.education}
                                                        onChange={(e) => teacherForm.setData('education', e.target.value)}
                                                        required
                                                    />
                                                    <datalist id="teacher-education-options">
                                                        {teacherEducationOptions.map((education) => (
                                                            <option key={education} value={education} />
                                                        ))}
                                                    </datalist>
                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Pilih dari daftar atau ketik pendidikan baru bila belum tersedia.
                                                    </p>
                                                    {teacherForm.errors.education && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.education}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Pengalaman Mengajar */}
                                                <div>
                                                    <label className={labelClass}>
                                                        {teacherFields.experience}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        placeholder="Contoh: 2 Tahun Tentor Bimbel / Privat (Opsional)"
                                                        value={teacherForm.data.experience}
                                                        onChange={(e) => teacherForm.setData('experience', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* BAGIAN 4: BERKAS CV & CATATAN */}
                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5 space-y-4">
                                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                                                    4
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900">Berkas CV & Catatan Tambahan</h4>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Upload CV */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className={labelClass}>
                                                            {teacherFields.cv} <span className="text-rose-500">*</span>
                                                        </label>
                                                        <span className="text-[11px] text-slate-400">PDF, DOC, DOCX (Maks. 5MB)</span>
                                                    </div>

                                                    {!selectedFileName ? (
                                                        <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 transition hover:border-brand-primary hover:bg-violet-50/30 cursor-pointer">
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-brand-primary group-hover:scale-110 transition duration-200">
                                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                </svg>
                                                            </div>
                                                            <p className="mt-2.5 text-xs font-bold text-slate-800">
                                                                Pilih file CV <span className="text-slate-400 font-normal">atau seret file ke sini</span>
                                                            </p>
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                className="sr-only"
                                                                onChange={handleCvChange}
                                                                required
                                                            />
                                                        </label>
                                                    ) : (
                                                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFileName}</p>
                                                                    <p className="text-[11px] text-emerald-700 font-medium">{selectedFileSize}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <label className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                                                                    Ganti
                                                                    <input
                                                                        type="file"
                                                                        accept=".pdf,.doc,.docx"
                                                                        className="sr-only"
                                                                        onChange={handleCvChange}
                                                                    />
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRemoveCv}
                                                                    className="rounded-xl p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                                    title="Hapus file"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {teacherForm.errors.cv && (
                                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                                            <span className="font-semibold">{teacherForm.errors.cv}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Catatan Tambahan */}
                                                <div>
                                                    <label className={labelClass}>{teacherFields.notes}</label>
                                                    <textarea
                                                        rows="2"
                                                        className={`${inputClass} resize-none`}
                                                        placeholder="Hari/jam luang mengajar, preferensi mengajar offline/online, atau info penunjang lainnya..."
                                                        value={teacherForm.data.notes}
                                                        onChange={(e) => teacherForm.setData('notes', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Honeypot & Submit */}
                                        <div className="pt-2 space-y-3">
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
                                                className="w-full shadow-lg shadow-amber-700/10 cursor-pointer"
                                                iconRight={
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                    </svg>
                                                }
                                            >
                                                {teacherForm.processing ? 'Mengirim Pendaftaran...' : (text.submitTeacher || 'Kirim Pendaftaran Pengajar ALC')}
                                            </Button>

                                            <p className="text-center text-[11px] text-slate-400">
                                                🔒 Data pribadi Anda dijaga kerahasiaannya dan hanya digunakan untuk keperluan seleksi di ALC.
                                            </p>
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
