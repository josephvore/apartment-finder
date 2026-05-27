"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, SectionHeading, fmtMoney } from "@/components/ui";
import {
  costPerSqFt,
  moveInCost,
  totalMonthlyCost,
} from "@/lib/scoring";

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
  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cost calculator</h1>
        <p className="text-sm text-[var(--muted)]">
          Confirmed vs. estimated costs side by side. Edit any apartment to
          update rent, parking, pet rent, utilities estimate.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
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
                  className="border-t border-slate-100 hover:bg-slate-50"
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
                  <td className="px-3 py-2">{fmtMoney(rent)}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {fmtMoney(parking)}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{fmtMoney(pet)}</td>
                  <td className="px-3 py-2 text-amber-700 italic">
                    {fmtMoney(utilities)}
                  </td>
                  <td className="px-3 py-2 font-semibold">{fmtMoney(total)}</td>
                  <td className="px-3 py-2">{fmtMoney(moveIn)}</td>
                  <td className="px-3 py-2">
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
            <span className="text-slate-900 font-medium">Rent &amp; parking
            &amp; pet rent</span> — pulled from confirmed/listed numbers.
          </li>
          <li>
            <span className="text-amber-700 italic">Utilities est</span> —
            tenant-entered estimate; varies by season and unit. Edit on the
            apartment page.
          </li>
          <li>
            <span className="text-slate-900 font-medium">Move-in</span> = first
            month rent + application + admin + deposit + pet deposit + pet fee
            (if pets allowed).
          </li>
        </ul>
      </Card>
    </div>
  );
}
