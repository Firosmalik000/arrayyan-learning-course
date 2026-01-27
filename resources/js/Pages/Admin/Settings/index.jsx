import { Head } from '@inertiajs/react';

const admins = [
    {
        name: 'Admin ALC',
        role: 'Super Admin',
        email: 'admin@alclearning.id',
    },
    {
        name: 'Koordinator Program',
        role: 'Editor Konten',
        email: 'program@alclearning.id',
    },
];

export default function Settings() {
    return (
        <>
            <Head title="Admin Pengaturan" />
            <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                            Pengaturan Konten
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 sm:mt-2">
                            Atur branding, copy utama, kontak, dan akses admin
                            untuk mockup dashboard.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 rounded-full bg-gradient-to-r from-violet-700 to-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-violet-800 hover:to-amber-500 sm:px-4 sm:py-2"
                    >
                        Simpan Pengaturan
                    </button>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <form
                        onSubmit={(event) => event.preventDefault()}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
                    >
                        <p className="text-sm font-semibold text-slate-800">
                            Branding & Hero
                        </p>
                        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            Konten utama yang tampil di halaman beranda.
                        </p>
                        <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
                            <input
                                type="text"
                                defaultValue="Ar Rayyan Learning Course"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <input
                                type="text"
                                defaultValue="Membimbing dengan Hati, Mencetak Generasi Berprestasi"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <textarea
                                rows="3"
                                defaultValue="ALC hadir sebagai partner belajar islami, hangat, dan profesional untuk anak-anak."
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <input
                                    type="text"
                                    defaultValue="CTA: Daftar Sekarang"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                                />
                                <input
                                    type="text"
                                    defaultValue="CTA: Lihat Program"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                                />
                            </div>
                        </div>
                    </form>

                    <form
                        onSubmit={(event) => event.preventDefault()}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
                    >
                        <p className="text-sm font-semibold text-slate-800">
                            Kontak & Sosial
                        </p>
                        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            Informasi kontak yang muncul di footer dan halaman
                            kontak.
                        </p>
                        <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
                            <input
                                type="text"
                                defaultValue="Jl. Pendidikan Islami No. 8, Bandung"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <input
                                type="text"
                                defaultValue="+62 812-3456-7890"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <input
                                type="email"
                                defaultValue="info@alclearning.id"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                            <input
                                type="text"
                                defaultValue="@alclearningcourse"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:rounded-2xl sm:px-4"
                            />
                        </div>
                    </form>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <p className="text-sm font-semibold text-slate-800">
                            Notifikasi Admin
                        </p>
                        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            Pilih notifikasi yang ingin diaktifkan.
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-slate-600 sm:mt-5 sm:space-y-3">
                            {[
                                'Pendaftaran baru masuk',
                                'Konten butuh review',
                                'Update jadwal olimpiade',
                            ].map((item) => (
                                <label
                                    key={item}
                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3"
                                >
                                    <span className="text-xs sm:text-sm">{item}</span>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                        <p className="text-sm font-semibold text-slate-800">
                            Akses Admin
                        </p>
                        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            Daftar akun admin yang dapat mengubah konten.
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-slate-600 sm:mt-5 sm:space-y-3">
                            {admins.map((admin) => (
                                <div
                                    key={admin.email}
                                    className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3"
                                >
                                    <p className="font-semibold text-slate-800">
                                        {admin.name}
                                    </p>
                                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                        {admin.role} - {admin.email}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="mt-4 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:text-violet-800 sm:mt-5 sm:px-4 sm:py-2"
                        >
                            Tambah Admin
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
