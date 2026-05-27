"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Card,
  ScorePill,
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
  return (
    <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading…</div>}>
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const { state, ready } = useStore();
  const params = useSearchParams();
  const sorted = useMemo(
    () => [...state.apartments].sort((a, b) => a.rank - b.rank),
    [state.apartments]
  );
  const [selected, setSelected] = useState<string[]>([]);

  // Initial selection: ?ids=... or top 3 by rank
  useEffect(() => {
    if (selected.length > 0) return;
    const raw = params.get("ids");
    if (raw) {
      const ids = raw.split(",").filter((id) => sorted.some((a) => a.id === id));
      if (ids.length > 0) {
        setSelected(ids);
        return;
      }
    }
    if (sorted.length > 0) {
      setSelected(sorted.slice(0, 3).map((a) => a.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, params]);

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
    {
      label: "Utilities est",
      render: (a) => fmtMoney(a.utilities.estimatedMonthly),
    },
    { label: "Pet rent", render: (a) => fmtMoney(a.fees.petRent) },
    { label: "All-in monthly", render: (a) => fmtMoney(totalMonthlyCost(a)) },
    { label: "Move-in cost", render: (a) => fmtMoney(moveInCost(a)) },
    { label: "Application fee", render: (a) => fmtMoney(a.fees.application) },
    { label: "Deposit", render: (a) => fmtMoney(a.fees.deposit) },
    { label: "Pet deposit", render: (a) => fmtMoney(a.fees.petDeposit) },
    { label: "Pet fee", render: (a) => fmtMoney(a.fees.petFee) },
    {
      label: "Pet weight limit",
      render: (a) =>
        a.petPolicy.weightLimit ? `${a.petPolicy.weightLimit} lb` : "—",
    },
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
        <div className="flex flex-wrap gap-0.5">
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
        <ul className="list-disc pl-4 text-xs space-y-0.5 text-emerald-800 dark:text-emerald-200">
          {a.pros.slice(0, 4).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "Cons",
      render: (a) => (
        <ul className="list-disc pl-4 text-xs space-y-0.5 text-rose-800 dark:text-rose-200">
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
          <ul className="list-disc pl-4 text-xs space-y-0.5 text-red-800 dark:text-red-200">
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
      render: (a) => (
        <ScorePill score={weightedScore(a.scores, state.weights)} />
      ),
    },
  ];

  const scoreRows: Row[] = (
    Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
  ).map((k) => ({
    label: `Score: ${SCORE_CATEGORY_LABELS[k]}`,
    render: (a) => (a.scores[k] !== null ? `${a.scores[k]} / 10` : "—"),
  }));

  const allRows = [...rows, ...scoreRows];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Compare</h1>
        <p className="text-sm text-[var(--muted)]">
          Pick apartments to compare across every field. Swipe →
        </p>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="text-xs text-[var(--muted)] uppercase mb-2">
          Select apartments
        </div>
        <div className="flex flex-wrap gap-2">
          {sorted.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`min-h-[40px] px-3 rounded-full text-sm border ${
                selected.includes(a.id)
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <colgroup>
                <col className="w-[108px] sm:w-[180px]" />
                {chosen.map((a) => (
                  <col key={a.id} className="w-[220px] sm:w-[260px]" />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/80 backdrop-blur p-3 text-left text-xs text-[var(--muted)] uppercase tracking-wider font-medium border-b border-[var(--border)]">
                    Attribute
                  </th>
                  {chosen.map((a) => (
                    <th
                      key={a.id}
                      className="p-3 text-left bg-[var(--card)] border-b border-[var(--border)] border-l border-[var(--border)]"
                    >
                      <div className="font-semibold leading-tight">{a.name}</div>
                      <div className="text-xs text-[var(--muted)] font-normal">
                        #{a.rank} • {a.neighborhood}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRows.map((row, ri) => (
                  <tr
                    key={row.label}
                    className={
                      ri % 2 === 0
                        ? ""
                        : "bg-slate-50/40 dark:bg-slate-800/30"
                    }
                  >
                    <th
                      className="sticky left-0 z-10 bg-[var(--card)] p-3 text-left text-xs text-[var(--muted)] uppercase tracking-wider font-medium align-top border-r border-[var(--border)]"
                    >
                      {row.label}
                    </th>
                    {chosen.map((a) => (
                      <td
                        key={a.id}
                        className="p-3 align-top border-l border-[var(--border)]"
                      >
                        {row.render(a)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chosen.length > 1 && (
            <div className="md:hidden text-center text-xs text-[var(--muted)] py-2 border-t border-[var(--border)]">
              ← swipe horizontally to compare →
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
