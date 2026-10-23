import { Head, Link } from "@inertiajs/react";

const titles = {
    levels: ["Pilih Jenjang", "Mulai dari jenjang pendidikan yang sesuai."],
    classes: ["Pilih Kelas", "Pilih satu kelas untuk melihat mata pelajaran."],
    subjects: [
        "Pilih Mata Pelajaran",
        "Bank soal dikelompokkan agar lebih mudah ditemukan.",
    ],
    bankSoals: ["Daftar Bank Soal", "Pilih paket soal yang ingin dipelajari."],
};

export default function BankSoalIndex({
    stage = "levels",
    items = [],
    breadcrumbs = [],
}) {
    const [title, subtitle] = titles[stage] || titles.levels;

    return (
        <>
            <Head title={`${title} - Bank Soal`} />
            <section className="min-h-[70vh] bg-gradient-to-b from-violet-50/70 via-white to-white py-12 sm:py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <nav
                        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500"
                        aria-label="Breadcrumb"
                    >
                        <Link
                            href="/bank-soal"
                            className="font-semibold text-violet-700 hover:text-violet-900"
                        >
                            Bank Soal
                        </Link>
                        {breadcrumbs.map((item, index) => (
                            <span
                                key={`${item.name}-${index}`}
                                className="flex items-center gap-2"
                            >
                                <span>/</span>
                                {item.url ? (
                                    <Link
                                        href={item.url}
                                        className="hover:text-violet-700"
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <span className="font-semibold text-slate-800">
                                        {item.name}
                                    </span>
                                )}
                            </span>
                        ))}
                    </nav>

                    <div className="mb-8 max-w-2xl">
                        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-3 text-base text-slate-600 sm:text-lg">
                            {subtitle}
                        </p>
                    </div>

                    {items.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <BrowseCard
                                    key={item.id}
                                    item={item}
                                    stage={stage}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <h2 className="text-lg font-bold text-slate-800">
                                Belum ada data pada bagian ini
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Silakan kembali ke langkah sebelumnya atau
                                hubungi admin.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

function BrowseCard({ item, stage }) {
    const isBankSoal = stage === "bankSoals";
    const isAvailable = isBankSoal || (item.count ?? 0) > 0;
    const className = `group rounded-2xl border p-6 transition ${
        isAvailable
            ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
    }`;
    const content = (
        <>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2
                        className={`break-words text-lg font-extrabold ${
                            isAvailable
                                ? "text-slate-900 group-hover:text-violet-700"
                                : "text-slate-500"
                        }`}
                    >
                        {item.name}
                    </h2>
                    {isBankSoal && item.description && (
                        <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-slate-500">
                            {item.description}
                        </p>
                    )}
                </div>
                {isAvailable && (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path
                                d="M5 12h14M13 6l6 6-6 6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                )}
            </div>
            {isBankSoal ? (
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        {item.format || "File"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        {item.questions || 0} soal
                    </span>
                </div>
            ) : (
                <p className="mt-5 text-sm font-semibold text-slate-500">
                    {isAvailable
                        ? `${item.count} bank soal tersedia`
                        : "Belum ada bank soal"}
                </p>
            )}
        </>
    );

    return isAvailable ? (
        <Link href={item.url} className={className}>
            {content}
        </Link>
    ) : (
        <div className={className} aria-disabled="true">
            {content}
        </div>
    );
}
