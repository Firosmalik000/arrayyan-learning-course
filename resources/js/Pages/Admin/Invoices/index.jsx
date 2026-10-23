import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import {
    ActionDropdown,
    FlashMessage,
    Modal,
    PageHeader,
    Pagination,
    SearchInput,
    StatCards,
    StatusBadge,
} from "@/Components/Admin";

const statusOptions = [
    ["unpaid", "Belum Bayar"],
    ["pending", "Menunggu Konfirmasi"],
    ["paid", "Lunas"],
    ["expired", "Kedaluwarsa"],
    ["rejected", "Ditolak"],
];
const statusMeta = Object.fromEntries(
    statusOptions.map(([value, label]) => [value, { label }]),
);
const formatRupiah = (value) =>
    `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`;
const formatDate = (value) =>
    value
        ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          }).format(new Date(`${value}T00:00:00`))
        : "-";
const toDateInput = (date) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60 * 1000)
        .toISOString()
        .slice(0, 10);
};
const currentMonth = toDateInput(new Date()).slice(0, 7);
const defaultDueDate = (billingMonth = currentMonth) => {
    const suggestedDate = new Date(`${billingMonth}-10T00:00:00`);
    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() + 7);

    return toDateInput(
        suggestedDate > minimumDate ? suggestedDate : minimumDate,
    );
};

function billingEligibility(member, billingMonth) {
    if (!billingMonth) return { allowed: false, label: "Pilih bulan" };
    if (member.billed_months.includes(billingMonth)) {
        return { allowed: false, label: "Sudah ditagih" };
    }
    if (member.is_scholarship) {
        return { allowed: false, label: "Beasiswa" };
    }

    const [year, month] = billingMonth.split("-").map(Number);
    const monthStart = `${billingMonth}-01`;
    const monthEnd = toDateInput(new Date(year, month, 0));

    if (member.joined_at && member.joined_at > monthEnd) {
        return { allowed: false, label: "Belum bergabung" };
    }
    if (member.ended_at && member.ended_at < monthStart) {
        return { allowed: false, label: "Sudah selesai" };
    }

    const classWasActive = member.lifecycles.some(
        (lifecycle) =>
            lifecycle.activated_at <= monthEnd &&
            (!lifecycle.deactivated_at ||
                lifecycle.deactivated_at >= monthStart),
    );

    if (!classWasActive) {
        return { allowed: false, label: "Kelas tidak aktif" };
    }

    return { allowed: true, label: "Siap ditagih" };
}

function InvoiceBadge({ status }) {
    const tones = {
        unpaid: "amber",
        pending: "violet",
        paid: "emerald",
        expired: "slate",
        rejected: "red",
    };

    return (
        <StatusBadge tone={tones[status] ?? "slate"}>
            {statusMeta[status]?.label ?? status}
        </StatusBadge>
    );
}

