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

export const programOptions = [
    { value: 'reguler', label: { id: 'Reguler', en: 'Regular' } },
    { value: 'privat', label: { id: 'Privat', en: 'Private' } },
    { value: 'persiapan_ujian_olimpiade', label: { id: 'Persiapan Ujian/Olimpiade', en: 'Exam/Olympiad Preparation' } },
];

export const packageOptions = [
    { value: '8', label: '8 pertemuan/bulan' },
    { value: '12', label: '12 pertemuan/bulan' },
    { value: '16', label: '16 pertemuan/bulan' },
    { value: '20', label: '20 pertemuan/bulan' },
];

export const formFields = {
    student: {
        id: {
            name: 'Nama siswa',
            address: 'Alamat',
            schoolName: 'Nama sekolah',
            level: 'Jenjang',
            subjects: 'Mata pelajaran',
            program: 'Program',
            package: 'Paket yang diambil',
            parentContact: 'Kontak orang tua',
            preferredMode: 'Sistem belajar (offline/online)',
            notes: 'Catatan tambahan',
        },
        en: {
            name: 'Student name',
            address: 'Address',
            schoolName: 'School name',
            level: 'Grade level',
            subjects: 'Subjects',
            program: 'Program',
            package: 'Package',
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
    subjects: '',
    program: '',
    package: '',
    parent_contact: '',
    preferred_mode: '',
    notes: '',
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
};
