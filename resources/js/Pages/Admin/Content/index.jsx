import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ActionDropdown, FlashMessage, Modal, PageHeader, Pagination } from '@/Components/Admin';

const icons = {
    plus: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
    ),
    trash: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    eye: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const tabs = [
    { key: 'posts', label: 'Artikel & Pengumuman' },
    { key: 'testimonials', label: 'Testimoni' },
    { key: 'faqs', label: 'FAQ' },
    { key: 'revisions', label: 'Revisi Landing' },
];

const formatDateTime = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return '-';
    }
};

export default function Content() {
    const {
        tab: initialTab = 'posts',
        posts = [],
        testimonials = [],
        faqs = [],
        revisions = [],
        flash,
        allowedActions = {},
    } = usePage().props;

    const [activeTab, setActiveTab] = useState(initialTab);
    const [postPage, setPostPage] = useState(1);
    const [postPerPage, setPostPerPage] = useState(10);
    const paginatedPosts = useMemo(() => {
        const start = (postPage - 1) * postPerPage;
        return posts.slice(start, start + postPerPage);
    }, [posts, postPage, postPerPage]);

    const [revPage, setRevPage] = useState(1);
    const [revPerPage, setRevPerPage] = useState(10);
    const paginatedRevisions = useMemo(() => {
        const start = (revPage - 1) * revPerPage;
        return revisions.slice(start, start + revPerPage);
    }, [revisions, revPage, revPerPage]);

    const can = (action) => (allowedActions.konten ?? []).includes(action);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const switchTab = (key) => {
        setActiveTab(key);
        router.get('/admin/konten', { tab: key }, { preserveState: true, replace: true });
    };

    // Post modal
    const [postModal, setPostModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const postForm = useForm({
        type: 'blog', title: '', excerpt: '', content: '',
        image: null, meta_title: '', meta_description: '',
        published_at: '', is_active: true,
    });

    const openPostModal = (post = null) => {
        setEditingPost(post);
        postForm.setData({
            type: post?.type || 'blog',
            title: post?.title || '',
            excerpt: post?.excerpt || '',
            content: '',
            image: null,
            meta_title: '',
            meta_description: '',
            published_at: post?.published_at ? String(post.published_at).slice(0, 16) : '',
            is_active: post ? !!post.is_active : true,
        });
        postForm.clearErrors();
        setPostModal(true);
    };

    const savePost = (e) => {
        e.preventDefault();
        postForm.transform((data) => ({
            ...data,
            published_at: data.published_at || null,
            is_active: data.is_active ? 1 : 0,
            ...(editingPost ? { _method: 'put' } : {}),
        }));
        const url = editingPost ? `/admin/konten/posts/${editingPost.id}` : '/admin/konten/posts';
        postForm.post(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => setPostModal(false),
            onFinish: () => postForm.transform((data) => data),
        });
    };

    const deletePost = (id) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Hapus konten ini?')) return;
        router.delete(`/admin/konten/posts/${id}`, { preserveScroll: true });
    };

    // Testimonial modal
    const [testiModal, setTestiModal] = useState(false);
    const [editingTesti, setEditingTesti] = useState(null);
    const testiForm = useForm({ name: '', role: '', message: '', rating: 5, sort_order: 0, is_active: true });

    const openTestiModal = (item = null) => {
        setEditingTesti(item);
        testiForm.setData({
            name: item?.name || '',
            role: item?.role || '',
            message: item?.message || '',
            rating: item?.rating ?? 5,
            sort_order: item?.sort_order ?? 0,
            is_active: item ? !!item.is_active : true,
        });
        testiForm.clearErrors();
        setTestiModal(true);
    };

    const saveTesti = (e) => {
        e.preventDefault();
        testiForm.transform((data) => ({ ...data, ...(editingTesti ? { _method: 'put' } : {}) }));
        const url = editingTesti ? `/admin/konten/testimoni/${editingTesti.id}` : '/admin/konten/testimoni';
        testiForm.post(url, {
            preserveScroll: true,
            onSuccess: () => setTestiModal(false),
            onFinish: () => testiForm.transform((data) => data),
        });
    };

    const deleteTesti = (id) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Hapus testimoni ini?')) return;
        router.delete(`/admin/konten/testimoni/${id}`, { preserveScroll: true });
    };

    // FAQ modal
    const [faqModal, setFaqModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const faqForm = useForm({ question: '', answer: '', category: '', sort_order: 0, is_active: true });

    const openFaqModal = (item = null) => {
        setEditingFaq(item);
        faqForm.setData({
            question: item?.question || '',
            answer: item?.answer || '',
            category: item?.category || '',
            sort_order: item?.sort_order ?? 0,
            is_active: item ? !!item.is_active : true,
        });
        faqForm.clearErrors();
        setFaqModal(true);
    };

    const saveFaq = (e) => {
        e.preventDefault();
        faqForm.transform((data) => ({ ...data, ...(editingFaq ? { _method: 'put' } : {}) }));
        const url = editingFaq ? `/admin/konten/faq/${editingFaq.id}` : '/admin/konten/faq';
        faqForm.post(url, {
            preserveScroll: true,
            onSuccess: () => setFaqModal(false),
            onFinish: () => faqForm.transform((data) => data),
        });
    };

    const deleteFaq = (id) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Hapus FAQ ini?')) return;
        router.delete(`/admin/konten/faq/${id}`, { preserveScroll: true });
    };

    const restoreRevision = (id) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Kembalikan bagian landing ke revisi ini? Konten saat ini akan ditimpa.')) return;
        router.post(`/admin/konten/revisi/${id}/restore`, {}, { preserveScroll: true });
    };

    const actionBtn = 'rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600';

    return (
        <>
            <Head title="Konten" />

            <div className="space-y-6">
                <PageHeader
                    title="Konten Website"
                />

                <FlashMessage flash={flash} />

                <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:flex sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => switchTab(tab.key)}
                            className={`flex-1 whitespace-nowrap rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition text-center ${
                                activeTab === tab.key
                                    ? 'bg-brand-primary text-white shadow'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* POSTS */}
                {activeTab === 'posts' && (
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-800">{posts.length} konten</p>
                            {canCreate && (
                                <button type="button" onClick={() => openPostModal()} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                                    {icons.plus} Tulis Konten
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                        <th className="w-12 px-5 py-3 text-center font-medium">No</th>
                                        <th className="w-14 px-3 py-3 text-center font-medium">Aksi</th>
                                        <th className="px-5 py-3 font-medium">Judul</th>
                                        <th className="px-5 py-3 font-medium">Tipe</th>
                                        <th className="px-5 py-3 font-medium">Terbit</th>
                                        <th className="px-5 py-3 font-medium">Aktif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedPosts.map((post, idx) => {
                                        const rowNumber = (postPage - 1) * postPerPage + idx + 1;
                                        const actionItems = [
                                            {
                                                label: 'Lihat',
                                                icon: icons.eye,
                                                href: `/blog/${post.slug}`,
                                                isExternal: true,
                                            },
                                            canEdit && {
                                                label: 'Edit',
                                                icon: icons.edit,
                                                onClick: () => openPostModal(post),
                                            },
                                            canDelete && {
                                                label: 'Hapus',
                                                icon: icons.trash,
                                                danger: true,
                                                onClick: () => deletePost(post.id),
                                            },
                                        ].filter(Boolean);

                                        return (
                                            <tr key={post.id} className="hover:bg-slate-50">
                                                <td className="px-5 py-3 text-center font-medium text-slate-400">{rowNumber}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <ActionDropdown items={actionItems} />
                                                </td>
                                                <td className="px-5 py-3 font-medium text-slate-800">{post.title}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.type === 'pengumuman' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}>
                                                        {post.type === 'pengumuman' ? 'Pengumuman' : 'Artikel'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-slate-600">{formatDateTime(post.published_at) || 'Draf'}</td>
                                                <td className="px-5 py-3 text-slate-600">{post.is_active ? 'Ya' : 'Tidak'}</td>
                                            </tr>
                                        );
                                    })}
                                    {posts.length === 0 && (
                                        <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Belum ada konten.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            pagination={{
                                current_page: postPage,
                                last_page: Math.ceil(posts.length / postPerPage) || 1,
                                per_page: postPerPage,
                                total: posts.length,
                                from: posts.length === 0 ? 0 : (postPage - 1) * postPerPage + 1,
                                to: Math.min(postPage * postPerPage, posts.length),
                            }}
                            onPageChange={(page) => setPostPage(page)}
                            perPage={postPerPage}
                            onPerPageChange={(perPage) => {
                                setPostPerPage(perPage);
                                setPostPage(1);
                            }}
                        />
                    </div>
                )}

                {/* TESTIMONIALS */}
                {activeTab === 'testimonials' && (
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-800">{testimonials.length} testimoni</p>
                            {canCreate && (
                                <button type="button" onClick={() => openTestiModal()} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                                    {icons.plus} Tambah Testimoni
                                </button>
                            )}
                        </div>
                        <div className="grid gap-3 p-4 sm:grid-cols-2">
                            {testimonials.map((t) => (
                                <div key={t.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-sm font-bold text-slate-800">{t.name} <span className="font-normal text-slate-500">• {t.role || '-'}</span></p>
                                    <p className="mt-1 text-sm text-slate-600">“{t.message}”</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-amber-500">{'★'.repeat(t.rating ?? 5)} <span className="text-slate-400">• Urutan {t.sort_order ?? 0} • {t.is_active ? 'Aktif' : 'Nonaktif'}</span></span>
                                        <div className="flex gap-1">
                                            {canEdit && (
                                                <button type="button" onClick={() => openTestiModal(t)} className={actionBtn} title="Edit">{icons.edit}</button>
                                            )}
                                            {canDelete && (
                                                <button type="button" onClick={() => deleteTesti(t.id)} className={actionBtn} title="Hapus">{icons.trash}</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {testimonials.length === 0 && (
                                <p className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
                                    Belum ada testimoni.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* FAQS */}
                {activeTab === 'faqs' && (
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-800">{faqs.length} FAQ</p>
                            {canCreate && (
                                <button type="button" onClick={() => openFaqModal()} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                                    {icons.plus} Tambah FAQ
                                </button>
                            )}
                        </div>
                        <div className="divide-y divide-slate-100">
                            {faqs.map((f) => (
                                <div key={f.id} className="flex items-start justify-between gap-3 p-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            {f.category && <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{f.category}</span>}
                                            {f.question}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{f.answer}</p>
                                        <p className="mt-1 text-xs text-slate-400">Urutan {f.sort_order ?? 0} • {f.is_active ? 'Aktif' : 'Nonaktif'}</p>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        {canEdit && (
                                            <button type="button" onClick={() => openFaqModal(f)} className={actionBtn} title="Edit">{icons.edit}</button>
                                        )}
                                        {canDelete && (
                                            <button type="button" onClick={() => deleteFaq(f.id)} className={actionBtn} title="Hapus">{icons.trash}</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {faqs.length === 0 && (
                                <p className="px-4 py-8 text-center text-xs text-slate-500">Belum ada FAQ.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* REVISIONS */}
                {activeTab === 'revisions' && (
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-4">
                            <p className="text-sm font-semibold text-slate-800">Riwayat Revisi Landing</p>
                            <p className="mt-0.5 text-xs text-slate-500">Snapshot otomatis dibuat setiap kali konten landing disimpan. Maksimal 50 terakhir.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                        <th className="w-12 px-5 py-3 text-center font-medium">No</th>
                                        <th className="w-14 px-3 py-3 text-center font-medium">Aksi</th>
                                        <th className="px-5 py-3 font-medium">Bagian</th>
                                        <th className="px-5 py-3 font-medium">Catatan</th>
                                        <th className="px-5 py-3 font-medium">Oleh</th>
                                        <th className="px-5 py-3 font-medium">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedRevisions.map((r, idx) => {
                                        const rowNumber = (revPage - 1) * revPerPage + idx + 1;
                                        const actionItems = [
                                            canEdit && {
                                                label: 'Kembalikan',
                                                onClick: () => restoreRevision(r.id),
                                            },
                                        ].filter(Boolean);

                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50">
                                                <td className="px-5 py-3 text-center font-medium text-slate-400">{rowNumber}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <ActionDropdown items={actionItems} />
                                                </td>
                                                <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800">{r.slug}</td>
                                                <td className="px-5 py-3 text-slate-600">{r.note || '-'}</td>
                                                <td className="px-5 py-3 text-slate-600">{r.created_by_name || '-'}</td>
                                                <td className="px-5 py-3 text-slate-600">{formatDateTime(r.created_at)}</td>
                                            </tr>
                                        );
                                    })}
                                    {revisions.length === 0 && (
                                        <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Belum ada revisi tersimpan.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            pagination={{
                                current_page: revPage,
                                last_page: Math.ceil(revisions.length / revPerPage) || 1,
                                per_page: revPerPage,
                                total: revisions.length,
                                from: revisions.length === 0 ? 0 : (revPage - 1) * revPerPage + 1,
                                to: Math.min(revPage * revPerPage, revisions.length),
                            }}
                            onPageChange={(page) => setRevPage(page)}
                            perPage={revPerPage}
                            onPerPageChange={(perPage) => {
                                setRevPerPage(perPage);
                                setRevPage(1);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Post Modal */}
            <Modal isOpen={postModal} onClose={() => setPostModal(false)} title={editingPost ? 'Edit Konten' : 'Tulis Konten'} size="lg">
                <form onSubmit={savePost} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Tipe *</label>
                            <select value={postForm.data.type} onChange={(e) => postForm.setData('type', e.target.value)} className={inputClass}>
                                <option value="blog">Artikel Blog</option>
                                <option value="pengumuman">Pengumuman</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Tanggal Terbit (kosong = draf)</label>
                            <input type="datetime-local" value={postForm.data.published_at} onChange={(e) => postForm.setData('published_at', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Judul *</label>
                        <input type="text" value={postForm.data.title} onChange={(e) => postForm.setData('title', e.target.value)} className={inputClass} required />
                        {postForm.errors.title && <p className="mt-1 text-xs text-rose-500">{postForm.errors.title}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Ringkasan</label>
                        <textarea rows="2" value={postForm.data.excerpt} onChange={(e) => postForm.setData('excerpt', e.target.value)} className={`${inputClass} resize-none`} />
                    </div>
                    <div>
                        <label className={labelClass}>Isi (paragraf dipisah baris kosong)</label>
                        <textarea rows="8" value={postForm.data.content} onChange={(e) => postForm.setData('content', e.target.value)} className={`${inputClass} resize-none`} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Meta Title (SEO)</label>
                            <input type="text" value={postForm.data.meta_title} onChange={(e) => postForm.setData('meta_title', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Meta Description (SEO)</label>
                            <input type="text" value={postForm.data.meta_description} onChange={(e) => postForm.setData('meta_description', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Gambar Sampul</label>
                        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => postForm.setData('image', e.target.files[0])} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={postForm.data.is_active} onChange={(e) => postForm.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                        Aktif / tampil di publik
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setPostModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={postForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                            {editingPost ? 'Simpan Perubahan' : 'Tambah Konten'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Testimonial Modal */}
            <Modal isOpen={testiModal} onClose={() => setTestiModal(false)} title={editingTesti ? 'Edit Testimoni' : 'Tambah Testimoni'}>
                <form onSubmit={saveTesti} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Nama *</label>
                            <input type="text" value={testiForm.data.name} onChange={(e) => testiForm.setData('name', e.target.value)} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Peran (cth: Ortu Murid Kelas 5)</label>
                            <input type="text" value={testiForm.data.role} onChange={(e) => testiForm.setData('role', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Pesan *</label>
                        <textarea rows="3" value={testiForm.data.message} onChange={(e) => testiForm.setData('message', e.target.value)} className={`${inputClass} resize-none`} required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Rating (1–5)</label>
                            <input type="number" min="1" max="5" value={testiForm.data.rating} onChange={(e) => testiForm.setData('rating', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Urutan</label>
                            <input type="number" min="0" value={testiForm.data.sort_order} onChange={(e) => testiForm.setData('sort_order', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={testiForm.data.is_active} onChange={(e) => testiForm.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                        Aktif
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setTestiModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={testiForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                            {editingTesti ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* FAQ Modal */}
            <Modal isOpen={faqModal} onClose={() => setFaqModal(false)} title={editingFaq ? 'Edit FAQ' : 'Tambah FAQ'}>
                <form onSubmit={saveFaq} className="space-y-4">
                    <div>
                        <label className={labelClass}>Pertanyaan *</label>
                        <input type="text" value={faqForm.data.question} onChange={(e) => faqForm.setData('question', e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Jawaban *</label>
                        <textarea rows="4" value={faqForm.data.answer} onChange={(e) => faqForm.setData('answer', e.target.value)} className={`${inputClass} resize-none`} required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Kategori (cth: Biaya, Jadwal)</label>
                            <input type="text" value={faqForm.data.category} onChange={(e) => faqForm.setData('category', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Urutan</label>
                            <input type="number" min="0" value={faqForm.data.sort_order} onChange={(e) => faqForm.setData('sort_order', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={faqForm.data.is_active} onChange={(e) => faqForm.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                        Aktif
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setFaqModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={faqForm.processing} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                            {editingFaq ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
