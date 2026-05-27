"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { Apartment, ScoreWeights, SCORE_CATEGORY_LABELS } from "@/lib/types";
import {
  bestBy,
  bestValue,
  costPerSqFt,
  highestRisk,
  moveInCost,
  rankByScore,
  totalMonthlyCost,
  weightedScore,
} from "@/lib/scoring";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  h2: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 2,
  },
  h3: { fontSize: 11, fontWeight: 700, marginTop: 8, marginBottom: 3 },
  small: { fontSize: 8, color: "#64748b" },
  row: { flexDirection: "row" },
  col: { flexDirection: "column" },
  muted: { color: "#64748b" },
  bold: { fontWeight: 700 },
  pill: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 3,
    borderRadius: 3,
    fontSize: 7.5,
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#94a3b8",
    marginTop: 4,
  },
  th: {
    backgroundColor: "#f1f5f9",
    padding: 3,
    fontSize: 7.5,
    fontWeight: 700,
    borderRightWidth: 0.5,
    borderRightColor: "#94a3b8",
  },
  td: {
    padding: 3,
    fontSize: 7.5,
    borderRightWidth: 0.5,
    borderRightColor: "#94a3b8",
  },
  tr: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#94a3b8",
  },
  card: {
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    padding: 6,
    marginBottom: 6,
    borderRadius: 3,
  },
  bullet: { marginLeft: 8, marginRight: 2 },
});

const fmt = (n: number | null | undefined): string =>
  n === null || n === undefined ? "—" : `$${n.toLocaleString()}`;

function ApartmentProfile({
  apt,
  weights,
}: {
  apt: Apartment;
  weights: ScoreWeights;
}) {
  const score = weightedScore(apt.scores, weights);
  const total = totalMonthlyCost(apt);
  const moveIn = moveInCost(apt);
  const cps = costPerSqFt(apt);

  return (
    <View style={styles.card} wrap={false}>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Text style={styles.h3}>
          #{apt.rank} {apt.name}
        </Text>
        <Text style={styles.small}>
          {score !== null ? `Score ${score.toFixed(1)}` : ""} • {apt.confidence}{" "}
          confidence
        </Text>
      </View>
      <Text style={styles.small}>
        {apt.neighborhood} • {apt.address} • {apt.status}
      </Text>
      <View style={[styles.row, { marginTop: 4 }]}>
        <Text style={{ width: "20%" }}>
          <Text style={styles.bold}>Rent:</Text> {fmt(apt.rent)}
        </Text>
        <Text style={{ width: "20%" }}>
          <Text style={styles.bold}>All-in:</Text> {fmt(total)}
        </Text>
        <Text style={{ width: "20%" }}>
          <Text style={styles.bold}>Move-in:</Text> {fmt(moveIn)}
        </Text>
        <Text style={{ width: "20%" }}>
          <Text style={styles.bold}>$/sqft:</Text>{" "}
          {cps !== null ? `$${cps}` : "—"}
        </Text>
        <Text style={{ width: "20%" }}>
          <Text style={styles.bold}>Unit:</Text> {apt.unitType || "—"}
        </Text>
      </View>

      {apt.availability && (
        <Text style={{ marginTop: 3 }}>
          <Text style={styles.bold}>Availability:</Text> {apt.availability}
        </Text>
      )}
      {apt.leaseTerms && (
        <Text>
          <Text style={styles.bold}>Lease:</Text> {apt.leaseTerms}
        </Text>
      )}

      <Text style={{ marginTop: 3 }}>
        <Text style={styles.bold}>Fees:</Text>{" "}
        {[
          apt.fees.application !== null && `App ${fmt(apt.fees.application)}`,
          apt.fees.deposit !== null && `Deposit ${fmt(apt.fees.deposit)}`,
          apt.parking.cost !== null && `Parking ${fmt(apt.parking.cost)}/mo`,
          apt.fees.petDeposit !== null && `Pet dep ${fmt(apt.fees.petDeposit)}`,
          apt.fees.petFee !== null && `Pet fee ${fmt(apt.fees.petFee)}`,
          apt.fees.petRent !== null && `Pet rent ${fmt(apt.fees.petRent)}/mo`,
        ]
          .filter(Boolean)
          .join(" • ")}
      </Text>
      <Text>
        <Text style={styles.bold}>Pets:</Text>{" "}
        {apt.petPolicy.allowed
          ? `${apt.petPolicy.speciesAllowed || "Allowed"}, ${
              apt.petPolicy.maxPets ?? "?"
            } max, ${
              apt.petPolicy.weightLimit
                ? `${apt.petPolicy.weightLimit} lb`
                : "no weight info"
            }${
              apt.petPolicy.petAmenities.length
                ? `, amenities: ${apt.petPolicy.petAmenities.join(", ")}`
                : ""
            }`
          : "Not allowed"}
      </Text>
      {apt.amenities.length > 0 && (
        <Text>
          <Text style={styles.bold}>Amenities:</Text>{" "}
          {apt.amenities.slice(0, 16).join(", ")}
          {apt.amenities.length > 16 ? ` (+${apt.amenities.length - 16})` : ""}
        </Text>
      )}
      {apt.locationNotes && (
        <Text>
          <Text style={styles.bold}>Location:</Text> {apt.locationNotes}
        </Text>
      )}

      {apt.pros.length > 0 && (
        <>
          <Text style={[styles.bold, { marginTop: 3, color: "#15803d" }]}>
            Pros
          </Text>
          {apt.pros.map((p, i) => (
            <Text key={i} style={styles.bullet}>
              • {p}
            </Text>
          ))}
        </>
      )}
      {apt.cons.length > 0 && (
        <>
          <Text style={[styles.bold, { marginTop: 3, color: "#b91c1c" }]}>
            Cons
          </Text>
          {apt.cons.map((p, i) => (
            <Text key={i} style={styles.bullet}>
              • {p}
            </Text>
          ))}
        </>
      )}
      {apt.redFlags.length > 0 && (
        <>
          <Text style={[styles.bold, { marginTop: 3, color: "#991b1b" }]}>
            ⚠ Red flags
          </Text>
          {apt.redFlags.map((p, i) => (
            <Text key={i} style={styles.bullet}>
              • {p}
            </Text>
          ))}
        </>
      )}
      {apt.followUpQuestions.length > 0 && (
        <>
          <Text style={[styles.bold, { marginTop: 3 }]}>Follow-up</Text>
          {apt.followUpQuestions.map((p, i) => (
            <Text key={i} style={styles.bullet}>
              • {p}
            </Text>
          ))}
        </>
      )}
      {apt.reviewSummary.rating !== null && (
        <Text style={{ marginTop: 3 }}>
          <Text style={styles.bold}>Reviews:</Text>{" "}
          {apt.reviewSummary.rating}/5
          {apt.reviewSummary.reviewCount
            ? ` (${apt.reviewSummary.reviewCount} reviews)`
            : ""}
          {apt.reviewSummary.source ? ` via ${apt.reviewSummary.source}` : ""}
        </Text>
      )}
      {apt.sources.length > 0 && (
        <Text style={{ marginTop: 3 }} wrap>
          <Text style={styles.bold}>Sources:</Text>{" "}
          {apt.sources.slice(0, 6).map((s, i) => (
            <Text key={i}>
              <Link src={s.url} style={{ color: "#2563eb" }}>
                {s.url}
              </Link>
              {i < apt.sources.length - 1 ? "  •  " : ""}
            </Text>
          ))}
        </Text>
      )}
    </View>
  );
}

