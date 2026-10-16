export default function PortalPagination({
    currentPage = 1,
    totalItems = 0,
    perPage = 10,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 25, 50, 100],
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const from = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }

        return pages;
    };

    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-3 xs:px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 text-xs text-slate-600">
            {/* Per Page Selector & Summary Container */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-slate-500 font-medium">Tampilkan</span>
                    <select
                        value={perPage}
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
                    <span className="text-slate-500 font-medium">per hal</span>
                </div>

                {/* Total count summary */}
                <div className="text-slate-500 font-medium text-[11px] xs:text-xs">
                    <strong className="text-slate-700">{from}</strong>–<strong className="text-slate-700">{to}</strong> dari{' '}
                    <strong className="text-slate-700">{totalItems}</strong>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center sm:justify-end gap-1 flex-wrap">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition active:scale-95"
                >
                    ‹ Prev
                </button>

                {getPageNumbers().map((p) => {
                    const isActive = p === currentPage;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition active:scale-95 ${
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
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition active:scale-95"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
}
