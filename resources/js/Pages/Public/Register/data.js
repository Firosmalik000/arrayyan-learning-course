/**
 * Register page data
 * All content specific to the registration page
 */

export const pageContent = {
    id: {
        title: 'Pendaftaran',
        subtitle: 'Isi form berikut untuk pendaftaran murid atau pengajar ALC.',
        studentTitle: 'Pendaftaran Murid',
        teacherTitle: 'Pendaftaran Pengajar',
        submitStudent: 'Kirim Pendaftaran Murid',
        submitTeacher: 'Kirim Pendaftaran Pengajar',
    },
    en: {
        title: 'Registration',
        subtitle: 'Submit the form for student or teacher registration.',
        studentTitle: 'Student Registration',
        teacherTitle: 'Teacher Registration',
        submitStudent: 'Submit Student Registration',
        submitTeacher: 'Submit Teacher Registration',
    },
};

export const packageOptions = [
    { value: '8', label: '8 pertemuan/bulan' },
    { value: '12', label: '12 pertemuan/bulan' },
    { value: '16', label: '16 pertemuan/bulan' },
    { value: '20', label: '20 pertemuan/bulan' },
];

export const LEVEL_OPTIONS = [
    { value: 'TK', label: 'TK / PAUD' },
    { value: 'SD', label: 'SD (Sekolah Dasar)' },
    { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
    { value: 'SMA', label: 'SMA / SMK' },
];

export const CLASS_OPTIONS_BY_LEVEL = {
    TK: [
        { value: 'PAUD', label: 'PAUD' },
        { value: 'TK A', label: 'TK A' },
        { value: 'TK B', label: 'TK B' },
    ],
    SD: [
        { value: 'Kelas 1', label: 'Kelas 1' },
        { value: 'Kelas 2', label: 'Kelas 2' },
        { value: 'Kelas 3', label: 'Kelas 3' },
        { value: 'Kelas 4', label: 'Kelas 4' },
        { value: 'Kelas 5', label: 'Kelas 5' },
        { value: 'Kelas 6', label: 'Kelas 6' },
    ],
    SMP: [
        { value: 'Kelas 7', label: 'Kelas 7' },
        { value: 'Kelas 8', label: 'Kelas 8' },
        { value: 'Kelas 9', label: 'Kelas 9' },
    ],
    SMA: [
        { value: 'Kelas 10', label: 'Kelas 10' },
        { value: 'Kelas 11', label: 'Kelas 11' },
        { value: 'Kelas 12', label: 'Kelas 12' },
        { value: 'Alumni / Gap Year', label: 'Alumni / Gap Year' },
    ],
};

export const TEACHER_ROLE_OPTIONS = [
    { value: 'Guru TK / Calistung', label: 'Guru TK / Calistung (Membaca, Menulis, Berhitung)' },
    { value: 'Guru SD (Tematik & Mapel SD)', label: 'Guru SD (Tematik & Mata Pelajaran SD)' },
    { value: 'Guru SMP (Mata Pelajaran SMP)', label: 'Guru SMP (Matematika, IPA, Bahasa Inggris, dll)' },
    { value: 'Guru SMA / SMK (Saintek / Soshum)', label: 'Guru SMA / SMK (Saintek & Soshum)' },
    { value: 'Guru Mengaji & Tahfidz', label: 'Guru Mengaji / Tahsin & Tahfidz Al-Qur\'an' },
    { value: 'Guru Olimpiade Sains / OSN', label: 'Guru Olimpiade Sains & Matematika (OSN)' },
    { value: 'Guru Persiapan UTBK / SNBT & Kedinasan', label: 'Guru Persiapan UTBK / SNBT & Kedinasan' },
    { value: 'Guru Bahasa Asing', label: 'Guru Bahasa Asing (Bahasa Inggris, Arab, dll)' },
    { value: 'Lainnya', label: 'Bidang / Posisi Mengajar Lainnya' },
];

export const TEACHER_LEVEL_OPTIONS = [
    { value: 'TK / PAUD', label: 'TK / PAUD' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA / SMK', label: 'SMA / SMK' },
    { value: 'Alumni / UTBK', label: 'Alumni / UTBK' },
    { value: 'Mengaji / Tahfidz', label: 'Mengaji / Tahfidz' },
    { value: 'Umum', label: 'Umum' },
];

export const DOMICILE_CITIES = [
    'Kota Padang',
    'Kota Bukittinggi',
    'Kota Pariaman',
    'Kota Padang Panjang',
    'Kota Solok',
    'Kota Payakumbuh',
    'Kota Sawahlunto',
    'Kab. Padang Pariaman',
    'Kab. Agam',
    'Kab. Pesisir Selatan',
    'Kab. Solok',
    'Kab. Tanah Datar',
    'Kab. Lima Puluh Kota',
    'Kab. Pasaman',
    'Kab. Pasaman Barat',
    'Kab. Sijunjung',
    'Kab. Dharmasraya',
    'Kab. Solok Selatan',
    'Kab. Kepulauan Mentawai',
    'Kota Pekanbaru',
    'DKI Jakarta',
];

export const PADANG_DISTRICTS = [
    'Koto Tangah',
    'Padang Timur',
    'Padang Barat',
    'Padang Utara',
    'Padang Selatan',
    'Kuranji',
    'Nanggalo',
    'Lubuk Begalung',
    'Lubuk Kilangan',
    'Pauh',
    'Bungus Teluk Kabung',
];

export const formFields = {
    student: {
        id: {
            name: 'Nama siswa',
            address: 'Alamat',
            schoolName: 'Nama sekolah',
            level: 'Jenjang',
            classLevel: 'Kelas',
            subjects: 'Mata pelajaran',
            program: 'Program',
            package: 'Pilihan pertemuan dan harga',
            parentContact: 'Kontak orang tua',
            parentEmail: 'Email orang tua',
            preferredMode: 'Sistem belajar (offline/online)',
            notes: 'Catatan tambahan',
        },
        en: {
            name: 'Student name',
            address: 'Address',
            schoolName: 'School name',
            level: 'Grade level',
            classLevel: 'Grade / Class',
            subjects: 'Subjects',
            program: 'Program',
            package: 'Sessions and price option',
            parentContact: 'Parent contact',
            parentEmail: 'Parent email',
            preferredMode: 'Learning mode (offline/online)',
            notes: 'Additional notes',
        },
    },
    teacher: {
        id: {
            name: 'Nama Lengkap',
            email: 'Email',
            city: 'Kota / Kabupaten',
            district: 'Kecamatan',
            address: 'Alamat Lengkap',
            teacherRole: 'Jenjang yang Diajar',
            education: 'Pendidikan Terakhir',
            subjects: 'Keahlian / Mata Pelajaran',
            experience: 'Pengalaman Mengajar',
            contact: 'Nomor WhatsApp',
            cv: 'Curriculum Vitae (CV)',
            notes: 'Catatan Tambahan',
        },
        en: {
            name: 'Full Name',
            email: 'Email',
            city: 'City / Regency',
            district: 'District',
            address: 'Full Address',
            teacherRole: 'Target Teaching Level',
            education: 'Latest Education',
            subjects: 'Expertise / Subjects',
            experience: 'Teaching Experience',
            contact: 'WhatsApp Number',
            cv: 'Curriculum Vitae (CV)',
            notes: 'Additional Notes',
        },
    },
};

export const initialStudentForm = {
    student_name: '',
    address: '',
    school_name: '',
    level: '',
    class_level: '',
    subjects: '',
    program_id: '',
    package_id: '',
    package: '',
    parent_contact: '',
    parent_email: '',
    preferred_mode: '',
    notes: '',
    website: '',
    form_started_at: '',
};

export const initialTeacherForm = {
    name: '',
    email: '',
    city: '',
    district: '',
    address: '',
    teacher_role: '',
    education: '',
    subjects: '',
    experience: '',
    contact: '',
    cv: null,
    notes: '',
    website: '',
    form_started_at: '',
};

export const honeypotStyle = {
    position: 'absolute',
    left: '-9999px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
};
