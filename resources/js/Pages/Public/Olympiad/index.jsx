import { Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import { formatDate, parseDateValue } from '@/lib/formatDate';
import {
    Container,
    Badge,
    Button,
    SectionHeader,
    OlympiadCard,
    EmptyState,
} from '@/Components/Public';
import { pageContent, olympiadLevels, events as fallbackEvents } from './data';

const formatCurrency = (value, lang = 'id') => {
    if (!value || value === 0) return lang === 'en' ? 'Free' : 'Gratis';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const getMonth = (dateStr) => {
    if (!dateStr) return null;
    const date = parseDateValue(dateStr);
    if (!date) return null;
    return date.getMonth();
};

const monthNames = {
    id: [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ],
    en: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
};

const dbToEvent = (item) => ({
    id: `db-${item.id}`,
    slug: item.slug,
    schedule_raw: item.schedule,
    image_url: item.image_url || null,
    name: { id: item.name, en: item.name },
    level: { id: item.level, en: item.level },
    schedule: { id: formatDate(item.schedule, 'id'), en: formatDate(item.schedule, 'en') },
    selection: { id: item.selection_system || '-', en: item.selection_system || '-' },
    category: {
        id: String(item.category).toLowerCase() === 'paid' || String(item.category).toLowerCase() === 'berbayar' ? 'Berbayar' : 'Gratis',
        en: String(item.category).toLowerCase() === 'paid' || String(item.category).toLowerCase() === 'berbayar' ? 'Paid' : 'Free',
    },
    fee: { id: formatCurrency(item.fee, 'id'), en: formatCurrency(item.fee, 'en') },
    description: { id: item.notes || '', en: item.notes || '' },
});

export default function Olympiad() {
    const { language } = useI18n();
    const { url, props } = usePage();

    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialCategory = urlParams.get('category')?.toLowerCase() || 'semua';

    const [activeCategory, setActiveCategory] = useState(
        initialCategory === 'all' || initialCategory === 'semua' ? 'semua' : initialCategory
    );
    const [activeLevel, setActiveLevel] = useState('semua');
    const [activeMonth, setActiveMonth] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');

    const text = pageContent[language] || pageContent.id;
    const levels = olympiadLevels[language] || olympiadLevels.id;

    // Load events from database props, fallback to data.js if database has no active records
    const allEvents = useMemo(() => {
        if (props.olympiads && props.olympiads.length > 0) {
            return props.olympiads.map(dbToEvent);
        }
        return fallbackEvents.map((ev) => ({
            ...ev,
            image_url: null,
            selection: ev.selection,
            schedule_raw: null,
        }));
    }, [props.olympiads]);

    // Filter logic
    const filteredEvents = useMemo(() => {
        return allEvents.filter((event) => {
            const eventCategory = (event.category[language] || event.category.id || '').toLowerCase();
            const eventLevel = event.level[language] || event.level.id || '';
            const eventName = event.name[language] || event.name.id || '';
            const eventDesc = event.description[language] || event.description.id || '';

            const matchCategory =
                activeCategory === 'semua' ||
                (activeCategory === 'gratis' && eventCategory === 'gratis') ||
                (activeCategory === 'berbayar' && eventCategory === 'berbayar') ||
                eventCategory === activeCategory;

            const matchLevel =
                activeLevel === 'semua' ||
                eventLevel.toLowerCase().includes(activeLevel.toLowerCase());

            const matchSearch =
                !searchQuery ||
                eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                eventDesc.toLowerCase().includes(searchQuery.toLowerCase());

            const matchMonth =
                activeMonth === 'semua' ||
                (event.schedule_raw && getMonth(event.schedule_raw) === parseInt(activeMonth, 10));

            return matchCategory && matchLevel && matchMonth && matchSearch;
        });
    }, [allEvents, activeCategory, activeLevel, activeMonth, searchQuery, language]);

    const clearFilters = () => {
        setActiveCategory('semua');
        setActiveLevel('semua');
        setActiveMonth('semua');
        setSearchQuery('');
    };

    const hasActiveFilter =
        activeCategory !== 'semua' ||
        activeLevel !== 'semua' ||
        activeMonth !== 'semua' ||
        searchQuery !== '';

    return (
        <>
            <SeoHead
                title={text.title || 'Pusat Lomba & Olimpiade Siswa'}
                description={
                    language === 'id'
                        ? 'Informasi olimpiade dan lomba prestasi siswa ALC, termasuk jadwal, jenjang, dan biaya.'
                        : 'Information on olympiads and student competition achievements at ALC.'
                }
            />

            {/* Header Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-slate-50/50 pt-10 pb-16 border-b border-slate-200/60">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="hover:text-brand-primary transition">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="text-amber-700 font-bold">Pusat Olimpiade</span>
                    </nav>

                    <SectionHeader
                        eyebrow="Pusat Prestasi & Lomba"
                        title={text.title || 'Informasi Olimpiade & Kejuaraan Akademik'}
                        subtitle={text.subtitle || 'Daftar kompetisi sains, matematika, dan kreativitas terkurasi untuk melatih jiwa kompetitif serta mengukir prestasi siswa dari tingkat daerah hingga nasional.'}
                        align="center"
                    />

                    {/* Filter & Search Bar */}
                    <div className="mt-10 mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-lg">
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
                                    placeholder={text.searchPlaceholder || 'Cari nama olimpiade, mata lomba, atau penyelenggara...'}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
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
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                                {/* Category Filters */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-400 mr-1">Kategori:</span>
                                    {['semua', 'gratis', 'berbayar'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setActiveCategory(cat)}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                                                activeCategory === cat
                                                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat === 'semua' ? 'Semua Kategori' : cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Level Filters */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-400 mr-1">Jenjang:</span>
                                    <select
                                        value={activeLevel}
                                        onChange={(e) => setActiveLevel(e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-amber-500"
                                    >
                                        <option value="semua">Semua Jenjang</option>
                                        <option value="SD">SD / MI</option>
                                        <option value="SMP">SMP / MTs</option>
                                        <option value="SMA">SMA / MA</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Event Grid Listing */}
            <section className="py-16 bg-slate-50/40">
                <Container>
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-600">
                            Menemukan <span className="text-slate-900 font-bold">{filteredEvents.length}</span> event kompetisi
                        </p>

                        {hasActiveFilter && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-xs font-bold text-amber-700 hover:underline"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map((olympiad) => (
                                <OlympiadCard
                                    key={olympiad.id}
                                    olympiad={olympiad}
                                    language={language}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Tidak Ada Olimpiade Ditemukan"
                            description="Belum ada event atau olimpiade yang cocok dengan kriteria pencarian dan filter Anda saat ini."
                            actionLabel="Tampilkan Semua Lomba"
                            onAction={clearFilters}
                        />
                    )}

                    {/* Mentoring Program Banner */}
                    <div className="mt-16 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-white to-violet-50/40 p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="max-w-xl text-center sm:text-left">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                Program Pembinaan Khusus
                            </span>
                            <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-slate-900">
                                Bimbingan Intensif Persiapan OSN & Lomba
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                Siswa ALC mendapatkan pendampingan latihan soal tipe olimpiade, strategi manajemen waktu, dan mentoring 1-on-1 dengan pengajar peraih medali.
                            </p>
                        </div>
                        <Button
                            href="https://wa.me/6281234567890?text=Halo%20Admin%20ALC,%20saya%20ingin%20berkonsultasi%20mengenai%20bimbingan%20persiapan%20olimpiade"
                            variant="secondary"
                            size="md"
                        >
                            Konsultasi Pembinaan Lomba
                        </Button>
                    </div>
                </Container>
            </section>
        </>
    );
}