export function PdfReport({
  apartments,
  weights,
}: {
  apartments: Apartment[];
  weights: ScoreWeights;
}) {
  const sorted = [...apartments].sort((a, b) => a.rank - b.rank);
  const ranked = rankByScore(apartments, weights);
  const best = ranked[0]?.apt ?? null;
  const value = bestValue(apartments);
  const loc = bestBy(apartments, "location");
  const am = bestBy(apartments, "amenities");
  const risk = highestRisk(apartments);
  const cheapest = [...apartments].sort(
    (a, b) => totalMonthlyCost(a) - totalMonthlyCost(b)
  )[0];

  const headers = [
    { label: "#", width: "4%" },
    { label: "Property", width: "16%" },
    { label: "Neighborhood", width: "12%" },
    { label: "Rent", width: "8%" },
    { label: "All-in", width: "8%" },
    { label: "Sqft", width: "6%" },
    { label: "Unit", width: "9%" },
    { label: "Pet wt", width: "6%" },
    { label: "Score", width: "6%" },
    { label: "Status", width: "11%" },
    { label: "Top pro", width: "14%" },
  ];

  return (
    <Document>
      <Page size="LETTER" style={styles.page} orientation="landscape" wrap>
        <Text style={styles.h1}>Apartment Decision Report</Text>
        <Text style={styles.small}>
          Generated {new Date().toLocaleString()} • {apartments.length}{" "}
          apartments tracked • Salt Lake City
        </Text>

        <Text style={styles.h2}>Executive summary</Text>
        <View style={styles.col}>
          {best && (
            <Text>
              <Text style={styles.bold}>Best overall:</Text> {best.name} —
              weighted score {weightedScore(best.scores, weights)?.toFixed(1)}.
            </Text>
          )}
          {value && (
            <Text>
              <Text style={styles.bold}>Best value:</Text> {value.name} — $
              {costPerSqFt(value)}/sqft at {fmt(value.rent)}.
            </Text>
          )}
          {loc && (
            <Text>
              <Text style={styles.bold}>Best location:</Text> {loc.name} —
              location score {loc.scores.location}/10.
            </Text>
          )}
          {am && (
            <Text>
              <Text style={styles.bold}>Best amenities:</Text> {am.name} —
              amenities score {am.scores.amenities}/10.
            </Text>
          )}
          {cheapest && (
            <Text>
              <Text style={styles.bold}>Lowest all-in monthly:</Text>{" "}
              {cheapest.name} — est {fmt(totalMonthlyCost(cheapest))}/mo.
            </Text>
          )}
          {risk && risk.redFlags.length > 0 && (
            <Text>
              <Text style={styles.bold}>Highest risk:</Text> {risk.name} —{" "}
              {risk.redFlags.length} red flag
              {risk.redFlags.length > 1 ? "s" : ""}: {risk.redFlags.join("; ")}.
            </Text>
          )}
        </View>

        <Text style={styles.h2}>Comparison table</Text>
        <View style={styles.table}>
          <View style={styles.tr}>
            {headers.map((h, i) => (
              <View key={i} style={[styles.th, { width: h.width }]}>
                <Text>{h.label}</Text>
              </View>
            ))}
          </View>
          {sorted.map((a) => (
            <View key={a.id} style={styles.tr} wrap={false}>
              <View style={[styles.td, { width: "4%" }]}>
                <Text>{a.rank}</Text>
              </View>
              <View style={[styles.td, { width: "16%" }]}>
                <Text style={styles.bold}>{a.name}</Text>
              </View>
              <View style={[styles.td, { width: "12%" }]}>
                <Text>{a.neighborhood}</Text>
              </View>
              <View style={[styles.td, { width: "8%" }]}>
                <Text>{fmt(a.rent)}</Text>
              </View>
              <View style={[styles.td, { width: "8%" }]}>
                <Text>{fmt(totalMonthlyCost(a))}</Text>
              </View>
              <View style={[styles.td, { width: "6%" }]}>
                <Text>{a.squareFeet ?? "—"}</Text>
              </View>
              <View style={[styles.td, { width: "9%" }]}>
                <Text>{a.unitType || "—"}</Text>
              </View>
              <View style={[styles.td, { width: "6%" }]}>
                <Text>
                  {a.petPolicy.weightLimit
                    ? `${a.petPolicy.weightLimit}lb`
                    : "—"}
                </Text>
              </View>
              <View style={[styles.td, { width: "6%" }]}>
                <Text>
                  {weightedScore(a.scores, weights)?.toFixed(1) ?? "—"}
                </Text>
              </View>
              <View style={[styles.td, { width: "11%" }]}>
                <Text>{a.status}</Text>
              </View>
              <View style={[styles.td, { width: "14%" }]}>
                <Text>{a.pros[0] ?? "—"}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <Text style={styles.h1}>Apartment profiles</Text>
        {sorted.map((a) => (
          <ApartmentProfile key={a.id} apt={a} weights={weights} />
        ))}
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <Text style={styles.h1}>Rankings &amp; reasoning</Text>
        {ranked.map(({ apt, score }, i) => (
          <View key={apt.id} style={styles.card} wrap={false}>
            <Text style={styles.h3}>
              {i + 1}. {apt.name} — score {score?.toFixed(1) ?? "—"}
            </Text>
            <Text>
              <Text style={styles.bold}>Best case:</Text>{" "}
              {apt.pros[0] || "Strong amenity stack + acceptable price"}.
            </Text>
            <Text>
              <Text style={styles.bold}>Worst case:</Text>{" "}
              {apt.redFlags[0] || apt.cons[0] || "—"}.
            </Text>
            <Text>
              <Text style={styles.bold}>Who should choose it:</Text>{" "}
              {apt.tags.join(", ") || "balanced renters"}.
            </Text>
            <Text>
              <Text style={styles.bold}>Why this rank:</Text> Driven by{" "}
              {(
                Object.keys(SCORE_CATEGORY_LABELS) as (keyof typeof SCORE_CATEGORY_LABELS)[]
              )
                .map((k) => `${SCORE_CATEGORY_LABELS[k]} ${apt.scores[k] ?? "—"}`)
                .join(", ")}
              .
            </Text>
          </View>
        ))}

        <Text style={styles.h2}>Research notes</Text>
        {sorted.map((a) => {
          const items: string[] = [];
          if (a.unknowns.length) items.push(`Unknowns: ${a.unknowns.join("; ")}`);
          if (a.missingData.length)
            items.push(`Missing: ${a.missingData.join("; ")}`);
          if (a.confidence !== "high")
            items.push(`Confidence: ${a.confidence}`);
          if (items.length === 0) return null;
          return (
            <View key={a.id} style={{ marginBottom: 4 }}>
              <Text style={styles.bold}>{a.name}</Text>
              {items.map((t, i) => (
                <Text key={i} style={styles.bullet}>
                  • {t}
                </Text>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
