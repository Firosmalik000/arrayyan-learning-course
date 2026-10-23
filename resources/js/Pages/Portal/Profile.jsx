import { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

const inputClass = (hasError) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
        hasError
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
            : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
    }`;

function Field({ label, error, hint, children, className = '' }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="block text-xs font-bold text-slate-700">{label}</label>
            {children}
            {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
            {!error && hint ? <p className="text-[11px] leading-relaxed text-slate-500">{hint}</p> : null}
        </div>
    );
}

function SaveButton({ processing, isDirty, recentlySuccessful, label = 'Simpan Perubahan' }) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
            {recentlySuccessful ? (
                <span className="text-xs font-bold text-emerald-600">Perubahan tersimpan</span>
            ) : null}
            <button
                type="submit"
                disabled={processing || !isDirty}
                className="inline-flex min-w-36 items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {processing ? 'Menyimpan...' : label}
            </button>
        </div>
    );
}

function PhotoField({ currentUrl, value, onChange, error, label }) {
    const [previewUrl, setPreviewUrl] = useState(currentUrl || null);

    useEffect(() => {
        if (!value) {
            setPreviewUrl(currentUrl || null);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(value);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [currentUrl, value]);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-violet-100 text-xl font-black text-brand-primary shadow-sm">
                {previewUrl ? (
                    <img src={previewUrl} alt={`Foto ${label}`} className="h-full w-full object-cover" />
                ) : (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">Foto {label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">JPG, PNG, atau WebP. Maksimal 2 MB. Foto persegi akan tampil paling rapi.</p>
                <label className="mt-3 inline-flex cursor-pointer items-center rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-xs font-bold text-brand-primary transition hover:bg-violet-50">
                    {currentUrl ? 'Ganti Foto' : 'Pilih Foto'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] || null)} />
                </label>
                {error ? <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p> : null}
            </div>
        </div>
    );
}

function StudentProfileForm({ student, index }) {
    const form = useForm({
        name: student.name || '',
        address: student.address || '',
        school_name: student.school_name || '',
        level: student.level || '',
        class_level: student.class_level || '',
        subjects: student.subjects || '',
        preferred_mode: student.preferred_mode?.toLowerCase() || '',
        notes: student.notes || '',
        photo: null,
    });

    const submit = (event) => {
        event.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' })).post(`/portal/profil/murid/${student.id}`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.defaults({ ...form.data, photo: null });
                form.setData('photo', null);
            },
        });
    };

    return (
        <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-100 text-sm font-black text-brand-primary">
                        {student.photo_url ? <img src={student.photo_url} alt={`Foto ${student.name}`} className="h-full w-full object-cover" /> : index + 1}
                    </span>
                    <div className="min-w-0">
                        <h3 className="truncate font-display text-sm font-bold text-slate-900">{student.name}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Data murid yang terhubung dengan akun Anda</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {student.program ? (
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                            {student.program}
                        </span>
                    ) : null}
                    {student.package ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {student.package}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <div className="sm:col-span-2">
                    <PhotoField currentUrl={student.photo_url} value={form.data.photo} onChange={(file) => form.setData('photo', file)} error={form.errors.photo} label="Murid" />
                </div>
                <Field label="Nama Lengkap Murid" error={form.errors.name}>
                    <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className={inputClass(form.errors.name)} />
                </Field>
                <Field label="Nama Sekolah" error={form.errors.school_name}>
                    <input value={form.data.school_name} onChange={(event) => form.setData('school_name', event.target.value)} className={inputClass(form.errors.school_name)} />
                </Field>
                <Field label="Jenjang" error={form.errors.level}>
                    <select value={form.data.level} onChange={(event) => form.setData('level', event.target.value)} className={inputClass(form.errors.level)}>
                        <option value="">Pilih jenjang</option>
                        <option value="TK">TK / PAUD</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA / SMK</option>
                    </select>
                </Field>
                <Field label="Kelas" error={form.errors.class_level}>
                    <input value={form.data.class_level} onChange={(event) => form.setData('class_level', event.target.value)} placeholder="Contoh: Kelas 7" className={inputClass(form.errors.class_level)} />
                </Field>
                <Field label="Mata Pelajaran" error={form.errors.subjects}>
                    <input value={form.data.subjects} onChange={(event) => form.setData('subjects', event.target.value)} className={inputClass(form.errors.subjects)} />
                </Field>
                <Field label="Sistem Belajar" error={form.errors.preferred_mode}>
                    <select value={form.data.preferred_mode} onChange={(event) => form.setData('preferred_mode', event.target.value)} className={inputClass(form.errors.preferred_mode)}>
                        <option value="">Belum ditentukan</option>
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                    </select>
                </Field>
                <Field label="Alamat" error={form.errors.address} className="sm:col-span-2">
                    <textarea rows={3} value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} className={inputClass(form.errors.address)} />
                </Field>
                <Field label="Catatan Tambahan" error={form.errors.notes} className="sm:col-span-2">
                    <textarea rows={3} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} placeholder="Informasi khusus yang perlu diketahui admin atau pengajar" className={inputClass(form.errors.notes)} />
                </Field>
                <div className="sm:col-span-2">
                    <SaveButton processing={form.processing} isDirty={form.isDirty} recentlySuccessful={form.recentlySuccessful} label={`Simpan Data ${student.name}`} />
                </div>
            </div>
        </form>
    );
}

export default function Profile() {
    const { props } = usePage();
    const account = props.account || {};
    const teacher = props.linked || {};
    const students = props.students || [];
    const isTeacher = (props.account_type || 'parent') === 'teacher';
    const selectedStudentId = props.portalAuth?.selected_student_id;
    const activeStudent = students.find((student) => student.id === Number(selectedStudentId)) || students[0];
    const profilePhotoUrl = isTeacher ? teacher.photo_url : activeStudent?.photo_url;
    const form = useForm({
        name: account.name || '',
        email: account.email || '',
        contact: account.contact || '',
        ...(isTeacher
            ? {
                  address: teacher.address || '', city: teacher.city || '', district: teacher.district || '',
                  teacher_role: teacher.teacher_role || '', education: teacher.education || '', subjects: teacher.subjects || '',
                  experience: teacher.experience || '', notes: teacher.notes || '',
                  photo: null,
              }
            : {}),
    });

    const submit = (event) => {
        event.preventDefault();
        if (isTeacher) {
            form.transform((data) => ({ ...data, _method: 'put' })).post('/portal/profil', {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    form.defaults({ ...form.data, photo: null });
                    form.setData('photo', null);
                },
            });
            return;
        }

        form.put('/portal/profil', { preserveScroll: true, onSuccess: () => form.setDefaults() });
    };

    return (
        <PortalLayout>
            <Head title={isTeacher ? 'Profil Pengajar' : 'Profil Orang Tua dan Murid'} />
            <div className="mx-auto max-w-4xl space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-violet-700 to-purple-900 p-5 text-white shadow-brand sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 font-display text-lg font-black ring-1 ring-white/20">
                                {profilePhotoUrl ? <img src={profilePhotoUrl} alt={isTeacher ? `Foto ${account.name}` : `Foto ${activeStudent?.name}`} className="h-full w-full object-cover" /> : (isTeacher ? account.name : activeStudent?.name || 'A')[0].toUpperCase()}
                            </span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">{isTeacher ? 'Portal Pengajar' : 'Portal Orang Tua'}</p>
                                <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight">{isTeacher ? 'Profil Pengajar' : 'Informasi Keluarga'}</h1>
                                <p className="mt-1 text-xs leading-relaxed text-violet-100">Periksa dan perbarui informasi yang sebelumnya diisi saat pendaftaran.</p>
                            </div>
                        </div>
                        <Link href="/portal/password" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20">Ganti Kata Sandi</Link>
                    </div>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
                    <div className="mb-5 border-b border-slate-100 pb-4">
                        <h2 className="font-display text-base font-bold text-slate-900">{isTeacher ? 'Data Diri Pengajar' : 'Data Orang Tua / Wali'}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">Email dan nomor WhatsApp digunakan untuk masuk ke portal serta menerima informasi dari ALC.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {isTeacher ? (
                            <div className="sm:col-span-2">
                                <PhotoField currentUrl={teacher.photo_url} value={form.data.photo} onChange={(file) => form.setData('photo', file)} error={form.errors.photo} label="Pengajar" />
                            </div>
                        ) : null}
                        <Field label={isTeacher ? 'Nama Lengkap' : 'Nama Orang Tua / Wali'} error={form.errors.name} className="sm:col-span-2">
                            <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className={inputClass(form.errors.name)} />
                        </Field>
                        <Field label="Email" error={form.errors.email}>
                            <input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className={inputClass(form.errors.email)} />
                        </Field>
                        <Field label="Nomor WhatsApp" error={form.errors.contact}>
                            <input inputMode="tel" value={form.data.contact} onChange={(event) => form.setData('contact', event.target.value)} className={inputClass(form.errors.contact)} />
                        </Field>

                        {isTeacher ? (
                            <>
                                <Field label="Posisi / Jenjang yang Diajar" error={form.errors.teacher_role}>
                                    <input value={form.data.teacher_role} onChange={(event) => form.setData('teacher_role', event.target.value)} className={inputClass(form.errors.teacher_role)} />
                                </Field>
                                <Field label="Pendidikan Terakhir" error={form.errors.education}>
                                    <input value={form.data.education} onChange={(event) => form.setData('education', event.target.value)} className={inputClass(form.errors.education)} />
                                </Field>
                                <Field label="Keahlian / Mata Pelajaran" error={form.errors.subjects} className="sm:col-span-2">
                                    <input value={form.data.subjects} onChange={(event) => form.setData('subjects', event.target.value)} className={inputClass(form.errors.subjects)} />
                                </Field>
                                <Field label="Kota / Kabupaten" error={form.errors.city}>
                                    <input value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} className={inputClass(form.errors.city)} />
                                </Field>
                                <Field label="Kecamatan" error={form.errors.district}>
                                    <input value={form.data.district} onChange={(event) => form.setData('district', event.target.value)} className={inputClass(form.errors.district)} />
                                </Field>
                                <Field label="Alamat Lengkap" error={form.errors.address} className="sm:col-span-2">
                                    <textarea rows={3} value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} className={inputClass(form.errors.address)} />
                                </Field>
                                <Field label="Pengalaman Mengajar" error={form.errors.experience} className="sm:col-span-2">
                                    <textarea rows={3} value={form.data.experience} onChange={(event) => form.setData('experience', event.target.value)} className={inputClass(form.errors.experience)} />
                                </Field>
                                <Field label="Catatan Tambahan" error={form.errors.notes} className="sm:col-span-2">
                                    <textarea rows={3} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} className={inputClass(form.errors.notes)} />
                                </Field>
                                {teacher.cv_url ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:col-span-2">CV pendaftaran tersimpan. <a href={teacher.cv_url} target="_blank" rel="noreferrer" className="font-bold text-brand-primary hover:underline">Lihat CV</a></div>
                                ) : null}
                            </>
                        ) : null}
                        <div className="sm:col-span-2">
                            <SaveButton processing={form.processing} isDirty={form.isDirty} recentlySuccessful={form.recentlySuccessful} />
                        </div>
                    </div>
                </form>

                {!isTeacher ? (
                    <section className="space-y-3">
                        <div className="px-1">
                            <h2 className="font-display text-base font-bold text-slate-900">Informasi Murid ({students.length})</h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">Data sekolah dan kebutuhan belajar dapat diperbarui di sini. Program dan paket dikelola oleh admin agar tetap sesuai tagihan.</p>
                        </div>
                        {students.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">Belum ada murid yang terhubung dengan akun ini.</div>
                        ) : students.map((student, index) => (
                            <StudentProfileForm key={student.id} student={student} index={index} />
                        ))}
                    </section>
                ) : null}
            </div>
        </PortalLayout>
    );
}