export default function Invoices() {
    const {
        students,
        billing_members: billingMembers = [],
        unlinked_invoices: unlinkedInvoices = [],
        stats = {},
        filters = {},
        filter_options: filterOptions = {
            programs: [],
            classes: [],
            years: [],
        },
        flash,
        allowedActions = {},
    } = usePage().props;
    const rows = students?.data ?? [];
    const meta = students?.meta ?? null;
    const can = (action) => (allowedActions.keuangan ?? []).includes(action);
    const [search, setSearch] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "");
    const [month, setMonth] = useState(filters.month ?? "");
    const [year, setYear] = useState(filters.year ?? "");
    const [programId, setProgramId] = useState(
        filters.program_id ? String(filters.program_id) : "",
    );
    const [classGroupId, setClassGroupId] = useState(
        filters.class_group_id ? String(filters.class_group_id) : "",
    );
    const [detailTarget, setDetailTarget] = useState(null);
    const [verifyTarget, setVerifyTarget] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [isCollectiveModalOpen, setIsCollectiveModalOpen] = useState(false);
    const [billingClassId, setBillingClassId] = useState("");
    const [billingSearch, setBillingSearch] = useState("");
    const collectiveForm = useForm({
        member_ids: [],
        billing_month: currentMonth,
        amount: "",
        due_date: defaultDueDate(),
        notes: "",
    });
    const availableClasses = filterOptions.classes.filter(
        (classItem) => !programId || String(classItem.program_id) === programId,
    );
    const collectiveMembers = billingMembers.filter((member) => {
        const matchesClass =
            !billingClassId || String(member.class_group_id) === billingClassId;
        const normalizedSearch = billingSearch.trim().toLocaleLowerCase("id");
        const matchesSearch =
            !normalizedSearch ||
            member.student_name
                .toLocaleLowerCase("id")
                .includes(normalizedSearch);

        return matchesClass && matchesSearch;
    });
    const eligibleCollectiveMembers = collectiveMembers.filter(
        (member) =>
            billingEligibility(member, collectiveForm.data.billing_month)
                .allowed,
    );
    const allVisibleEligibleSelected =
        eligibleCollectiveMembers.length > 0 &&
        eligibleCollectiveMembers.every((member) =>
            collectiveForm.data.member_ids.includes(member.id),
        );

    const fetchPage = (overrides = {}) => {
        router.get(
            "/admin/keuangan",
            {
                search,
                status,
                month,
                year,
                program_id: programId,
                class_group_id: classGroupId,
                page: meta?.current_page ?? 1,
                per_page: filters.per_page ?? 10,
                ...overrides,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return undefined;
        }

        const timer = setTimeout(() => fetchPage({ page: 1 }), 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status, month, year, programId, classGroupId]);

    const statCards = [
        {
            label: "Jumlah Tagihan",
            value: stats.total ?? 0,
            color: "bg-violet-50 text-violet-700 border-violet-200",
        },
        {
            label: "Belum Bayar",
            value: stats.unpaid ?? 0,
            color: "bg-amber-50 text-amber-700 border-amber-200",
        },
        {
            label: "Menunggu Konfirmasi",
            value: stats.pending ?? 0,
            color: "bg-blue-50 text-blue-700 border-blue-200",
        },
        {
            label: "Lunas",
            value: stats.paid ?? 0,
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
    ];
    const exportParams = new URLSearchParams({
        ...(status ? { status } : {}),
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
        ...(programId ? { program_id: programId } : {}),
        ...(classGroupId ? { class_group_id: classGroupId } : {}),
    });
    const unlinkedActions = (invoice) =>
        [
            {
                label: "Detail Tagihan",
                onClick: () => setDetailTarget(invoice),
            },
            invoice.proof_url && {
                label: "Lihat Bukti",
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
    const closeCollectiveModal = () => {
        if (collectiveForm.processing) return;
        setIsCollectiveModalOpen(false);
        setBillingClassId("");
        setBillingSearch("");
        collectiveForm.reset();
        collectiveForm.clearErrors();
    };
    const updateCollectiveMonth = (billingMonth) => {
        collectiveForm.setData({
            ...collectiveForm.data,
            billing_month: billingMonth,
            due_date: billingMonth ? defaultDueDate(billingMonth) : "",
            member_ids: [],
        });
    };
    const updateBillingClass = (value) => {
        setBillingClassId(value);
        collectiveForm.setData("member_ids", []);
    };
    const toggleCollectiveMember = (memberId) => {
        const isSelected = collectiveForm.data.member_ids.includes(memberId);
        collectiveForm.setData(
            "member_ids",
            isSelected
                ? collectiveForm.data.member_ids.filter(
                      (selectedId) => selectedId !== memberId,
                  )
                : [...collectiveForm.data.member_ids, memberId],
        );
    };
    const toggleAllEligibleMembers = () => {
        collectiveForm.setData(
            "member_ids",
            allVisibleEligibleSelected
                ? []
                : eligibleCollectiveMembers.map((member) => member.id),
        );
    };
    const submitCollectiveInvoices = (event) => {
        event.preventDefault();
        collectiveForm.post("/admin/keuangan/tagihan-bulanan-bersama", {
            preserveScroll: true,
            onSuccess: () => {
                setIsCollectiveModalOpen(false);
                setBillingClassId("");
                setBillingSearch("");
                collectiveForm.reset();
                collectiveForm.clearErrors();
            },
        });
    };

    return (
        <>
            <Head title="Keuangan" />
            <div className="space-y-6">
                <PageHeader
                    title="Keuangan"
                    actions={
                        <div className="flex flex-wrap justify-end gap-2">
                            {can("create") && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsCollectiveModalOpen(true)
                                    }
                                    className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={billingMembers.length === 0}
                                >
                                    Buat Tagihan Bersama
                                </button>
                            )}
                            {can("export") && (
                                <a
                                    href={`/admin/keuangan/export?${exportParams}`}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                >
                                    Export CSV
                                </a>
                            )}
                        </div>
                    }
                />
                <FlashMessage flash={flash} />
                <StatCards items={statCards} />

                <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-2 xl:grid-cols-7">
                        <div className="xl:col-span-2">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Cari nama, kontak, atau no. tagihan..."
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Semua Status</option>
                            {statusOptions.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <input
                            type="month"
                            value={month}
                            onChange={(event) => {
                                setMonth(event.target.value);
                                if (event.target.value) setYear("");
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                        <select
                            value={year}
                            onChange={(event) => {
                                setYear(event.target.value);
                                if (event.target.value) setMonth("");
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Semua Tahun</option>
                            {filterOptions.years.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <select
                            value={programId}
                            onChange={(event) => {
                                setProgramId(event.target.value);
                                setClassGroupId("");
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Semua Program</option>
                            {filterOptions.programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={classGroupId}
                            onChange={(event) =>
                                setClassGroupId(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="">Semua Kelas</option>
                            {availableClasses.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="w-16 px-5 py-3 text-center font-medium">
                                        No
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Pelajar
                                    </th>
                                    <th className="px-5 py-3 text-center font-medium">
                                        Kelas
                                    </th>
                                    <th className="px-5 py-3 text-center font-medium">
                                        Tagihan
                                    </th>
                                    <th className="px-5 py-3 text-center font-medium">
                                        Lunas
                                    </th>
                                    <th className="px-5 py-3 text-center font-medium">
                                        Tertunggak
                                    </th>
                                    <th className="px-5 py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 text-center font-semibold text-slate-400">
                                            {(meta?.from ?? 1) + index}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {student.contact || "-"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-center font-semibold text-slate-700">
                                            {student.class_count}
                                        </td>
                                        <td className="px-5 py-4 text-center font-semibold text-slate-700">
                                            {student.invoice_count}
                                        </td>
                                        <td className="px-5 py-4 text-center font-semibold text-emerald-700">
                                            {student.paid_count}
                                        </td>
                                        <td className="px-5 py-4 text-center font-semibold text-amber-700">
                                            {student.outstanding_count}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/admin/keuangan/pelajar/${student.id}`}
                                                className="inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                            >
                                                Lihat Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-14 text-center text-sm text-slate-500"
                                        >
                                            Belum ada pelajar yang sesuai dengan
                                            filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        meta={meta}
                        perPage={filters.per_page ?? 10}
                        onPage={(page) => fetchPage({ page })}
                        onPerPageChange={(per_page) =>
                            fetchPage({ per_page, page: 1 })
                        }
                    />
                </section>

                {unlinkedInvoices.length > 0 && (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                        <h2 className="text-sm font-bold text-amber-900">
                            Tagihan pendaftaran belum terhubung ke data pelajar
                        </h2>
                        <div className="mt-3 divide-y divide-amber-100 overflow-hidden rounded-xl bg-white">
                            {unlinkedInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {invoice.student_name}
                                        </p>
                                        <p className="font-mono text-xs text-slate-500">
                                            {invoice.invoice_no}
                                        </p>
                                    </div>
                                    <InvoiceBadge status={invoice.status} />
                                    <ActionDropdown
                                        actions={unlinkedActions(invoice)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Modal
                isOpen={isCollectiveModalOpen}
                onClose={closeCollectiveModal}
                title="Buat Tagihan Bulanan Bersama"
                size="2xl"
            >
                <form onSubmit={submitCollectiveInvoices} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                            Kelas
                            <select
                                value={billingClassId}
                                onChange={(event) =>
                                    updateBillingClass(event.target.value)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            >
                                <option value="">Semua Kelas</option>
                                {filterOptions.classes.map((classItem) => (
                                    <option
                                        key={classItem.id}
                                        value={classItem.id}
                                    >
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                            Bulan Tagihan
                            <input
                                type="month"
                                value={collectiveForm.data.billing_month}
                                onChange={(event) =>
                                    updateCollectiveMonth(event.target.value)
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                required
                            />
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                            Jatuh Tempo
                            <input
                                type="date"
                                value={collectiveForm.data.due_date}
                                onChange={(event) =>
                                    collectiveForm.setData(
                                        "due_date",
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                required
                            />
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                            Nominal Sama (Opsional)
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={collectiveForm.data.amount}
                                onChange={(event) =>
                                    collectiveForm.setData(
                                        "amount",
                                        event.target.value,
                                    )
                                }
                                placeholder="Gunakan tarif kelas"
                                className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />
                        </label>
                    </div>

                    {(collectiveForm.errors.member_ids ||
                        collectiveForm.errors.billing_month ||
                        collectiveForm.errors.due_date ||
                        collectiveForm.errors.amount) && (
                        <div
                            role="alert"
                            className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                        >
                            {collectiveForm.errors.member_ids ??
                                collectiveForm.errors.billing_month ??
                                collectiveForm.errors.due_date ??
                                collectiveForm.errors.amount}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <SearchInput
                            value={billingSearch}
                            onChange={setBillingSearch}
                            placeholder="Cari nama pelajar..."
                        />
                        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold tabular-nums">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-600">
                                {eligibleCollectiveMembers.length} tersedia
                            </span>
                            <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-violet-700">
                                {collectiveForm.data.member_ids.length} dipilih
                            </span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="max-h-[42vh] overflow-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="w-14 px-4 py-3 text-center font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    allVisibleEligibleSelected
                                                }
                                                onChange={
                                                    toggleAllEligibleMembers
                                                }
                                                disabled={
                                                    eligibleCollectiveMembers.length ===
                                                    0
                                                }
                                                aria-label="Pilih semua pelajar yang tersedia"
                                                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                                            />
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Pelajar
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Kelas
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Tanggal Masuk
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {collectiveMembers.map((member) => {
                                        const eligibility = billingEligibility(
                                            member,
                                            collectiveForm.data.billing_month,
                                        );
                                        const isSelected =
                                            collectiveForm.data.member_ids.includes(
                                                member.id,
                                            );

                                        return (
                                            <tr
                                                key={member.id}
                                                className={
                                                    eligibility.allowed
                                                        ? "transition hover:bg-slate-50"
                                                        : "bg-slate-50/60 text-slate-400"
                                                }
                                            >
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            toggleCollectiveMember(
                                                                member.id,
                                                            )
                                                        }
                                                        disabled={
                                                            !eligibility.allowed
                                                        }
                                                        aria-label={`Pilih ${member.student_name} di ${member.class_name}`}
                                                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-slate-800">
                                                        {member.student_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {member.program_name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {member.class_name}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums text-slate-600">
                                                    {formatDate(
                                                        member.joined_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span
                                                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                                            eligibility.allowed
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-200/70 text-slate-600"
                                                        }`}
                                                    >
                                                        {eligibility.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {collectiveMembers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-12 text-center text-sm text-slate-500"
                                            >
                                                Tidak ada keanggotaan pelajar
                                                yang sesuai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                        Catatan (Opsional)
                        <textarea
                            rows="2"
                            value={collectiveForm.data.notes}
                            onChange={(event) =>
                                collectiveForm.setData(
                                    "notes",
                                    event.target.value,
                                )
                            }
                            maxLength="500"
                            className="resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </label>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeCollectiveModal}
                            disabled={collectiveForm.processing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={
                                collectiveForm.processing ||
                                collectiveForm.data.member_ids.length === 0
                            }
                            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {collectiveForm.processing
                                ? "Membuat Tagihan..."
                                : `Buat ${collectiveForm.data.member_ids.length} Tagihan`}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={!!detailTarget}
                onClose={() => setDetailTarget(null)}
                title="Detail Tagihan"
                size="md"
            >
                {detailTarget && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                            <span className="font-mono font-semibold text-slate-900">
                                {detailTarget.invoice_no}
                            </span>
                            <InvoiceBadge status={detailTarget.status} />
                        </div>
                        <dl className="grid grid-cols-2 gap-3">
                            <dt className="text-slate-500">Nominal</dt>
                            <dd className="text-right font-semibold text-slate-800">
                                {formatRupiah(detailTarget.amount)}
                            </dd>
                        </dl>
                    </div>
                )}
            </Modal>
            <Modal
                isOpen={!!verifyTarget}
                onClose={() => setVerifyTarget(null)}
                title="Konfirmasi Tagihan"
                size="sm"
            >
                {verifyTarget && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Tandai <strong>{verifyTarget.invoice_no}</strong>{" "}
                            sebesar {formatRupiah(verifyTarget.amount)} sebagai
                            lunas?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setVerifyTarget(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmInvoice}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Konfirmasi Lunas
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                isOpen={!!rejectTarget}
                onClose={() => setRejectTarget(null)}
                title="Tolak Pembayaran"
                size="sm"
            >
                {rejectTarget && (
                    <div className="space-y-4">
                        <textarea
                            rows="3"
                            value={adminNote}
                            onChange={(event) =>
                                setAdminNote(event.target.value)
                            }
                            placeholder="Alasan penolakan"
                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRejectTarget(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={rejectInvoice}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Tolak
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
