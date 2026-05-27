"use client";

import { useId, useState } from "react";

export function ListField({
  label,
  values,
  onChange,
  placeholder,
  colorClass = "bg-slate-100 text-slate-700",
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  colorClass?: string;
}) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-xs text-[var(--muted)] uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${colorClass}`}
          >
            {v}
            <button
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-current opacity-60 hover:opacity-100"
              type="button"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}…`}
          className="flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1 rounded bg-slate-900 text-white text-sm whitespace-nowrap min-h-[44px]"
        >
          Add
        </button>
      </div>
    </div>
  );
}
