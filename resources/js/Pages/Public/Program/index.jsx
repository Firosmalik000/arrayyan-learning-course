import { Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
    ProgramCard,
    EmptyState,
} from '@/Components/Public';
import { programContent, sectionTitles } from '../Home/data';

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

export default function ProgramIndex() {
    const { language } = useI18n();
    const { props } = usePage();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Semua');
    const [selectedMode, setSelectedMode] = useState('Semua');

    const landing = mergeContent(
        {
            programContent,
            sectionTitles,
        },
        props.landingContent || {}
    );

    const titles = landing.sectionTitles[language] || landing.sectionTitles.id;
    const eyebrow = titles?.program?.eyebrow || (language === 'en' ? 'Programs' : 'Program');
    const title = titles?.program?.title || (language === 'en' ? 'Learning Programs' : 'Pilihan Program Belajar');
    const subtitle =
        titles?.program?.subtitle ||
        (language === 'en'
            ? 'Structured tutoring packages designed to help students master core subjects and achieve peak academic milestones.'
            : 'Paket bimbingan belajar komprehensif yang dirancang untuk membantu siswa menguasai konsep dan meraih prestasi terbaik.');

    const rawPrograms = (props.programs || []).map((item) => ({
        id: item.id,
        slug: item.slug || item.id,
        name: localizeField(item.name, language),
        level: localizeField(item.level, language),
        description: localizeField(item.description, language),
        subjects: Array.isArray(item.subjects) ? item.subjects : [],
        mode: localizeField(item.mode, language),
        imageUrl: item.image_url || null,
        image_url: item.image_url || null,
        price: item.price,
        base_price: item.base_price,
        packages: Array.isArray(item.packages) ? item.packages : [],
    }));

    // Extract unique levels for filter tabs
    const availableLevels = useMemo(() => {
        const set = new Set();
        rawPrograms.forEach((p) => {
            if (p.level) set.add(p.level);
        });
        return ['Semua', ...Array.from(set)];
    }, [rawPrograms]);

    const availableModes = ['Semua', 'Offline', 'Online'];

    // Filter logic
    const filteredPrograms = useMemo(() => {
        return rawPrograms.filter((p) => {
            const matchSearch =
                !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchLevel =
                selectedLevel === 'Semua' ||
                (p.level && p.level.toLowerCase().includes(selectedLevel.toLowerCase()));

            const matchMode =
                selectedMode === 'Semua' ||
                (p.mode && p.mode.toLowerCase() === selectedMode.toLowerCase());

            return matchSearch && matchLevel && matchMode;
        });
    }, [rawPrograms, searchQuery, selectedLevel, selectedMode]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedLevel('Semua');
        setSelectedMode('Semua');
    };

    const hasActiveFilters = searchQuery !== '' || selectedLevel !== 'Semua' || selectedMode !== 'Semua';

    return (
        <>
            <SeoHead title={title} description={subtitle} />

            {/* Page Header */}
            <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/70 via-white to-slate-50/50 pt-10 pb-16 sm:pb-20 border-b border-slate-200/60">
                <Container>
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="text-brand-primary font-bold">Program Belajar</span>
                    </nav>

                    <SectionHeader
                        eyebrow={eyebrow}
                        title={title}
                        subtitle={subtitle}
                        align="center"
                    />

                    {/* Search & Filter Controls Bar */}
                    <div className="mt-8 sm:mt-10 mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-3.5 xs:p-4 sm:p-5 shadow-lg">
                        <div className="flex flex-col gap-3.5 sm:gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute left-3.5 xs:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
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
                                    placeholder="Cari program belajar, jenjang, atau mata pelajaran..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-10 xs:pl-11 pr-4 py-2.5 xs:py-3 text-xs xs:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
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

                            {/* Filter Pills */}
                            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                                {/* Level Tabs */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-400 mr-1">Jenjang:</span>
                                    {availableLevels.map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => setSelectedLevel(lvl)}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                selectedLevel === lvl
                                                    ? 'bg-brand-primary text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>

                                {/* Mode Tabs */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-400 mr-1">Mode:</span>
                                    {availableModes.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setSelectedMode(m)}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                selectedMode === m
                                                    ? 'bg-amber-500 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Programs Listing Grid */}
            <section className="py-16 sm:py-20 bg-slate-50/40">
                <Container>
                    {/* Results Counter & Reset Button */}
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-600">
                            Menampilkan <span className="text-slate-900 font-bold">{filteredPrograms.length}</span> program belajar
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs font-bold text-brand-primary hover:underline"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>

                    {filteredPrograms.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPrograms.map((program) => (
                                <ProgramCard
                                    key={program.id}
                                    program={program}
                                    language={language}
                                    showDescription={false}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Tidak Menemukan Program"
                            description="Tidak ada program bimbingan belajar yang cocok dengan kriteria filter atau pencarian Anda. Silakan coba kata kunci lain."
                            actionLabel="Tampilkan Semua Program"
                            onAction={resetFilters}
                        />
                    )}

                    {/* Bottom Help Banner */}
                    <div className="mt-16 rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="max-w-xl text-center sm:text-left">
                            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                                Butuh Rekomendasi Program yang Tepat?
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                Diskusikan kebutuhan belajar anak dengan tim konsultan pendidikan ALC secara gratis untuk memilih paket dan jadwal terbaik.
                            </p>
                        </div>
                        <Button
                            href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20ingin%20konsultasi%20program%20bimbingan%20belajar%20yang%20cocok%20untuk%20anak%20saya"
                            variant="primary"
                            size="md"
                            iconRight={
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            }
                        >
                            Konsultasi via WhatsApp
                        </Button>
                    </div>
                </Container>
            </section>
        </>
    );
}
