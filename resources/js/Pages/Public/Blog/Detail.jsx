import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SeoHead from '@/Components/SeoHead';
import {
    Badge,
    Button,
    Container,
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

function ArticleBody({ content }) {
    const paragraphs = String(content || '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

    if (paragraphs.length === 0) {
        return <p className="text-slate-500">Konten segera hadir.</p>;
    }

    return (
        <div className="space-y-5">
            {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line text-base leading-loose text-slate-700 sm:text-lg">
                    {p}
                </p>
            ))}
        </div>
    );
}

export default function BlogDetail() {
    const { props } = usePage();
    const post = props.post;
    const related = props.related ?? [];
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const el = document.getElementById('article-body');
            if (!el) {
                setProgress(0);
                return;
            }
            const rect = el.getBoundingClientRect();
            const total = el.offsetHeight - window.innerHeight + rect.top + window.scrollY;
            const read = Math.min(Math.max(window.scrollY - (rect.top + window.scrollY - window.innerHeight), 0), Math.max(total, 1));
            setProgress(Math.round((read / Math.max(total, 1)) * 100));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [post?.id]);

    if (!post) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 py-24">
                <Container>
                    <div className="mx-auto max-w-md text-center">
                        <h2 className="text-xl font-bold text-slate-900">Tulisan Tidak Ditemukan</h2>
                        <p className="mt-2 text-sm text-slate-600">Artikel sudah diarsip atau tidak tersedia.</p>
                        <div className="mt-6">
                            <Button href="/blog" variant="primary">Kembali ke Blog</Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <>
            <SeoHead
                title={post.meta_title || post.title}
                description={post.meta_description || post.excerpt}
                type="article"
            />

            <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden="true">
                <div className="h-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            <section className="border-b border-slate-200/60 bg-gradient-to-b from-violet-50/70 via-white to-slate-50/40 pb-10 pt-10">
                <Container>
                    <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/" className="transition hover:text-brand-primary">Beranda</Link>
                        <span>/</span>
                        <Link href="/blog" className="transition hover:text-brand-primary">Blog</Link>
                        <span>/</span>
                        <span className="line-clamp-1 font-bold text-brand-primary">{post.title}</span>
                    </nav>
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant={post.type === 'pengumuman' ? 'warning' : 'primary'}>
                                {post.type === 'pengumuman' ? 'Pengumuman' : 'Artikel'}
                            </Badge>
                            <span className="text-xs text-slate-400">
                                {formatDate(post.published_at)} • {post.reading_minutes} mnt baca
                            </span>
                        </div>
                        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </Container>
            </section>

            <section className="bg-white py-10 sm:py-14">
                <Container>
                    <article id="article-body" className="mx-auto max-w-3xl">
                        {post.image_url && (
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="mb-8 aspect-16/9 w-full rounded-3xl border border-slate-200/80 object-cover"
                            />
                        )}
                        <ArticleBody content={post.content} />

                        <div className="mt-10 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 p-6 text-center text-white sm:p-8">
                            <h3 className="font-display text-xl font-bold">Siap Belajar Lebih Terarah?</h3>
                            <p className="mx-auto mt-1 max-w-md text-sm text-violet-100">
                                Bergabung dengan ALC dan rasakan pendampingan belajar yang personal.
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <Button href="/pendaftaran" variant="white">Daftar Sekarang</Button>
                                <Button href="/cek-status" variant="outline" className="!border-white/40 !text-white hover:!bg-white/10">
                                    Cek Status
                                </Button>
                            </div>
                        </div>
                    </article>

                    {related.length > 0 && (
                        <div className="mx-auto mt-14 max-w-5xl">
                            <h3 className="font-display text-xl font-bold text-slate-900">Bacaan Terkait</h3>
                            <div className="mt-4 grid gap-5 sm:grid-cols-3">
                                {related.map((r) => (
                                    <Link
                                        key={r.id}
                                        href={`/blog/${r.slug}`}
                                        className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <p className="text-xs font-bold text-brand-primary">
                                            {r.type === 'pengumuman' ? 'Pengumuman' : 'Artikel'} • {r.reading_minutes} mnt
                                        </p>
                                        <p className="mt-1.5 font-display font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-brand-primary">
                                            {r.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </Container>
            </section>
        </>
    );
}
