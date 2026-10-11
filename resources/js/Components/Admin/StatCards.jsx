export default function StatCards({ items = [] }) {
    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
            {items.map((stat) => (
                <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
                    <p className="text-xs xs:text-sm font-medium">{stat.label}</p>
                    <p className="mt-1 text-xl xs:text-2xl font-bold">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}
