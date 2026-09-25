import { Link, router, usePage } from '@inertiajs/react';
import SeoHead from '@/Components/SeoHead';
import { useI18n } from '@/lib/i18n';
import {
    Badge,
    Button,
    Container,
    SectionHeader,
} from '@/Components/Public';

const formatDate = (value) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '';
    }
};

function Stars({ value }) {
    return (
        <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${value} dari 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={i <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5c.16-.4.88-.4 1.04 0l2.12 5.11 5.52.44c.44.04.62.58.28.85l-4.2 3.6 1.28 5.38c.1.44-.36.78-.75.55L12 16.54l-4.67 2.9c-.39.22-.85-.12-.75-.55l1.28-5.39-4.2-3.6c-.34-.27-.16-.81.28-.85l5.52-.44 2.12-5.1Z" />
                </svg>
            ))}
        </span>
    );
}

export default function BlogIndex() {
    const { props } = usePage();
    const { language } = useI18n();
    const pages = props.posts ?? { data: [] };
    const rows = pages.data ?? [];
    const meta = pages.meta ?? null;
    const activeType = props.type || '';
    const testimonials = props.testimonials ?? [];

    const goType = (type) => {
        router.get('/blog', { type: type || null }, { preserveState: true, replace: true });
    };

    const goPage = (page) => {
        router.get('/blog', { type: activeType || null, page }, { preserveState: true, replace: true });
    };

    return (
        <>
            <SeoHead
                title={language === 'en' ? 'Blog & Announcements' : 'Blog & Pengumuman'}
                description="Artikel edukasi, tips belajar, dan pengumuman resmi Ar Rayyan Learning Course."
            />

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pb-12 pt-10">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">Beranda</Link>
                        <span>/</span>
                        <span className="font-bold text-brand-primary">Blog</span>
                    </nav>
                    <SectionHeader
                        eyebrow="Wawasan & Kabar"
                        title="Blog & Pengumuman"
                        subtitle="Tips belajar, panduan orang tua, dan kabar terbaru dari ALC."
                        align="center"
                    />
                    <div className="mt-6 flex justify-center gap-2">
                        {[
                            { value: '', label: 'Semua' },
                            { value: 'blog', label: 'Artikel' },
                            { value: 'pengumuman', label: 'Pengumuman' },
                        ].map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => goType(t.value)}
                                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                                    activeType === t.value
                                        ? 'bg-brand-primary text-white shadow'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="bg-slate-50/40 py-12 sm:py-16">
                <Container>
                    {rows.length === 0 ? (
                        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
                            <p className="font-bold text-slate-800">Belum ada tulisan</p>
                            <p className="mt-1 text-sm text-slate-500">Artikel dan pengumuman akan tampil di sini.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {rows.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-violet-100 via-white to-amber-50">
                                            {post.image_url ? (
                                                <img
                                                    src={post.image_url}
                                                    alt={post.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center p-6">
                                                    <p className="text-center font-display text-lg font-bold leading-snug text-slate-700 line-clamp-3">
                                                        {post.title}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={post.type === 'pengumuman' ? 'warning' : 'primary'}>
                                                    {post.type === 'pengumuman' ? 'Pengumuman' : 'Artikel'}
                                                </Badge>
                                                <span className="text-xs text-slate-400">{post.reading_minutes} mnt baca</span>
                                            </div>
                                            <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-slate-900 transition group-hover:text-brand-primary line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <p className="mt-3 text-xs font-semibold text-slate-400">
                                                {formatDate(post.published_at)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {meta && meta.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        disabled={meta.current_page <= 1}
                                        onClick={() => goPage(meta.current_page - 1)}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-violet-300 disabled:opacity-50"
                                    >
                                        ← Sebelumnya
                                    </button>
                                    <span className="text-xs text-slate-500">
                                        Hal {meta.current_page} dari {meta.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={meta.current_page >= meta.last_page}
                                        onClick={() => goPage(meta.current_page + 1)}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-violet-300 disabled:opacity-50"
                                    >
                                        Berikutnya →
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {testimonials.length > 0 && (
                        <div className="mt-16">
                            <SectionHeader
                                eyebrow="Kata Mereka"
                                title="Testimoni Orang Tua & Murid"
                                align="center"
                            />
                            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {testimonials.map((t) => (
                                    <figure key={t.id} className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                        <Stars value={t.rating ?? 5} />
                                        <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                                            “{t.message}”
                                        </blockquote>
                                        <figcaption className="mt-4 border-t border-slate-100 pt-3">
                                            <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                            {t.role && <p className="text-xs text-slate-500">{t.role}</p>}
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                            <div className="mt-8 text-center">
                                <Button href="/pendaftaran" variant="primary" size="lg">
                                    Daftar Sekarang
                                </Button>
                            </div>
                        </div>
                    )}
                </Container>
            </section>
        </>
    );
}
