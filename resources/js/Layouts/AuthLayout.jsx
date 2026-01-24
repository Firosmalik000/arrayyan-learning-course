import { Link } from '@inertiajs/react';

export default function AuthLayout({ children, context = 'public' }) {
    const isAdmin = context === 'admin';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-purple-600 to-amber-300 px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between lg:rounded-r-[90px] lg:px-12 lg:py-14">
                    <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
                    <div className="absolute right-10 top-24 h-28 w-28 rounded-[32px] bg-white/20 shadow-2xl" />

                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-violet-700 shadow-lg lg:h-11 lg:w-11 lg:rounded-2xl">
                                <span className="text-xs font-bold lg:text-sm">ALC</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Ar Rayyan Learning Course
                                </p>
                                <p className="text-xs text-white/80">
                                    Membimbing dengan Hati
                                </p>
                            </div>
                        </Link>

                        <div className="mt-12 max-w-sm space-y-3 lg:mt-16 lg:space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/85 lg:text-xs lg:tracking-[0.4em]">
                                {isAdmin ? 'Portal Admin' : 'Portal Member'}
                            </p>
                            <h1 className="text-2xl font-semibold leading-tight lg:text-3xl">
                                {isAdmin
                                    ? 'Kelola konten ALC dengan tampilan yang rapi dan elegan.'
                                    : 'Masuk untuk melanjutkan komunikasi dan pendaftaran ALC.'}
                            </h1>
                            <p className="text-sm text-white/85">
                                {isAdmin
                                    ? 'Atur program, pendaftaran, bank soal, dan informasi olimpiade.'
                                    : 'Pantau status pendaftaran, konsultasi, dan kebutuhan belajar.'}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 flex items-center gap-4 lg:mt-10 lg:gap-6">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-[24px] bg-white/90 shadow-xl lg:h-24 lg:w-24 lg:rounded-[28px]" />
                            <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-amber-200 shadow-lg lg:-right-4 lg:-top-4 lg:h-12 lg:w-12" />
                            <div className="absolute -bottom-3 left-8 h-8 w-12 rounded-[12px] bg-violet-600/80 shadow-lg lg:-bottom-4 lg:left-10 lg:h-10 lg:w-16 lg:rounded-[14px]" />
                        </div>
                        <div className="space-y-2 text-sm text-white/90 lg:space-y-3">
                            <p className="font-semibold">
                                {isAdmin
                                    ? 'Dashboard yang fokus pada konten.'
                                    : 'Akses cepat untuk keluarga ALC.'}
                            </p>
                            <p className="text-xs">
                                {isAdmin
                                    ? 'Sinkronkan informasi publik dengan cepat.'
                                    : 'Dapatkan update program dan konsultasi.'}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="h-2 w-2 rounded-full bg-white/90" />
                                <span>Update mingguan</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-6 flex items-center justify-center lg:hidden">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-amber-400 text-white shadow-lg">
                                    <span className="text-xs font-bold">ALC</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Ar Rayyan Learning Course
                                    </p>
                                    <p className="text-xs text-violet-600">
                                        {isAdmin ? 'Portal Admin' : 'Portal Member'}
                                    </p>
                                </div>
                            </Link>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
