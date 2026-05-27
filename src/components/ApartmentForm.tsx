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
import { Card, SectionHeading } from "./ui";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "new" ? "Add apartment" : `Edit: ${apt.name}`}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded border border-slate-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <SectionHeading>Basics</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Property name</span>
            <input
              value={apt.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Website</span>
            <input
              value={apt.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Address</span>
            <input
              value={apt.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Neighborhood</span>
            <input
              value={apt.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Unit type</span>
            <input
              value={apt.unitType}
              onChange={(e) => update("unitType", e.target.value)}
              placeholder="e.g. 2BR/2BA"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Square feet</span>
            <input
              type="number"
              value={numVal("squareFeet")}
              onChange={(e) => setNum("squareFeet", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Status</span>
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
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Confidence</span>
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
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Rank</span>
            <input
              type="number"
              value={apt.rank}
              onChange={(e) => update("rank", parseInt(e.target.value, 10) || 0)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Availability</span>
            <input
              value={apt.availability}
              onChange={(e) => update("availability", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-[var(--muted)]">Lease terms</span>
            <input
              value={apt.leaseTerms}
              onChange={(e) => update("leaseTerms", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-[var(--muted)]">Location notes</span>
            <textarea
              rows={2}
              value={apt.locationNotes}
              onChange={(e) => update("locationNotes", e.target.value)}
            />
          </label>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <SectionHeading>Pricing &amp; fees</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Rent</span>
            <input
              type="number"
              value={numVal("rent")}
              onChange={(e) => setNum("rent", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Rent low</span>
            <input
              type="number"
              value={numVal("rentRangeLow")}
              onChange={(e) => setNum("rentRangeLow", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Rent high</span>
            <input
              type="number"
              value={numVal("rentRangeHigh")}
              onChange={(e) => setNum("rentRangeHigh", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Application</span>
            <input
              type="number"
              value={numVal("fees.application")}
              onChange={(e) => setNum("fees.application", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Admin</span>
            <input
              type="number"
              value={numVal("fees.admin")}
              onChange={(e) => setNum("fees.admin", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Deposit</span>
            <input
              type="number"
              value={numVal("fees.deposit")}
              onChange={(e) => setNum("fees.deposit", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Parking /mo</span>
            <input
              type="number"
              value={numVal("parking.cost")}
              onChange={(e) => setNum("parking.cost", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Pet deposit</span>
            <input
              type="number"
              value={numVal("fees.petDeposit")}
              onChange={(e) => setNum("fees.petDeposit", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Pet fee</span>
            <input
              type="number"
              value={numVal("fees.petFee")}
              onChange={(e) => setNum("fees.petFee", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Pet rent /mo</span>
            <input
              type="number"
              value={numVal("fees.petRent")}
              onChange={(e) => setNum("fees.petRent", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Utilities est</span>
            <input
              type="number"
              value={numVal("utilities.estimatedMonthly")}
              onChange={(e) =>
                setNum("utilities.estimatedMonthly", e.target.value)
              }
            />
          </label>
        </div>
        <ListField
          label="Other fees"
          values={apt.fees.other}
          onChange={(v) =>
            update("fees", { ...apt.fees, other: v })
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      </Card>

      <Card className="p-5 space-y-4">
        <SectionHeading>Parking &amp; pets</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={apt.parking.available}
              onChange={(e) =>
                update("parking", {
                  ...apt.parking,
                  available: e.target.checked,
                })
              }
              className="!w-4 !h-4"
            />
            <span>Parking available</span>
          </label>
          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={apt.parking.covered}
              onChange={(e) =>
                update("parking", { ...apt.parking, covered: e.target.checked })
              }
              className="!w-4 !h-4"
            />
            <span>Covered</span>
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-[var(--muted)]">Parking notes</span>
            <input
              value={apt.parking.notes}
              onChange={(e) =>
                update("parking", { ...apt.parking, notes: e.target.value })
              }
            />
          </label>

          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={apt.petPolicy.allowed}
              onChange={(e) =>
                update("petPolicy", {
                  ...apt.petPolicy,
                  allowed: e.target.checked,
                })
              }
              className="!w-4 !h-4"
            />
            <span>Pets allowed</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Species</span>
            <input
              value={apt.petPolicy.speciesAllowed}
              onChange={(e) =>
                update("petPolicy", {
                  ...apt.petPolicy,
                  speciesAllowed: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Max pets</span>
            <input
              type="number"
              value={numVal("petPolicy.maxPets")}
              onChange={(e) => setNum("petPolicy.maxPets", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Weight (lb)</span>
            <input
              type="number"
              value={numVal("petPolicy.weightLimit")}
              onChange={(e) => setNum("petPolicy.weightLimit", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-4">
            <span className="text-xs text-[var(--muted)]">Breed restrictions</span>
            <input
              value={apt.petPolicy.breedRestrictions}
              onChange={(e) =>
                update("petPolicy", {
                  ...apt.petPolicy,
                  breedRestrictions: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-4">
            <span className="text-xs text-[var(--muted)]">Pet notes</span>
            <input
              value={apt.petPolicy.notes}
              onChange={(e) =>
                update("petPolicy", {
                  ...apt.petPolicy,
                  notes: e.target.value,
                })
              }
            />
          </label>
        </div>
        <ListField
          label="Pet amenities"
          values={apt.petPolicy.petAmenities}
          onChange={(v) =>
            update("petPolicy", { ...apt.petPolicy, petAmenities: v })
          }
        />
      </Card>

      <Card className="p-5 space-y-4">
        <SectionHeading>Amenities &amp; tags</SectionHeading>
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
      </Card>

      <Card className="p-5 space-y-4">
        <SectionHeading>Evaluation</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ListField
            label="Pros"
            values={apt.pros}
            onChange={(v) => update("pros", v)}
            colorClass="bg-emerald-100 text-emerald-800"
          />
          <ListField
            label="Cons"
            values={apt.cons}
            onChange={(v) => update("cons", v)}
            colorClass="bg-rose-100 text-rose-800"
          />
          <ListField
            label="Red flags"
            values={apt.redFlags}
            onChange={(v) => update("redFlags", v)}
            colorClass="bg-red-100 text-red-800"
          />
          <ListField
            label="Unknowns"
            values={apt.unknowns}
            onChange={(v) => update("unknowns", v)}
            colorClass="bg-amber-100 text-amber-800"
          />
          <ListField
            label="Dealbreakers"
            values={apt.dealbreakers}
            onChange={(v) => update("dealbreakers", v)}
            colorClass="bg-red-200 text-red-900"
          />
          <ListField
            label="Nice-to-haves"
            values={apt.niceToHaves}
            onChange={(v) => update("niceToHaves", v)}
            colorClass="bg-blue-100 text-blue-800"
          />
          <ListField
            label="Follow-up questions"
            values={apt.followUpQuestions}
            onChange={(v) => update("followUpQuestions", v)}
            colorClass="bg-purple-100 text-purple-800"
          />
          <ListField
            label="Missing data"
            values={apt.missingData}
            onChange={(v) => update("missingData", v)}
            colorClass="bg-slate-200 text-slate-700"
          />
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Scores (1–10, blank to skip)</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {(
            Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
          ).map((k) => (
            <label key={k} className="flex flex-col gap-1">
              <span className="text-xs text-[var(--muted)]">
                {SCORE_CATEGORY_LABELS[k]}
              </span>
              <input
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={apt.scores[k] ?? ""}
                onChange={(e) =>
                  update("scores", {
                    ...apt.scores,
                    [k]: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Tour &amp; contact</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={apt.tour.scheduled}
              onChange={(e) =>
                update("tour", { ...apt.tour, scheduled: e.target.checked })
              }
              className="!w-4 !h-4"
            />
            <span>Tour scheduled</span>
          </label>
          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={apt.tour.completed}
              onChange={(e) =>
                update("tour", { ...apt.tour, completed: e.target.checked })
              }
              className="!w-4 !h-4"
            />
            <span>Tour completed</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Tour date</span>
            <input
              type="date"
              value={apt.tour.date}
              onChange={(e) =>
                update("tour", { ...apt.tour, date: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Contact name</span>
            <input
              value={apt.tour.contactName}
              onChange={(e) =>
                update("tour", { ...apt.tour, contactName: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Email</span>
            <input
              value={apt.tour.contactEmail}
              onChange={(e) =>
                update("tour", { ...apt.tour, contactEmail: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Phone</span>
            <input
              value={apt.tour.contactPhone}
              onChange={(e) =>
                update("tour", { ...apt.tour, contactPhone: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">App deadline</span>
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
          </label>
          <label className="flex flex-col gap-1 md:col-span-3">
            <span className="text-xs text-[var(--muted)]">Required documents</span>
            <input
              value={apt.tour.requiredDocuments}
              onChange={(e) =>
                update("tour", {
                  ...apt.tour,
                  requiredDocuments: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-3">
            <span className="text-xs text-[var(--muted)]">Tour notes</span>
            <textarea
              rows={3}
              value={apt.tour.notes}
              onChange={(e) =>
                update("tour", { ...apt.tour, notes: e.target.value })
              }
            />
          </label>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Review signals</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Rating</span>
            <input
              type="number"
              step="0.1"
              value={apt.reviewSummary.rating ?? ""}
              onChange={(e) =>
                update("reviewSummary", {
                  ...apt.reviewSummary,
                  rating: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Review count</span>
            <input
              type="number"
              value={apt.reviewSummary.reviewCount ?? ""}
              onChange={(e) =>
                update("reviewSummary", {
                  ...apt.reviewSummary,
                  reviewCount:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Source</span>
            <input
              value={apt.reviewSummary.source}
              onChange={(e) =>
                update("reviewSummary", {
                  ...apt.reviewSummary,
                  source: e.target.value,
                })
              }
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ListField
            label="Common praise"
            values={apt.reviewSummary.commonPraise}
            onChange={(v) =>
              update("reviewSummary", {
                ...apt.reviewSummary,
                commonPraise: v,
              })
            }
            colorClass="bg-emerald-50 text-emerald-700"
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
            colorClass="bg-rose-50 text-rose-700"
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded border border-slate-300 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
