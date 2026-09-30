import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

export default function Password() {
    const form = useForm({ current_password: '', password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        form.put('/portal/password');
    };

    const inputClass =
        'w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 shadow-2xs';

    return (
        <PortalLayout>
            <Head title="Ganti Password" />
            <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Ganti Password
                </h1>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Password Saat Ini
                        </label>
                        <input
                            type="password"
                            value={form.data.current_password}
                            onChange={(e) => form.setData('current_password', e.target.value)}
                            placeholder="••••••••"
                            className={inputClass}
                        />
                        {form.errors.current_password && (
                            <p className="mt-1.5 text-xs font-semibold text-rose-500">{form.errors.current_password}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Password Baru
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

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Konfirmasi Password Baru
                        </label>
                        <input
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className={inputClass}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full rounded-full bg-brand-primary px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                        >
                            Simpan Password
                        </button>
                    </div>
                </form>
            </div>
        </PortalLayout>
    );
}
