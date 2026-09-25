import { useState } from 'react';

/**
 * Reusable accessible Accordion component for FAQs and collapsible content.
 *
 * @param {Array<{ id: string|number, question: string, answer: string }>} items
 * @param {boolean} allowMultiple Whether multiple items can be opened at once
 * @param {string} className Additional container class
 */
export default function Accordion({ items = [], allowMultiple = false, className = '' }) {
    const [openIndexes, setOpenIndexes] = useState([0]); // First item open by default

    const toggleIndex = (index) => {
        if (allowMultiple) {
            setOpenIndexes((prev) =>
                prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
            );
        } else {
            setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {items.map((item, index) => {
                const isOpen = openIndexes.includes(index);
                const question = item.question || item.q || item.title || '';
                const answer = item.answer || item.a || item.content || '';

                return (
                    <div
                        key={item.id || index}
                        className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                            isOpen
                                ? 'border-violet-300/80 bg-white shadow-md ring-2 ring-violet-500/10'
                                : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => toggleIndex(index)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors"
                        >
                            <span className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                {question}
                            </span>
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                                    isOpen
                                        ? 'rotate-180 bg-violet-100 text-brand-primary'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </span>
                        </button>

                        {isOpen && (
                            <div className="border-t border-slate-100 px-5 pb-5 sm:px-6 sm:pb-6 pt-3 text-xs sm:text-sm leading-relaxed text-slate-600 animate-in fade-in duration-200">
                                {answer}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
