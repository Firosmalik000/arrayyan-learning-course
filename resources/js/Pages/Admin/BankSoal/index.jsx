import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

const text = (value) =>
    typeof value === "object" && value
        ? value.id || value.en || ""
        : value || "";
const emptyResource = () => ({
    id: null,
    label: "",
    destination_url: "",
    file: null,
    file_name: "",
});

export default function BankSoalAdmin({
    globalPasskey = "",
    bankSoalItems = [],
    levels = [],
    classes = [],
    subjects = [],
    allLevels = [],
    selection = {},
}) {
    const [editing, setEditing] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const passkey = useForm({ passkey: globalPasskey });
    const form = useForm({
        education_level_id: selection.education_level_id || "",
        education_class_id: selection.education_class_id || "",
        subject_id: selection.subject_id || "",
        name: "",
        description: "",
        format: "PDF",
        questions: 0,
        image: null,
        is_active: true,
        resources: [emptyResource()],
    });
    const selectedLevel = useMemo(
        () =>
            allLevels.find(
                (item) =>
                    Number(item.id) === Number(form.data.education_level_id),
            ),
        [allLevels, form.data.education_level_id],
    );
    const availableClasses = selectedLevel?.education_classes || [];
    const availableSubjects = selectedLevel?.subjects || [];

    const openCreate = () => {
        setEditing(null);
        setIsModalOpen(true);
        form.setData({
            education_level_id: selection.education_level_id || "",
            education_class_id: selection.education_class_id || "",
            subject_id: selection.subject_id || "",
            name: "",
            description: "",
            format: "PDF",
            questions: 0,
            image: null,
            is_active: true,
            resources: [emptyResource()],
        });
    };
    const openEdit = (item) => {
        setEditing(item);
        setIsModalOpen(true);
        form.setData({
            education_level_id: item.education_level_id || "",
            education_class_id: item.education_class_id || "",
            subject_id: item.subject_id || "",
            name: text(item.name),
            description: text(item.description),
            format: item.format || "PDF",
            questions: item.questions || 0,
            image: null,
            is_active: !!item.is_active,
            resources: item.resources?.length
                ? item.resources.map((resource) => ({
                      ...emptyResource(),
                      ...resource,
                  }))
                : [emptyResource()],
        });
    };
    const closeModal = () => {
        setEditing(null);
        setIsModalOpen(false);
        form.clearErrors();
        form.transform((data) => data);
    };
    const submit = (event) => {
        event.preventDefault();
        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeModal,
        };
        if (editing)
            form.transform((data) => ({ ...data, _method: "put" })).post(
                `/admin/bank-soal/${editing.id}`,
                options,
            );
        else form.post("/admin/bank-soal", options);
    };
    const updateResource = (index, key, value) =>
        form.setData(
            "resources",
            form.data.resources.map((resource, resourceIndex) =>
                resourceIndex === index
                    ? { ...resource, [key]: value }
                    : resource,
            ),
        );
    const breadcrumbs = [{ label: "Bank Soal", url: "/admin/bank-soal" }];
    if (selection.education_level_id)
        breadcrumbs.push({
            label:
                levels[0]?.name ||
                allLevels.find((x) => x.id === selection.education_level_id)
                    ?.name,
            url: `/admin/bank-soal/${selection.education_level_id}`,
        });
    if (selection.education_class_id)
        breadcrumbs.push({
            label: classes[0]?.name || "Kelas",
            url: `/admin/bank-soal/${selection.education_level_id}/${selection.education_class_id}`,
        });

    return (
        <>
            <Head title="Manajemen Bank Soal" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-700 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
                            Master Data Akademik
                        </p>
                        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                            Manajemen Bank Soal
                        </h1>
                        <p className="mt-2 text-sm text-violet-100">
                            Jenjang → kelas → mata pelajaran → bank soal.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/admin/master-pendidikan"
                            className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/25"
                        >
                            Kelola Master
                        </Link>
                        {selection.subject_id && (
                            <button
                                onClick={openCreate}
                                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700"
                            >
                                Tambah Bank Soal
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <span
                            key={crumb.url}
                            className="flex items-center gap-2"
                        >
                            {index > 0 && <span>/</span>}
                            <Link
                                href={crumb.url}
                                className="font-semibold text-violet-700"
                            >
                                {crumb.label}
                            </Link>
                        </span>
                    ))}
                </div>

                {!selection.education_level_id && (
                    <HierarchyGrid
                        title="Pilih Jenjang"
                        items={levels}
                        href={(item) => `/admin/bank-soal/${item.id}`}
                        countKey="education_classes_count"
                    />
                )}
                {selection.education_level_id &&
                    !selection.education_class_id && (
                        <HierarchyGrid
                            title="Pilih Kelas"
                            items={classes}
                            href={(item) =>
                                `/admin/bank-soal/${selection.education_level_id}/${item.id}`
                            }
                            countKey="bank_soals_count"
                        />
                    )}
                {selection.education_class_id && !selection.subject_id && (
                    <HierarchyGrid
                        title="Pilih Mata Pelajaran"
                        items={subjects}
                        href={(item) =>
                            `/admin/bank-soal/${selection.education_level_id}/${selection.education_class_id}/${item.id}`
                        }
                        countKey="bank_soals_count"
                    />
                )}

                {selection.subject_id && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="font-black text-slate-900">
                                Daftar Bank Soal
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3">Nama</th>
                                        <th className="px-6 py-3">Format</th>
                                        <th className="px-6 py-3">Sumber</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bankSoalItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {text(item.name)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.format}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.resources?.length || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                                                >
                                                    {item.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    className="font-bold text-violet-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.confirm(
                                                            "Hapus bank soal ini?",
                                                        ) &&
                                                        router.delete(
                                                            `/admin/bank-soal/${item.id}`,
                                                        )
                                                    }
                                                    className="ml-4 font-bold text-rose-600"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {bankSoalItems.length === 0 && (
                            <p className="p-10 text-center text-sm text-slate-500">
                                Belum ada bank soal.
                            </p>
                        )}
                    </div>
                )}

                {!selection.education_level_id && bankSoalItems.length > 0 && (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                        <h2 className="font-black text-amber-950">
                            Perlu Dilengkapi ({bankSoalItems.length})
                        </h2>
                        <p className="mt-1 text-sm text-amber-800">
                            Data lama multi-kelas atau belum lengkap harus
                            dipilih tepat satu kelas.
                        </p>
                        <div className="mt-4 grid gap-3">
                            {bankSoalItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => openEdit(item)}
                                    className="rounded-2xl border border-amber-200 bg-white p-4 text-left font-bold text-slate-900"
                                >
                                    {text(item.name)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        passkey.put("/admin/bank-soal/passkey", {
                            preserveScroll: true,
                        });
                    }}
                    className="rounded-3xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="font-black text-slate-900">
                        Passkey Global
                    </h2>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={passkey.data.passkey}
                            onChange={(event) =>
                                passkey.setData("passkey", event.target.value)
                            }
                            className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
                        />
                        <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">
                            Simpan Passkey
                        </button>
                    </div>
                </form>
            </div>

            {isModalOpen && <BankSoalModal />}
        </>
    );

    function BankSoalModal() {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                <form
                    onSubmit={submit}
                    className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">
                            {editing ? "Edit Bank Soal" : "Tambah Bank Soal"}
                        </h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg px-3 py-2 text-slate-500"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Jenjang"
                            error={form.errors.education_level_id}
                        >
                            <select
                                value={form.data.education_level_id}
                                onChange={(event) =>
                                    form.setData({
                                        ...form.data,
                                        education_level_id: Number(
                                            event.target.value,
                                        ),
                                        education_class_id: "",
                                        subject_id: "",
                                    })
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                            >
                                <option value="">Pilih jenjang</option>
                                {allLevels.map((level) => (
                                    <option key={level.id} value={level.id}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            label="Kelas"
                            error={form.errors.education_class_id}
                        >
                            <select
                                value={form.data.education_class_id}
                                onChange={(event) =>
                                    form.setData(
                                        "education_class_id",
                                        Number(event.target.value),
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                            >
                                <option value="">Pilih satu kelas</option>
                                {availableClasses.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            label="Mata Pelajaran"
                            error={form.errors.subject_id}
                        >
                            <select
                                value={form.data.subject_id}
                                onChange={(event) =>
                                    form.setData(
                                        "subject_id",
                                        Number(event.target.value),
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                            >
                                <option value="">Pilih mapel</option>
                                {availableSubjects.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Nama Bank Soal" error={form.errors.name}>
                            <input
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData("name", event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                            />
                        </Field>
                        <Field label="Format">
                            <input
                                value={form.data.format}
                                onChange={(event) =>
                                    form.setData("format", event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                            />
                        </Field>
                        <Field label="Jumlah Soal">
                            <input
                                type="number"
                                min="0"
                                value={form.data.questions}
                                onChange={(event) =>
                                    form.setData(
                                        "questions",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                            />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Deskripsi">
                                <textarea
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    rows="3"
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                                />
                            </Field>
                        </div>
                        <div className="sm:col-span-2">
                            <Field label="Gambar Sampul">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        form.setData(
                                            "image",
                                            event.target.files[0],
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                                />
                            </Field>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black">
                                File & Link Destinasi
                            </h3>
                            <button
                                type="button"
                                onClick={() =>
                                    form.setData("resources", [
                                        ...form.data.resources,
                                        emptyResource(),
                                    ])
                                }
                                className="text-sm font-bold text-violet-700"
                            >
                                + Tambah Sumber
                            </button>
                        </div>
                        <div className="mt-3 grid gap-3">
                            {form.data.resources.map((resource, index) => (
                                <div
                                    key={resource.id || index}
                                    className="rounded-2xl border border-slate-200 p-4"
                                >
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <input
                                            placeholder="Label sumber"
                                            value={resource.label}
                                            onChange={(event) =>
                                                updateResource(
                                                    index,
                                                    "label",
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded-xl border border-slate-300 px-3 py-2.5"
                                        />
                                        <input
                                            placeholder="https://..."
                                            value={
                                                resource.destination_url || ""
                                            }
                                            onChange={(event) =>
                                                updateResource(
                                                    index,
                                                    "destination_url",
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded-xl border border-slate-300 px-3 py-2.5"
                                        />
                                        <input
                                            type="file"
                                            onChange={(event) =>
                                                updateResource(
                                                    index,
                                                    "file",
                                                    event.target.files[0],
                                                )
                                            }
                                            className="sm:col-span-2 rounded-xl border border-slate-300 px-3 py-2.5"
                                        />
                                        {resource.file_name && (
                                            <p className="text-xs text-slate-500">
                                                File saat ini:{" "}
                                                {resource.file_name}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    "resources",
                                                    form.data.resources.filter(
                                                        (_, i) => i !== index,
                                                    ),
                                                )
                                            }
                                            className="text-left text-xs font-bold text-rose-600"
                                        >
                                            Hapus sumber
                                        </button>
                                    </div>
                                    {form.errors[`resources.${index}.file`] && (
                                        <p className="mt-2 text-xs font-bold text-rose-600">
                                            {
                                                form.errors[
                                                    `resources.${index}.file`
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(event) =>
                                form.setData("is_active", event.target.checked)
                            }
                        />{" "}
                        Aktif
                    </label>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold"
                        >
                            Batal
                        </button>
                        <button
                            disabled={form.processing}
                            className="rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white disabled:opacity-60"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

function HierarchyGrid({ title, items, href, countKey }) {
    return (
        <div>
            <h2 className="mb-4 text-xl font-black text-slate-900">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={href(item)}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                    >
                        <h3 className="text-lg font-black text-slate-900">
                            {item.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {item[countKey] || 0} data
                        </p>
                    </Link>
                ))}
            </div>
            {items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    Belum ada data.
                </p>
            )}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            <span>{label}</span>
            {children}
            {error && <span className="text-xs text-rose-600">{error}</span>}
        </label>
    );
}
