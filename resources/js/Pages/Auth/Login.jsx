import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Login({ context = 'public' }) {
    const [showPassword, setShowPassword] = useState(false);
    const { flash = {} } = usePage().props;

    const form = useForm({
        identity: '',
        email: '',
        contact: '',
        password: '',
        remember: false,
    });

    const handleIdentityChange = (e) => {
        const val = e.target.value;
        form.setData((prev) => ({
            ...prev,
            identity: val,
            email: val,
            contact: val,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    const identityError = form.errors.identity || form.errors.email || form.errors.contact;

    return (
        <>
            <Head title="Masuk ke Akun - ALC" />

            <div className="space-y-5">
                <div className="text-center">
                    <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
                        Masuk ke Akun
                    </h1>
                </div>

                {flash.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-700" role="status">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Identifier: Email / No. WhatsApp */}
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                            Email atau No. WhatsApp
                        </label>
                        <input
                            type="text"
                            value={form.data.identity}
                            onChange={handleIdentityChange}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                identityError
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-slate-200 focus:border-brand-primary'
                            }`}
                            placeholder="nama@email.com atau 08xxxxxxxxxx"
                            autoComplete="username"
                            autoFocus
                            required
                        />
                        {identityError && (
                            <p className="text-xs text-rose-500 pt-0.5">{identityError}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-slate-700">
                                Kata Sandi
                            </label>
                            {context === 'admin' ? (
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20butuh%20bantuan%20masuk%20ke%20akun"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-400 hover:text-brand-primary transition"
                                >
                                    Butuh bantuan?
                                </a>
                            ) : (
                                <Link
                                    href="/portal/lupa-password"
                                    className="text-xs text-slate-400 hover:text-brand-primary transition"
                                >
                                    Lupa kata sandi?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className={`w-full rounded-xl border bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                    form.errors.password
                                        ? 'border-rose-400 focus:border-rose-500'
                                        : 'border-slate-200 focus:border-brand-primary'
                                }`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                                aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                            >
                                {showPassword ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {form.errors.password && (
                            <p className="text-xs text-rose-500 pt-0.5">{form.errors.password}</p>
                        )}
                    </div>

                    {/* Remember */}
                    <div className="flex items-center pt-0.5">
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(e) => form.setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-violet-400"
                            />
                            <span>Ingat saya</span>
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-xl bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                    >
                        {form.processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="rounded-xl bg-violet-50/70 border border-violet-100 p-3 text-center">
                    <p className="text-[11px] leading-relaxed text-violet-700">
                        Orang tua dan pengajar dapat masuk menggunakan email terdaftar atau nomor WhatsApp dan kata sandi yang dikirimkan melalui email / WhatsApp.
                    </p>
                </div>
            </div>
        </>
    );
}

Login.layout = (page) => <AuthLayout>{page}</AuthLayout>;
