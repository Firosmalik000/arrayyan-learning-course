export default function PlaceholderPanel({ title, description }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
    );
}
