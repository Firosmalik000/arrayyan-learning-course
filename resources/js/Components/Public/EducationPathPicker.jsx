const toneStyles = {
    emerald: {
        idle: 'border-slate-200 bg-white text-emerald-950 hover:border-emerald-300 hover:bg-emerald-50',
        badge: 'bg-emerald-100 text-emerald-800',
    },
    amber: {
        idle: 'border-slate-200 bg-white text-amber-950 hover:border-amber-300 hover:bg-amber-50',
        badge: 'bg-amber-100 text-amber-800',
    },
    violet: {
        idle: 'border-slate-200 bg-white text-violet-950 hover:border-violet-300 hover:bg-violet-50',
        badge: 'bg-violet-100 text-violet-800',
    },
};

export default function EducationPathPicker({
    options = [],
    items = [],
    selectedLevel,
    selectedGrade,
    onLevelChange,
    onGradeChange,
    onReset,
    tone = 'emerald',
    itemLabel = 'koleksi',
    compact = false,
}) {
    const styles = toneStyles[tone] || toneStyles.emerald;
    const activeOption = options.find((option) => option.value === selectedLevel);
    const activeGrade = activeOption?.grades.find((grade) => grade.value === selectedGrade);

    const levelCount = (level) => items.filter((item) => item.education_levels?.includes(level)).length;
    const gradeCount = (grade) => items.filter((item) => {
        if (!item.education_levels?.includes(selectedLevel)) return false;
        return !item.grades?.length || item.grades.includes(grade);
    }).length;

    const goToLevels = () => {
        if (onReset) {
            onReset();
            return;
        }

        onLevelChange('');
        onGradeChange('');
    };

    return (
        <section className={`${compact ? '' : 'mx-auto mt-9 max-w-5xl'} rounded-2xl bg-white ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7'} shadow-sm ring-1 ring-slate-200`} aria-labelledby="education-path-title">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold" aria-label="Posisi katalog">
                <button type="button" onClick={goToLevels} className={`${selectedLevel ? 'text-slate-500 hover:text-slate-900' : 'text-slate-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300`}>
                    Jenjang
                </button>
                {selectedLevel && (
                    <>
                        <span className="text-slate-300">/</span>
                        <button
                            type="button"
                            onClick={() => onGradeChange('')}
                            className={`${selectedGrade ? 'text-slate-500 hover:text-slate-900' : 'text-slate-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300`}
                        >
                            {activeOption?.label || selectedLevel}
                        </button>
                    </>
                )}
                {selectedGrade && (
                    <>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900">{activeGrade?.label || `Kelas ${selectedGrade}`}</span>
                    </>
                )}
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-5">
                <h2 id="education-path-title" className={`${compact ? 'text-lg' : 'font-display text-xl sm:text-2xl'} font-bold tracking-tight text-slate-900`}>
                    {!selectedLevel
                        ? 'Pilih jenjang pendidikan'
                        : !selectedGrade
                            ? `Pilih kelas ${activeOption?.label || selectedLevel}`
                            : `${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} ${activeGrade?.label || selectedGrade}`}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                    {!selectedLevel
                        ? 'Buka salah satu jenjang untuk melihat daftar kelas.'
                        : !selectedGrade
                            ? 'Pilih kelas untuk membuka daftar materi yang tersedia.'
                            : `Menampilkan ${itemLabel} untuk ${activeOption?.label || selectedLevel}, ${activeGrade?.label || selectedGrade}.`}
                </p>
            </div>

            {!selectedLevel && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {options.map((option) => {
                        const count = levelCount(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={count === 0}
                                onClick={() => onLevelChange(option.value)}
                                className={`group flex min-h-20 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${styles.idle}`}
                            >
                                <span>
                                    <span className="block text-base font-bold">{option.label}</span>
                                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles.badge}`}>
                                        {count} {itemLabel}
                                    </span>
                                </span>
                                <svg className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedLevel && !selectedGrade && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {activeOption.grades.map((grade) => {
                            const count = gradeCount(grade.value);
                            return (
                                <button
                                    key={grade.value}
                                    type="button"
                                    disabled={count === 0}
                                    onClick={() => onGradeChange(grade.value)}
                                    className={`group flex min-h-16 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${styles.idle}`}
                                >
                                    <span>
                                        <span className="block font-bold">{grade.label}</span>
                                        <span className="mt-0.5 block text-xs font-medium opacity-70">{count} {itemLabel}</span>
                                    </span>
                                    <svg className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            );
                        })}
                </div>
            )}
        </section>
    );
}
