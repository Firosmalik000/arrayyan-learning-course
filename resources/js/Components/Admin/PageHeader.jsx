export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            <div>
                <h1 className="text-xl font-bold text-slate-800 xs:text-2xl">{title}</h1>
                {subtitle && <p className="mt-1 text-xs text-slate-600 xs:text-sm">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
    );
}
