import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    ActionDropdown,
    FlashMessage,
    Modal,
    StatusBadge,
    showToast,
} from "@/Components/Admin";

const statusMeta = {
    unpaid: {
        label: "Belum Bayar",
        tone: "amber",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    pending: {
        label: "Menunggu Konfirmasi",
        tone: "violet",
        bg: "bg-violet-50 text-violet-700 border-violet-200",
    },
    paid: {
        label: "Lunas",
        tone: "emerald",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    expired: {
        label: "Kedaluwarsa",
        tone: "slate",
        bg: "bg-slate-50 text-slate-600 border-slate-200",
    },
    rejected: {
        label: "Ditolak",
        tone: "red",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
    },
};

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const formatRupiah = (value) =>
    `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`;

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "-";

const defaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
};

const cleanWhatsAppNumber = (phone) => {
    if (!phone) return "";
    let cleaned = String(phone).replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
        cleaned = "62" + cleaned.slice(1);
    }
    return cleaned;
};

/* --- SVGs & Icons --- */
function IconCheckCircle({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function IconClock({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function IconAlert({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    );
}

function IconCopy({ className = "w-3.5 h-3.5" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
        </svg>
    );
}

function IconWhatsApp({ className = "w-4 h-4" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
    );
}

function IconCalendar({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    );
}

function IconBook({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
        </svg>
    );
}

function IconReceipt({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
        </svg>
    );
}

function IconPlus({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
            />
        </svg>
    );
}

function IconUsers({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    );
}

function IconEye({ className = "w-4 h-4" }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
        </svg>
    );
}

function InvoiceBadge({ status }) {
    const meta = statusMeta[status] ?? statusMeta.unpaid;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${meta.bg}`}
        >
            {status === "paid" && (
                <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {status === "pending" && (
                <IconClock className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            )}
            {status === "unpaid" && (
                <IconAlert className="w-3.5 h-3.5 text-amber-600" />
            )}
            {meta.label}
        </span>
    );
}

export default function InvoiceShow() {
    const { student, flash, allowedActions = {} } = usePage().props;
    const can = (action) => (allowedActions.keuangan ?? []).includes(action);

    const [selectedClassKey, setSelectedClassKey] = useState(
        student.classes[0]?.id ?? null,
    );
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [activeTab, setActiveTab] = useState("matrix"); // 'matrix' | 'invoices'

    const [billingTarget, setBillingTarget] = useState(null);
    const [verifyTarget, setVerifyTarget] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [adminNote, setAdminNote] = useState("");

    const selectedClass =
        student.classes.find(
            (classItem) => String(classItem.id) === String(selectedClassKey),
        ) ?? student.classes[0] ?? null;

    const billingForm = useForm({
        billing_month: currentMonth,
        amount: "",
        due_date: defaultDueDate(),
        notes: "",
    });

    const yearOptions = useMemo(() => {
        const foundYears = new Set([now.getFullYear()]);

        for (const classItem of student.classes) {
            [classItem.joined_at, classItem.ended_at].forEach((date) => {
                if (date) foundYears.add(Number(date.slice(0, 4)));
            });
            classItem.invoices.forEach((invoice) => {
                const date = invoice.billing_month ?? invoice.created_at;
                if (date) foundYears.add(Number(date.slice(0, 4)));
            });
        }

        const firstYear = Math.min(...foundYears);
        const lastYear = Math.max(...foundYears);

        return Array.from(
            { length: lastYear - firstYear + 1 },
            (_, index) => lastYear - index,
        );
    }, [student.classes]);

    const monthRows = useMemo(() => {
        if (!selectedClass) return [];

        return monthNames.map((name, monthIndex) => {
            const monthNumber = String(monthIndex + 1).padStart(2, "0");
            const monthKey = `${selectedYear}-${monthNumber}`;
            const monthStart = `${monthKey}-01`;
            const monthEnd = new Date(Date.UTC(selectedYear, monthIndex + 1, 0))
                .toISOString()
                .slice(0, 10);
            const invoice = selectedClass.invoices.find((item) => {
                const invoiceMonth =
                    item.billing_month ?? item.created_at?.slice(0, 7);
                return invoiceMonth === monthKey;
            });
            const memberWasActive =
                selectedClass.member_id &&
                (!selectedClass.joined_at ||
                    selectedClass.joined_at <= monthEnd) &&
                (!selectedClass.ended_at ||
                    selectedClass.ended_at >= monthStart);
            const classWasActive = selectedClass.lifecycles?.some(
                (lifecycle) =>
                    lifecycle.activated_at <= monthEnd &&
                    (!lifecycle.deactivated_at ||
                        lifecycle.deactivated_at >= monthStart),
            );

            return {
                name,
                monthKey,
                invoice,
                isCurrent: monthKey === currentMonth,
                isFuture: monthKey > currentMonth,
                isBillable:
                    !selectedClass.is_scholarship &&
                    memberWasActive &&
                    classWasActive,
            };
        });
    }, [selectedClass, selectedYear]);

    const openBilling = (
        classItem,
        mode = "single",
        billingMonth = currentMonth,
    ) => {
        billingForm.setData({
            billing_month: billingMonth,
            amount: classItem.default_amount ?? "",
            due_date: defaultDueDate(),
            notes: "",
        });
        billingForm.clearErrors();
        setBillingTarget({ ...classItem, mode });
    };

    const submitBilling = (event) => {
        event.preventDefault();
        if (!billingTarget) return;

        const url =
            billingTarget.mode === "bulk"
                ? `/admin/keuangan/kelas/${billingTarget.id}/tagihan-bulanan`
                : `/admin/keuangan/anggota/${billingTarget.member_id}/tagihan-bulanan`;

        billingForm.post(url, {
            preserveScroll: true,
            onSuccess: () => setBillingTarget(null),
        });
    };

    const invoiceActions = (invoice) =>
        [
            {
                label: "Detail Tagihan",
                onClick: () => setDetailTarget(invoice),
            },
            invoice.proof_url && {
                label: "Lihat Bukti Transfer",
                href: invoice.proof_url,
                external: true,
            },
            invoice.status !== "paid" &&
                can("approve") && {
                    label: "Konfirmasi Lunas",
                    onClick: () => setVerifyTarget(invoice),
                },
            invoice.status === "pending" &&
                can("reject") && {
                    label: "Tolak Pembayaran",
                    danger: true,
                    onClick: () => {
                        setRejectTarget(invoice);
                        setAdminNote("");
                    },
                },
            {
                label: "Salin No. Tagihan",
                onClick: () => {
                    navigator.clipboard?.writeText(invoice.invoice_no);
                    showToast.success(
                        `No. tagihan ${invoice.invoice_no} berhasil disalin.`,
                    );
                },
            },
        ].filter(Boolean);

    const confirmInvoice = () => {
        if (!verifyTarget) return;
        router.post(
            `/admin/keuangan/invoice/${verifyTarget.id}/confirm`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setVerifyTarget(null),
            },
        );
    };

    const rejectInvoice = () => {
        if (!rejectTarget) return;
        router.post(
            `/admin/keuangan/invoice/${rejectTarget.id}/decline`,
            { note: adminNote },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectTarget(null);
                    setAdminNote("");
                },
            },
        );
    };

    const waNumber = cleanWhatsAppNumber(student.contact);
    const waLink = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
              `Halo Bapak/Ibu wali dari ${student.name}, kami dari Ar Rayyan Learning Course ingin menginformasikan terkait tagihan bimbingan belajar.`,
          )}`
        : null;

    return (
        <>
            <Head title={`Keuangan - ${student.name}`} />

            <div className="space-y-5 pb-12">
                {/* --- Top Navigation & Quick Links --- */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3.5">
                    <div className="flex items-center gap-2 text-xs">
                        <Link
                            href="/admin/keuangan"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Keuangan
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-700 truncate max-w-xs">
                            {student.name}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {waLink && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                title="Kirim pesan WhatsApp ke nomor wali"
                            >
                                <IconWhatsApp className="w-3.5 h-3.5" />
                                <span>WhatsApp Wali</span>
                            </a>
                        )}

                        <Link
                            href={`/admin/pelajar?search=${encodeURIComponent(student.name)}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        >
                            <span>Profil Murid</span>
                            <svg
                                className="w-3.5 h-3.5 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                <FlashMessage flash={flash} />

                {/* --- Compact Student Header & Unified Financial Snapshot --- */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Student Identity */}
                        <div className="flex items-center gap-3.5 min-w-0">
                            {student.photo_url ? (
                                <img
                                    src={student.photo_url}
                                    alt={student.name}
                                    className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                                />
                            ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 font-display text-xl font-bold text-white shadow-xs">
                                    {(student.name || "A")[0].toUpperCase()}
                                </div>
                            )}

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                                        {student.name}
                                    </h1>
                                    <StatusBadge
                                        tone={student.is_active ? "emerald" : "slate"}
                                    >
                                        {student.is_active ? "Aktif" : "Nonaktif"}
                                    </StatusBadge>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                    {student.contact ? (
                                        <div className="flex items-center gap-1 font-medium">
                                            <span className="font-mono text-slate-700">
                                                {student.contact}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard?.writeText(student.contact);
                                                    showToast.success("Kontak disalin.");
                                                }}
                                                className="text-slate-400 hover:text-violet-600"
                                                title="Salin kontak"
                                            >
                                                <IconCopy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="italic text-slate-400">
                                            Kontak belum diisi
                                        </span>
                                    )}

                                    {(student.school_name || student.level) && (
                                        <span className="text-slate-600">
                                            • {[student.school_name, student.level].filter(Boolean).join(" · ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Streamlined Financial Metrics (Compact & Non-repetitive) */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                            {/* Total Tagihan */}
                            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Total Tagihan
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-900">
                                    {formatRupiah(student.total_amount)}
                                </span>
                            </div>

                            {/* Sudah Terbayar */}
                            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-3.5 py-2">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                    Terbayar ({student.paid_count})
                                </span>
                                <span className="font-mono text-sm font-bold text-emerald-800">
                                    {formatRupiah(student.paid_amount)}
                                </span>
                            </div>

                            {/* Total Tertunggak */}
                            <div
                                className={`rounded-xl border px-3.5 py-2 ${
                                    student.outstanding_amount > 0
                                        ? "border-amber-200 bg-amber-50/70"
                                        : "border-slate-200/80 bg-slate-50/70"
                                }`}
                            >
                                <span
                                    className={`block text-[10px] font-bold uppercase tracking-wider ${
                                        student.outstanding_amount > 0
                                            ? "text-amber-800"
                                            : "text-slate-500"
                                    }`}
                                >
                                    Tertunggak ({student.outstanding_count})
                                </span>
                                <span
                                    className={`font-mono text-sm font-bold ${
                                        student.outstanding_amount > 0
                                            ? "text-amber-700"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {formatRupiah(student.outstanding_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Unified Full-Width Workspace (NO Empty Space Column!) --- */}
                <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    {/* Horizontal Class Selector Tabs */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-slate-50/70 p-3.5 sm:px-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1.5 shrink-0">
                            Pilih Kelas:
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                            {student.classes.map((classItem) => {
                                const isSelected =
                                    String(selectedClassKey) === String(classItem.id);

                                return (
                                    <button
                                        key={`${classItem.id}-${classItem.member_id ?? "general"}`}
                                        type="button"
                                        onClick={() => setSelectedClassKey(classItem.id)}
                                        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-violet-200 ${
                                            isSelected
                                                ? "bg-violet-600 text-white shadow-xs"
                                                : "bg-white text-slate-700 border border-slate-200 hover:border-violet-200 hover:bg-violet-50/40"
                                        }`}
                                    >
                                        {classItem.id === "general" ? (
                                            <IconReceipt className="w-3.5 h-3.5 shrink-0" />
                                        ) : (
                                            <IconBook className="w-3.5 h-3.5 shrink-0" />
                                        )}
                                        <span className="truncate max-w-[200px]">
                                            {classItem.name}
                                        </span>

                                        {classItem.is_scholarship ? (
                                            <span
                                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                                    isSelected
                                                        ? "bg-white/20 text-white"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                Beasiswa
                                            </span>
                                        ) : classItem.outstanding_count > 0 ? (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                    isSelected
                                                        ? "bg-amber-400 text-amber-950"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}
                                            >
                                                {classItem.outstanding_count} tertunggak
                                            </span>
                                        ) : classItem.invoice_count > 0 ? (
                                            <span
                                                className={`text-[10px] font-semibold ${
                                                    isSelected
                                                        ? "text-emerald-200"
                                                        : "text-emerald-600"
                                                }`}
                                            >
                                                ✓ Lunas
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Class Workspace Content */}
                    {selectedClass ? (
                        <div className="p-4 sm:p-5 space-y-4">
                            {/* Class Summary & Actions Bar */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/60 rounded-xl border border-slate-100 p-3 sm:px-4">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                    <span className="font-bold text-slate-900">
                                        {selectedClass.name}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Program: <strong>{selectedClass.program}</strong>
                                    </span>
                                    {selectedClass.package && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                Paket: <strong>{selectedClass.package}</strong>
                                            </span>
                                        </>
                                    )}
                                    {selectedClass.default_amount != null && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                Tarif SPP:{" "}
                                                <strong className="text-violet-700 font-mono">
                                                    {formatRupiah(selectedClass.default_amount)}
                                                </strong>
                                                /bln
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {can("create") &&
                                        selectedClass.member_id &&
                                        !selectedClass.is_scholarship && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openBilling(selectedClass)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                                >
                                                    <IconPlus className="w-3.5 h-3.5" />
                                                    <span>Buat Tagihan</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openBilling(selectedClass, "bulk")
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                                    title="Buat tagihan serentak untuk seluruh murid di kelas ini"
                                                >
                                                    <IconUsers className="w-3.5 h-3.5" />
                                                    <span>Massal Kelas</span>
                                                </button>
                                            </>
                                        )}
                                </div>
                            </div>

                            {/* Sub-Tabs: Matriks 12 Bulan vs Daftar Semua Tagihan */}
                            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("matrix")}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            activeTab === "matrix"
                                                ? "bg-slate-900 text-white"
                                                : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        Matriks 12 Bulan (SPP)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("invoices")}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            activeTab === "invoices"
                                                ? "bg-slate-900 text-white"
                                                : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        Semua Tagihan ({selectedClass.invoices.length})
                                    </button>
                                </div>

                                {activeTab === "matrix" && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                            <IconCalendar className="w-3.5 h-3.5" />
                                            Tahun:
                                        </span>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) =>
                                                setSelectedYear(Number(e.target.value))
                                            }
                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                        >
                                            {yearOptions.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* --- TAB 1: Matriks 12 Bulan (Compact & Clean) --- */}
                            {activeTab === "matrix" && (
                                <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-2xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[650px] text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    <th className="px-3.5 py-2.5">Bulan</th>
                                                    <th className="px-3.5 py-2.5">No. Tagihan</th>
                                                    <th className="px-3.5 py-2.5 text-right">Nominal</th>
                                                    <th className="px-3.5 py-2.5 text-center">Status</th>
                                                    <th className="px-3.5 py-2.5 text-center">Bukti</th>
                                                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {monthRows.map((month) => (
                                                    <tr
                                                        key={month.monthKey}
                                                        className={`transition-colors ${
                                                            month.isCurrent
                                                                ? "bg-violet-50/30 hover:bg-violet-50/60"
                                                                : "hover:bg-slate-50/60"
                                                        }`}
                                                    >
                                                        {/* Bulan */}
                                                        <td className="px-3.5 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800">
                                                                    {month.name}
                                                                </span>
                                                                {month.isCurrent && (
                                                                    <span className="rounded bg-violet-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                                                                        Bulan Ini
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* No. Tagihan */}
                                                        <td className="px-3.5 py-2.5">
                                                            {month.invoice ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono font-semibold text-slate-800">
                                                                        {month.invoice.invoice_no}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            navigator.clipboard?.writeText(
                                                                                month.invoice.invoice_no,
                                                                            );
                                                                            showToast.success(
                                                                                `No. tagihan ${month.invoice.invoice_no} disalin.`,
                                                                            );
                                                                        }}
                                                                        className="text-slate-400 hover:text-violet-600"
                                                                        title="Salin No. Tagihan"
                                                                    >
                                                                        <IconCopy className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300">-</span>
                                                            )}
                                                        </td>

                                                        {/* Nominal */}
                                                        <td className="px-3.5 py-2.5 text-right font-bold text-slate-800">
                                                            {month.invoice ? (
                                                                formatRupiah(month.invoice.amount)
                                                            ) : selectedClass.default_amount != null &&
                                                              month.isBillable ? (
                                                                <span className="text-slate-400 font-normal">
                                                                    {formatRupiah(selectedClass.default_amount)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300">-</span>
                                                            )}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-3.5 py-2.5 text-center">
                                                            {month.invoice ? (
                                                                <InvoiceBadge status={month.invoice.status} />
                                                            ) : month.isFuture ? (
                                                                <span className="text-[11px] font-medium text-slate-400">
                                                                    Akan datang
                                                                </span>
                                                            ) : month.isBillable ? (
                                                                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                    Belum dibuat
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] font-medium text-slate-300">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Bukti Bayar */}
                                                        <td className="px-3.5 py-2.5 text-center">
                                                            {month.invoice?.proof_url ? (
                                                                <a
                                                                    href={month.invoice.proof_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900 hover:underline"
                                                                >
                                                                    <IconEye className="w-3.5 h-3.5" />
                                                                    <span>Lihat</span>
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-300 text-xs">-</span>
                                                            )}
                                                        </td>

                                                        {/* Aksi */}
                                                        <td className="px-3.5 py-2.5 text-right">
                                                            {month.invoice ? (
                                                                <div className="inline-flex items-center gap-1">
                                                                    {month.invoice.status === "pending" && can("approve") && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setVerifyTarget(month.invoice)}
                                                                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                                                                        >
                                                                            Konfirmasi
                                                                        </button>
                                                                    )}
                                                                    <ActionDropdown
                                                                        actions={invoiceActions(month.invoice)}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                month.isBillable &&
                                                                can("create") && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openBilling(
                                                                                selectedClass,
                                                                                "single",
                                                                                month.monthKey,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 transition hover:bg-violet-100"
                                                                    >
                                                                        <IconPlus className="w-3 h-3" />
                                                                        <span>Buat</span>
                                                                    </button>
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 2: Semua Tagihan (Chronological) --- */}
                            {activeTab === "invoices" && (
                                <div className="space-y-3">
                                    {selectedClass.invoices.length > 0 ? (
                                        <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-2xs">
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[650px] text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                            <th className="px-3.5 py-2.5">No. Tagihan</th>
                                                            <th className="px-3.5 py-2.5">Tipe / Periode</th>
                                                            <th className="px-3.5 py-2.5 text-right">Nominal</th>
                                                            <th className="px-3.5 py-2.5 text-center">Jatuh Tempo</th>
                                                            <th className="px-3.5 py-2.5 text-center">Status</th>
                                                            <th className="px-3.5 py-2.5 text-center">Bukti</th>
                                                            <th className="px-3.5 py-2.5 text-right">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {selectedClass.invoices.map((inv) => (
                                                            <tr
                                                                key={inv.id}
                                                                className="hover:bg-slate-50/70 transition-colors"
                                                            >
                                                                <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                                                                    {inv.invoice_no}
                                                                </td>
                                                                <td className="px-3.5 py-2.5 text-slate-700">
                                                                    <span className="capitalize font-semibold">
                                                                        {inv.billing_type === "registration"
                                                                            ? "Pendaftaran"
                                                                            : "Bulanan (SPP)"}
                                                                    </span>
                                                                    {inv.billing_month && (
                                                                        <span className="block text-[10px] text-slate-500">
                                                                            Bulan: {inv.billing_month}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3.5 py-2.5 text-right font-bold text-slate-900">
                                                                    {formatRupiah(inv.amount)}
                                                                </td>
                                                                <td className="px-3.5 py-2.5 text-center text-slate-600">
                                                                    {formatDate(inv.due_date)}
                                                                </td>
                                                                <td className="px-3.5 py-2.5 text-center">
                                                                    <InvoiceBadge status={inv.status} />
                                                                </td>
                                                                <td className="px-3.5 py-2.5 text-center">
                                                                    {inv.proof_url ? (
                                                                        <a
                                                                            href={inv.proof_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900"
                                                                        >
                                                                            <IconEye className="w-3.5 h-3.5" />
                                                                            <span>Lihat</span>
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-slate-300">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3.5 py-2.5 text-right">
                                                                    <ActionDropdown
                                                                        actions={invoiceActions(inv)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                                            <IconReceipt className="mx-auto h-7 w-7 text-slate-300" />
                                            <p className="mt-1.5 text-xs font-semibold text-slate-700">
                                                Belum ada invoice di kelas ini
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Pelajar belum memiliki kelas atau tagihan.
                        </div>
                    )}
                </section>
            </div>

            {/* --- MODAL 1: Buat Tagihan Bulanan / Massal --- */}
            <Modal
                isOpen={!!billingTarget}
                onClose={() => setBillingTarget(null)}
                title={
                    billingTarget?.mode === "bulk"
                        ? "Buat Tagihan Massal Kelas"
                        : "Buat Tagihan Bulanan"
                }
                size="md"
            >
                {billingTarget && (
                    <form onSubmit={submitBilling} className="space-y-4">
                        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">
                                {billingTarget.mode === "bulk"
                                    ? "Untuk Seluruh Anggota Kelas"
                                    : "Target Siswa & Kelas"}
                            </p>
                            <p className="mt-0.5 text-xs font-bold text-slate-900">
                                {billingTarget.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                {student.name} · {billingTarget.program}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                Bulan Tagihan
                                <input
                                    type="month"
                                    value={billingForm.data.billing_month}
                                    onChange={(event) =>
                                        billingForm.setData(
                                            "billing_month",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    required
                                />
                                {billingForm.errors.billing_month && (
                                    <span className="mt-1 block text-xs text-rose-600">
                                        {billingForm.errors.billing_month}
                                    </span>
                                )}
                            </label>

                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                Batas Jatuh Tempo
                                <input
                                    type="date"
                                    value={billingForm.data.due_date}
                                    onChange={(event) =>
                                        billingForm.setData(
                                            "due_date",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    required
                                />
                                {billingForm.errors.due_date && (
                                    <span className="mt-1 block text-xs text-rose-600">
                                        {billingForm.errors.due_date}
                                    </span>
                                )}
                            </label>
                        </div>

                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Nominal (Rp)
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={billingForm.data.amount}
                                    onChange={(event) =>
                                        billingForm.setData(
                                            "amount",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: 350000"
                                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    required
                                />
                            </div>
                            {billingForm.data.amount ? (
                                <span className="mt-1 block text-[11px] text-slate-500 font-mono">
                                    Format: {formatRupiah(billingForm.data.amount)}
                                </span>
                            ) : null}
                            {billingForm.errors.amount && (
                                <span className="mt-1 block text-xs text-rose-600">
                                    {billingForm.errors.amount}
                                </span>
                            )}
                        </label>

                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Catatan (Opsional)
                            <textarea
                                rows="2"
                                value={billingForm.data.notes}
                                onChange={(event) =>
                                    billingForm.setData("notes", event.target.value)
                                }
                                placeholder="Misal: Tagihan SPP bulan berjalan..."
                                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />
                            {billingForm.errors.notes && (
                                <span className="mt-1 block text-xs text-rose-600">
                                    {billingForm.errors.notes}
                                </span>
                            )}
                        </label>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setBillingTarget(null)}
                                disabled={billingForm.processing}
                                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={billingForm.processing}
                                className="rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-violet-700 disabled:opacity-50"
                            >
                                {billingForm.processing
                                    ? "Menyimpan..."
                                    : "Buat Tagihan Sekarang"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* --- MODAL 2: Konfirmasi Pembayaran Lunas --- */}
            <Modal
                isOpen={!!verifyTarget}
                onClose={() => setVerifyTarget(null)}
                title="Konfirmasi Pembayaran Lunas"
                size="sm"
            >
                {verifyTarget && (
                    <div className="space-y-3.5">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
                            <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <IconCheckCircle className="w-5 h-5" />
                            </span>
                            <p className="mt-2 font-mono text-xs font-bold text-slate-900">
                                {verifyTarget.invoice_no}
                            </p>
                            <p className="text-lg font-black text-emerald-700 mt-0.5">
                                {formatRupiah(verifyTarget.amount)}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Siswa: <strong>{student.name}</strong>
                            </p>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Apakah Anda yakin ingin menandai tagihan ini sebagai{" "}
                            <strong>LUNAS</strong>?
                        </p>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setVerifyTarget(null)}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmInvoice}
                                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
                            >
                                Ya, Konfirmasi Lunas
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- MODAL 3: Tolak Pembayaran --- */}
            <Modal
                isOpen={!!rejectTarget}
                onClose={() => setRejectTarget(null)}
                title="Tolak Pembayaran"
                size="sm"
            >
                {rejectTarget && (
                    <div className="space-y-3.5">
                        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                            <p className="text-xs font-semibold text-rose-800">
                                Menolak Pembayaran: {rejectTarget.invoice_no}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Nominal: {formatRupiah(rejectTarget.amount)}
                            </p>
                        </div>

                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Alasan Penolakan
                            <textarea
                                rows="3"
                                value={adminNote}
                                onChange={(event) => setAdminNote(event.target.value)}
                                placeholder="Contoh: Bukti transfer tidak jelas / nominal tidak sesuai..."
                                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                required
                            />
                        </label>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setRejectTarget(null)}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={rejectInvoice}
                                className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-rose-700"
                            >
                                Tolak Pembayaran
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- MODAL 4: Detail Tagihan --- */}
            <Modal
                isOpen={!!detailTarget}
                onClose={() => setDetailTarget(null)}
                title="Rincian Tagihan"
                size="md"
            >
                {detailTarget && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                            <div>
                                <span className="font-mono text-sm font-bold text-slate-900">
                                    {detailTarget.invoice_no}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Dibuat: {formatDate(detailTarget.created_at)}
                                </p>
                            </div>
                            <InvoiceBadge status={detailTarget.status} />
                        </div>

                        <dl className="grid grid-cols-2 gap-2.5 text-xs">
                            <div className="rounded-lg bg-slate-50/70 p-2.5">
                                <dt className="text-slate-400 text-[10px] uppercase font-bold">
                                    Siswa
                                </dt>
                                <dd className="mt-0.5 font-bold text-slate-800">
                                    {detailTarget.student_name}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-slate-50/70 p-2.5">
                                <dt className="text-slate-400 text-[10px] uppercase font-bold">
                                    Kelas / Program
                                </dt>
                                <dd className="mt-0.5 font-bold text-slate-800">
                                    {detailTarget.class_name}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-slate-50/70 p-2.5">
                                <dt className="text-slate-400 text-[10px] uppercase font-bold">
                                    Bulan / Periode
                                </dt>
                                <dd className="mt-0.5 font-bold text-slate-800">
                                    {detailTarget.billing_month ?? "Tagihan Awal"}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-slate-50/70 p-2.5">
                                <dt className="text-slate-400 text-[10px] uppercase font-bold">
                                    Jatuh Tempo
                                </dt>
                                <dd className="mt-0.5 font-bold text-slate-800">
                                    {formatDate(detailTarget.due_date)}
                                </dd>
                            </div>
                            <div className="col-span-2 rounded-lg bg-violet-50/60 p-3 border border-violet-100">
                                <dt className="text-[10px] font-bold uppercase tracking-wider text-violet-800">
                                    Total Tagihan
                                </dt>
                                <dd className="mt-0.5 text-lg font-black text-violet-900 font-mono">
                                    {formatRupiah(detailTarget.amount)}
                                </dd>
                            </div>
                        </dl>

                        {detailTarget.proof_url && (
                            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                                    Bukti Pembayaran Terunggah
                                </p>
                                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <img
                                        src={detailTarget.proof_url}
                                        alt="Bukti Transfer"
                                        className="max-h-56 w-full object-contain bg-slate-100"
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    {detailTarget.proof_note && (
                                        <p className="text-[11px] text-slate-500 italic">
                                            Catatan: {detailTarget.proof_note}
                                        </p>
                                    )}
                                    <a
                                        href={detailTarget.proof_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 ml-auto"
                                    >
                                        <IconEye className="w-3.5 h-3.5" />
                                        <span>Buka Ukuran Penuh</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard?.writeText(detailTarget.invoice_no);
                                    showToast.success(
                                        `No. tagihan ${detailTarget.invoice_no} disalin.`,
                                    );
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                            >
                                <IconCopy className="w-3.5 h-3.5" />
                                <span>Salin No. Tagihan</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDetailTarget(null)}
                                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
