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

export const formFields = {
    student: {
        id: {
            name: 'Nama siswa',
            level: 'Jenjang',
            subjects: 'Mata pelajaran',
            parentContact: 'Kontak orang tua',
            preferredMode: 'Sistem belajar (offline/online)',
            notes: 'Catatan tambahan',
        },
        en: {
            name: 'Student name',
            level: 'Grade level',
            subjects: 'Subjects',
            parentContact: 'Parent contact',
            preferredMode: 'Learning mode (offline/online)',
            notes: 'Additional notes',
        },
    },
    teacher: {
        id: {
            name: 'Nama',
            education: 'Pendidikan',
            subjects: 'Mata pelajaran dikuasai',
            experience: 'Pengalaman',
            contact: 'Kontak',
            notes: 'Catatan tambahan',
        },
        en: {
            name: 'Name',
            education: 'Education',
            subjects: 'Subjects expertise',
            experience: 'Experience',
            contact: 'Contact',
            notes: 'Additional notes',
        },
    },
};

export const initialStudentForm = {
    student_name: '',
    level: '',
    subjects: '',
    parent_contact: '',
    preferred_mode: '',
    notes: '',
};

export const initialTeacherForm = {
    name: '',
    education: '',
    subjects: '',
    experience: '',
    contact: '',
    notes: '',
};
