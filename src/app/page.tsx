"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Card,
  RankBadge,
  RedFlagBadge,
  ScorePill,
  SectionHeading,
  StatusBadge,
  Tag,
  fmtMoney,
} from "@/components/ui";
import { weightedScore, totalMonthlyCost } from "@/lib/scoring";
import { APARTMENT_STATUSES, ApartmentStatus } from "@/lib/types";

type SortKey = "rank" | "score" | "rent" | "totalCost" | "name";
type View = "cards" | "table";

export default function DashboardPage() {
  const { state, ready, deleteApartment, reorder } = useStore();
  const [view, setView] = useState<View>("cards");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [maxRent, setMaxRent] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ApartmentStatus | "">("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [petOnly, setPetOnly] = useState(false);

  const allTags = useMemo(
    () => Array.from(new Set(state.apartments.flatMap((a) => a.tags))).sort(),
    [state.apartments]
  );

  const filtered = useMemo(() => {
    const max = maxRent ? parseInt(maxRent, 10) : Infinity;
    return state.apartments
      .filter((a) => {
        if (a.rent !== null && a.rent > max) return false;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Apartment Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">
            {state.apartments.length} option
            {state.apartments.length !== 1 ? "s" : ""} tracked •{" "}
            {filtered.length} shown
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="rounded-md border border-[var(--border)] bg-white p-0.5 flex">
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-1 text-sm rounded ${
                view === "cards" ? "bg-slate-900 text-white" : ""
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1 text-sm rounded ${
                view === "table" ? "bg-slate-900 text-white" : ""
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <SectionHeading>Filters &amp; sort</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-[var(--muted)]">Max rent</span>
            <input
              type="number"
              placeholder="e.g. 2400"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--muted)]">Status</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApartmentStatus | "")
              }
            >
              <option value="">All</option>
              {APARTMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--muted)]">Tag</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="">All</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--muted)]">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="rank">Rank</option>
              <option value="score">Score</option>
              <option value="rent">Rent (low → high)</option>
              <option value="totalCost">Total monthly cost</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={petOnly}
              onChange={(e) => setPetOnly(e.target.checked)}
              className="!w-4 !h-4"
            />
            <span>Pet-friendly only</span>
          </label>
        </div>
      </Card>

      {view === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(({ apt, score, total }) => (
            <Card key={apt.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex flex-col items-center gap-1">
                    <RankBadge rank={apt.rank} />
                    <div className="flex flex-col">
                      <button
                        className="text-xs text-slate-500 hover:text-slate-900"
                        onClick={() => moveRank(apt.id, -1)}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        className="text-xs text-slate-500 hover:text-slate-900"
                        onClick={() => moveRank(apt.id, 1)}
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/apartments/${apt.id}`}
                      className="font-semibold text-lg hover:underline truncate block"
                    >
                      {apt.name}
                    </Link>
                    <div className="text-xs text-[var(--muted)] truncate">
                      {apt.neighborhood} • {apt.address}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <StatusBadge status={apt.status} />
                      <RedFlagBadge count={apt.redFlags.length} />
                      {apt.tags.slice(0, 3).map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
                <ScorePill score={score} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-xs text-[var(--muted)]">Rent</div>
                  <div className="font-medium">{fmtMoney(apt.rent)}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">All-in</div>
                  <div className="font-medium">{fmtMoney(total)}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)]">Unit</div>
                  <div className="font-medium">{apt.unitType || "—"}</div>
                </div>
              </div>

              {apt.pros.length > 0 && (
                <div className="text-xs">
                  <div className="text-emerald-700 font-semibold mb-0.5">
                    Pros
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {apt.pros.slice(0, 2).map((p, i) => (
                      <li key={i} className="truncate">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {apt.cons.length > 0 && (
                <div className="text-xs">
                  <div className="text-rose-700 font-semibold mb-0.5">Cons</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {apt.cons.slice(0, 2).map((c, i) => (
                      <li key={i} className="truncate">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                <Link
                  href={`/apartments/${apt.id}`}
                  className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs hover:bg-slate-700"
                >
                  Open
                </Link>
                <Link
                  href={`/apartments/${apt.id}/edit`}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${apt.name}?`)) deleteApartment(apt.id);
                  }}
                  className="ml-auto px-3 py-1.5 rounded text-xs text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
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
                  className="border-t border-slate-100 hover:bg-slate-50"
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
    </div>
  );
}
