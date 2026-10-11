import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import SeoHead from '@/Components/SeoHead';
import PasskeyModal from '@/Components/PasskeyModal';
import { useI18n } from '@/lib/i18n';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
    BankSoalCard,
    EmptyState,
} from '@/Components/Public';
import { bankSoalContent, bankSoalPasskey, bankSoalPageContent } from '../Home/data';

const mergeContent = (base, override) => {
    if (Array.isArray(base)) {
        return Array.isArray(override) ? override : base;
    }
    if (base && typeof base === 'object') {
        const result = { ...base };
        if (override && typeof override === 'object') {
            Object.keys(override).forEach((key) => {
                if (override[key] === undefined || override[key] === null) return;
                result[key] = mergeContent(base[key], override[key]);
            });
        }
        return result;
    }
    return override !== undefined ? override : base;
};

const localizeField = (value, lang) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.id || value.en || '';
};

const normalizeFormat = (val) => String(val || '').trim().toLowerCase();

export default function BankSoalIndex() {
    const { language } = useI18n();
    const { url, props } = usePage();

    const [hasAccess, setHasAccess] = useState(false);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const [targetItemUrl, setTargetItemUrl] = useState('');

    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialFormat = urlParams.get('format')?.toLowerCase() || 'semua';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [selectedFormat, setSelectedFormat] = useState(initialFormat === 'all' ? 'semua' : initialFormat);

    const landing = mergeContent(
        {
            bankSoalContent,
            bankSoalPasskey,
            bankSoalPageContent,
        },
        props.landingContent || {}
    );

    const t = landing.bankSoalPageContent[language] || landing.bankSoalPageContent.id;
    const bank = landing.bankSoalContent[language] || landing.bankSoalContent.id;

    // Check passkey access on mount
    useEffect(() => {
        const access = sessionStorage.getItem('banksoal_access') === 'granted';
        setHasAccess(access);
    }, []);

    const dbItems = (props.bankSoalItems || []).map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name || { id: '', en: '' },
        category: item.category || { id: '', en: '' },
        level: item.level || { id: '', en: '' },
        format: item.format || 'PDF',
        questions: item.questions,
        description: item.description || { id: '', en: '' },
        links: item.links || [],
        image_url: item.image_url || null,
        tone: item.tone || 'violet',
    }));

    // Extract categories
    const categories = useMemo(() => {
        const set = new Set();
        dbItems.forEach((item) => {
            const cat = localizeField(item.category, language);
            if (cat) set.add(cat);
        });
        return ['Semua', ...Array.from(set)];
    }, [dbItems, language]);

    const formatOptions = [
        { key: 'semua', label: 'Semua Format' },
        { key: 'pdf', label: 'PDF Cetak' },
        { key: 'online', label: 'Latihan Online' },
        { key: 'hybrid', label: 'Hybrid' },
    ];

    // Filter items
    const filteredItems = useMemo(() => {
        return dbItems.filter((item) => {
            const nameStr = localizeField(item.name, language).toLowerCase();
            const descStr = localizeField(item.description, language).toLowerCase();
            const catStr = localizeField(item.category, language);
            const fmtStr = normalizeFormat(item.format);

            const matchSearch =
                !searchQuery ||
                nameStr.includes(searchQuery.toLowerCase()) ||
                descStr.includes(searchQuery.toLowerCase());

            const matchCat =
                selectedCategory === 'Semua' ||
                catStr.toLowerCase() === selectedCategory.toLowerCase();

            const matchFormat =
                selectedFormat === 'semua' ||
                (selectedFormat === 'pdf' && fmtStr.includes('pdf')) ||
                (selectedFormat === 'online' && fmtStr.includes('online')) ||
                (selectedFormat === 'hybrid' && (fmtStr.includes('hybrid') || (fmtStr.includes('pdf') && fmtStr.includes('online'))));

            return matchSearch && matchCat && matchFormat;
        });
    }, [dbItems, searchQuery, selectedCategory, selectedFormat, language]);

    const handleRequireAccess = (item) => {
        setTargetItemUrl(`/bank-soal/${item.slug}`);
        setShowPasskeyModal(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('Semua');
        setSelectedFormat('semua');
    };

    const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'Semua' || selectedFormat !== 'semua';

    return (
        <>
            <SeoHead
                title={t.title || 'Bank Soal & Latihan Ujian'}
                description={t.description || 'Kumpulan modul dan bank soal terpercaya untuk persiapan ujian sekolah dan asesmen nasional.'}
            />

            {/* Header Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/50 pt-10 pb-16 border-b border-slate-200/60">
                <Container>
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="text-emerald-700 font-bold">Bank Soal & Modul</span>
                    </nav>

                    <SectionHeader
                        eyebrow="Bank Soal ALC"
                        title={t.title || 'Bank Soal & Latihan Ujian Terpadu'}
                        subtitle={t.description || 'Koleksi soal latihan terstandar yang disusun oleh tim pengajar berpengalaman untuk persiapan ujian harian, ANBK, dan seleksi sekolah favorit.'}
                        align="center"
                    />

                    {/* Access Status Banner */}
                    <div className="mt-8 mx-auto max-w-3xl">
                        {hasAccess ? (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs text-emerald-800 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 font-bold">
                                        ✓
                                    </span>
                                    <div>
                                        <p className="font-bold">Akses Bank Soal Aktif</p>
                                        <p className="text-emerald-700 text-[11px]">Seluruh link soal dan modul PDF dapat langsung dibuka.</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                                    Unlocked
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-3.5 text-xs text-amber-900 shadow-xs">
                                <div className="flex items-center gap-3 text-center sm:text-left">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="font-bold">Materi Terproteksi Passkey Siswa</p>
                                        <p className="text-amber-800 text-[11px]">Masukkan passkey Anda untuk membuka link download dan modul latihan.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasskeyModal(true)}
                                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
                                    >
                                        Buka Passkey
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="mt-8 mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-lg">
                        <div className="flex flex-col gap-4">
                            {/* Search */}
                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari materi soal, kelas, atau topik pembahasan..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Filters Row */}
                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                                {/* Format Filters */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-400 mr-1">Format:</span>
                                    {formatOptions.map((fmt) => (
                                        <button
                                            key={fmt.key}
                                            type="button"
                                            onClick={() => setSelectedFormat(fmt.key)}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                selectedFormat === fmt.key
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {fmt.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Category Select */}
                                {categories.length > 1 && (
                                    <div className="flex items-center gap-1.5 w-full xs:w-auto justify-between xs:justify-start">
                                        <span className="text-xs font-bold text-slate-400 mr-1">Kategori:</span>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 w-full xs:w-auto"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Grid Listing */}
            <section className="py-12 sm:py-16 bg-slate-50/40">
                <Container>
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-600">
                            Menemukan <span className="text-slate-900 font-bold">{filteredItems.length}</span> modul soal
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs font-bold text-emerald-700 hover:underline"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {filteredItems.map((item) => (
                                <BankSoalCard
                                    key={item.id}
                                    item={item}
                                    hasAccess={hasAccess}
                                    onRequireAccess={handleRequireAccess}
                                    language={language}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Tidak Ada Modul Soal"
                            description="Tidak ditemukan modul atau bank soal yang cocok dengan filter atau kata kunci pencarian Anda."
                            actionLabel="Reset Semua Filter"
                            onAction={resetFilters}
                        />
                    )}
                </Container>
            </section>

            {/* Passkey Modal */}
            <PasskeyModal
                isOpen={showPasskeyModal}
                onClose={() => {
                    setShowPasskeyModal(false);
                    setTargetItemUrl('');
                }}
                targetUrl={targetItemUrl}
                correctPasskey={landing.bankSoalPasskey}
                language={language}
                onSuccess={() => {
                    setHasAccess(true);
                    sessionStorage.setItem('banksoal_access', 'granted');
                }}
            />
        </>
    );
}
