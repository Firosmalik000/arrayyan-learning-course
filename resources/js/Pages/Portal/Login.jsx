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
        'w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 shadow-2xs';

    return (
        <>
            <SeoHead title="Masuk Portal" description="Masuk ke portal murid dan pengajar Ar Rayyan Learning Course." />
            <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50/60 via-white to-slate-50/50 py-12 px-4">
                {/* Ambient Soft Glow */}
                <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

                <Container>
                    <div className="relative mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xl">
                        <div className="text-center">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 font-display text-base font-extrabold text-white shadow-sm">
                                ALC
                            </span>
                            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900">
                                Masuk Portal
                            </h1>
                        </div>

                        <form onSubmit={submit} className="mt-7 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                                    <p className="mt-1.5 text-xs font-semibold text-rose-500">{form.errors.contact}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                                    <p className="mt-1.5 text-xs font-semibold text-rose-500">{form.errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.remember}
                                        onChange={(e) => form.setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-violet-400"
                                    />
                                    Ingat saya
                                </label>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" variant="primary" className="w-full" loading={form.processing}>
                                    Masuk
                                </Button>
                            </div>
                        </form>

                        <div className="mt-7 border-t border-slate-100 pt-5 flex items-center justify-between text-xs text-slate-500 font-medium">
                            <Link href="/cek-status" className="hover:text-brand-primary hover:underline transition">
                                Cek Status Pendaftaran
                            </Link>
                            <Link href="/" className="hover:text-slate-900 transition">
                                Beranda Web
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
