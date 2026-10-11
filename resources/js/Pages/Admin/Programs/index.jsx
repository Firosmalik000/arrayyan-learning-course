import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ActionDropdown, ConfirmModal, FlashMessage, FormInput, FormSelect, FormTextarea, Modal, PageHeader, Pagination } from '@/Components/Admin';

const normalizeSubjects = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

const statusStyles = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusOptions = ['Aktif', 'Nonaktif'];
const programModeOptions = [
    { value: 'offline', label: 'Offline' },
    { value: 'online', label: 'Online' },
];
const packageModeOptions = [
    { value: 'offline', label: 'Tatap muka' },
    { value: 'online', label: 'Online' },
    { value: 'hybrid', label: 'Tatap muka / Online' },
];
const levelOptions = ['Pra TK', 'TK', 'SD', 'SMP', 'SMA', 'Pra TK - SMA', 'TK - SMA', 'SD - SMA'];

// Icons
const icons = {
    plus: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            />
        </svg>
    ),
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
        </svg>
    ),
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const normalizeModeValue = (value) => (value ? value.toString().trim().toLowerCase() : '');

const formatModeLabel = (value) => {
    const normalized = normalizeModeValue(value);
    if (normalized === 'online') return 'Online';
    if (normalized === 'offline') return 'Offline';
    return value || '-';
};

const formatCurrency = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const getInitials = (value) => {
    if (!value) return 'ALC';
    const chars = value
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('');
    return chars.slice(0, 2).toUpperCase();
};

