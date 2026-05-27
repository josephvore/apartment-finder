import { Apartment, ScoreWeights, Scores } from "./types";

export function weightedScore(
  scores: Scores,
  weights: ScoreWeights,
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;
  const keys = Object.keys(weights) as (keyof ScoreWeights)[];
  for (const key of keys) {
    const score = scores[key];
    const weight = weights[key];
    if (score !== null && score !== undefined && weight > 0) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function totalMonthlyCost(apt: Apartment): number {
  const rent = apt.rent ?? 0;
  const parking = apt.parking.cost ?? 0;
  const petRent = apt.petPolicy.allowed ? (apt.fees.petRent ?? 0) : 0;
  const utilities = apt.utilities.estimatedMonthly ?? 0;
  return rent + parking + petRent + utilities;
}

export function moveInCost(apt: Apartment): number {
  return (
    (apt.fees.application ?? 0) +
    (apt.fees.admin ?? 0) +
    (apt.fees.deposit ?? 0) +
    (apt.petPolicy.allowed
      ? (apt.fees.petDeposit ?? 0) + (apt.fees.petFee ?? 0)
      : 0) +
    (apt.rent ?? 0)
  );
}

export function costPerSqFt(apt: Apartment): number | null {
  if (!apt.rent || !apt.squareFeet) return null;
  return Math.round((apt.rent / apt.squareFeet) * 100) / 100;
}

interface RankedApartment {
  apt: Apartment;
  score: number | null;
}

export function rankByScore(
  apartments: Apartment[],
  weights: ScoreWeights,
): RankedApartment[] {
  return apartments
    .map((apt) => ({ apt, score: weightedScore(apt.scores, weights) }))
    .sort((a, b) => {
      if (a.score === null && b.score === null) return a.apt.rank - b.apt.rank;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
}

export function bestBy(
  apartments: Apartment[],
  field: keyof Scores,
): Apartment | null {
  let best: Apartment | null = null;
  let bestVal = -Infinity;
  for (const apt of apartments) {
    const v = apt.scores[field];
    if (v !== null && v !== undefined && v > bestVal) {
      bestVal = v;
      best = apt;
    }
  }
  return best;
}

export function bestValue(apartments: Apartment[]): Apartment | null {
  let best: Apartment | null = null;
  let bestCps = Infinity;
  for (const apt of apartments) {
    const cps = costPerSqFt(apt);
    if (cps !== null && cps < bestCps) {
      bestCps = cps;
      best = apt;
    }
  }
  return best;
}

export function highestRisk(apartments: Apartment[]): Apartment | null {
  let worst: Apartment | null = null;
  let mostFlags = -1;
  for (const apt of apartments) {
    const flagCount = apt.redFlags.length;
    if (flagCount > mostFlags) {
      mostFlags = flagCount;
      worst = apt;
    }
  }
  return worst;
}
