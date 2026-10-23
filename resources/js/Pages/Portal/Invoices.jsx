import { useState, useMemo } from "react";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import ActionDropdown from "./components/ActionDropdown";
import PortalPagination from "./components/PortalPagination";

const statusMeta = {
    unpaid: {
        label: "Belum Bayar",
        cls: "bg-amber-100 text-amber-800 border-amber-200",
    },
    pending: {
        label: "Menunggu Konfirmasi",
        cls: "bg-violet-100 text-brand-primary border-violet-200",
    },
    paid: {
        label: "Lunas",
        cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    expired: {
        label: "Kedaluwarsa",
        cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
    rejected: {
        label: "Ditolak",
        cls: "bg-rose-100 text-rose-800 border-rose-200",
    },
};

const bankAccounts = [
    { bank: "BCA", no: "8240912334", name: "Ar Rayyan Learning Course" },
    { bank: "BSI", no: "7210495512", name: "Ar Rayyan Learning Course" },
];

const formatDate = (v) => {
    if (!v) return "-";
    try {
        return new Date(v).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
};

const formatRupiah = (v) => `Rp ${Number(v ?? 0).toLocaleString("id-ID")}`;

export default function Invoices() {
    const { props } = usePage();
    const invoices = props.invoices ?? [];
    const selectedStudent = props.selected_student ?? null;

    const [statusFilter, setStatusFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailRow, setDetailRow] = useState(null);
    const [payTarget, setPayTarget] = useState(null);
    const [toastMessage, setToastMessage] = useState("");

    const uploadForm = useForm({
        proof: null,
        note: "",
    });

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleCopy = (text, label = "Teks") => {
        navigator.clipboard?.writeText(text);
        showToast(`${label} disalin: ${text}`);
    };

    const openPayModal = (inv) => {
        if (inv.status === "pending" || inv.status === "paid") {
            return;
        }
        setPayTarget(inv);
        uploadForm.reset();
        uploadForm.clearErrors();
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!payTarget) return;

        uploadForm.post(`/portal/tagihan/${payTarget.id}/bayar`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPayTarget(null);
                uploadForm.reset();
                showToast(
                    "Bukti pembayaran berhasil dikirim! Menunggu konfirmasi admin.",
                );
            },
        });
    };

    const filtered = useMemo(() => {
        return invoices.filter((invoice) => {
            if (statusFilter && invoice.status !== statusFilter) return false;
            if (
                classFilter &&
                String(invoice.class_group_id ?? "general") !== classFilter
            )
                return false;
            if (
                yearFilter &&
                (invoice.billing_month?.slice(0, 4) ??
                    new Date(invoice.created_at).getFullYear().toString()) !==
                    yearFilter
            )
                return false;
            return true;
        });
    }, [invoices, statusFilter, classFilter, yearFilter]);

    const classOptions = useMemo(() => {
        const options = new Map();
        invoices.forEach((invoice) =>
            options.set(
                String(invoice.class_group_id ?? "general"),
                invoice.class_name ?? "Tagihan Awal / Umum",
            ),
        );
        return [...options.entries()];
    }, [invoices]);

    const yearOptions = useMemo(
        () =>
            [
                ...new Set(
                    invoices.map(
                        (invoice) =>
                            invoice.billing_month?.slice(0, 4) ??
                            new Date(invoice.created_at)
                                .getFullYear()
                                .toString(),
                    ),
                ),
            ]
                .sort()
                .reverse(),
        [invoices],
    );

    const stats = useMemo(() => {
        const totalAmount = invoices.reduce(
            (sum, inv) => sum + Number(inv.amount || 0),
            0,
        );
        const paidAmount = invoices
            .filter((i) => i.status === "paid")
            .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        const unpaidAmount = invoices
            .filter((i) => i.status === "unpaid" || i.status === "rejected")
            .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        const unpaidCount = invoices.filter(
            (i) => i.status === "unpaid" || i.status === "rejected",
        ).length;
        const pendingCount = invoices.filter(
            (i) => i.status === "pending",
        ).length;

        return {
            totalAmount,
            paidAmount,
            unpaidAmount,
            unpaidCount,
            pendingCount,
        };
    }, [invoices]);

    const totalItems = filtered.length;
    const startIndex = (currentPage - 1) * perPage;
    const displayedInvoices = filtered.slice(startIndex, startIndex + perPage);

    return (
        <PortalLayout>
            <Head title="Tagihan & Pembayaran" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {toastMessage}
                </div>
            )}

            {/* Compact Financial Snapshot for Parents */}
            <div className="mb-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                            Tagihan & Pembayaran
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {selectedStudent
                                ? `Murid: ${selectedStudent.name}`
                                : "Ringkasan tagihan bimbingan belajar"}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                Total Tagihan
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-900">
                                {formatRupiah(stats.totalAmount)}
                            </span>
                        </div>

                        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-3 py-1.5">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                                Sudah Lunas
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-800">
                                {formatRupiah(stats.paidAmount)}
                            </span>
                        </div>

                        <div
                            className={`rounded-xl border px-3 py-1.5 ${
                                stats.unpaidAmount > 0
                                    ? "border-amber-200 bg-amber-50/70"
                                    : "border-slate-200/80 bg-slate-50/70"
                            }`}
                        >
                            <span
                                className={`block text-[9px] font-bold uppercase tracking-wider ${
                                    stats.unpaidAmount > 0
                                        ? "text-amber-800"
                                        : "text-slate-500"
                                }`}
                            >
                                Perlu Dibayar ({stats.unpaidCount})
                            </span>
                            <span
                                className={`font-mono text-xs font-bold ${
                                    stats.unpaidAmount > 0
                                        ? "text-amber-700"
                                        : "text-slate-700"
                                }`}
                            >
                                {formatRupiah(stats.unpaidAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {stats.pendingCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 border border-violet-100">
                        <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                        <span>
                            Ada {stats.pendingCount} pembayaran Anda yang sedang dalam proses verifikasi oleh admin.
                        </span>
                    </div>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Daftar Invoice ({filtered.length})
                </div>

                <div className="grid w-full grid-cols-1 gap-2 xs:w-auto xs:grid-cols-3">
                    <select
                        value={classFilter}
                        onChange={(e) => {
                            setClassFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs cursor-pointer"
                    >
                        <option value="">Semua Kelas</option>
                        {classOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={yearFilter}
                        onChange={(e) => {
                            setYearFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs cursor-pointer"
                    >
                        <option value="">Semua Tahun</option>
                        {yearOptions.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full xs:w-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs cursor-pointer"
                    >
                        <option value="">Semua Status</option>
                        <option value="unpaid">Belum Bayar</option>
                        <option value="pending">Menunggu Konfirmasi</option>
                        <option value="paid">Lunas</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-slate-200/80 bg-white p-6 text-center shadow-2xs">
                    <p className="text-xs text-slate-400">Belum ada tagihan.</p>
                    <Link
                        href="/portal"
                        className="mt-2.5 inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                        Dashboard
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                    {/* Mobile Card List (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {displayedInvoices.map((inv, i) => {
                            const meta =
                                statusMeta[inv.status] ?? statusMeta.unpaid;
                            const canUpload =
                                inv.status === "unpaid" ||
                                inv.status === "rejected";

                            return (
                                <div
                                    key={inv.invoice_no}
                                    className="p-4 space-y-3 hover:bg-slate-50/50 transition"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-xs font-bold text-slate-800 truncate">
                                                {inv.invoice_no}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        inv.invoice_no,
                                                        "No. Tagihan",
                                                    )
                                                }
                                                className="text-slate-400 hover:text-slate-600 transition"
                                                title="Salin No. Tagihan"
                                            >
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${meta.cls}`}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>

                                    <div className="space-y-0.5">
                                        <p className="font-display text-sm font-bold text-slate-900 truncate">
                                            {inv.student_name}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium truncate">
                                            {inv.class_name ?? inv.program}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {inv.billing_month
                                                ? new Date(
                                                      `${inv.billing_month}-01T00:00:00`,
                                                  ).toLocaleDateString(
                                                      "id-ID",
                                                      {
                                                          month: "long",
                                                          year: "numeric",
                                                      },
                                                  )
                                                : "Tagihan awal / pendaftaran"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                                        <div>
                                            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                                                Total Tagihan
                                            </span>
                                            <span className="font-display text-base font-extrabold text-slate-900">
                                                {formatRupiah(inv.amount)}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                                                Jatuh Tempo
                                            </span>
                                            <span className="font-semibold text-slate-700">
                                                {formatDate(inv.due_date)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        {canUpload && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openPayModal(inv)
                                                }
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition active:scale-95"
                                            >
                                                <span>
                                                    {inv.status === "rejected"
                                                        ? "Unggah Ulang Bukti"
                                                        : "Konfirmasi Bayar"}
                                                </span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setDetailRow(inv)}
                                            className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 ${canUpload ? "" : "flex-1"}`}
                                        >
                                            Detail
                                        </button>
                                        {inv.latest_payment?.proof_url && (
                                            <a
                                                href={
                                                    inv.latest_payment.proof_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition active:scale-95"
                                            >
                                                Bukti
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Datatable (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="w-10 px-3 py-2.5 text-center">
                                        No
                                    </th>
                                    <th className="w-12 px-2.5 py-2.5 text-center">
                                        Aksi
                                    </th>
                                    <th className="px-3.5 py-2.5">
                                        No. Tagihan
                                    </th>
                                    <th className="px-3.5 py-2.5">Siswa</th>
                                    <th className="px-3.5 py-2.5">
                                        Kelas / Periode
                                    </th>
                                    <th className="px-3.5 py-2.5">Jumlah</th>
                                    <th className="px-3.5 py-2.5">
                                        Jatuh Tempo
                                    </th>
                                    <th className="px-3.5 py-2.5 text-right">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedInvoices.map((inv, i) => {
                                    const meta =
                                        statusMeta[inv.status] ??
                                        statusMeta.unpaid;
                                    const rowNumber = startIndex + i + 1;

                                    const actionItems = [];

                                    const canUpload =
                                        inv.status === "unpaid" ||
                                        inv.status === "rejected";

                                    if (canUpload) {
                                        actionItems.push({
                                            label:
                                                inv.status === "rejected"
                                                    ? "Unggah Ulang Bukti"
                                                    : "Konfirmasi Pembayaran",
                                            primary: true,
                                            icon: (
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                            ),
                                            onClick: () => openPayModal(inv),
                                        });
                                    }

                                    actionItems.push({
                                        label: "Lihat Detail",
                                        icon: (
                                            <svg
                                                className="h-3.5 w-3.5"
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
                                        ),
                                        onClick: () => setDetailRow(inv),
                                    });

                                    if (inv.latest_payment?.proof_url) {
                                        actionItems.push({
                                            label: "Lihat Bukti Bayar",
                                            icon: (
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                                    />
                                                </svg>
                                            ),
                                            href: inv.latest_payment.proof_url,
                                            external: true,
                                        });
                                    }

                                    actionItems.push({
                                        label: "Salin No. Tagihan",
                                        icon: (
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                                />
                                            </svg>
                                        ),
                                        onClick: () =>
                                            handleCopy(
                                                inv.invoice_no,
                                                "No. Tagihan",
                                            ),
                                    });

                                    return (
                                        <tr
                                            key={inv.invoice_no}
                                            className="hover:bg-slate-50/70 transition-colors"
                                        >
                                            {/* Index Column */}
                                            <td className="w-12 px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                                                {rowNumber}
                                            </td>

                                            {/* Action Column with 3 dots */}
                                            <td className="w-14 px-3 py-3.5 text-center">
                                                <ActionDropdown
                                                    items={actionItems}
                                                    label={`Aksi tagihan ${inv.invoice_no}`}
                                                />
                                            </td>

                                            <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                                                {inv.invoice_no}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">
                                                {inv.student_name}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 font-medium">
                                                <span className="block">
                                                    {inv.class_name ??
                                                        inv.program}
                                                </span>
                                                <span className="block text-[11px] font-normal text-slate-400">
                                                    {inv.billing_month
                                                        ? new Date(
                                                              `${inv.billing_month}-01T00:00:00`,
                                                          ).toLocaleDateString(
                                                              "id-ID",
                                                              {
                                                                  month: "long",
                                                                  year: "numeric",
                                                              },
                                                          )
                                                        : "Tagihan awal / pendaftaran"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-display font-extrabold text-slate-900 whitespace-nowrap">
                                                {formatRupiah(inv.amount)}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                                                {formatDate(inv.due_date)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}
                                                >
                                                    {meta.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <PortalPagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        perPage={perPage}
                        onPageChange={(page) => setCurrentPage(page)}
                        onPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            {/* Modal Konfirmasi / Unggah Bukti Pembayaran */}
            {payTarget && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-3 xs:p-4 sm:p-6">
                    <div className="flex min-h-full items-center justify-center py-4">
                        <div className="relative w-full max-w-lg rounded-2xl xs:rounded-3xl border border-slate-200 bg-white p-4.5 xs:p-6 shadow-2xl space-y-4 my-auto">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="min-w-0 pr-2">
                                    <h3 className="font-display text-base font-bold text-slate-900 truncate">
                                        Konfirmasi Pembayaran
                                    </h3>
                                    <p className="font-mono text-xs font-bold text-violet-700 truncate">
                                        {payTarget.invoice_no}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPayTarget(null)}
                                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                    aria-label="Tutup modal"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Ringkasan Tagihan */}
                            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5 xs:p-4 space-y-2 text-xs">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-500 font-medium shrink-0">
                                        Siswa:
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {payTarget.student_name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-500 font-medium shrink-0">
                                        Program:
                                    </span>
                                    <span className="font-semibold text-slate-800 text-right">
                                        {payTarget.program}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-slate-500 font-medium shrink-0">
                                        Jatuh Tempo:
                                    </span>
                                    <span className="font-semibold text-slate-700 text-right">
                                        {formatDate(payTarget.due_date)}
                                    </span>
                                </div>
                                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 pt-2 border-t border-violet-200/60">
                                    <span className="text-slate-700 font-bold">
                                        Total Pembayaran:
                                    </span>
                                    <span className="font-display text-lg xs:text-xl font-black text-brand-primary">
                                        {formatRupiah(payTarget.amount)}
                                    </span>
                                </div>
                            </div>

                            {/* Rekening Tujuan Transfer */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 xs:p-3.5 space-y-2 text-xs">
                                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                                    Rekening Pembayaran Resmi ALC
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {bankAccounts.map((b) => (
                                        <div
                                            key={b.bank}
                                            className="flex items-center justify-between gap-2 bg-white rounded-xl p-2.5 border border-slate-200/70"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-extrabold text-slate-800 text-xs">
                                                    {b.bank}
                                                </p>
                                                <p className="font-mono text-xs font-bold text-slate-600 truncate">
                                                    {b.no}
                                                </p>
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    {b.name}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        b.no,
                                                        `No. Rekening ${b.bank}`,
                                                    )
                                                }
                                                className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[10px] font-bold text-brand-primary hover:bg-violet-100 transition active:scale-95"
                                            >
                                                Salin
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Note */}
                            {payTarget.status === "pending" && (
                                <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3 text-xs text-violet-900">
                                    <p className="font-bold">
                                        Status: Menunggu Konfirmasi
                                    </p>
                                    <p className="mt-0.5 text-violet-700 leading-relaxed">
                                        Anda sudah mengunggah bukti sebelumnya.
                                        Mengunggah ulang akan mengganti bukti
                                        transfer yang sedang ditinjau admin.
                                    </p>
                                </div>
                            )}

                            {payTarget.status === "rejected" && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                                    <p className="font-bold">
                                        Bukti Sebelumnya Ditolak
                                    </p>
                                    <p className="mt-0.5 text-rose-700 leading-relaxed">
                                        Silakan unggah foto/dokumen bukti
                                        transfer yang valid dan jelas.
                                    </p>
                                </div>
                            )}

                            {/* Form Upload */}
                            <form
                                onSubmit={handleUploadSubmit}
                                className="space-y-3.5 pt-1"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Unggah Bukti Transfer{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                                        onChange={(e) =>
                                            uploadForm.setData(
                                                "proof",
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="w-full rounded-2xl border border-slate-200 bg-white p-2 text-xs file:mr-2 xs:file:mr-3 file:rounded-xl file:border-0 file:bg-violet-100 file:px-2.5 xs:file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-violet-200 cursor-pointer"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Format: JPG, PNG, WEBP, atau PDF (Maks.
                                        5 MB).
                                    </p>
                                    {uploadForm.errors.proof && (
                                        <p className="mt-1 text-xs text-rose-600 font-semibold">
                                            {uploadForm.errors.proof}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Catatan Pembayaran (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadForm.data.note}
                                        onChange={(e) =>
                                            uploadForm.setData(
                                                "note",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Transfer dari BCA a.n. Nama Pengirim"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
                                    />
                                    {uploadForm.errors.note && (
                                        <p className="mt-1 text-xs text-rose-600 font-semibold">
                                            {uploadForm.errors.note}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setPayTarget(null)}
                                        className="w-full xs:flex-1 rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadForm.processing}
                                        className="w-full xs:flex-1 rounded-xl bg-brand-primary py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition shadow-xs disabled:opacity-50"
                                    >
                                        {uploadForm.processing
                                            ? "Mengirim..."
                                            : "Kirim Bukti Pembayaran"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailRow && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-3.5 xs:p-4 sm:p-6">
                    <div className="flex min-h-full items-center justify-center py-4">
                        <div className="relative w-full max-w-sm rounded-2xl xs:rounded-3xl border border-slate-200 bg-white p-4.5 xs:p-6 shadow-2xl space-y-4 my-auto">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="min-w-0 pr-2">
                                    <h3 className="font-display text-base font-bold text-slate-900 truncate">
                                        Detail Tagihan
                                    </h3>
                                    <p className="font-mono text-xs font-bold text-violet-700 truncate">
                                        {detailRow.invoice_no}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDetailRow(null)}
                                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                    aria-label="Tutup modal"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                    <span className="text-slate-400 font-medium shrink-0">
                                        Siswa
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {detailRow.student_name}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                    <span className="text-slate-400 font-medium shrink-0">
                                        Program
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {detailRow.program}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                    <span className="text-slate-400 font-medium shrink-0">
                                        Kelas
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {detailRow.class_name ??
                                            "Tagihan Awal / Umum"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                    <span className="text-slate-400 font-medium shrink-0">
                                        Periode
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {detailRow.billing_month
                                            ? new Date(
                                                  `${detailRow.billing_month}-01T00:00:00`,
                                              ).toLocaleDateString("id-ID", {
                                                  month: "long",
                                                  year: "numeric",
                                              })
                                            : "Tagihan awal / pendaftaran"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                    <span className="text-slate-400 font-medium shrink-0">
                                        Status
                                    </span>
                                    <span>
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusMeta[detailRow.status]?.cls || "bg-slate-100 text-slate-700"}`}
                                        >
                                            {statusMeta[detailRow.status]
                                                ?.label || detailRow.status}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                    <span className="text-slate-400 font-medium shrink-0">
                                        Jatuh Tempo
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {formatDate(detailRow.due_date)}
                                    </span>
                                </div>
                                {detailRow.paid_at && (
                                    <div className="flex justify-between py-1 border-b border-slate-50 gap-2">
                                        <span className="text-slate-400 font-medium shrink-0">
                                            Tanggal Lunas
                                        </span>
                                        <span className="font-bold text-emerald-700 text-right">
                                            {formatDate(detailRow.paid_at)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col xs:flex-row xs:items-center justify-between py-2 gap-1">
                                    <span className="text-slate-400 font-medium">
                                        Jumlah
                                    </span>
                                    <span className="font-display text-xl xs:text-2xl font-black text-slate-900">
                                        {formatRupiah(detailRow.amount)}
                                    </span>
                                </div>

                                {/* Info Bukti Terakhir */}
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                                        Status Bukti Pembayaran
                                    </p>
                                    {detailRow.status === "pending" && (
                                        <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-2.5 text-violet-900 text-xs">
                                            <p className="font-semibold">
                                                Bukti Sedang Ditinjau
                                            </p>
                                            <p className="text-[11px] text-violet-700 mt-0.5 leading-relaxed">
                                                Admin akan memverifikasi bukti
                                                pembayaran ini segera.
                                            </p>
                                        </div>
                                    )}
                                    {detailRow.status === "rejected" && (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-900 text-xs">
                                            <p className="font-semibold">
                                                Bukti Pembayaran Ditolak
                                            </p>
                                            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                                                Silakan unggah bukti baru yang
                                                sesuai.
                                            </p>
                                        </div>
                                    )}
                                    {detailRow.status === "paid" && (
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-900 text-xs">
                                            <p className="font-semibold">
                                                Tagihan Lunas
                                            </p>
                                            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                                                Pembayaran telah dikonfirmasi
                                                oleh admin.
                                            </p>
                                        </div>
                                    )}

                                    {detailRow.latest_payment?.proof_url && (
                                        <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-800">
                                                    Berkas Bukti
                                                </p>
                                                {detailRow.latest_payment
                                                    .note && (
                                                    <p className="text-[11px] text-slate-500 truncate">
                                                        {
                                                            detailRow
                                                                .latest_payment
                                                                .note
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <a
                                                href={
                                                    detailRow.latest_payment
                                                        .proof_url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-brand-primary hover:bg-violet-100 transition"
                                            >
                                                Lihat File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setDetailRow(null)}
                                    className="w-full xs:flex-1 rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                >
                                    Tutup
                                </button>
                                {(detailRow.status === "unpaid" ||
                                    detailRow.status === "rejected") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const current = detailRow;
                                            setDetailRow(null);
                                            openPayModal(current);
                                        }}
                                        className="w-full xs:flex-1 rounded-xl bg-brand-primary py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition shadow-xs"
                                    >
                                        {detailRow.status === "rejected"
                                            ? "Unggah Ulang Bukti"
                                            : "Unggah Bukti"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
