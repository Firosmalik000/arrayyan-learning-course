import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';

export default function ActionDropdown({ items, actions, label = 'Aksi' }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const rawItems = items ?? actions ?? [];
    const visibleItems = rawItems.filter(Boolean);

    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 192;
            const menuHeight = 200;

            const spaceBelow = window.innerHeight - rect.bottom;
            const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;

            let left = rect.left;
            if (left + menuWidth > window.innerWidth - 12) {
                left = window.innerWidth - menuWidth - 12;
            }
            if (left < 12) left = 12;

            const top = openUp ? Math.max(12, rect.top - menuHeight - 6) : rect.bottom + 6;

            setPosition({ top, left });
        };

        updatePosition();

        function handleScroll(e) {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            setIsOpen(false);
        }

        function handleClickOutside(e) {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        }

        function handleEscape(e) {
            if (e.key === 'Escape') setIsOpen(false);
        }

        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    if (visibleItems.length === 0) return null;

    return (
        <div className="relative inline-block text-left">
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    isOpen
                        ? 'border-violet-300 bg-violet-50 text-violet-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 shadow-2xs'
                }`}
                title={label}
                aria-label={label}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </button>

            {isOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                        className="z-[9999] min-w-[170px] rounded-2xl border border-slate-200/95 bg-white p-1.5 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
                        role="menu"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                            Pilihan Aksi
                        </div>
                        <div className="space-y-0.5">
                            {visibleItems.map((item, index) => {
                                if (item.divider) {
                                    return <hr key={index} className="my-1 border-slate-100" />;
                                }

                                const itemClasses = `flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition text-left ${
                                    item.danger
                                        ? 'text-rose-600 hover:bg-rose-50'
                                        : item.primary
                                        ? 'text-violet-700 hover:bg-violet-50 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`;

                                const content = (
                                    <>
                                        {item.icon && <span className="shrink-0">{item.icon}</span>}
                                        <span className="truncate">{item.label}</span>
                                    </>
                                );

                                if (item.href) {
                                    if (item.isExternal || item.external) {
                                        return (
                                            <a
                                                key={index}
                                                href={item.href}
                                                target={item.target || '_blank'}
                                                rel="noopener noreferrer"
                                                className={itemClasses}
                                                onClick={() => setIsOpen(false)}
                                                role="menuitem"
                                            >
                                                {content}
                                            </a>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={itemClasses}
                                            onClick={() => setIsOpen(false)}
                                            role="menuitem"
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            if (item.onClick) item.onClick();
                                        }}
                                        className={itemClasses}
                                        role="menuitem"
                                    >
                                        {content}
                                    </button>
                                );
                            })}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
