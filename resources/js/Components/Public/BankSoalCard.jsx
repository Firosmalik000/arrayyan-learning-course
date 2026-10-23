import { Link } from "@inertiajs/react";
import Badge from "./Badge";

export default function BankSoalCard({
    item,
    hasAccess = false,
    onRequireAccess = null,
    language = "id",
    className = "",
}) {
    if (!item) return null;

    const localize = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return val[language] || val.id || val.en || "";
    };

    const name = localize(item.name);
    const category = localize(item.category);
    const level = localize(item.level);
    const description = localize(item.description);
    const format = item.format || "PDF";
    const questions = item.questions;
    const imageUrl = item.image_url;

    const isPdf = String(format).toLowerCase().includes("pdf");

    const handleActionClick = (e) => {
        if (!hasAccess && onRequireAccess) {
            e.preventDefault();
            onRequireAccess(item);
        }
    };

    return (
        <div
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4.5 xs:p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl ${className}`}
        >
            <div>
                {/* Header row with badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {category && (
                            <Badge variant="primary" size="xs">
                                {category}
                            </Badge>
                        )}
                        {level && (
                            <Badge variant="neutral" size="xs">
                                {level}
                            </Badge>
                        )}
                    </div>

                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isPdf
                                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                : "bg-sky-50 text-sky-700 border border-sky-200/60"
                        }`}
                    >
                        {isPdf ? (
                            <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        )}
                        <span>{format}</span>
                    </span>
                </div>

                {/* Title */}
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    <Link
                        href={item.url || "/bank-soal"}
                        onClick={handleActionClick}
                    >
                        {name}
                    </Link>
                </h3>

                {/* Description */}
                {description && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Meta details */}
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                    {questions && (
                        <span className="inline-flex items-center gap-1 font-medium">
                            <svg
                                className="h-4 w-4 text-emerald-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span>{questions} Butir Soal</span>
                        </span>
                    )}

                    <span className="inline-flex items-center gap-1 font-medium">
                        {hasAccess ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Akses Terbuka</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700">
                                <svg
                                    className="h-3.5 w-3.5 text-amber-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span>Passkey Siswa</span>
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Footer Action */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Link
                    href={item.url || "/bank-soal"}
                    onClick={handleActionClick}
                    className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                >
                    <span>Detail Materi</span>
                    <svg
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Link>

                <Link
                    href={item.url || "/bank-soal"}
                    onClick={handleActionClick}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95 ${
                        hasAccess
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                >
                    {hasAccess ? (
                        <>
                            <span>Buka Soal</span>
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                            </svg>
                        </>
                    ) : (
                        <>
                            <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                />
                            </svg>
                            <span>Akses Soal</span>
                        </>
                    )}
                </Link>
            </div>
        </div>
    );
}
