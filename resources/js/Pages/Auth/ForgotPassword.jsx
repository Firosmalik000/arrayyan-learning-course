import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function ForgotPassword({ status }) {
    const form = useForm({ email: '' });

    const submit = (event) => {
        event.preventDefault();
        form.post('/portal/lupa-password');
    };

    return (
        <>
            <Head title="Lupa Kata Sandi - Portal ALC" />

            <div className="space-y-5">
                <div className="space-y-2 text-center">
                    <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
                        Lupa Kata Sandi
                    </h1>
                    <p className="text-xs leading-relaxed text-slate-500">
                        Masukkan email akun portal. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
                    </p>
                </div>

                {status && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-700" role="status">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                            Email Akun Portal
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                form.errors.email
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-slate-200 focus:border-brand-primary'
                            }`}
                            placeholder="nama@email.com"
                            autoComplete="email"
                            autoFocus
                            required
                        />
                        {form.errors.email && (
                            <p className="pt-0.5 text-xs text-rose-500">{form.errors.email}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                    >
                        {form.processing ? 'Mengirim...' : 'Kirim Tautan Reset'}
                    </button>
                </form>

                <div className="text-center">
                    <Link href="/login" className="text-xs font-semibold text-violet-600 transition hover:text-violet-700">
                        Kembali ke halaman masuk
                    </Link>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = (page) => <AuthLayout>{page}</AuthLayout>;
