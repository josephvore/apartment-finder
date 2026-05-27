"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Card,
  RankBadge,
  RedFlagBadge,
  ScorePill,
  Sheet,
  StatusBadge,
  fmtMoney,
} from "@/components/ui";
import { weightedScore, totalMonthlyCost } from "@/lib/scoring";
import { APARTMENT_STATUSES, ApartmentStatus } from "@/lib/types";

type SortKey = "rank" | "score" | "rent" | "totalCost" | "name";
type View = "cards" | "table";

const DEFAULT_MAX_RENT = 4000;

export default function DashboardPage() {
  const { state, ready, deleteApartment, reorder } = useStore();
  const [view, setView] = useState<View>("cards");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [maxRent, setMaxRent] = useState<number>(DEFAULT_MAX_RENT);
  const [statusFilter, setStatusFilter] = useState<ApartmentStatus | "">("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [petOnly, setPetOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const allTags = useMemo(
    () => Array.from(new Set(state.apartments.flatMap((a) => a.tags))).sort(),
    [state.apartments]
  );

  const filterCount = useMemo(() => {
    let n = 0;
    if (maxRent < DEFAULT_MAX_RENT) n++;
    if (statusFilter) n++;
    if (tagFilter) n++;
    if (petOnly) n++;
    return n;
  }, [maxRent, statusFilter, tagFilter, petOnly]);

  const filtered = useMemo(() => {
    return state.apartments
      .filter((a) => {
        if (a.rent !== null && a.rent > maxRent) return false;
        if (statusFilter && a.status !== statusFilter) return false;
        if (tagFilter && !a.tags.includes(tagFilter)) return false;
        if (petOnly && !a.petPolicy.allowed) return false;
        return true;
      })
      .map((a) => ({
        apt: a,
        score: weightedScore(a.scores, state.weights),
        total: totalMonthlyCost(a),
      }))
      .sort((a, b) => {
        switch (sortKey) {
          case "rank":
            return a.apt.rank - b.apt.rank;
          case "score": {
            const av = a.score ?? -Infinity;
            const bv = b.score ?? -Infinity;
            return bv - av;
          }
          case "rent":
            return (a.apt.rent ?? Infinity) - (b.apt.rent ?? Infinity);
          case "totalCost":
            return a.total - b.total;
          case "name":
            return a.apt.name.localeCompare(b.apt.name);
        }
      });
  }, [
    state.apartments,
    state.weights,
    maxRent,
    statusFilter,
    tagFilter,
    petOnly,
    sortKey,
  ]);

  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const moveRank = (id: string, dir: -1 | 1) => {
    const sorted = [...state.apartments].sort((a, b) => a.rank - b.rank);
    const idx = sorted.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    reorder(sorted.map((a) => a.id));
  };

  const resetFilters = () => {
    setMaxRent(DEFAULT_MAX_RENT);
    setStatusFilter("");
    setTagFilter("");
    setPetOnly(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">
            {state.apartments.length} option
            {state.apartments.length !== 1 ? "s" : ""} tracked •{" "}
            {filtered.length} shown
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 px-3 min-h-[44px] rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
          >
            <FilterIcon />
            Filters
            {filterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs">
                {filterCount}
              </span>
            )}
          </button>
          <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-0.5 hidden sm:flex">
            <button
              onClick={() => setView("cards")}
              className={`px-3 min-h-[40px] text-sm rounded ${
                view === "cards" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : ""
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 min-h-[40px] text-sm rounded ${
                view === "table" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : ""
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {view === "cards" || filtered.length === 0 ? (
        <ul className="space-y-3 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-4 sm:space-y-0">
          {filtered.map(({ apt, score, total }, idx) => (
            <li key={apt.id}>
              <Card className="p-4 flex flex-col gap-3 touch-card">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/apartments/${apt.id}`}
                    className="min-w-0 flex-1 -m-1 p-1 rounded-md"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <RankBadge rank={apt.rank} />
                      <span className="font-semibold text-base sm:text-lg break-words leading-snug">
                        {apt.name}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] truncate">
                      {apt.neighborhood}
                    </div>
                  </Link>
                  <ScorePill score={score} />
                </div>

                <div className="flex flex-wrap gap-1">
                  <StatusBadge status={apt.status} />
                  <RedFlagBadge count={apt.redFlags.length} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Stat label="Rent" value={fmtMoney(apt.rent)} />
                  <Stat label="All-in" value={fmtMoney(total)} />
                  <Stat label="Unit" value={apt.unitType || "—"} />
                </div>

                {apt.pros.length > 0 && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-snug line-clamp-2">
                    <span className="font-semibold">Pros:</span>{" "}
                    {apt.pros.slice(0, 2).join(" • ")}
                  </p>
                )}
                {apt.cons.length > 0 && (
                  <p className="text-sm text-rose-700 dark:text-rose-300 leading-snug line-clamp-2">
                    <span className="font-semibold">Cons:</span>{" "}
                    {apt.cons.slice(0, 2).join(" • ")}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/apartments/${apt.id}`}
                    className="px-3 min-h-[44px] inline-flex items-center rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm hover:opacity-90"
                  >
                    Open
                  </Link>
                  <Link
                    href={`/apartments/${apt.id}/edit`}
                    className="px-3 min-h-[44px] inline-flex items-center rounded border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Edit
                  </Link>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveRank(apt.id, -1)}
                      aria-label="Move rank up"
                      disabled={idx === 0}
                      className="w-11 h-11 inline-flex items-center justify-center rounded text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRank(apt.id, 1)}
                      aria-label="Move rank down"
                      disabled={idx === filtered.length - 1}
                      className="w-11 h-11 inline-flex items-center justify-center rounded text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronDown />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${apt.name}?`)) deleteApartment(apt.id);
                      }}
                      aria-label={`Delete ${apt.name}`}
                      className="w-11 h-11 inline-flex items-center justify-center rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
          {filtered.length === 0 && (
            <Card className="p-6 text-center text-sm text-[var(--muted)]">
              No apartments match your filters.{" "}
              <button onClick={resetFilters} className="underline">
                Reset
              </button>
            </Card>
          )}
        </ul>
      ) : (
        <Card className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Rent</th>
                <th className="px-3 py-2">All-in</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ apt, score, total }) => (
                <tr
                  key={apt.id}
                  className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-3 py-2 font-semibold">{apt.rank}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/apartments/${apt.id}`}
                      className="font-medium hover:underline"
                    >
                      {apt.name}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      {apt.neighborhood}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-3 py-2">{apt.unitType}</td>
                  <td className="px-3 py-2">{fmtMoney(apt.rent)}</td>
                  <td className="px-3 py-2">{fmtMoney(total)}</td>
                  <td className="px-3 py-2">
                    {score !== null ? score.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <RedFlagBadge count={apt.redFlags.length} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/apartments/${apt.id}`}
                      className="text-xs underline"
                    >
                      open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Sheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters & sort"
        footer={
          <>
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 min-h-[44px] rounded border border-[var(--border)] text-sm"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="flex-1 min-h-[44px] rounded bg-[var(--accent)] text-white text-sm font-medium"
            >
              Show {filtered.length} apartment{filtered.length === 1 ? "" : "s"}
            </button>
          </>
        }
      >
        <div className="space-y-5 py-2">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Max rent</span>
              <span className="tabular-nums text-[var(--muted)]">
                {maxRent >= DEFAULT_MAX_RENT
                  ? "any"
                  : `$${maxRent.toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={DEFAULT_MAX_RENT}
              step={50}
              value={maxRent}
              onChange={(e) => setMaxRent(parseInt(e.target.value, 10))}
              className="w-full"
              aria-label="Maximum rent"
            />
            <div className="flex justify-between text-[11px] text-[var(--muted)] mt-1 tabular-nums">
              <span>$1,000</span>
              <span>$4,000+</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Status</div>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={statusFilter === ""}
                onClick={() => setStatusFilter("")}
                label="All"
              />
              {APARTMENT_STATUSES.map((s) => (
                <FilterChip
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  label={s}
                />
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Tag</div>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={tagFilter === ""}
                  onClick={() => setTagFilter("")}
                  label="All"
                />
                {allTags.map((t) => (
                  <FilterChip
                    key={t}
                    active={tagFilter === t}
                    onClick={() => setTagFilter(t)}
                    label={t}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">Sort by</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["rank", "Rank"],
                  ["score", "Score"],
                  ["rent", "Rent ↑"],
                  ["totalCost", "All-in ↑"],
                  ["name", "Name"],
                ] as const
              ).map(([key, label]) => (
                <FilterChip
                  key={key}
                  active={sortKey === key}
                  onClick={() => setSortKey(key)}
                  label={label}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 min-h-[44px]">
            <input
              type="checkbox"
              checked={petOnly}
              onChange={(e) => setPetOnly(e.target.checked)}
              className="!w-5 !h-5"
            />
            <span className="text-sm">Pet-friendly only</span>
          </label>
        </div>
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] px-3 rounded-full text-sm border transition-colors ${
        active
          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
          : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}
function ChevronUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden>
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
