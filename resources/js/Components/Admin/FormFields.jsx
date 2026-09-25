const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

export function FormInput({ label, type = 'text', value, onChange, placeholder, required, error }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
                required={required}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

export function FormSelect({ label, value, onChange, options = [], required, error, placeholder }) {
    const hasEmptyOption = options.some((opt) => (typeof opt === 'string' ? opt : opt.value) === '');
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
                required={required}
            >
                {!hasEmptyOption && <option value="">{placeholder || `Pilih ${label}`}</option>}
                {options.map((opt) => {
                    const optionValue = typeof opt === 'string' ? opt : opt.value;
                    const optionLabel = typeof opt === 'string' ? opt : opt.label;
                    return (
                        <option key={optionValue} value={optionValue}>
                            {optionLabel}
                        </option>
                    );
                })}
            </select>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

export function FormTextarea({ label, value, onChange, placeholder, rows = 3, error }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
            <textarea
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`${inputClass} resize-none`}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

export function FormCheckbox({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700">
            <input
                type="checkbox"
                checked={!!checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            {label}
        </label>
    );
}
