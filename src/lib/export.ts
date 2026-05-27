import { Apartment } from "./types";
import { totalMonthlyCost, moveInCost, costPerSqFt } from "./scoring";

const ESCAPE = (s: string | number | null | undefined): string => {
  if (s === null || s === undefined) return "";
  const str = String(s);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export function apartmentsToCSV(apartments: Apartment[]): string {
  const headers = [
    "rank",
    "status",
    "name",
    "address",
    "neighborhood",
    "rent",
    "unitType",
    "squareFeet",
    "$/sqft",
    "all-in monthly",
    "move-in cost",
    "parking $/mo",
    "pet weight (lb)",
    "pet rent",
    "amenities",
    "pros",
    "cons",
    "redFlags",
    "tags",
    "website",
    "confidence",
  ];
  const lines = [headers.join(",")];
  for (const a of apartments) {
    lines.push(
      [
        a.rank,
        a.status,
        a.name,
        a.address,
        a.neighborhood,
        a.rent ?? "",
        a.unitType,
        a.squareFeet ?? "",
        costPerSqFt(a) ?? "",
        totalMonthlyCost(a),
        moveInCost(a),
        a.parking.cost ?? "",
        a.petPolicy.weightLimit ?? "",
        a.fees.petRent ?? "",
        a.amenities.join("; "),
        a.pros.join("; "),
        a.cons.join("; "),
        a.redFlags.join("; "),
        a.tags.join("; "),
        a.website,
        a.confidence,
      ]
        .map(ESCAPE)
        .join(","),
    );
  }
  return lines.join("\n");
}

export interface GoogleDocsRow {
  rank: number;
  name: string;
  addressNeighborhood: string;
  rent: string;
  unitType: string;
  squareFeet: string;
  availability: string;
  leaseTerms: string;
  fees: string;
  utilities: string;
  parking: string;
  petPolicy: string;
  amenities: string;
  locationNotes: string;
  pros: string;
  cons: string;
  redFlags: string;
  bestFitFor: string;
  recommendation: string;
  sourceLinks: string;
}

export function toGoogleDocsRows(apartments: Apartment[]): GoogleDocsRow[] {
  return [...apartments]
    .sort((a, b) => a.rank - b.rank)
    .map((a) => ({
      rank: a.rank,
      name: a.name,
      addressNeighborhood: `${a.address} (${a.neighborhood})`,
      rent: a.rent
        ? `$${a.rent.toLocaleString()}${
            a.rentRangeLow && a.rentRangeHigh
              ? ` (range $${a.rentRangeLow}–$${a.rentRangeHigh})`
              : ""
          }`
        : "—",
      unitType: a.unitType || "—",
      squareFeet: a.squareFeet ? a.squareFeet.toString() : "—",
      availability: a.availability || "—",
      leaseTerms: a.leaseTerms || "—",
      fees:
        [
          a.fees.application !== null && `App $${a.fees.application}`,
          a.fees.admin !== null && `Admin $${a.fees.admin}`,
          a.fees.deposit !== null && `Deposit $${a.fees.deposit}`,
          a.fees.petDeposit !== null && `Pet dep $${a.fees.petDeposit}`,
          a.fees.petFee !== null && `Pet fee $${a.fees.petFee}`,
          a.fees.petRent !== null && `Pet rent $${a.fees.petRent}/mo`,
          ...a.fees.other,
        ]
          .filter(Boolean)
          .join("; ") || "—",
      utilities:
        [
          a.utilities.included.length &&
            `Included: ${a.utilities.included.join(", ")}`,
          a.utilities.tenantPaid.length &&
            `Tenant pays: ${a.utilities.tenantPaid.join(", ")}`,
          a.utilities.estimatedMonthly !== null &&
            `Est $${a.utilities.estimatedMonthly}/mo`,
        ]
          .filter(Boolean)
          .join("; ") || "—",
      parking:
        [
          a.parking.available ? "Yes" : "No",
          a.parking.covered && "covered",
          a.parking.cost !== null && `$${a.parking.cost}/mo`,
          a.parking.notes,
        ]
          .filter(Boolean)
          .join(", ") || "—",
      petPolicy: a.petPolicy.allowed
        ? [
            a.petPolicy.speciesAllowed,
            a.petPolicy.maxPets && `${a.petPolicy.maxPets} max`,
            a.petPolicy.weightLimit && `${a.petPolicy.weightLimit} lb`,
            a.petPolicy.breedRestrictions,
            a.petPolicy.petAmenities.join(", "),
          ]
            .filter(Boolean)
            .join("; ")
        : "Not allowed",
      amenities: a.amenities.slice(0, 12).join(", "),
      locationNotes: a.locationNotes,
      pros: a.pros.join("; "),
      cons: a.cons.join("; "),
      redFlags: a.redFlags.join("; ") || "—",
      bestFitFor:
        a.tags.length > 0
          ? a.tags.join(", ")
          : a.status === "Strong contender"
            ? "Top contender"
            : "Worth tracking",
      recommendation: a.pros[0] ?? "",
      sourceLinks: a.sources.map((s) => s.url).join(" | "),
    }));
}

export function googleDocsRowsToHTML(rows: GoogleDocsRow[]): string {
  const headers: { key: keyof GoogleDocsRow; label: string }[] = [
    { key: "rank", label: "Rank" },
    { key: "name", label: "Property" },
    { key: "addressNeighborhood", label: "Address / Neighborhood" },
    { key: "rent", label: "Rent" },
    { key: "unitType", label: "Unit Type" },
    { key: "squareFeet", label: "Sqft" },
    { key: "availability", label: "Availability" },
    { key: "leaseTerms", label: "Lease Terms" },
    { key: "fees", label: "Fees" },
    { key: "utilities", label: "Utilities" },
    { key: "parking", label: "Parking" },
    { key: "petPolicy", label: "Pet Policy" },
    { key: "amenities", label: "Amenities" },
    { key: "locationNotes", label: "Location Notes" },
    { key: "pros", label: "Pros" },
    { key: "cons", label: "Cons" },
    { key: "redFlags", label: "Red Flags" },
    { key: "bestFitFor", label: "Best Fit For" },
    { key: "recommendation", label: "Recommendation" },
    { key: "sourceLinks", label: "Source Links" },
  ];

  const head = headers
    .map(
      (h) =>
        `<th style="border:1px solid #999;padding:6px;background:#f1f5f9;text-align:left;">${h.label}</th>`,
    )
    .join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${headers
          .map(
            (h) =>
              `<td style="border:1px solid #999;padding:6px;vertical-align:top;">${escapeHTML(
                String(r[h.key] ?? ""),
              )}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:11px;width:100%;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function escapeHTML(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function copyHTMLToClipboard(html: string, plain: string) {
  if (
    typeof window !== "undefined" &&
    "ClipboardItem" in window &&
    navigator.clipboard?.write
  ) {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
  } else {
    await navigator.clipboard.writeText(plain);
  }
}
