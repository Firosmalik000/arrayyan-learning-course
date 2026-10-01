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
            preferredMode: 'Learning mode (offline/online)',
            notes: 'Additional notes',
        },
    },
    teacher: {
        id: {
            name: 'Nama',
            address: 'Alamat',
            education: 'Pendidikan',
            subjects: 'Mata pelajaran dikuasai',
            experience: 'Pengalaman',
            contact: 'Kontak',
            cv: 'Sertakan CV (PDF/DOC, maks 5MB)',
            notes: 'Catatan tambahan',
        },
        en: {
            name: 'Name',
            address: 'Address',
            education: 'Education',
            subjects: 'Subjects expertise',
            experience: 'Experience',
            contact: 'Contact',
            cv: 'Attach CV (PDF/DOC, max 5MB)',
            notes: 'Additional notes',
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
    preferred_mode: '',
    notes: '',
    website: '',
    form_started_at: '',
};

export const initialTeacherForm = {
    name: '',
    address: '',
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
