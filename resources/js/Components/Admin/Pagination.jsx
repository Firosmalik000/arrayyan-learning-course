export default function Pagination({
    meta,
    onPage,
    currentPage,
    totalItems,
    perPage = 10,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 25, 50, 100],
}) {
    const isMeta = !!meta;
    const activeCurrentPage = isMeta ? meta.current_page : currentPage || 1;
    const activeTotalItems = isMeta ? meta.total : totalItems || 0;
    const activePerPage = isMeta ? meta.per_page || perPage : perPage;
    const activeTotalPages = isMeta
        ? meta.last_page || 1
        : Math.max(1, Math.ceil(activeTotalItems / activePerPage));

    const handlePage = onPageChange || onPage;

    const from = activeTotalItems === 0 ? 0 : (activeCurrentPage - 1) * activePerPage + 1;
    const to = Math.min(activeCurrentPage * activePerPage, activeTotalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (activeTotalPages <= maxVisible) {
            for (let i = 1; i <= activeTotalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, activeCurrentPage - 2);
            let end = Math.min(activeTotalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }

        return pages;
    };

    if (activeTotalItems === 0) return null;

    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 text-xs text-slate-600">
            {/* Per Page Selector */}
            <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Tampilkan</span>
                <select
                    value={activePerPage}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (onPerPageChange) onPerPageChange(val);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 shadow-2xs cursor-pointer"
                >
                    {perPageOptions.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
                <span className="text-slate-500 font-medium">per halaman</span>
            </div>

            {/* Total count summary */}
            <div className="text-slate-500 font-medium">
                Menampilkan <strong className="text-slate-700">{from}</strong> –{' '}
                <strong className="text-slate-700">{to}</strong> dari{' '}
                <strong className="text-slate-700">{activeTotalItems}</strong> data
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={activeCurrentPage <= 1}
                    onClick={() => handlePage && handlePage(activeCurrentPage - 1)}
                    className="inline-flex h-7 px-2.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                >
                    ‹ Prev
                </button>

                {getPageNumbers().map((p) => {
                    const isActive = p === activeCurrentPage;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => handlePage && handlePage(p)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition ${
                                isActive
                                    ? 'bg-violet-600 text-white shadow-xs'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs'
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}

                <button
                    type="button"
                    disabled={activeCurrentPage >= activeTotalPages}
                    onClick={() => handlePage && handlePage(activeCurrentPage + 1)}
                    className="inline-flex h-7 px-2.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
}
