import { Link } from '@inertiajs/react';

export default function AdminAuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-700 text-white shadow">
                            <span className="text-sm font-bold">ALC</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Admin Access
                            </p>
                            <p className="text-xs text-violet-600">
                                Ar Rayyan LC
                            </p>
                        </div>
                    </Link>
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
