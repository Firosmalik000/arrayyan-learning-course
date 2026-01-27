import { Head, useForm, usePage } from '@inertiajs/react';
import SectionTitle from '@/Components/SectionTitle';
import { useI18n } from '@/lib/i18n';

// Page-specific data
import { pageContent, formFields, initialStudentForm, initialTeacherForm } from './data';

export default function Register() {
    const { props } = usePage();
    const { language } = useI18n();
    const flashSuccess = props.flash?.success;

    const text = pageContent[language] || pageContent.id;
    const studentFields = formFields.student[language] || formFields.student.id;
    const teacherFields = formFields.teacher[language] || formFields.teacher.id;

    const inputClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 sm:rounded-2xl sm:px-4';

    const studentForm = useForm(initialStudentForm);
    const teacherForm = useForm(initialTeacherForm);

    const handleStudentSubmit = (event) => {
        event.preventDefault();
        studentForm.post('/pendaftaran/murid', {
            preserveScroll: true,
            onSuccess: () => studentForm.reset(),
        });
    };

    const handleTeacherSubmit = (event) => {
        event.preventDefault();
        teacherForm.post('/pendaftaran/pengajar', {
            preserveScroll: true,
            onSuccess: () => teacherForm.reset(),
        });
    };

    return (
        <>
            <Head>
                <title>{text.title}</title>
                <meta
                    name="description"
                    content="Form pendaftaran murid dan pengajar untuk Ar Rayyan Learning Course."
                />
            </Head>

            <section className="bg-gradient-to-br from-violet-50 via-white to-amber-50 py-10 alc-pattern sm:py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <SectionTitle
                        eyebrow="Join ALC"
                        title={text.title}
                        subtitle={text.subtitle}
                    />

                    {flashSuccess && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-700 sm:mt-6 sm:rounded-2xl sm:px-4 sm:py-3">
                            {flashSuccess}
                        </div>
                    )}

                    <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-8 lg:grid-cols-2">
                        {/* Student Registration Form */}
                        <form
                            onSubmit={handleStudentSubmit}
                            className="rounded-2xl border border-violet-100/70 bg-white/90 p-4 shadow-sm sm:rounded-3xl sm:p-6"
                        >
                            <h3 className="font-display text-base font-semibold text-slate-800 sm:text-lg">
                                {text.studentTitle}
                            </h3>
                            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4">
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={studentFields.name}
                                        value={studentForm.data.student_name}
                                        onChange={(e) => studentForm.setData('student_name', e.target.value)}
                                    />
                                    {studentForm.errors.student_name && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.student_name}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={studentFields.level}
                                        value={studentForm.data.level}
                                        onChange={(e) => studentForm.setData('level', e.target.value)}
                                    />
                                    {studentForm.errors.level && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.level}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={studentFields.subjects}
                                        value={studentForm.data.subjects}
                                        onChange={(e) => studentForm.setData('subjects', e.target.value)}
                                    />
                                    {studentForm.errors.subjects && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.subjects}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={studentFields.parentContact}
                                        value={studentForm.data.parent_contact}
                                        onChange={(e) => studentForm.setData('parent_contact', e.target.value)}
                                    />
                                    {studentForm.errors.parent_contact && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.parent_contact}</p>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder={studentFields.preferredMode}
                                    value={studentForm.data.preferred_mode}
                                    onChange={(e) => studentForm.setData('preferred_mode', e.target.value)}
                                />
                                <textarea
                                    rows="3"
                                    className={`${inputClass} resize-none`}
                                    placeholder={studentFields.notes}
                                    value={studentForm.data.notes}
                                    onChange={(e) => studentForm.setData('notes', e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={studentForm.processing}
                                className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:px-6 sm:py-3"
                            >
                                {text.submitStudent}
                            </button>
                        </form>

                        {/* Teacher Registration Form */}
                        <form
                            onSubmit={handleTeacherSubmit}
                            className="rounded-2xl border border-amber-100/70 bg-white/90 p-4 shadow-sm sm:rounded-3xl sm:p-6"
                        >
                            <h3 className="font-display text-base font-semibold text-slate-800 sm:text-lg">
                                {text.teacherTitle}
                            </h3>
                            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4">
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={teacherFields.name}
                                        value={teacherForm.data.name}
                                        onChange={(e) => teacherForm.setData('name', e.target.value)}
                                    />
                                    {teacherForm.errors.name && (
                                        <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={teacherFields.education}
                                        value={teacherForm.data.education}
                                        onChange={(e) => teacherForm.setData('education', e.target.value)}
                                    />
                                    {teacherForm.errors.education && (
                                        <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.education}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={teacherFields.subjects}
                                        value={teacherForm.data.subjects}
                                        onChange={(e) => teacherForm.setData('subjects', e.target.value)}
                                    />
                                    {teacherForm.errors.subjects && (
                                        <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.subjects}</p>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder={teacherFields.experience}
                                    value={teacherForm.data.experience}
                                    onChange={(e) => teacherForm.setData('experience', e.target.value)}
                                />
                                <div>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={teacherFields.contact}
                                        value={teacherForm.data.contact}
                                        onChange={(e) => teacherForm.setData('contact', e.target.value)}
                                    />
                                    {teacherForm.errors.contact && (
                                        <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.contact}</p>
                                    )}
                                </div>
                                <textarea
                                    rows="3"
                                    className={`${inputClass} resize-none`}
                                    placeholder={teacherFields.notes}
                                    value={teacherForm.data.notes}
                                    onChange={(e) => teacherForm.setData('notes', e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={teacherForm.processing}
                                className="mt-4 w-full rounded-full border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow transition hover:border-violet-300 hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:px-6 sm:py-3"
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
