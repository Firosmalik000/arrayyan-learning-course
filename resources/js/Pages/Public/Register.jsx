import { Head, useForm, usePage } from '@inertiajs/react';
import SectionTitle from '../../Components/SectionTitle';
import { useI18n } from '../../lib/i18n';

export default function Register() {
    const { props } = usePage();
    const { language } = useI18n();
    const flashSuccess = props.flash?.success;
    const inputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

    const studentForm = useForm({
        student_name: '',
        level: '',
        subjects: '',
        parent_contact: '',
        preferred_mode: '',
        notes: '',
    });

    const teacherForm = useForm({
        name: '',
        education: '',
        subjects: '',
        experience: '',
        contact: '',
        notes: '',
    });

    const copy = {
        id: {
            title: 'Pendaftaran',
            subtitle:
                'Isi form berikut untuk pendaftaran murid atau pengajar ALC.',
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

    const text = copy[language] ?? copy.id;

    return (
        <>
            <Head>
                <title>Pendaftaran</title>
                <meta
                    name="description"
                    content="Form pendaftaran murid dan pengajar untuk Ar Rayyan Learning Course."
                />
            </Head>

            <section className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16 alc-pattern">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <SectionTitle
                        eyebrow="Join ALC"
                        title={text.title}
                        subtitle={text.subtitle}
                    />

                    {flashSuccess ? (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
                            {flashSuccess}
                        </div>
                    ) : null}

                    <div className="mt-10 grid gap-8 lg:grid-cols-2">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                studentForm.post('/pendaftaran/murid', {
                                    preserveScroll: true,
                                    onSuccess: () => studentForm.reset(),
                                });
                            }}
                            className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm"
                        >
                            <h3 className="font-display text-lg font-semibold text-slate-800">
                                {text.studentTitle}
                            </h3>
                            <div className="mt-4 grid gap-4">
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Nama siswa"
                                    value={studentForm.data.student_name}
                                    onChange={(event) =>
                                        studentForm.setData(
                                            'student_name',
                                            event.target.value
                                        )
                                    }
                                />
                                {studentForm.errors.student_name ? (
                                    <p className="text-xs text-rose-500">
                                        {studentForm.errors.student_name}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Jenjang"
                                    value={studentForm.data.level}
                                    onChange={(event) =>
                                        studentForm.setData(
                                            'level',
                                            event.target.value
                                        )
                                    }
                                />
                                {studentForm.errors.level ? (
                                    <p className="text-xs text-rose-500">
                                        {studentForm.errors.level}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Mata pelajaran"
                                    value={studentForm.data.subjects}
                                    onChange={(event) =>
                                        studentForm.setData(
                                            'subjects',
                                            event.target.value
                                        )
                                    }
                                />
                                {studentForm.errors.subjects ? (
                                    <p className="text-xs text-rose-500">
                                        {studentForm.errors.subjects}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Kontak orang tua"
                                    value={studentForm.data.parent_contact}
                                    onChange={(event) =>
                                        studentForm.setData(
                                            'parent_contact',
                                            event.target.value
                                        )
                                    }
                                />
                                {studentForm.errors.parent_contact ? (
                                    <p className="text-xs text-rose-500">
                                        {studentForm.errors.parent_contact}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Sistem belajar (offline/online)"
                                    value={studentForm.data.preferred_mode}
                                    onChange={(event) =>
                                        studentForm.setData(
                                            'preferred_mode',
                                            event.target.value
                                        )
                                    }
                                />
                                <textarea
                                    rows="3"
                                    className={`${inputClass} resize-none`}
                                    placeholder="Catatan tambahan"
                                    value={studentForm.data.notes}
                                    onChange={(event) =>
                                        studentForm.setData(
                                            'notes',
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={studentForm.processing}
                                className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:from-emerald-600 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {text.submitStudent}
                            </button>
                        </form>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                teacherForm.post('/pendaftaran/pengajar', {
                                    preserveScroll: true,
                                    onSuccess: () => teacherForm.reset(),
                                });
                            }}
                            className="rounded-3xl border border-sky-100/70 bg-white/90 p-6 shadow-sm"
                        >
                            <h3 className="font-display text-lg font-semibold text-slate-800">
                                {text.teacherTitle}
                            </h3>
                            <div className="mt-4 grid gap-4">
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Nama"
                                    value={teacherForm.data.name}
                                    onChange={(event) =>
                                        teacherForm.setData(
                                            'name',
                                            event.target.value
                                        )
                                    }
                                />
                                {teacherForm.errors.name ? (
                                    <p className="text-xs text-rose-500">
                                        {teacherForm.errors.name}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Pendidikan"
                                    value={teacherForm.data.education}
                                    onChange={(event) =>
                                        teacherForm.setData(
                                            'education',
                                            event.target.value
                                        )
                                    }
                                />
                                {teacherForm.errors.education ? (
                                    <p className="text-xs text-rose-500">
                                        {teacherForm.errors.education}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Mata pelajaran dikuasai"
                                    value={teacherForm.data.subjects}
                                    onChange={(event) =>
                                        teacherForm.setData(
                                            'subjects',
                                            event.target.value
                                        )
                                    }
                                />
                                {teacherForm.errors.subjects ? (
                                    <p className="text-xs text-rose-500">
                                        {teacherForm.errors.subjects}
                                    </p>
                                ) : null}
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Pengalaman"
                                    value={teacherForm.data.experience}
                                    onChange={(event) =>
                                        teacherForm.setData(
                                            'experience',
                                            event.target.value
                                        )
                                    }
                                />
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Kontak"
                                    value={teacherForm.data.contact}
                                    onChange={(event) =>
                                        teacherForm.setData(
                                            'contact',
                                            event.target.value
                                        )
                                    }
                                />
                                {teacherForm.errors.contact ? (
                                    <p className="text-xs text-rose-500">
                                        {teacherForm.errors.contact}
                                    </p>
                                ) : null}
                                <textarea
                                    rows="3"
                                    className={`${inputClass} resize-none`}
                                    placeholder="Catatan tambahan"
                                    value={teacherForm.data.notes}
                                    onChange={(event) =>
                                        teacherForm.setData(
                                            'notes',
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={teacherForm.processing}
                                className="mt-6 w-full rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {text.submitTeacher}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
