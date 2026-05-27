"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import {
  Accordion,
  Card,
  RankBadge,
  RedFlagBadge,
  ScorePill,
  Sheet,
  StatusBadge,
  StickyActionBar,
  StickyActionSpacer,
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
  const [noteSheet, setNoteSheet] = useState(false);

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
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <RankBadge rank={apt.rank} />
              <h1 className="text-xl sm:text-2xl font-bold leading-tight break-words">
                {apt.name}
              </h1>
            </div>
            <p className="text-sm text-[var(--muted)]">{apt.neighborhood}</p>
            <p className="text-xs text-[var(--muted)] break-words">{apt.address}</p>
          </div>
          <ScorePill score={score} size="lg" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={apt.status} />
          <RedFlagBadge count={apt.redFlags.length} />
          {apt.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              apt.confidence === "high"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                : apt.confidence === "medium"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
            }`}
          >
            confidence: {apt.confidence}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        <KpiCard label="Rent" value={fmtMoney(apt.rent)} sub={
          apt.rentRangeLow !== null && apt.rentRangeHigh !== null
            ? `${fmtMoney(apt.rentRangeLow)}–${fmtMoney(apt.rentRangeHigh)}`
            : undefined
        } />
        <KpiCard label="Est. monthly" value={fmtMoney(total)} />
        <KpiCard label="Move-in" value={fmtMoney(moveIn)} />
        <KpiCard
          label="$/sqft"
          value={cps !== null ? `$${cps}` : "—"}
          sub={fmtSqft(apt.squareFeet)}
        />
        <KpiCard label="Unit" value={apt.unitType || "—"} />
      </div>

      {(apt.pros.length > 0 || apt.cons.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {apt.pros.length > 0 && (
            <Card className="p-4 sm:p-5 space-y-2">
              <h2 className="text-base font-semibold">Pros</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {apt.pros.map((p, i) => (
                  <li key={i} className="text-emerald-800 dark:text-emerald-200">
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {apt.cons.length > 0 && (
            <Card className="p-4 sm:p-5 space-y-2">
              <h2 className="text-base font-semibold">Cons</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {apt.cons.map((c, i) => (
                  <li key={i} className="text-rose-800 dark:text-rose-200">
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {(apt.redFlags.length > 0 ||
        apt.dealbreakers.length > 0 ||
        apt.unknowns.length > 0 ||
        apt.followUpQuestions.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {apt.redFlags.length > 0 && (
            <Card className="p-4 sm:p-5 space-y-2 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900">
              <h2 className="text-base font-semibold">⚠ Red flags</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {apt.redFlags.map((c, i) => (
                  <li key={i} className="text-red-900 dark:text-rose-100">
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {apt.dealbreakers.length > 0 && (
            <Card className="p-4 sm:p-5 space-y-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
              <h2 className="text-base font-semibold">Dealbreakers</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {apt.dealbreakers.map((c, i) => (
                  <li key={i} className="text-red-900 dark:text-red-100 font-medium">
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {apt.unknowns.length > 0 && (
            <Card className="p-4 sm:p-5 space-y-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
              <h2 className="text-base font-semibold">Unknowns</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {apt.unknowns.map((c, i) => (
                  <li key={i} className="text-amber-900 dark:text-amber-100">
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {apt.followUpQuestions.length > 0 && (
            <Card className="p-4 sm:p-5 space-y-2">
              <h2 className="text-base font-semibold">Follow-up questions</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {apt.followUpQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <Card className="p-2 sm:p-4">
        <Accordion title="Fees, parking, pets, utilities" defaultOpen alwaysOpenAt="md">
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
                  <li key={i} className="text-slate-600 dark:text-slate-400">
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
                  <li className="text-slate-600 dark:text-slate-400">
                    {apt.petPolicy.notes}
                  </li>
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
                  <li className="text-slate-600 dark:text-slate-400">
                    {apt.parking.notes}
                  </li>
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
            <div className="mt-3">
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
            <div className="mt-3">
              <div className="text-xs text-[var(--muted)] uppercase mb-1">
                Location notes
              </div>
              <p className="text-sm">{apt.locationNotes}</p>
            </div>
          )}
          {apt.availability && (
            <div className="mt-3">
              <div className="text-xs text-[var(--muted)] uppercase mb-1">
                Availability
              </div>
              <p className="text-sm">{apt.availability}</p>
            </div>
          )}
          {apt.leaseTerms && (
            <div className="mt-3">
              <div className="text-xs text-[var(--muted)] uppercase mb-1">
                Lease terms
              </div>
              <p className="text-sm">{apt.leaseTerms}</p>
            </div>
          )}
        </Accordion>

        <Accordion title="Scores" defaultOpen alwaysOpenAt="md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {(
              Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
            ).map((k) => (
              <div
                key={k}
                className="bg-slate-50 dark:bg-slate-800/60 rounded p-2"
              >
                <div className="text-xs text-[var(--muted)]">
                  {SCORE_CATEGORY_LABELS[k]}
                </div>
                <div className="font-semibold">
                  {apt.scores[k] !== null ? apt.scores[k] : "—"} / 10
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion
          title="Reviews"
          alwaysOpenAt="md"
          badge={
            apt.reviewSummary.rating !== null ? (
              <span className="text-xs text-[var(--muted)]">
                {apt.reviewSummary.rating}/5
              </span>
            ) : undefined
          }
        >
          {apt.reviewSummary.rating !== null && (
            <p className="text-sm mb-2">
              <span className="font-semibold">{apt.reviewSummary.rating}</span> / 5{" "}
              {apt.reviewSummary.reviewCount &&
                `from ${apt.reviewSummary.reviewCount} reviews`}{" "}
              {apt.reviewSummary.source && `• ${apt.reviewSummary.source}`}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {apt.reviewSummary.commonPraise.length > 0 && (
              <div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 uppercase mb-1">
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
                <div className="text-xs text-rose-700 dark:text-rose-300 uppercase mb-1">
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
        </Accordion>

        <Accordion
          title="Sources"
          alwaysOpenAt="md"
          badge={
            <span className="text-xs text-[var(--muted)]">
              {apt.sources.length}
            </span>
          }
        >
          {apt.sources.length === 0 ? (
            <p className="text-sm text-slate-500">No sources added.</p>
          ) : (
            <ul className="space-y-2">
              {apt.sources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
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
                    className="text-xs text-rose-700 min-h-[44px] min-w-[44px] px-2"
                  >
                    remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mt-3">
            <input
              type="url"
              inputMode="url"
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
              className="px-3 min-h-[44px] rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
            >
              Add source
            </button>
          </div>
        </Accordion>

        <Accordion
          title="Notes & comments"
          alwaysOpenAt="md"
          badge={
            <span className="text-xs text-[var(--muted)]">
              {apt.comments.length}
            </span>
          }
        >
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
                    className="border border-slate-200 dark:border-slate-700 rounded p-2 text-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-medium">{c.category}</span>
                      <span>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{c.body}</p>
                    <button
                      onClick={() => removeComment(apt.id, c.id)}
                      className="text-xs text-rose-700 mt-1 min-h-[44px] min-w-[44px]"
                    >
                      remove
                    </button>
                  </li>
                ))}
            </ul>
          )}
          {/* Desktop inline composer */}
          <div className="hidden md:flex flex-col gap-2 mt-3">
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
              className="self-end px-3 min-h-[44px] rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm"
            >
              Add comment
            </button>
          </div>
          {/* Mobile: tap "Add note" in the sticky action bar (handled by Sheet below) */}
          <button
            type="button"
            onClick={() => setNoteSheet(true)}
            className="md:hidden mt-3 px-3 min-h-[44px] rounded border border-[var(--border)] text-sm w-full"
          >
            + Add note
          </button>
        </Accordion>

        <Accordion title="Quick status change" alwaysOpenAt="md">
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
                className={`px-3 min-h-[44px] rounded text-xs border ${
                  apt.status === s
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                    : "border-slate-300 dark:border-slate-600 bg-[var(--card)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-3">
            Last updated {new Date(apt.updatedAt).toLocaleString()}
          </div>
        </Accordion>
      </Card>

      <StickyActionSpacer />

      <StickyActionBar>
        <Link
          href={`/apartments/${apt.id}/edit`}
          className="flex-1 inline-flex items-center justify-center min-h-[44px] rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium"
        >
          Edit
        </Link>
        <Link
          href={`/compare?ids=${apt.id}`}
          className="flex-1 inline-flex items-center justify-center min-h-[44px] rounded border border-[var(--border)] text-sm font-medium"
        >
          Compare
        </Link>
        <button
          type="button"
          onClick={() => setNoteSheet(true)}
          className="flex-1 inline-flex items-center justify-center min-h-[44px] rounded border border-[var(--border)] text-sm font-medium"
        >
          + Note
        </button>
      </StickyActionBar>

      <Sheet
        open={noteSheet}
        onClose={() => setNoteSheet(false)}
        title="Add note"
        footer={
          <>
            <button
              type="button"
              onClick={() => setNoteSheet(false)}
              className="flex-1 min-h-[44px] rounded border border-[var(--border)] text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!draft.trim()) return;
                addComment(apt.id, draft.trim(), draftCat);
                setDraft("");
                setNoteSheet(false);
              }}
              disabled={!draft.trim()}
              className="flex-1 min-h-[44px] rounded bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50"
            >
              Save note
            </button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <label className="block text-sm">
            <span className="text-xs text-[var(--muted)] block mb-1">Category</span>
            <select
              value={draftCat}
              onChange={(e) => setDraftCat(e.target.value as Comment["category"])}
            >
              <option value="general">general</option>
              <option value="tour">tour</option>
              <option value="question">question</option>
              <option value="concern">concern</option>
              <option value="decision">decision</option>
              <option value="followup">follow-up</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs text-[var(--muted)] block mb-1">Note</span>
            <textarea
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your note…"
              autoFocus
            />
          </label>
        </div>
      </Sheet>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card className="p-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="text-base sm:text-lg font-semibold tabular-nums break-words">
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </Card>
  );
}
