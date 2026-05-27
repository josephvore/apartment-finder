"use client";

import Link from "next/link";
import { use, useState } from "react";
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
  fmtSqft,
} from "@/components/ui";
import {
  costPerSqFt,
  moveInCost,
  totalMonthlyCost,
  weightedScore,
} from "@/lib/scoring";
import { Comment, SCORE_CATEGORY_LABELS } from "@/lib/types";

export default function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    state,
    addComment,
    removeComment,
    addSource,
    removeSource,
    upsertApartment,
  } = useStore();
  const apt = state.apartments.find((a) => a.id === id);
  const [draft, setDraft] = useState("");
  const [draftCat, setDraftCat] = useState<Comment["category"]>("general");
  const [srcUrl, setSrcUrl] = useState("");
  const [srcNotes, setSrcNotes] = useState("");

  if (!apt) {
    return (
      <div>
        <p>Apartment not found.</p>
        <Link href="/" className="underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const score = weightedScore(apt.scores, state.weights);
  const total = totalMonthlyCost(apt);
  const moveIn = moveInCost(apt);
  const cps = costPerSqFt(apt);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <RankBadge rank={apt.rank} />
          <div>
            <h1 className="text-2xl font-bold">{apt.name}</h1>
            <p className="text-sm text-[var(--muted)]">
              {apt.neighborhood} • {apt.address}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <StatusBadge status={apt.status} />
              <RedFlagBadge count={apt.redFlags.length} />
              {apt.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  apt.confidence === "high"
                    ? "bg-emerald-50 text-emerald-700"
                    : apt.confidence === "medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                confidence: {apt.confidence}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScorePill score={score} />
          <Link
            href={`/apartments/${apt.id}/edit`}
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
          >
            Edit
          </Link>
          {apt.website && (
            <a
              href={apt.website}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded border border-slate-300 text-sm"
            >
              Visit site ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-xs text-[var(--muted)]">Rent</div>
          <div className="text-lg font-semibold">{fmtMoney(apt.rent)}</div>
          {apt.rentRangeLow !== null && apt.rentRangeHigh !== null && (
            <div className="text-xs text-slate-500">
              {fmtMoney(apt.rentRangeLow)}–{fmtMoney(apt.rentRangeHigh)}
            </div>
          )}
        </Card>
        <Card className="p-3">
          <div className="text-xs text-[var(--muted)]">Est. monthly</div>
          <div className="text-lg font-semibold">{fmtMoney(total)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-[var(--muted)]">Move-in cost</div>
          <div className="text-lg font-semibold">{fmtMoney(moveIn)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-[var(--muted)]">$/sqft</div>
          <div className="text-lg font-semibold">
            {cps !== null ? `$${cps}` : "—"}
          </div>
          <div className="text-xs text-slate-500">{fmtSqft(apt.squareFeet)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-[var(--muted)]">Unit type</div>
          <div className="text-lg font-semibold">{apt.unitType || "—"}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-2">
          <SectionHeading>Pros</SectionHeading>
          {apt.pros.length === 0 ? (
            <p className="text-sm text-slate-500">None added.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {apt.pros.map((p, i) => (
                <li key={i} className="text-emerald-800">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5 space-y-2">
          <SectionHeading>Cons</SectionHeading>
          {apt.cons.length === 0 ? (
            <p className="text-sm text-slate-500">None added.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {apt.cons.map((c, i) => (
                <li key={i} className="text-rose-800">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </Card>
        {apt.redFlags.length > 0 && (
          <Card className="p-5 space-y-2 bg-rose-50 border-rose-200">
            <SectionHeading>⚠ Red flags</SectionHeading>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {apt.redFlags.map((c, i) => (
                <li key={i} className="text-red-900">
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {apt.unknowns.length > 0 && (
          <Card className="p-5 space-y-2 bg-amber-50 border-amber-200">
            <SectionHeading>Unknowns</SectionHeading>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {apt.unknowns.map((c, i) => (
                <li key={i} className="text-amber-900">
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {apt.followUpQuestions.length > 0 && (
          <Card className="p-5 space-y-2">
            <SectionHeading>Follow-up questions</SectionHeading>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {apt.followUpQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </Card>
        )}
        {apt.dealbreakers.length > 0 && (
          <Card className="p-5 space-y-2 bg-red-50 border-red-200">
            <SectionHeading>Dealbreakers</SectionHeading>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {apt.dealbreakers.map((c, i) => (
                <li key={i} className="text-red-900 font-medium">
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card className="p-5 space-y-3">
        <SectionHeading>Fees, parking, pets, utilities</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Fees
            </div>
            <ul className="space-y-0.5">
              <li>Application: {fmtMoney(apt.fees.application)}</li>
              <li>Admin: {fmtMoney(apt.fees.admin)}</li>
              <li>Deposit: {fmtMoney(apt.fees.deposit)}</li>
              <li>Parking: {fmtMoney(apt.fees.parking ?? apt.parking.cost)}</li>
              <li>Pet deposit: {fmtMoney(apt.fees.petDeposit)}</li>
              <li>Pet fee: {fmtMoney(apt.fees.petFee)}</li>
              <li>Pet rent: {fmtMoney(apt.fees.petRent)}</li>
              {apt.fees.other.map((o, i) => (
                <li key={i} className="text-slate-600">
                  • {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Pets
            </div>
            <ul className="space-y-0.5">
              <li>Allowed: {apt.petPolicy.allowed ? "Yes" : "No"}</li>
              <li>Species: {apt.petPolicy.speciesAllowed || "—"}</li>
              <li>Max pets: {apt.petPolicy.maxPets ?? "—"}</li>
              <li>
                Weight limit:{" "}
                {apt.petPolicy.weightLimit
                  ? `${apt.petPolicy.weightLimit} lb`
                  : "—"}
              </li>
              <li>Breeds: {apt.petPolicy.breedRestrictions || "—"}</li>
              {apt.petPolicy.petAmenities.length > 0 && (
                <li>Amenities: {apt.petPolicy.petAmenities.join(", ")}</li>
              )}
              {apt.petPolicy.notes && (
                <li className="text-slate-600">{apt.petPolicy.notes}</li>
              )}
            </ul>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Parking
            </div>
            <ul className="space-y-0.5">
              <li>Available: {apt.parking.available ? "Yes" : "No"}</li>
              <li>Covered: {apt.parking.covered ? "Yes" : "No"}</li>
              <li>Cost: {fmtMoney(apt.parking.cost)}/mo</li>
              {apt.parking.notes && (
                <li className="text-slate-600">{apt.parking.notes}</li>
              )}
            </ul>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Utilities
            </div>
            <ul className="space-y-0.5">
              <li>
                Included:{" "}
                {apt.utilities.included.length
                  ? apt.utilities.included.join(", ")
                  : "—"}
              </li>
              <li>
                Tenant pays:{" "}
                {apt.utilities.tenantPaid.length
                  ? apt.utilities.tenantPaid.join(", ")
                  : "—"}
              </li>
              <li>
                Est. monthly: {fmtMoney(apt.utilities.estimatedMonthly)}
              </li>
            </ul>
          </div>
        </div>
        {apt.amenities.length > 0 && (
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Amenities
            </div>
            <div className="flex flex-wrap gap-1">
              {apt.amenities.map((a, i) => (
                <Tag key={i}>{a}</Tag>
              ))}
            </div>
          </div>
        )}
        {apt.locationNotes && (
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Location notes
            </div>
            <p className="text-sm">{apt.locationNotes}</p>
          </div>
        )}
        {apt.availability && (
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Availability
            </div>
            <p className="text-sm">{apt.availability}</p>
          </div>
        )}
        {apt.leaseTerms && (
          <div>
            <div className="text-xs text-[var(--muted)] uppercase mb-1">
              Lease terms
            </div>
            <p className="text-sm">{apt.leaseTerms}</p>
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Scores</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {(
            Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
          ).map((k) => (
            <div key={k} className="bg-slate-50 rounded p-2">
              <div className="text-xs text-[var(--muted)]">
                {SCORE_CATEGORY_LABELS[k]}
              </div>
              <div className="font-semibold">
                {apt.scores[k] !== null ? apt.scores[k] : "—"} / 10
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Reviews</SectionHeading>
        {apt.reviewSummary.rating !== null && (
          <p className="text-sm">
            <span className="font-semibold">{apt.reviewSummary.rating}</span> / 5{" "}
            {apt.reviewSummary.reviewCount &&
              `from ${apt.reviewSummary.reviewCount} reviews`}{" "}
            {apt.reviewSummary.source && `• ${apt.reviewSummary.source}`}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {apt.reviewSummary.commonPraise.length > 0 && (
            <div>
              <div className="text-xs text-emerald-700 uppercase mb-1">
                Common praise
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {apt.reviewSummary.commonPraise.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {apt.reviewSummary.commonComplaints.length > 0 && (
            <div>
              <div className="text-xs text-rose-700 uppercase mb-1">
                Common complaints
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {apt.reviewSummary.commonComplaints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Sources</SectionHeading>
        {apt.sources.length === 0 ? (
          <p className="text-sm text-slate-500">No sources added.</p>
        ) : (
          <ul className="space-y-2">
            {apt.sources.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--accent)] hover:underline break-all"
                  >
                    {s.url}
                  </a>
                  <div className="text-xs text-slate-500">
                    {s.type} • {s.dateAccessed} • confidence {s.confidence}
                  </div>
                  {s.notes && <div className="text-xs">{s.notes}</div>}
                </div>
                <button
                  onClick={() => removeSource(apt.id, s.id)}
                  className="text-xs text-rose-700"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <input
            placeholder="https://…"
            value={srcUrl}
            onChange={(e) => setSrcUrl(e.target.value)}
          />
          <input
            placeholder="What this source confirms"
            value={srcNotes}
            onChange={(e) => setSrcNotes(e.target.value)}
          />
          <button
            onClick={() => {
              if (!srcUrl.trim()) return;
              addSource(apt.id, {
                url: srcUrl.trim(),
                type: "listing",
                dateAccessed: new Date().toISOString().slice(0, 10),
                notes: srcNotes.trim(),
                confidence: "medium",
              });
              setSrcUrl("");
              setSrcNotes("");
            }}
            className="px-3 py-1.5 rounded bg-slate-900 text-white"
          >
            Add source
          </button>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Notes &amp; comments</SectionHeading>
        {apt.comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {apt.comments
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((c) => (
                <li
                  key={c.id}
                  className="border border-slate-200 rounded p-2 text-sm"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-medium">{c.category}</span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{c.body}</p>
                  <button
                    onClick={() => removeComment(apt.id, c.id)}
                    className="text-xs text-rose-700 mt-1"
                  >
                    remove
                  </button>
                </li>
              ))}
          </ul>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={draftCat}
              onChange={(e) =>
                setDraftCat(e.target.value as Comment["category"])
              }
              className="!w-auto"
            >
              <option value="general">general</option>
              <option value="tour">tour</option>
              <option value="question">question</option>
              <option value="concern">concern</option>
              <option value="decision">decision</option>
              <option value="followup">follow-up</option>
            </select>
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a note…"
            />
          </div>
          <button
            onClick={() => {
              if (!draft.trim()) return;
              addComment(apt.id, draft.trim(), draftCat);
              setDraft("");
            }}
            className="self-end px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
          >
            Add comment
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeading
          right={
            <span className="text-xs text-slate-500">
              Last updated {new Date(apt.updatedAt).toLocaleString()}
            </span>
          }
        >
          Quick status change
        </SectionHeading>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "Interested",
              "Strong contender",
              "Needs research",
              "Scheduled tour",
              "Applied",
              "Rejected",
              "Archived",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => upsertApartment({ ...apt, status: s })}
              className={`px-3 py-1.5 rounded text-xs border ${
                apt.status === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-300 bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
