"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  ScorePill,
  SectionHeading,
  StatusBadge,
  Tag,
  fmtMoney,
  fmtSqft,
} from "@/components/ui";
import {
  costPerSqFt,
  moveInCost,
  totalMonthlyCost,
  weightedScore,
} from "@/lib/scoring";
import { Apartment, SCORE_CATEGORY_LABELS } from "@/lib/types";

export default function ComparePage() {
  const { state, ready } = useStore();
  const sorted = useMemo(
    () => [...state.apartments].sort((a, b) => a.rank - b.rank),
    [state.apartments]
  );
  const [selected, setSelected] = useState<string[]>(() =>
    sorted.slice(0, 3).map((a) => a.id)
  );

  const toggle = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const chosen: Apartment[] = selected
    .map((id) => sorted.find((a) => a.id === id))
    .filter(Boolean) as Apartment[];

  type Row = {
    label: string;
    render: (a: Apartment) => React.ReactNode;
    sub?: boolean;
  };

  const rows: Row[] = [
    { label: "Rank", render: (a) => `#${a.rank}` },
    { label: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { label: "Neighborhood", render: (a) => a.neighborhood },
    { label: "Address", render: (a) => a.address },
    { label: "Unit type", render: (a) => a.unitType || "—" },
    { label: "Square feet", render: (a) => fmtSqft(a.squareFeet) },
    { label: "Rent", render: (a) => fmtMoney(a.rent) },
    {
      label: "Rent range",
      render: (a) =>
        a.rentRangeLow !== null && a.rentRangeHigh !== null
          ? `${fmtMoney(a.rentRangeLow)} – ${fmtMoney(a.rentRangeHigh)}`
          : "—",
    },
    {
      label: "$ / sqft",
      render: (a) => {
        const c = costPerSqFt(a);
        return c !== null ? `$${c}` : "—";
      },
    },
    { label: "Parking / mo", render: (a) => fmtMoney(a.parking.cost) },
    { label: "Utilities est", render: (a) => fmtMoney(a.utilities.estimatedMonthly) },
    { label: "Pet rent", render: (a) => fmtMoney(a.fees.petRent) },
    { label: "All-in monthly", render: (a) => fmtMoney(totalMonthlyCost(a)) },
    { label: "Move-in cost", render: (a) => fmtMoney(moveInCost(a)) },
    { label: "Application fee", render: (a) => fmtMoney(a.fees.application) },
    { label: "Deposit", render: (a) => fmtMoney(a.fees.deposit) },
    { label: "Pet deposit", render: (a) => fmtMoney(a.fees.petDeposit) },
    { label: "Pet fee", render: (a) => fmtMoney(a.fees.petFee) },
    { label: "Pet weight limit", render: (a) => a.petPolicy.weightLimit ? `${a.petPolicy.weightLimit} lb` : "—" },
    { label: "Max pets", render: (a) => a.petPolicy.maxPets ?? "—" },
    {
      label: "Pet amenities",
      render: (a) =>
        a.petPolicy.petAmenities.length
          ? a.petPolicy.petAmenities.join(", ")
          : "—",
    },
    {
      label: "Amenities",
      render: (a) => (
        <div className="flex flex-wrap gap-0.5 max-w-[260px]">
          {a.amenities.slice(0, 8).map((x, i) => (
            <Tag key={i}>{x}</Tag>
          ))}
          {a.amenities.length > 8 && (
            <span className="text-xs text-slate-500">
              +{a.amenities.length - 8}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Pros",
      render: (a) => (
        <ul className="list-disc pl-4 text-xs space-y-0.5 text-emerald-800">
          {a.pros.slice(0, 4).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "Cons",
      render: (a) => (
        <ul className="list-disc pl-4 text-xs space-y-0.5 text-rose-800">
          {a.cons.slice(0, 4).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "Red flags",
      render: (a) =>
        a.redFlags.length ? (
          <ul className="list-disc pl-4 text-xs space-y-0.5 text-red-800">
            {a.redFlags.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : (
          "—"
        ),
    },
    {
      label: "Overall score",
      render: (a) => <ScorePill score={weightedScore(a.scores, state.weights)} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Side-by-side comparison</h1>
          <p className="text-sm text-[var(--muted)]">
            Pick any number of apartments to compare across every field.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <SectionHeading>Select apartments to compare</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {sorted.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                selected.includes(a.id)
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              #{a.rank} {a.name}
            </button>
          ))}
        </div>
      </Card>

      {chosen.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Select at least one apartment above.
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left w-44">Attribute</th>
                {chosen.map((a) => (
                  <th key={a.id} className="px-3 py-2 text-left min-w-[220px]">
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-[var(--muted)] font-normal">
                      {a.neighborhood}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-slate-100 align-top">
                  <th className="px-3 py-2 text-left text-xs text-[var(--muted)] uppercase tracking-wider font-medium">
                    {row.label}
                  </th>
                  {chosen.map((a) => (
                    <td key={a.id} className="px-3 py-2">
                      {row.render(a)}
                    </td>
                  ))}
                </tr>
              ))}
              {(
                Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
              ).map((k) => (
                <tr key={k} className="border-t border-slate-100 align-top">
                  <th className="px-3 py-2 text-left text-xs text-[var(--muted)] font-medium">
                    Score: {SCORE_CATEGORY_LABELS[k]}
                  </th>
                  {chosen.map((a) => (
                    <td key={a.id} className="px-3 py-2 text-sm">
                      {a.scores[k] !== null ? `${a.scores[k]} / 10` : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
