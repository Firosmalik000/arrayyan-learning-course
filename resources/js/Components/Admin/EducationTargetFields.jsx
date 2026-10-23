export default function EducationTargetFields({
    options = [],
    levels = [],
    grades = [],
    onLevelsChange,
    onGradesChange,
    errors = {},
}) {
    const selectedOptions = options.filter((option) => levels.includes(option.value));
    const toggleLevel = (level) => {
        const nextLevels = levels.includes(level)
            ? levels.filter((item) => item !== level)
            : [...levels, level];
        const nextAllowedGrades = options
            .filter((option) => nextLevels.includes(option.value))
            .flatMap((option) => option.grades.map((grade) => grade.value));

        onLevelsChange(nextLevels);
        onGradesChange(grades.filter((grade) => nextAllowedGrades.includes(grade)));
    };

    const toggleGrade = (grade) => {
        onGradesChange(
            grades.includes(grade)
                ? grades.filter((item) => item !== grade)
                : [...grades, grade]
        );
    };

    return (
        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div>
                <p className="text-sm font-semibold text-slate-800">Jenjang tujuan</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Pilih satu atau beberapa jenjang yang dapat mengakses konten ini.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {options.map((option) => {
                        const active = levels.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleLevel(option.value)}
                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${active ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'}`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
                {(errors.education_levels || errors['education_levels.0']) && (
                    <p className="mt-2 text-xs font-medium text-rose-600">{errors.education_levels || errors['education_levels.0']}</p>
                )}
            </div>

            {levels.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Kelas tujuan</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Kosongkan pilihan kelas agar konten berlaku untuk semua kelas pada jenjang terpilih.</p>
                        </div>
                        {grades.length > 0 && (
                            <button type="button" onClick={() => onGradesChange([])} className="text-xs font-semibold text-violet-700 underline underline-offset-4">
                                Pilih semua kelas
                            </button>
                        )}
                    </div>
                    <div className="mt-3 space-y-3">
                        {selectedOptions.map((option) => (
                            <div key={option.value}>
                                <p className="text-xs font-bold text-slate-500">{option.label}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {option.grades.map((grade) => {
                                        const active = grades.includes(grade.value);
                                        return (
                                            <button
                                                key={grade.value}
                                                type="button"
                                                onClick={() => toggleGrade(grade.value)}
                                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${active ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}
                                            >
                                                {grade.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    {grades.length === 0 && (
                        <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Berlaku untuk semua kelas</p>
                    )}
                    {Object.keys(errors).some((key) => key.startsWith('grades.')) && (
                        <p className="mt-2 text-xs font-medium text-rose-600">Kelas harus sesuai dengan jenjang yang dipilih.</p>
                    )}
                </div>
            )}
        </div>
    );
}
