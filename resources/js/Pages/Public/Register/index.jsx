import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import SectionTitle from '@/Components/SectionTitle';
import { useI18n } from '@/lib/i18n';

// Page-specific data
import { pageContent, formFields, initialStudentForm, initialTeacherForm, programOptions, packageOptions } from './data';

export default function Register() {
    const { props } = usePage();
    const { language } = useI18n();
    const flashSuccess = props.flash?.success;
    const [activeTab, setActiveTab] = useState('student');

    const text = pageContent[language] || pageContent.id;
    const studentFields = formFields.student[language] || formFields.student.id;
    const teacherFields = formFields.teacher[language] || formFields.teacher.id;

    const labelClass = 'mb-1.5 block text-sm font-medium text-slate-600';

    const inputClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 sm:rounded-2xl sm:px-4';

    const selectClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 sm:rounded-2xl sm:px-4 appearance-none';

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

    const tabs = [
        { key: 'student', label: language === 'en' ? 'Student' : 'Murid' },
        { key: 'teacher', label: language === 'en' ? 'Teacher' : 'Pengajar' },
    ];

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
                <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
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

                    {/* Tabs */}
                    <div className="mt-6 flex rounded-full border border-slate-200 bg-white p-1 sm:mt-10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                                    activeTab === tab.key
                                        ? tab.key === 'student'
                                            ? 'bg-gradient-to-r from-violet-700 to-violet-500 text-white shadow'
                                            : 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Student Registration Form */}
                    {activeTab === 'student' && (
                        <form
                            onSubmit={handleStudentSubmit}
                            className="mt-4 rounded-2xl border border-violet-100/70 bg-white/90 p-4 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-6"
                        >
                            <h3 className="font-display text-base font-semibold text-slate-800 sm:text-lg">
                                {text.studentTitle}
                            </h3>
                            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4">
                                <div>
                                    <label className={labelClass}>{studentFields.name}</label>
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
                                    <label className={labelClass}>{studentFields.address}</label>
                                    <textarea
                                        rows="2"
                                        className={`${inputClass} resize-none`}
                                        placeholder={studentFields.address}
                                        value={studentForm.data.address}
                                        onChange={(e) => studentForm.setData('address', e.target.value)}
                                    />
                                    {studentForm.errors.address && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.address}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{studentFields.schoolName}</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={studentFields.schoolName}
                                        value={studentForm.data.school_name}
                                        onChange={(e) => studentForm.setData('school_name', e.target.value)}
                                    />
                                    {studentForm.errors.school_name && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.school_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{studentFields.level}</label>
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
                                    <label className={labelClass}>{studentFields.subjects}</label>
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
                                    <label className={labelClass}>{studentFields.program}</label>
                                    <select
                                        className={`${selectClass} ${!studentForm.data.program ? 'text-slate-400' : 'text-slate-700'}`}
                                        value={studentForm.data.program}
                                        onChange={(e) => studentForm.setData('program', e.target.value)}
                                    >
                                        <option value="" disabled>{studentFields.program}</option>
                                        {programOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label[language] || opt.label.id}
                                            </option>
                                        ))}
                                    </select>
                                    {studentForm.errors.program && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.program}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{studentFields.package}</label>
                                    <select
                                        className={`${selectClass} ${!studentForm.data.package ? 'text-slate-400' : 'text-slate-700'}`}
                                        value={studentForm.data.package}
                                        onChange={(e) => studentForm.setData('package', e.target.value)}
                                    >
                                        <option value="" disabled>{studentFields.package}</option>
                                        {packageOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    {studentForm.errors.package && (
                                        <p className="mt-1 text-xs text-rose-500">{studentForm.errors.package}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{studentFields.parentContact}</label>
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
                                <div>
                                    <label className={labelClass}>{studentFields.preferredMode}</label>
                                    <select
                                        className={`${selectClass} ${!studentForm.data.preferred_mode ? 'text-slate-400' : 'text-slate-700'}`}
                                        value={studentForm.data.preferred_mode}
                                        onChange={(e) => studentForm.setData('preferred_mode', e.target.value)}
                                    >
                                        <option value="" disabled>{studentFields.preferredMode}</option>
                                        <option value="offline">Offline</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>{studentFields.notes}</label>
                                    <textarea
                                        rows="3"
                                        className={`${inputClass} resize-none`}
                                        placeholder={studentFields.notes}
                                        value={studentForm.data.notes}
                                        onChange={(e) => studentForm.setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={studentForm.processing}
                                className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:px-6 sm:py-3"
                            >
                                {text.submitStudent}
                            </button>
                        </form>
                    )}

                    {/* Teacher Registration Form */}
                    {activeTab === 'teacher' && (
                        <form
                            onSubmit={handleTeacherSubmit}
                            className="mt-4 rounded-2xl border border-amber-100/70 bg-white/90 p-4 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-6"
                        >
                            <h3 className="font-display text-base font-semibold text-slate-800 sm:text-lg">
                                {text.teacherTitle}
                            </h3>
                            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4">
                                <div>
                                    <label className={labelClass}>{teacherFields.name}</label>
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
                                    <label className={labelClass}>{teacherFields.address}</label>
                                    <textarea
                                        rows="2"
                                        className={`${inputClass} resize-none`}
                                        placeholder={teacherFields.address}
                                        value={teacherForm.data.address}
                                        onChange={(e) => teacherForm.setData('address', e.target.value)}
                                    />
                                    {teacherForm.errors.address && (
                                        <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.address}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{teacherFields.education}</label>
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
                                    <label className={labelClass}>{teacherFields.subjects}</label>
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
                                <div>
                                    <label className={labelClass}>{teacherFields.experience}</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder={teacherFields.experience}
                                        value={teacherForm.data.experience}
                                        onChange={(e) => teacherForm.setData('experience', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>{teacherFields.contact}</label>
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
                                <div>
                                    <label className={labelClass}>{teacherFields.cv}</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100 sm:rounded-2xl sm:px-4"
                                        onChange={(e) => teacherForm.setData('cv', e.target.files[0])}
                                    />
                                    {teacherForm.errors.cv && (
                                        <p className="mt-1 text-xs text-rose-500">{teacherForm.errors.cv}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{teacherFields.notes}</label>
                                    <textarea
                                        rows="3"
                                        className={`${inputClass} resize-none`}
                                        placeholder={teacherFields.notes}
                                        value={teacherForm.data.notes}
                                        onChange={(e) => teacherForm.setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={teacherForm.processing}
                                className="mt-4 w-full rounded-full border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow transition hover:border-violet-300 hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:px-6 sm:py-3"
                            >
                                {text.submitTeacher}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </>
    );
}
