import { Head, Link, useForm } from "@inertiajs/react";

export default function BankSoalDetail({ bankSoal, unlockUrl, backUrl }) {
    const unlock = useForm({ passkey: "" });
    const submitUnlock = (event) => {
        event.preventDefault();
        unlock.post(unlockUrl, {
            preserveScroll: true,
            onSuccess: () => unlock.reset("passkey"),
        });
    };

    return (
        <>
            <Head title={`${bankSoal.name} - Bank Soal`} />
            <section className="bg-gradient-to-b from-emerald-50/70 via-white to-white py-10 sm:py-14">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <Link
                            href="/bank-soal"
                            className="font-semibold text-violet-700"
                        >
                            Bank Soal
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/bank-soal/${bankSoal.level.id}`}
                            className="hover:text-violet-700"
                        >
                            {bankSoal.level.name}
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/bank-soal/${bankSoal.level.id}/${bankSoal.class.id}`}
                            className="hover:text-violet-700"
                        >
                            {bankSoal.class.name}
                        </Link>
                        <span>/</span>
                        <Link href={backUrl} className="hover:text-violet-700">
                            {bankSoal.subject.name}
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-slate-800">
                            {bankSoal.name}
                        </span>
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                        <main>
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
                                <div className="flex flex-wrap gap-2 text-xs font-bold">
                                    {[
                                        bankSoal.subject.name,
                                        bankSoal.level.name,
                                        bankSoal.class.name,
                                        bankSoal.format,
                                    ].map((value) => (
                                        <span
                                            key={value}
                                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700"
                                        >
                                            {value}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                    {bankSoal.name}
                                </h1>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    {bankSoal.description ||
                                        "Bank soal terpilih untuk latihan belajar."}
                                </p>
                            </div>

                            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                <h2 className="text-xl font-black text-slate-900">
                                    File &amp; Destinasi Soal
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Unduh file atau buka sumber latihan yang
                                    disediakan.
                                </p>

                                {bankSoal.unlocked ? (
                                    bankSoal.resources.length > 0 ? (
                                        <div className="mt-6 grid gap-4">
                                            {bankSoal.resources.map(
                                                (resource) => (
                                                    <div
                                                        key={resource.id}
                                                        className="rounded-2xl border border-slate-200 p-5 sm:flex sm:items-center sm:justify-between"
                                                    >
                                                        <div>
                                                            <h3 className="font-bold text-slate-900">
                                                                {resource.label}
                                                            </h3>
                                                            {resource.file_name && (
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {
                                                                        resource.file_name
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                                                            {resource.has_file && (
                                                                <a
                                                                    href={`${resource.url}?source=file`}
                                                                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
                                                                >
                                                                    Unduh File
                                                                </a>
                                                            )}
                                                            {resource.has_link && (
                                                                <a
                                                                    href={`${resource.url}?source=link`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-violet-400"
                                                                >
                                                                    Buka
                                                                    Destinasi
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">
                                            Belum ada file maupun link
                                            destinasi.
                                        </p>
                                    )
                                ) : bankSoal.passkey_verified &&
                                  !bankSoal.authenticated ? (
                                    <div className="mt-6 rounded-2xl bg-violet-50 p-6">
                                        <h3 className="font-black text-violet-950">
                                            Passkey sudah terverifikasi
                                        </h3>
                                        <p className="mt-2 text-sm text-violet-800">
                                            Silakan login. Anda tidak perlu
                                            memasukkan kode lagi setelah masuk.
                                        </p>
                                        <Link
                                            href="/login"
                                            className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white"
                                        >
                                            Login untuk Membuka
                                        </Link>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={submitUnlock}
                                        className="mt-6 rounded-2xl bg-slate-50 p-6"
                                    >
                                        <label
                                            htmlFor="passkey"
                                            className="text-sm font-bold text-slate-800"
                                        >
                                            Passkey global Bank Soal
                                        </label>
                                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                            <input
                                                id="passkey"
                                                type="password"
                                                value={unlock.data.passkey}
                                                onChange={(event) =>
                                                    unlock.setData(
                                                        "passkey",
                                                        event.target.value,
                                                    )
                                                }
                                                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3"
                                            />
                                            <button
                                                disabled={unlock.processing}
                                                className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white disabled:opacity-60"
                                            >
                                                Buka Akses
                                            </button>
                                        </div>
                                        {unlock.errors.passkey && (
                                            <p className="mt-2 text-sm font-semibold text-rose-600">
                                                {unlock.errors.passkey}
                                            </p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </main>

                        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="font-black text-slate-900">
                                Informasi Soal
                            </h2>
                            <dl className="mt-5 grid gap-4 text-sm">
                                <div>
                                    <dt className="text-slate-500">Jenjang</dt>
                                    <dd className="font-bold text-slate-900">
                                        {bankSoal.level.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Kelas</dt>
                                    <dd className="font-bold text-slate-900">
                                        {bankSoal.class.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">
                                        Mata Pelajaran
                                    </dt>
                                    <dd className="font-bold text-slate-900">
                                        {bankSoal.subject.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">
                                        Jumlah Soal
                                    </dt>
                                    <dd className="font-bold text-slate-900">
                                        {bankSoal.questions || 0}
                                    </dd>
                                </div>
                            </dl>
                            <Link
                                href={backUrl}
                                className="mt-6 flex justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"
                            >
                                Kembali ke Daftar
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
