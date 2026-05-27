"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  Accordion,
  Card,
  RedFlagBadge,
  ScorePill,
  SectionHeading,
  StatusBadge,
  fmtMoney,
} from "@/components/ui";
import {
  bestBy,
  bestValue,
  costPerSqFt,
  highestRisk,
  rankByScore,
  totalMonthlyCost,
  weightedScore,
} from "@/lib/scoring";
import { Apartment } from "@/lib/types";

function Spotlight({
  title,
  apt,
  reason,
}: {
  title: string;
  apt: Apartment | null;
  reason: string;
}) {
  if (!apt) {
    return (
      <Card className="p-4">
        <div className="text-xs text-[var(--muted)] uppercase">{title}</div>
        <p className="text-sm text-slate-500 mt-1">No qualifying apartment.</p>
      </Card>
    );
  }
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="text-xs text-[var(--muted)] uppercase">{title}</div>
      <Link
        href={`/apartments/${apt.id}`}
        className="font-semibold hover:underline"
      >
        {apt.name}
      </Link>
      <div className="text-xs text-[var(--muted)]">{apt.neighborhood}</div>
      <p className="text-sm">{reason}</p>
    </Card>
  );
}

export default function DecisionPage() {
  const { state, ready } = useStore();
  const apts = state.apartments;
  const weights = state.weights;

  const ranked = useMemo(() => rankByScore(apts, weights), [apts, weights]);
  const best = ranked[0]?.apt ?? null;
  const value = useMemo(() => bestValue(apts), [apts]);
  const location = useMemo(() => bestBy(apts, "location"), [apts]);
  const amenities = useMemo(() => bestBy(apts, "amenities"), [apts]);
  const risk = useMemo(() => highestRisk(apts), [apts]);
  const needsResearch = apts.filter(
    (a) =>
      a.confidence === "low" ||
      a.unknowns.length >= 3 ||
      a.missingData.length >= 3
  );
  const eliminate = apts.filter((a) => a.dealbreakers.length > 0);
  const flagged = apts.filter((a) => a.redFlags.length > 0);

  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Decision</h1>
        <p className="text-sm text-[var(--muted)]">
          Best-fit summaries derived from your scores, flags, and notes. Adjust
          weights in Settings to change rankings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Spotlight
          title="Best overall (by weighted score)"
          apt={best}
          reason={
            best
              ? `Top weighted score: ${weightedScore(
                  best.scores,
                  weights
                )?.toFixed(1)}. Strongest balance across your priorities.`
              : ""
          }
        />
        <Spotlight
          title="Best value ($/sqft)"
          apt={value}
          reason={
            value
              ? `Lowest cost per square foot: $${costPerSqFt(value)}/sqft on ${
                  value.rent ? fmtMoney(value.rent) : "?"
                } rent.`
              : ""
          }
        />
        <Spotlight
          title="Best location"
          apt={location}
          reason={
            location
              ? `Highest location score (${location.scores.location}/10). ${location.locationNotes}`
              : ""
          }
        />
        <Spotlight
          title="Best amenities"
          apt={amenities}
          reason={
            amenities
              ? `${amenities.scores.amenities}/10 amenity score. ${amenities.amenities
                  .slice(0, 5)
                  .join(", ")}…`
              : ""
          }
        />
        <Spotlight
          title="Highest risk (most red flags)"
          apt={risk && risk.redFlags.length > 0 ? risk : null}
          reason={
            risk && risk.redFlags.length > 0
              ? `${risk.redFlags.length} flag${
                  risk.redFlags.length > 1 ? "s" : ""
                }: ${risk.redFlags.slice(0, 2).join("; ")}`
              : ""
          }
        />
        <Spotlight
          title="Lowest all-in monthly"
          apt={
            [...apts].sort(
              (a, b) => totalMonthlyCost(a) - totalMonthlyCost(b)
            )[0] ?? null
          }
          reason={
            apts.length > 0
              ? `Cheapest estimated all-in monthly cost across your tracked options.`
              : ""
          }
        />
      </div>

      <Card className="p-4 sm:p-5">
        <SectionHeading>Full ranking (weighted)</SectionHeading>
        <ol className="space-y-1">
          {ranked.map(({ apt, score }, i) => (
            <li
              key={apt.id}
              className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0 py-2"
            >
              <span className="w-7 text-center text-sm font-bold text-slate-500 shrink-0">
                {i + 1}
              </span>
              <ScorePill score={score} size="sm" />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/apartments/${apt.id}`}
                  className="font-medium hover:underline truncate block"
                >
                  {apt.name}
                </Link>
                <div className="text-xs text-[var(--muted)] truncate">
                  {apt.neighborhood} • {fmtMoney(apt.rent)} •{" "}
                  {fmtMoney(totalMonthlyCost(apt))} all-in
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <StatusBadge status={apt.status} />
                <RedFlagBadge count={apt.redFlags.length} />
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <SectionHeading>Needs more research</SectionHeading>
          {needsResearch.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing flagged.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {needsResearch.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/apartments/${a.id}`}
                    className="font-medium hover:underline"
                  >
                    {a.name}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {" "}
                    — {a.confidence} confidence, {a.unknowns.length} unknowns,{" "}
                    {a.missingData.length} missing fields
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-4 sm:p-5">
          <SectionHeading>Likely eliminate (dealbreakers)</SectionHeading>
          {eliminate.length === 0 ? (
            <p className="text-sm text-slate-500">No dealbreakers logged.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {eliminate.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/apartments/${a.id}`}
                    className="font-medium hover:underline"
                  >
                    {a.name}
                  </Link>
                  <span className="text-xs text-rose-700 dark:text-rose-300">
                    {" "}
                    — {a.dealbreakers.join("; ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {flagged.length > 0 && (
        <Card className="p-2 sm:p-4 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900">
          <Accordion
            title="Biggest red flags"
            badge={
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                {flagged.length} apartment{flagged.length === 1 ? "" : "s"}
              </span>
            }
            alwaysOpenAt="md"
          >
            <ul className="space-y-2 text-sm">
              {flagged.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/apartments/${a.id}`}
                    className="font-medium hover:underline"
                  >
                    {a.name}
                  </Link>
                  <ul className="list-disc pl-5 text-xs text-red-900 dark:text-rose-100">
                    {a.redFlags.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Accordion>
        </Card>
      )}
    </div>
  );
}
