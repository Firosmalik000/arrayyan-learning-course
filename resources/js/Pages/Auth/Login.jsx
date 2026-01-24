import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Login() {
    const { props } = usePage();
    const context = props.context ?? 'public';
    const isAdmin = context === 'admin';

    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const inputClass =
        'w-full border-b border-slate-200 bg-transparent pb-2 text-sm text-slate-700 outline-none transition focus:border-violet-500';

    return (
        <>
            <Head title={isAdmin ? 'Login Admin' : 'Login'} />
            <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-semibold text-slate-500 lg:hidden"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                            ALC
                        </span>
                        Ar Rayyan LC
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        <span>English (UK)</span>
                        <span className="text-slate-300">v</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-600">
                        {isAdmin ? 'Admin Access' : 'Member Access'}
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        {isAdmin ? 'Login Admin' : 'Login Akun'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isAdmin
                            ? 'Masuk untuk mengelola konten dan pendaftaran ALC.'
                            : 'Masuk untuk melanjutkan proses pendaftaran.'}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:border-violet-300"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            f
                        </span>
                        Masuk dengan Facebook
                    </button>
                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:border-violet-300"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-violet-700 shadow-sm">
                            G
                        </span>
                        Masuk dengan Google
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">atau</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/login', {
                            onFinish: () => form.reset('password'),
                        });
                    }}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            className={inputClass}
                            placeholder="Email Address"
                            autoComplete="email"
                        />
                        {form.errors.email ? (
                            <p className="text-xs text-rose-500">
                                {form.errors.email}
                            </p>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">
                            Password
                        </label>
                        <input
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            className={inputClass}
                            placeholder="Password"
                            autoComplete="current-password"
                        />
                        {form.errors.password ? (
                            <p className="text-xs text-rose-500">
                                {form.errors.password}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(event) =>
                                    form.setData(
                                        'remember',
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-violet-600"
                            />
                            Ingat saya
                        </label>
                        <Link href="#" className="text-violet-700">
                            Lupa password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing ? 'Memproses...' : 'Masuk Sekarang'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-500">
                    Belum punya akun?{' '}
                    <span className="font-semibold text-violet-700">
                        Hubungi admin ALC
                    </span>
                </p>
            </div>
        </>
    );
}

Login.layout = (page) => (
    <AuthLayout context={page.props.context}>{page}</AuthLayout>
);