export default function Programs() {
    const { programs: programsData = [], packages: packagesData = [], teachers: teachersData = [], allowedActions = {}, flash } = usePage().props;
    const programs = useMemo(
        () =>
            programsData.map((program) => ({
                ...program,
                subjects: normalizeSubjects(program.subjects),
                is_active: Number(program.is_active ?? 1) === 1,
                mode: normalizeModeValue(program.mode),
            })),
        [programsData],
    );
    const packages = useMemo(
        () =>
            packagesData.map((pkg) => ({
                ...pkg,
                subjects: normalizeSubjects(pkg.subjects),
                is_active: Number(pkg.is_active ?? 1) === 1,
                mode: normalizeModeValue(pkg.mode),
            })),
        [packagesData],
    );

    const can = (action) => (allowedActions.program ?? []).includes(action);
    const canCreate = can('create');
    const canView = can('view');
    const canEdit = can('edit');
    const canDelete = can('delete');

    // Modal states
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProgramDetailModal, setShowProgramDetailModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [editingPackage, setEditingPackage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', item: null });
    const [programDetail, setProgramDetail] = useState(null);
    const [currentProgramImageUrl, setCurrentProgramImageUrl] = useState(null);
    const [activePriceProgramId, setActivePriceProgramId] = useState(programsData[0]?.id ? String(programsData[0].id) : '');
    const [packagePage, setPackagePage] = useState(1);
    const [packagePerPage, setPackagePerPage] = useState(10);

    const resolvedPriceProgramId = programs.some((program) => String(program.id) === activePriceProgramId)
        ? activePriceProgramId
        : String(programs[0]?.id ?? '');
    const activePriceProgram = programs.find((program) => String(program.id) === resolvedPriceProgramId) ?? null;
    const visiblePackages = packages.filter((pkg) => String(pkg.program_id) === resolvedPriceProgramId);
    const activeStartingPrice = visiblePackages.length > 0 ? Math.min(...visiblePackages.map((pkg) => Number(pkg.price ?? 0))) : null;
    const paginatedPackages = useMemo(() => {
        const start = (packagePage - 1) * packagePerPage;
        return visiblePackages.slice(start, start + packagePerPage);
    }, [visiblePackages, packagePage, packagePerPage]);

    // Program form state
    const programForm = useForm({
        name: '',
        slug: '',
        level: '',
        description: '',
        price: '',
        duration: '',
        quota: '',
        schedule_info: '',
        syllabus: '',
        teacher_id: '',
        subjects: '',
        mode: '',
        image: null,
        is_active: true,
        is_featured: false,
    });

    // Package form state
    const packageForm = useForm({
        program_id: '',
        level: '',
        sessions: '',
        intensity: '',
        price: '',
        max_participants: '',
        mode: '',
        schedule: '',
        sort_order: 0,
        is_active: true,
    });

    // Program handlers
    const openProgramModal = (program = null) => {
        if (program) {
            setEditingProgram(program);
            programForm.setData({
                name: program.name || '',
                slug: program.slug || '',
                level: program.level || '',
                description: program.description || '',
                price: program.price ?? '',
                duration: program.duration || '',
                quota: program.quota ?? '',
                schedule_info: program.schedule_info || '',
                syllabus: normalizeSubjects(program.syllabus).join('\n'),
                teacher_id: program.teacher_id ? String(program.teacher_id) : '',
                subjects: normalizeSubjects(program.subjects).join(', '),
                mode: normalizeModeValue(program.mode),
                image: null,
                is_active: Number(program.is_active ?? 1) === 1,
                is_featured: Number(program.is_featured ?? 0) === 1,
            });
            setCurrentProgramImageUrl(program.image_url || null);
        } else {
            setEditingProgram(null);
            programForm.setData({
                name: '',
                slug: '',
                level: '',
                description: '',
                price: '',
                duration: '',
                quota: '',
                schedule_info: '',
                syllabus: '',
                teacher_id: '',
                subjects: '',
                mode: '',
                image: null,
                is_active: true,
                is_featured: false,
            });
            setCurrentProgramImageUrl(null);
        }
        programForm.clearErrors();
        setShowProgramModal(true);
    };

    const openProgramDetailModal = (program) => {
        setProgramDetail(program);
        setShowProgramDetailModal(true);
    };

    const saveProgramForm = () => {
        const payload = {
            ...programForm.data,
            slug: programForm.data.slug || null,
            price: programForm.data.price === '' ? null : Number(programForm.data.price),
            quota: programForm.data.quota === '' ? null : Number(programForm.data.quota),
            teacher_id: programForm.data.teacher_id === '' ? null : Number(programForm.data.teacher_id),
            syllabus: normalizeSubjects(
                String(programForm.data.syllabus || '')
                    .split(/[\n,]/)
                    .map((item) => item.trim()),
            ),
            subjects: normalizeSubjects(programForm.data.subjects),
            is_active: programForm.data.is_active ? 1 : 0,
            is_featured: programForm.data.is_featured ? 1 : 0,
            mode: programForm.data.mode || null,
        };

        programForm.transform(() => ({
            ...payload,
            ...(editingProgram ? { _method: 'put' } : {}),
        }));

        const url = editingProgram ? `/admin/program/${editingProgram.id}` : '/admin/program';

        programForm.post(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowProgramModal(false);
                programForm.reset('image');
            },
            onFinish: () => programForm.transform((data) => data),
        });
    };

    // Package handlers
    const openPackageModal = (pkg = null, programId = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            packageForm.setData({
                program_id: pkg.program_id ? String(pkg.program_id) : '',
                level: pkg.level || '',
                sessions: pkg.sessions ?? '',
                intensity: pkg.intensity || '',
                price: pkg.price ?? '',
                max_participants: pkg.max_participants ?? '',
                mode: normalizeModeValue(pkg.mode),
                schedule: pkg.schedule || '',
                sort_order: pkg.sort_order ?? 0,
                is_active: Number(pkg.is_active ?? 1) === 1,
            });
        } else {
            setEditingPackage(null);
            packageForm.setData({
                program_id: String(programId ?? activePriceProgram?.id ?? programs[0]?.id ?? ''),
                level: '',
                sessions: '',
                intensity: '',
                price: '',
                max_participants: '',
                mode: '',
                schedule: '',
                sort_order: 0,
                is_active: true,
            });
        }
        packageForm.clearErrors();
        setShowPackageModal(true);
    };

    const savePackageForm = () => {
        const payload = {
            ...packageForm.data,
            program_id: Number(packageForm.data.program_id),
            sessions: Number(packageForm.data.sessions),
            price: Number(packageForm.data.price),
            max_participants: packageForm.data.max_participants === '' ? null : Number(packageForm.data.max_participants),
            sort_order: Number(packageForm.data.sort_order || 0),
            is_active: packageForm.data.is_active ? 1 : 0,
        };

        packageForm.transform(() => ({
            ...payload,
            ...(editingPackage ? { _method: 'put' } : {}),
        }));

        const url = editingPackage ? `/admin/paket/${editingPackage.id}` : '/admin/paket';
        packageForm.post(url, {
            preserveScroll: true,
            onSuccess: () => setShowPackageModal(false),
            onFinish: () => packageForm.transform((data) => data),
        });
    };

    // Delete handlers
    const openDeleteModal = (type, item) => {
        setDeleteTarget({ type, item });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteTarget.type === 'program') {
            router.delete(`/admin/program/${deleteTarget.item.id}`, {
                preserveScroll: true,
                onSuccess: () => setShowDeleteModal(false),
            });
        } else {
            router.delete(`/admin/paket/${deleteTarget.item.id}`, {
                preserveScroll: true,
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <>
            <Head title="Program & Daftar Harga" />

            <div className="space-y-6">
                <FlashMessage flash={flash} />
                {/* Header */}
                <PageHeader
                    title="Program & Daftar Harga"
                    subtitle="Kelola jenis program lalu atur harga per jenjang dan jumlah pertemuan."
                    actions={
                        canCreate && (
                            <button
                                type="button"
                                onClick={() => openProgramModal()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                                {icons.plus}
                                Tambah Program
                            </button>
                        )
                    }
                />

                {/* Program Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {programs.map((program) => {
                        const statusLabel = program.is_active ? 'Aktif' : 'Nonaktif';
                        const modeLabel = formatModeLabel(program.mode);

                        return (
                            <div key={program.id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                                <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                    {program.image_url ? (
                                        <img src={program.image_url} alt={program.name} className="h-40 w-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 via-white to-violet-50">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-sm font-semibold text-violet-600 shadow-sm">
                                                {getInitials(program.name)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-slate-800">{program.name}</h3>
                                        <p className="mt-0.5 text-sm text-slate-500">{program.level || 'Semua Jenjang'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}>
                                            {statusLabel}
                                        </span>
                                        <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                            {modeLabel}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{program.description || 'Belum ada deskripsi program.'}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {program.starting_price != null && (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            Mulai Rp {Number(program.starting_price).toLocaleString('id-ID')}
                                        </span>
                                    )}
                                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                        {program.packages_count ?? 0} pilihan harga
                                    </span>
                                    {program.quota != null ? (
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${Number(program.quota_remaining ?? 0) <= 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}
                                        >
                                            {Number(program.quota_remaining ?? 0) <= 0 ? 'Kuota penuh' : `Sisa ${program.quota_remaining}/${program.quota}`}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Tanpa batas kuota</span>
                                    )}
                                    {Number(program.is_featured ?? 0) === 1 && (
                                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Unggulan</span>
                                    )}
                                </div>
                                {program.subjects?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {program.subjects.map((subject) => (
                                            <span key={`${program.id}-${subject}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {(canView || canEdit || canDelete) && (
                                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                        {canView && (
                                            <button
                                                type="button"
                                                onClick={() => openProgramDetailModal(program)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                                            >
                                                {icons.eye} Detail
                                            </button>
                                        )}
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => openProgramModal(program)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                                            >
                                                {icons.edit} Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal('program', program)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                                            >
                                                {icons.trash} Hapus
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Package prices by program */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800">Daftar Harga per Program</h2>
                            <p className="mt-0.5 text-sm text-slate-500">Pilih program untuk melihat dan mengatur pilihan harganya.</p>
                        </div>
                        {canCreate && activePriceProgram && (
                            <button
                                type="button"
                                onClick={() => openPackageModal(null, activePriceProgram.id)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                                {icons.plus} Tambah Harga {activePriceProgram.name}
                            </button>
                        )}
                    </div>

                    {programs.length > 0 ? (
                        <>
                            <div className="overflow-x-auto border-b border-slate-100 px-3 pt-3">
                                <div role="tablist" aria-label="Pilih program untuk daftar harga" className="flex min-w-max gap-1">
                                    {programs.map((program) => {
                                        const programPackages = packages.filter((pkg) => String(pkg.program_id) === String(program.id));
                                        const startingPrice =
                                            programPackages.length > 0 ? Math.min(...programPackages.map((pkg) => Number(pkg.price ?? 0))) : null;
                                        const isActive = String(program.id) === resolvedPriceProgramId;

                                        return (
                                            <button
                                                key={program.id}
                                                id={`price-tab-${program.id}`}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                aria-controls="program-price-panel"
                                                onClick={() => {
                                                    setActivePriceProgramId(String(program.id));
                                                    setPackagePage(1);
                                                }}
                                                className={`rounded-t-xl px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                                                    isActive ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            >
                                                <span className="block text-sm font-semibold">{program.name}</span>
                                                <span className={`mt-0.5 block text-xs ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                                    {programPackages.length} pilihan
                                                    {startingPrice !== null ? ` · mulai ${formatCurrency(startingPrice)}` : ''}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div id="program-price-panel" role="tabpanel" aria-labelledby={`price-tab-${activePriceProgram.id}`}>
                                <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{activePriceProgram.name}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {activePriceProgram.level || 'Semua jenjang'} · {formatModeLabel(activePriceProgram.mode)}
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        <span className="font-semibold text-slate-900">{visiblePackages.length}</span> pilihan
                                        {activeStartingPrice !== null && (
                                            <>
                                                {' '}
                                                · mulai{' '}
                                                <span className="font-semibold tabular-nums text-emerald-700">{formatCurrency(activeStartingPrice)}</span>
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-[760px] w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                                <th className="w-12 px-5 py-3 text-center font-medium">No</th>
                                                <th className="w-14 px-3 py-3 text-center font-medium">Aksi</th>
                                                <th className="px-5 py-3 font-medium">Jenjang</th>
                                                <th className="px-5 py-3 font-medium">Pertemuan</th>
                                                <th className="px-5 py-3 font-medium">Harga</th>
                                                <th className="px-5 py-3 font-medium">Kapasitas</th>
                                                <th className="px-5 py-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedPackages.map((pkg, idx) => {
                                                const rowNumber = (packagePage - 1) * packagePerPage + idx + 1;
                                                const statusLabel = pkg.is_active ? 'Aktif' : 'Nonaktif';
                                                const actionItems = [];
                                                if (canEdit) {
                                                    actionItems.push({
                                                        label: 'Edit',
                                                        icon: icons.edit,
                                                        onClick: () => openPackageModal(pkg),
                                                    });
                                                }
                                                if (canDelete) {
                                                    actionItems.push({
                                                        label: 'Hapus',
                                                        icon: icons.trash,
                                                        danger: true,
                                                        onClick: () => openDeleteModal('package', pkg),
                                                    });
                                                }

                                                return (
                                                    <tr key={pkg.id} className="transition hover:bg-slate-50">
                                                        <td className="px-5 py-4 text-center font-medium text-slate-400">{rowNumber}</td>
                                                        <td className="px-3 py-4 text-center">
                                                            <ActionDropdown items={actionItems} />
                                                        </td>
                                                        <td className="px-5 py-4 font-medium text-slate-700">{pkg.level || '-'}</td>
                                                        <td className="px-5 py-4 text-slate-600">
                                                            <p className="font-medium text-slate-800">{pkg.sessions ? `${pkg.sessions}x / bulan` : '-'}</p>
                                                            <p className="mt-0.5 text-xs text-slate-500">
                                                                {pkg.intensity || pkg.schedule || 'Jadwal fleksibel'}
                                                            </p>
                                                        </td>
                                                        <td className="px-5 py-4 font-semibold tabular-nums text-slate-900">{formatCurrency(pkg.price)}</td>
                                                        <td className="px-5 py-4 text-slate-600">
                                                            {pkg.max_participants ? `Maks. ${pkg.max_participants} siswa` : 'Tidak dibatasi'}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusLabel]}`}
                                                            >
                                                                {statusLabel}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {visiblePackages.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                                                        Belum ada pilihan harga untuk {activePriceProgram.name}. Tambahkan harga pertama agar customer dapat
                                                        memilihnya saat mendaftar.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <Pagination
                                    pagination={{
                                        current_page: packagePage,
                                        last_page: Math.ceil(visiblePackages.length / packagePerPage) || 1,
                                        per_page: packagePerPage,
                                        total: visiblePackages.length,
                                        from: visiblePackages.length === 0 ? 0 : (packagePage - 1) * packagePerPage + 1,
                                        to: Math.min(packagePage * packagePerPage, visiblePackages.length),
                                    }}
                                    onPageChange={(page) => setPackagePage(page)}
                                    perPage={packagePerPage}
                                    onPerPageChange={(perPage) => {
                                        setPackagePerPage(perPage);
                                        setPackagePage(1);
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="px-5 py-10 text-center">
                            <p className="text-sm font-semibold text-slate-700">Belum ada program</p>
                            <p className="mt-1 text-sm text-slate-500">Tambahkan program terlebih dahulu sebelum membuat pilihan harga.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Program Modal */}
            <Modal
                isOpen={showProgramModal}
                onClose={() => setShowProgramModal(false)}
                title={editingProgram ? 'Edit Program' : 'Tambah Program Baru'}
                size="lg"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveProgramForm();
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormInput
                                label="Nama Program"
                                value={programForm.data.name}
                                onChange={(v) => programForm.setData('name', v)}
                                placeholder="contoh: Reguler"
                                required
                            />
                            {programForm.errors.name && <p className="text-xs text-rose-500">{programForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <FormSelect
                                label="Jenjang"
                                value={programForm.data.level}
                                onChange={(v) => programForm.setData('level', v)}
                                options={levelOptions}
                                required
                            />
                            {programForm.errors.level && <p className="text-xs text-rose-500">{programForm.errors.level}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormSelect
                                label="Mode Program"
                                value={programForm.data.mode}
                                onChange={(v) => programForm.setData('mode', v)}
                                options={programModeOptions}
                                required
                            />
                            {programForm.errors.mode && <p className="text-xs text-rose-500">{programForm.errors.mode}</p>}
                        </div>
                        <FormSelect
                            label="Status"
                            value={programForm.data.is_active ? 'Aktif' : 'Nonaktif'}
                            onChange={(v) => programForm.setData('is_active', v === 'Aktif')}
                            options={statusOptions}
                        />
                    </div>
                    <FormTextarea
                        label="Deskripsi Program"
                        value={programForm.data.description}
                        onChange={(v) => programForm.setData('description', v)}
                        placeholder="Deskripsi singkat program..."
                    />
                    <FormInput
                        label="Mata Pelajaran"
                        value={programForm.data.subjects}
                        onChange={(v) => programForm.setData('subjects', v)}
                        placeholder="contoh: Matematika, IPA, Bahasa Inggris"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormInput
                                label="Slug URL (otomatis bila kosong)"
                                value={programForm.data.slug}
                                onChange={(v) => programForm.setData('slug', v)}
                                placeholder="contoh: reguler-smp"
                            />
                            {programForm.errors.slug && <p className="text-xs text-rose-500">{programForm.errors.slug}</p>}
                        </div>
                        <div className="space-y-1">
                            <FormInput
                                label="Harga (Rp)"
                                type="number"
                                value={programForm.data.price}
                                onChange={(v) => programForm.setData('price', v)}
                                placeholder="contoh: 350000"
                            />
                            {programForm.errors.price && <p className="text-xs text-rose-500">{programForm.errors.price}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormInput
                                label="Durasi"
                                value={programForm.data.duration}
                                onChange={(v) => programForm.setData('duration', v)}
                                placeholder="contoh: 3 bulan / 12 pertemuan"
                            />
                            {programForm.errors.duration && <p className="text-xs text-rose-500">{programForm.errors.duration}</p>}
                        </div>
                        <div className="space-y-1">
                            <FormInput
                                label="Kuota Peserta (kosong = tanpa batas)"
                                type="number"
                                value={programForm.data.quota}
                                onChange={(v) => programForm.setData('quota', v)}
                                placeholder="contoh: 30"
                            />
                            {programForm.errors.quota && <p className="text-xs text-rose-500">{programForm.errors.quota}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Pengajar Penanggung Jawab"
                            value={programForm.data.teacher_id}
                            onChange={(v) => programForm.setData('teacher_id', v)}
                            options={[
                                { value: '', label: 'Tanpa pengajar khusus' },
                                ...teachersData.map((t) => ({
                                    value: String(t.id),
                                    label: t.name,
                                })),
                            ]}
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={programForm.data.is_featured}
                                onChange={(e) => programForm.setData('is_featured', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                            Tampilkan sebagai program unggulan
                        </label>
                    </div>
                    <FormTextarea
                        label="Info Jadwal"
                        value={programForm.data.schedule_info}
                        onChange={(v) => programForm.setData('schedule_info', v)}
                        placeholder="contoh: Senin & Kamis, 16.00–17.30"
                        rows={2}
                    />
                    <FormTextarea
                        label="Silabus (satu baris per materi)"
                        value={programForm.data.syllabus}
                        onChange={(v) => programForm.setData('syllabus', v)}
                        placeholder={'contoh:\nPecahan dan desimal\nAljabar dasar\nGeometri bangun datar'}
                        rows={4}
                    />
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload Foto</label>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => programForm.setData('image', e.target.files[0])}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
                        />
                        {currentProgramImageUrl && (
                            <p className="mt-2 text-xs text-slate-500">
                                Foto saat ini:{' '}
                                <a href={currentProgramImageUrl} target="_blank" rel="noreferrer" className="font-medium text-violet-600 underline">
                                    Lihat
                                </a>
                            </p>
                        )}
                        {programForm.errors.image && <p className="mt-1 text-xs text-rose-500">{programForm.errors.image}</p>}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowProgramModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={programForm.processing}
                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {editingProgram ? 'Simpan Perubahan' : 'Tambah Program'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Program Detail Modal */}
            <Modal isOpen={showProgramDetailModal} onClose={() => setShowProgramDetailModal(false)} title="Detail Program" size="lg">
                {programDetail && (
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                            {programDetail.image_url ? (
                                <img src={programDetail.image_url} alt={programDetail.name} className="h-56 w-full object-cover" loading="lazy" />
                            ) : (
                                <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-100 via-white to-violet-50">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-base font-semibold text-violet-600 shadow-sm">
                                        {getInitials(programDetail.name)}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[programDetail.is_active ? 'Aktif' : 'Nonaktif']}`}
                            >
                                {programDetail.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                                {formatModeLabel(programDetail.mode)}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-slate-800">{programDetail.name}</h4>
                            <p className="text-sm text-slate-500">{programDetail.level || 'Semua Jenjang'}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi</p>
                            <p className="mt-2 text-sm text-slate-600">{programDetail.description || 'Belum ada deskripsi program.'}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Harga</p>
                                <p className="mt-1 font-semibold text-slate-800">
                                    {programDetail.price != null ? `Rp ${Number(programDetail.price).toLocaleString('id-ID')}` : '-'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Durasi</p>
                                <p className="mt-1 font-semibold text-slate-800">{programDetail.duration || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kuota</p>
                                <p className="mt-1 font-semibold text-slate-800">
                                    {programDetail.quota != null ? `${programDetail.quota_filled ?? 0}/${programDetail.quota} terisi` : 'Tanpa batas'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pengajar</p>
                                <p className="mt-1 font-semibold text-slate-800">{programDetail.teacher_name || '-'}</p>
                            </div>
                        </div>
                        {programDetail.schedule_info && (
                            <div className="rounded-xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Info Jadwal</p>
                                <p className="mt-2 text-sm text-slate-600">{programDetail.schedule_info}</p>
                            </div>
                        )}
                        {programDetail.syllabus?.length > 0 && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Silabus</p>
                                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                                    {programDetail.syllabus.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mata Pelajaran</p>
                            {programDetail.subjects?.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {programDetail.subjects.map((subject) => (
                                        <span key={subject} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-slate-500">Belum ada data mata pelajaran.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Package Modal */}
            <Modal
                isOpen={showPackageModal}
                onClose={() => setShowPackageModal(false)}
                title={editingPackage ? 'Edit Pilihan Harga' : 'Tambah Pilihan Harga'}
                size="lg"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        savePackageForm();
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
                        Nama pilihan akan dibuat otomatis dari program, jenjang, dan jumlah pertemuan.
                    </div>
                    <div className="space-y-1">
                        <FormSelect
                            label="Program"
                            value={packageForm.data.program_id}
                            onChange={(v) => packageForm.setData('program_id', v)}
                            options={programs.map((program) => ({
                                value: String(program.id),
                                label: program.name,
                            }))}
                            required
                        />
                        {packageForm.errors.program_id && <p className="text-xs text-rose-500">{packageForm.errors.program_id}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormSelect
                                label="Jenjang"
                                value={packageForm.data.level}
                                onChange={(v) => packageForm.setData('level', v)}
                                options={levelOptions}
                                required
                            />
                            {packageForm.errors.level && <p className="text-xs text-rose-500">{packageForm.errors.level}</p>}
                        </div>
                        <div className="space-y-1">
                            <FormInput
                                label="Jumlah Pertemuan / Bulan"
                                value={packageForm.data.sessions}
                                onChange={(v) => packageForm.setData('sessions', v)}
                                placeholder="contoh: 8"
                                required
                            />
                            {packageForm.errors.sessions && <p className="text-xs text-rose-500">{packageForm.errors.sessions}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Intensitas"
                            value={packageForm.data.intensity}
                            onChange={(v) => packageForm.setData('intensity', v)}
                            placeholder="contoh: 2x / minggu"
                        />
                        <div className="space-y-1">
                            <FormInput
                                label="Harga per Bulan"
                                value={packageForm.data.price}
                                onChange={(v) => packageForm.setData('price', v)}
                                placeholder="contoh: 400000"
                                required
                            />
                            {packageForm.errors.price && <p className="text-xs text-rose-500">{packageForm.errors.price}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Maksimal Siswa"
                            value={packageForm.data.max_participants}
                            onChange={(v) => packageForm.setData('max_participants', v)}
                            placeholder="1 untuk privat, 5 untuk reguler"
                        />
                        <div className="space-y-1">
                            <FormSelect
                                label="Mode Belajar"
                                value={packageForm.data.mode}
                                onChange={(v) => packageForm.setData('mode', v)}
                                options={packageModeOptions}
                                required
                            />
                            {packageForm.errors.mode && <p className="text-xs text-rose-500">{packageForm.errors.mode}</p>}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Keterangan Jadwal"
                            value={packageForm.data.schedule}
                            onChange={(v) => packageForm.setData('schedule', v)}
                            placeholder="contoh: Senin - Jumat, fleksibel"
                        />
                        <FormInput
                            label="Urutan Tampil"
                            value={packageForm.data.sort_order}
                            onChange={(v) => packageForm.setData('sort_order', v)}
                            placeholder="0"
                        />
                    </div>
                    <FormSelect
                        label="Status"
                        value={packageForm.data.is_active ? 'Aktif' : 'Nonaktif'}
                        onChange={(v) => packageForm.setData('is_active', v === 'Aktif')}
                        options={statusOptions}
                    />
                    {packageForm.hasErrors && (
                        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">Periksa kembali data pilihan harga yang ditandai.</p>
                    )}
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowPackageModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            {packageForm.processing ? 'Menyimpan...' : editingPackage ? 'Simpan Perubahan' : 'Tambah Pilihan Harga'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-800">{deleteTarget.item?.name}</span>?
                    </>
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}
