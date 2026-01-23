import { Head } from '@inertiajs/react';

export default function Login() {
    return (
        <>
            <Head title="Admin Login" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Login Admin
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Halaman login sementara untuk persiapan panel admin.
                    </p>
                </div>
                <form className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-violet-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-violet-500"
                    />
                    <button
                        type="button"
                        className="w-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-6 py-3 text-sm font-semibold text-white transition hover:from-violet-800 hover:to-amber-500"
                    >
                        Masuk (Dummy)
                    </button>
                </form>
            </div>
        </>
    );
}
