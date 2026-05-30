"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hideDot?: boolean;
}

export function AppSelect({ value, onChange, options, placeholder, hideDot }: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen((v) => !v);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current?.contains(t) ||
        panelRef.current?.contains(t)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector('[data-selected="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [open]);

  const panelStyle: React.CSSProperties = rect
    ? { position: "fixed", top: rect.bottom + 4, left: rect.left, minWidth: rect.width }
    : { position: "fixed" };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="app-select-trigger"
        data-open={open ? "true" : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={handleToggle}
      >
        <span className="app-select-trigger-content">
          {!hideDot && (selected?.color
            ? <span className="app-select-dot" style={{ background: selected.color }} />
            : <span className="app-select-dot app-select-dot-empty" />
          )}
          <span className="app-select-value">
            {selected ? selected.label : (placeholder ?? "")}
          </span>
        </span>
        <svg
          className={`app-select-chevron${open ? " open" : ""}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={panelRef}
          className="app-select-panel"
          role="listbox"
          style={{ ...panelStyle, zIndex: 9999 }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className="app-select-item"
              data-selected={opt.value === value ? "true" : undefined}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="app-select-item-left">
                {!hideDot && (opt.color
                  ? <span className="app-select-dot" style={{ background: opt.color }} />
                  : <span className="app-select-dot app-select-dot-empty" />
                )}
                <span>{opt.label}</span>
              </span>
              {opt.value === value && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6.5L5 9.5L10 3"
                    stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
