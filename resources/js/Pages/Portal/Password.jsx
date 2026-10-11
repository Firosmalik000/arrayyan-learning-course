import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

export default function Password() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put('/portal/password', {
            onSuccess: () => form.reset(),
        });
    };

    const isMismatch =
        form.data.password_confirmation.length > 0 &&
        form.data.password !== form.data.password_confirmation;

    return (
        <PortalLayout>
            <Head title="Ganti Kata Sandi - Portal ALC" />

            <div className="mx-auto max-w-lg space-y-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-4 xs:p-6 sm:p-8 shadow-xs">
                    <h1 className="font-display text-lg xs:text-xl font-bold tracking-tight text-slate-900">
                        Ganti Kata Sandi
                    </h1>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Kata Sandi Saat Ini
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={form.data.current_password}
                                    onChange={(e) => form.setData('current_password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                        form.errors.current_password
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                                            : 'border-slate-200 focus:border-brand-primary'
                                    }`}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                                    aria-label={showCurrent ? 'Sembunyikan' : 'Tampilkan'}
                                >
                                    {showCurrent ? (
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
                            {form.errors.current_password && (
                                <p className="text-xs text-rose-500 pt-0.5">{form.errors.current_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Kata Sandi Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                        form.errors.password
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                                            : 'border-slate-200 focus:border-brand-primary'
                                    }`}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                                    aria-label={showNew ? 'Sembunyikan' : 'Tampilkan'}
                                >
                                    {showNew ? (
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

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                                        isMismatch
                                            ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-100'
                                            : 'border-slate-200 focus:border-brand-primary'
                                    }`}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                                    aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}
                                >
                                    {showConfirm ? (
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
                            {isMismatch && (
                                <p className="text-xs text-amber-600 pt-0.5">Konfirmasi sandi belum sama.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Link
                                href="/portal/profil"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing || isMismatch}
                                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-violet-700 active:scale-95 disabled:opacity-50"
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Sandi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PortalLayout>
    );
}
