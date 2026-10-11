import { Link } from '@inertiajs/react';

export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-3.5 xs:px-4 py-8 xs:py-12 text-slate-900 antialiased selection:bg-violet-100 selection:text-brand-primary sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-display text-sm font-black text-white shadow-xs">
                        ALC
                    </span>
                    <span className="font-display text-lg font-bold tracking-tight text-slate-900">
                        Ar Rayyan LC
                    </span>
                </Link>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[400px]">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 xs:p-6 sm:p-8 shadow-xs">
                    {children}
                </div>

                <div className="mt-4 text-center">
                    <Link
                        href="/"
                        className="text-xs text-slate-400 hover:text-slate-600 transition"
                    >
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
