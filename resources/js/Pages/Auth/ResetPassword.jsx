import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function ResetPassword({ token, email }) {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({
        token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/portal/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Buat Kata Sandi Baru - Portal ALC" />

            <div className="space-y-5">
                <div className="space-y-2 text-center">
                    <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
                        Buat Kata Sandi Baru
                    </h1>
                    <p className="text-xs leading-relaxed text-slate-500">
                        Gunakan minimal 8 karakter dan simpan kata sandi Anda dengan aman.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-semibold text-slate-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                form.errors.email ? 'border-rose-400' : 'border-slate-200 focus:border-brand-primary'
                            }`}
                            autoComplete="email"
                            required
                        />
                        {form.errors.email && <p className="pt-0.5 text-xs text-rose-500">{form.errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-semibold text-slate-700">Kata Sandi Baru</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={`w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-16 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                    form.errors.password ? 'border-rose-400' : 'border-slate-200 focus:border-brand-primary'
                                }`}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
                            >
                                {showPassword ? 'Tutup' : 'Lihat'}
                            </button>
                        </div>
                        {form.errors.password && <p className="pt-0.5 text-xs text-rose-500">{form.errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password_confirmation" className="block text-xs font-semibold text-slate-700">Konfirmasi Kata Sandi</label>
                        <input
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-violet-500/20"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                    >
                        {form.processing ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                    </button>
                </form>

                <div className="text-center">
                    <Link href="/portal/login" className="text-xs font-semibold text-violet-600 transition hover:text-violet-700">
                        Kembali ke halaman masuk
                    </Link>
                </div>
            </div>
        </>
    );
}

ResetPassword.layout = (page) => <AuthLayout>{page}</AuthLayout>;
