export default function Pagination({ meta, onPage }) {
    if (!meta || meta.last_page <= 1) return null;

    const btnClass =
        'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
                Hal {meta.current_page} dari {meta.last_page} — {meta.total} data
            </p>
            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPage(meta.current_page - 1)}
                    className={btnClass}
                >
                    Sebelumnya
                </button>
                <button
                    type="button"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPage(meta.current_page + 1)}
                    className={btnClass}
                >
                    Berikutnya
                </button>
            </div>
        </div>
    );
}
