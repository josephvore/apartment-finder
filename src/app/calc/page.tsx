"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, RankBadge, SectionHeading, fmtMoney } from "@/components/ui";
import { costPerSqFt, moveInCost, totalMonthlyCost } from "@/lib/scoring";

export default function CalcPage() {
  const { state, ready } = useStore();
  const rows = useMemo(
    () =>
      [...state.apartments]
        .sort((a, b) => a.rank - b.rank)
        .map((a) => ({
          apt: a,
          rent: a.rent ?? 0,
          parking: a.parking.cost ?? 0,
          pet: a.petPolicy.allowed ? a.fees.petRent ?? 0 : 0,
          utilities: a.utilities.estimatedMonthly ?? 0,
          total: totalMonthlyCost(a),
          moveIn: moveInCost(a),
          cps: costPerSqFt(a),
        })),
    [state.apartments]
  );

  const totals = useMemo(() => {
    if (rows.length === 0) return null;
    const min = Math.min(...rows.map((r) => r.total));
    const avg = Math.round(
      rows.reduce((s, r) => s + r.total, 0) / rows.length
    );
    const max = Math.max(...rows.map((r) => r.total));
    return { min, avg, max };
  }, [rows]);

  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Cost calculator</h1>
        <p className="text-sm text-[var(--muted)]">
          Confirmed vs. estimated costs side by side. Edit any apartment to
          update rent, parking, pet rent, or utilities estimate.
        </p>
      </div>

      {totals && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="p-3">
            <div className="text-xs text-[var(--muted)]">Cheapest all-in</div>
            <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {fmtMoney(totals.min)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-[var(--muted)]">Average all-in</div>
            <div className="text-lg font-semibold tabular-nums">
              {fmtMoney(totals.avg)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-[var(--muted)]">Most expensive</div>
            <div className="text-lg font-semibold text-rose-700 dark:text-rose-300 tabular-nums">
              {fmtMoney(totals.max)}
            </div>
          </Card>
        </div>
      )}

      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map(
          ({ apt, rent, parking, pet, utilities, total, moveIn, cps }) => (
            <li key={apt.id}>
              <Card className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/apartments/${apt.id}`}
                    className="flex items-center gap-2 min-w-0 flex-1"
                  >
                    <RankBadge rank={apt.rank} />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{apt.name}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {apt.unitType || "—"}
                      </div>
                    </div>
                  </Link>
                  <div className="text-right">
                    <div className="text-xs text-[var(--muted)]">Monthly</div>
                    <div className="text-lg font-bold tabular-nums">
                      {fmtMoney(total)}
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm tabular-nums">
                  <dt className="text-[var(--muted)]">Rent</dt>
                  <dd className="text-right font-medium">{fmtMoney(rent)}</dd>
                  <dt className="text-[var(--muted)]">Parking</dt>
                  <dd className="text-right">{fmtMoney(parking)}</dd>
                  <dt className="text-[var(--muted)]">Pet rent</dt>
                  <dd className="text-right">{fmtMoney(pet)}</dd>
                  <dt className="text-[var(--muted)]">
                    <span className="italic text-amber-700 dark:text-amber-300">
                      Utilities (est)
                    </span>
                  </dt>
                  <dd className="text-right italic text-amber-700 dark:text-amber-300">
                    {fmtMoney(utilities)}
                  </dd>
                  <dt className="text-[var(--muted)] pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    Move-in
                  </dt>
                  <dd className="text-right font-medium pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    {fmtMoney(moveIn)}
                  </dd>
                  <dt className="text-[var(--muted)]">$ / sqft</dt>
                  <dd className="text-right">
                    {cps !== null ? `$${cps}` : "—"}
                  </dd>
                </dl>
              </Card>
            </li>
          )
        )}
      </ul>

      {/* Tablet+: table */}
      <Card className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Property</th>
              <th className="px-3 py-2">Rent</th>
              <th className="px-3 py-2">Parking</th>
              <th className="px-3 py-2">Pet rent</th>
              <th className="px-3 py-2">Utilities est</th>
              <th className="px-3 py-2 font-semibold">Monthly total</th>
              <th className="px-3 py-2">Move-in</th>
              <th className="px-3 py-2">$/sqft</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(
              ({ apt, rent, parking, pet, utilities, total, moveIn, cps }) => (
                <tr
                  key={apt.id}
                  className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-3 py-2">{apt.rank}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/apartments/${apt.id}`}
                      className="font-medium hover:underline"
                    >
                      {apt.name}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      {apt.unitType}
                    </div>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{fmtMoney(rent)}</td>
                  <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-400">
                    {fmtMoney(parking)}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-400">
                    {fmtMoney(pet)}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-amber-700 dark:text-amber-300 italic">
                    {fmtMoney(utilities)}
                  </td>
                  <td className="px-3 py-2 tabular-nums font-semibold">
                    {fmtMoney(total)}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{fmtMoney(moveIn)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {cps !== null ? `$${cps}` : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <SectionHeading>Legend</SectionHeading>
        <ul className="text-xs space-y-1 text-[var(--muted)]">
          <li>
            <span className="text-[var(--foreground)] font-medium">
              Rent & parking & pet rent
            </span>{" "}
            — pulled from confirmed/listed numbers.
          </li>
          <li>
            <span className="text-amber-700 dark:text-amber-300 italic">
              Utilities est
            </span>{" "}
            — tenant-entered estimate; varies by season and unit. Edit on the
            apartment page.
          </li>
          <li>
            <span className="text-[var(--foreground)] font-medium">Move-in</span>{" "}
            = first month rent + application + admin + deposit + pet deposit +
            pet fee (if pets allowed).
          </li>
        </ul>
      </Card>
    </div>
  );
}
