"use client";

import { useEffect, useId, useState } from "react";
import { ApartmentStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ApartmentStatus }) {
  const colors: Record<ApartmentStatus, string> = {
    Interested: "bg-slate-100 text-slate-700",
    "Strong contender": "bg-emerald-100 text-emerald-800",
    "Needs research": "bg-amber-100 text-amber-800",
    "Scheduled tour": "bg-blue-100 text-blue-800",
    Applied: "bg-purple-100 text-purple-800",
    Rejected: "bg-rose-100 text-rose-700",
    Archived: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors[status]}`}
    >
      {status}
    </span>
  );
}

export function ScorePill({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-12 h-12 text-base"
      : size === "sm"
        ? "w-9 h-9 text-xs"
        : "w-10 h-10 text-sm";
  if (score === null) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-400 ${dim}`}
      >
        —
      </span>
    );
  }
  const color =
    score >= 8
      ? "bg-emerald-600"
      : score >= 6.5
        ? "bg-blue-600"
        : score >= 5
          ? "bg-amber-600"
          : "bg-rose-600";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${color} ${dim}`}
    >
      {score.toFixed(1)}
    </span>
  );
}

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold">
      #{rank}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3 gap-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {right}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
      {children}
    </span>
  );
}

export function RedFlagBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-700 font-medium">
      ⚠ {count} red flag{count > 1 ? "s" : ""}
    </span>
  );
}

export function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString()}`;
}

export function fmtSqft(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString()} sqft`;
}

/* -------------------- Accordion -------------------- */

export function Accordion({
  title,
  defaultOpen = false,
  alwaysOpenAt = "md",
  badge,
  children,
}: {
  title: React.ReactNode;
  defaultOpen?: boolean;
  alwaysOpenAt?: "sm" | "md" | "lg" | "never";
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const forceOpenCls =
    alwaysOpenAt === "never"
      ? ""
      : alwaysOpenAt === "sm"
        ? "sm:!grid-rows-[1fr]"
        : alwaysOpenAt === "md"
          ? "md:!grid-rows-[1fr]"
          : "lg:!grid-rows-[1fr]";
  const forceHideToggle =
    alwaysOpenAt === "never"
      ? ""
      : alwaysOpenAt === "sm"
        ? "sm:hidden"
        : alwaysOpenAt === "md"
          ? "md:hidden"
          : "lg:hidden";
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-3 py-3 px-1 min-h-[48px] text-left ${forceHideToggle ? "" : ""}`}
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-base">{title}</span>
          {badge}
        </span>
        <span
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""} ${forceHideToggle}`}
          aria-hidden
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } ${forceOpenCls}`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 pt-1 px-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Bottom Sheet -------------------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-[var(--card)] rounded-t-2xl shadow-2xl border-t border-[var(--border)] max-h-[90vh] flex flex-col"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="flex justify-center pt-2 shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>
        {title && (
          <div className="px-4 pt-2 pb-1 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-base">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-sm text-[var(--muted)] min-h-[44px] min-w-[44px]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-4 pb-4 flex-1">{children}</div>
        {footer && (
          <div className="border-t border-[var(--border)] p-3 flex items-center gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- Sticky bottom action bar -------------------- */

export function StickyActionBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`no-print sticky-action-bar ${className}`}>
      <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

/* Spacer to reserve room under sticky action bars so trailing content isn't hidden. */
export function StickyActionSpacer() {
  return <div aria-hidden className="h-16 md:h-14" />;
}
