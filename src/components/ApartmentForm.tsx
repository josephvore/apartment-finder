"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Apartment,
  APARTMENT_STATUSES,
  ConfidenceLevel,
  SCORE_CATEGORY_LABELS,
} from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  Accordion,
  Card,
  StickyActionBar,
  StickyActionSpacer,
} from "./ui";
import { ListField } from "./ListField";

type NumField =
  | "rent"
  | "rentRangeLow"
  | "rentRangeHigh"
  | "squareFeet"
  | "fees.application"
  | "fees.admin"
  | "fees.deposit"
  | "fees.parking"
  | "fees.petDeposit"
  | "fees.petFee"
  | "fees.petRent"
  | "utilities.estimatedMonthly"
  | "parking.cost"
  | "petPolicy.maxPets"
  | "petPolicy.weightLimit";

export function ApartmentForm({
  initial,
  mode,
}: {
  initial: Apartment;
  mode: "new" | "edit";
}) {
  const router = useRouter();
  const { upsertApartment } = useStore();
  const [apt, setApt] = useState<Apartment>(initial);

  const update = <K extends keyof Apartment>(key: K, value: Apartment[K]) => {
    setApt((a) => ({ ...a, [key]: value }));
  };

  const updateNested = (path: string, value: unknown) => {
    setApt((a) => {
      const [head, tail] = path.split(".") as [string, string];
      const cloned: Apartment = JSON.parse(JSON.stringify(a));
      // @ts-expect-error generic nested
      cloned[head][tail] = value;
      return cloned;
    });
  };

  const numVal = (path: NumField): number | "" => {
    if (!path.includes(".")) {
      const v = (apt as unknown as Record<string, unknown>)[path];
      return (v as number | null) ?? "";
    }
    const [h, t] = path.split(".") as [string, string];
    const obj = (apt as unknown as Record<string, Record<string, unknown>>)[h];
    return (obj[t] as number | null) ?? "";
  };

  const setNum = (path: NumField, raw: string) => {
    const n = raw === "" ? null : Number(raw);
    if (!path.includes(".")) {
      update(path as keyof Apartment, n as never);
    } else {
      updateNested(path, n);
    }
  };

  const save = () => {
    upsertApartment(apt);
    router.push(`/apartments/${apt.id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold truncate">
          {mode === "new" ? "Add apartment" : `Edit: ${apt.name || "Untitled"}`}
        </h1>
        <div className="hidden md:flex gap-2 shrink-0">
          <button
            onClick={() => router.back()}
            className="px-3 min-h-[44px] rounded border border-slate-300 dark:border-slate-600 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-3 min-h-[44px] rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </div>

      <Card className="p-2 sm:p-4">
        <Accordion title="Basics" defaultOpen alwaysOpenAt="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Field label="Property name">
              <input
                value={apt.name}
                onChange={(e) => update("name", e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                value={apt.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Address">
              <input
                value={apt.address}
                onChange={(e) => update("address", e.target.value)}
                autoComplete="street-address"
              />
            </Field>
            <Field label="Neighborhood">
              <input
                value={apt.neighborhood}
                onChange={(e) => update("neighborhood", e.target.value)}
              />
            </Field>
            <Field label="Unit type">
              <input
                value={apt.unitType}
                onChange={(e) => update("unitType", e.target.value)}
                placeholder="e.g. 2BR/2BA"
              />
            </Field>
            <Field label="Square feet">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("squareFeet")}
                onChange={(e) => setNum("squareFeet", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                value={apt.status}
                onChange={(e) =>
                  update("status", e.target.value as Apartment["status"])
                }
              >
                {APARTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Confidence">
              <select
                value={apt.confidence}
                onChange={(e) =>
                  update("confidence", e.target.value as ConfidenceLevel)
                }
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </Field>
            <Field label="Rank">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={apt.rank}
                onChange={(e) =>
                  update("rank", parseInt(e.target.value, 10) || 0)
                }
              />
            </Field>
            <Field label="Availability">
              <input
                value={apt.availability}
                onChange={(e) => update("availability", e.target.value)}
              />
            </Field>
            <Field label="Lease terms" className="sm:col-span-2">
              <input
                value={apt.leaseTerms}
                onChange={(e) => update("leaseTerms", e.target.value)}
              />
            </Field>
            <Field label="Location notes" className="sm:col-span-2">
              <textarea
                rows={2}
                value={apt.locationNotes}
                onChange={(e) => update("locationNotes", e.target.value)}
              />
            </Field>
          </div>
        </Accordion>

        <Accordion title="Pricing & fees" alwaysOpenAt="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Field label="Rent">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("rent")}
                onChange={(e) => setNum("rent", e.target.value)}
              />
            </Field>
            <Field label="Rent low">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("rentRangeLow")}
                onChange={(e) => setNum("rentRangeLow", e.target.value)}
              />
            </Field>
            <Field label="Rent high">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("rentRangeHigh")}
                onChange={(e) => setNum("rentRangeHigh", e.target.value)}
              />
            </Field>
            <Field label="Application">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("fees.application")}
                onChange={(e) => setNum("fees.application", e.target.value)}
              />
            </Field>
            <Field label="Admin">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("fees.admin")}
                onChange={(e) => setNum("fees.admin", e.target.value)}
              />
            </Field>
            <Field label="Deposit">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("fees.deposit")}
                onChange={(e) => setNum("fees.deposit", e.target.value)}
              />
            </Field>
            <Field label="Parking /mo">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("parking.cost")}
                onChange={(e) => setNum("parking.cost", e.target.value)}
              />
            </Field>
            <Field label="Pet deposit">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("fees.petDeposit")}
                onChange={(e) => setNum("fees.petDeposit", e.target.value)}
              />
            </Field>
            <Field label="Pet fee">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("fees.petFee")}
                onChange={(e) => setNum("fees.petFee", e.target.value)}
              />
            </Field>
            <Field label="Pet rent /mo">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("fees.petRent")}
                onChange={(e) => setNum("fees.petRent", e.target.value)}
              />
            </Field>
            <Field label="Utilities est">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("utilities.estimatedMonthly")}
                onChange={(e) =>
                  setNum("utilities.estimatedMonthly", e.target.value)
                }
              />
            </Field>
          </div>
          <div className="mt-3 space-y-3">
            <ListField
              label="Other fees"
              values={apt.fees.other}
              onChange={(v) => update("fees", { ...apt.fees, other: v })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ListField
                label="Utilities included"
                values={apt.utilities.included}
                onChange={(v) =>
                  update("utilities", { ...apt.utilities, included: v })
                }
              />
              <ListField
                label="Utilities tenant pays"
                values={apt.utilities.tenantPaid}
                onChange={(v) =>
                  update("utilities", { ...apt.utilities, tenantPaid: v })
                }
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Parking & pets" alwaysOpenAt="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <label className="flex items-center gap-2 min-h-[44px]">
              <input
                type="checkbox"
                checked={apt.parking.available}
                onChange={(e) =>
                  update("parking", {
                    ...apt.parking,
                    available: e.target.checked,
                  })
                }
                className="!w-5 !h-5"
              />
              <span>Parking available</span>
            </label>
            <label className="flex items-center gap-2 min-h-[44px]">
              <input
                type="checkbox"
                checked={apt.parking.covered}
                onChange={(e) =>
                  update("parking", { ...apt.parking, covered: e.target.checked })
                }
                className="!w-5 !h-5"
              />
              <span>Covered</span>
            </label>
            <Field label="Parking notes" className="sm:col-span-2">
              <input
                value={apt.parking.notes}
                onChange={(e) =>
                  update("parking", { ...apt.parking, notes: e.target.value })
                }
              />
            </Field>
            <label className="flex items-center gap-2 min-h-[44px]">
              <input
                type="checkbox"
                checked={apt.petPolicy.allowed}
                onChange={(e) =>
                  update("petPolicy", {
                    ...apt.petPolicy,
                    allowed: e.target.checked,
                  })
                }
                className="!w-5 !h-5"
              />
              <span>Pets allowed</span>
            </label>
            <Field label="Species">
              <input
                value={apt.petPolicy.speciesAllowed}
                onChange={(e) =>
                  update("petPolicy", {
                    ...apt.petPolicy,
                    speciesAllowed: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Max pets">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("petPolicy.maxPets")}
                onChange={(e) => setNum("petPolicy.maxPets", e.target.value)}
              />
            </Field>
            <Field label="Weight (lb)">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numVal("petPolicy.weightLimit")}
                onChange={(e) =>
                  setNum("petPolicy.weightLimit", e.target.value)
                }
              />
            </Field>
            <Field label="Breed restrictions" className="md:col-span-4">
              <input
                value={apt.petPolicy.breedRestrictions}
                onChange={(e) =>
                  update("petPolicy", {
                    ...apt.petPolicy,
                    breedRestrictions: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Pet notes" className="md:col-span-4">
              <input
                value={apt.petPolicy.notes}
                onChange={(e) =>
                  update("petPolicy", { ...apt.petPolicy, notes: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="mt-3">
            <ListField
              label="Pet amenities"
              values={apt.petPolicy.petAmenities}
              onChange={(v) =>
                update("petPolicy", { ...apt.petPolicy, petAmenities: v })
              }
            />
          </div>
        </Accordion>

        <Accordion title="Amenities & tags" alwaysOpenAt="md">
          <div className="space-y-3">
            <ListField
              label="Amenities"
              values={apt.amenities}
              onChange={(v) => update("amenities", v)}
            />
            <ListField
              label="Tags"
              values={apt.tags}
              onChange={(v) => update("tags", v)}
            />
          </div>
        </Accordion>

        <Accordion title="Evaluation" alwaysOpenAt="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ListField
              label="Pros"
              values={apt.pros}
              onChange={(v) => update("pros", v)}
              colorClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            />
            <ListField
              label="Cons"
              values={apt.cons}
              onChange={(v) => update("cons", v)}
              colorClass="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
            />
            <ListField
              label="Red flags"
              values={apt.redFlags}
              onChange={(v) => update("redFlags", v)}
              colorClass="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
            />
            <ListField
              label="Unknowns"
              values={apt.unknowns}
              onChange={(v) => update("unknowns", v)}
              colorClass="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
            />
            <ListField
              label="Dealbreakers"
              values={apt.dealbreakers}
              onChange={(v) => update("dealbreakers", v)}
              colorClass="bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100"
            />
            <ListField
              label="Nice-to-haves"
              values={apt.niceToHaves}
              onChange={(v) => update("niceToHaves", v)}
              colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
            />
            <ListField
              label="Follow-up questions"
              values={apt.followUpQuestions}
              onChange={(v) => update("followUpQuestions", v)}
              colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
            />
            <ListField
              label="Missing data"
              values={apt.missingData}
              onChange={(v) => update("missingData", v)}
              colorClass="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </Accordion>

        <Accordion title="Scores (1–10, blank to skip)" alwaysOpenAt="md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {(
              Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
            ).map((k) => (
              <Field key={k} label={SCORE_CATEGORY_LABELS[k]}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={10}
                  step={0.5}
                  value={apt.scores[k] ?? ""}
                  onChange={(e) =>
                    update("scores", {
                      ...apt.scores,
                      [k]:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </Accordion>

        <Accordion title="Tour & contact" alwaysOpenAt="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <label className="flex items-center gap-2 min-h-[44px]">
              <input
                type="checkbox"
                checked={apt.tour.scheduled}
                onChange={(e) =>
                  update("tour", { ...apt.tour, scheduled: e.target.checked })
                }
                className="!w-5 !h-5"
              />
              <span>Tour scheduled</span>
            </label>
            <label className="flex items-center gap-2 min-h-[44px]">
              <input
                type="checkbox"
                checked={apt.tour.completed}
                onChange={(e) =>
                  update("tour", { ...apt.tour, completed: e.target.checked })
                }
                className="!w-5 !h-5"
              />
              <span>Tour completed</span>
            </label>
            <Field label="Tour date">
              <input
                type="date"
                value={apt.tour.date}
                onChange={(e) =>
                  update("tour", { ...apt.tour, date: e.target.value })
                }
              />
            </Field>
            <Field label="Contact name">
              <input
                value={apt.tour.contactName}
                onChange={(e) =>
                  update("tour", { ...apt.tour, contactName: e.target.value })
                }
                autoComplete="name"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={apt.tour.contactEmail}
                onChange={(e) =>
                  update("tour", { ...apt.tour, contactEmail: e.target.value })
                }
                autoComplete="email"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                inputMode="tel"
                value={apt.tour.contactPhone}
                onChange={(e) =>
                  update("tour", { ...apt.tour, contactPhone: e.target.value })
                }
                autoComplete="tel"
              />
            </Field>
            <Field label="App deadline">
              <input
                type="date"
                value={apt.tour.applicationDeadline}
                onChange={(e) =>
                  update("tour", {
                    ...apt.tour,
                    applicationDeadline: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Required documents" className="md:col-span-3">
              <input
                value={apt.tour.requiredDocuments}
                onChange={(e) =>
                  update("tour", {
                    ...apt.tour,
                    requiredDocuments: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Tour notes" className="md:col-span-3">
              <textarea
                rows={3}
                value={apt.tour.notes}
                onChange={(e) =>
                  update("tour", { ...apt.tour, notes: e.target.value })
                }
              />
            </Field>
          </div>
        </Accordion>

        <Accordion title="Review signals" alwaysOpenAt="md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <Field label="Rating">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={apt.reviewSummary.rating ?? ""}
                onChange={(e) =>
                  update("reviewSummary", {
                    ...apt.reviewSummary,
                    rating:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Review count">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={apt.reviewSummary.reviewCount ?? ""}
                onChange={(e) =>
                  update("reviewSummary", {
                    ...apt.reviewSummary,
                    reviewCount:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Source">
              <input
                value={apt.reviewSummary.source}
                onChange={(e) =>
                  update("reviewSummary", {
                    ...apt.reviewSummary,
                    source: e.target.value,
                  })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <ListField
              label="Common praise"
              values={apt.reviewSummary.commonPraise}
              onChange={(v) =>
                update("reviewSummary", {
                  ...apt.reviewSummary,
                  commonPraise: v,
                })
              }
              colorClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
            />
            <ListField
              label="Common complaints"
              values={apt.reviewSummary.commonComplaints}
              onChange={(v) =>
                update("reviewSummary", {
                  ...apt.reviewSummary,
                  commonComplaints: v,
                })
              }
              colorClass="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
            />
          </div>
        </Accordion>
      </Card>

      <StickyActionSpacer />

      <StickyActionBar>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 min-h-[44px] rounded border border-[var(--border)] text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          className="flex-[2] min-h-[44px] rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          Save
        </button>
      </StickyActionBar>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
