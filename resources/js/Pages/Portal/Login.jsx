import { Link, useForm, usePage } from '@inertiajs/react';
import SeoHead from '@/Components/SeoHead';
import { Button, Container } from '@/Components/Public';

export default function Login() {
    const { props } = usePage();
    const form = useForm({ contact: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        form.post('/portal/login');
    };

    const inputClass =
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100';

    return (
        <>
            <SeoHead title="Masuk Portal" description="Masuk ke portal murid dan pengajar Ar Rayyan Learning Course." />
            <section className="flex min-h-screen items-center bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 py-12">
                <Container>
                    <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8">
                        <div className="text-center">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary font-display text-base font-bold text-white">
                                ALC
                            </span>
                            <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Masuk Portal</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Murid & pengajar — gunakan nomor WhatsApp terdaftar dan password portal.
                            </p>
                        </div>

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    No. WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={form.data.contact}
                                    onChange={(e) => form.setData('contact', e.target.value)}
                                    placeholder="081234567890"
                                    className={inputClass}
                                />
                                {form.errors.contact && (
                                    <p className="mt-1 text-xs text-rose-500">{form.errors.contact}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                                {form.errors.password && (
                                    <p className="mt-1 text-xs text-rose-500">{form.errors.password}</p>
                                )}
                            </div>
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                Ingat saya
                            </label>
                            <Button type="submit" variant="primary" className="w-full" loading={form.processing}>
                                Masuk
                            </Button>
                        </form>

                        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                            <p>
                                Belum punya akun portal? Akun dibuat otomatis saat pendaftaran disetujui.{' '}
                                <Link href="/cek-status" className="font-bold text-brand-primary hover:underline">
                                    Cek status
                                </Link>
                            </p>
                            <p className="mt-2">
                                <Link href="/" className="hover:underline">← Kembali ke website</Link>
                            </p>
                            {props.flash?.error && (
                                <p className="mt-2 text-rose-500">{props.flash.error}</p>
                            )}
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
