export type ApartmentStatus =
  | "Interested"
  | "Strong contender"
  | "Needs research"
  | "Scheduled tour"
  | "Applied"
  | "Rejected"
  | "Archived";

export const APARTMENT_STATUSES: ApartmentStatus[] = [
  "Interested",
  "Strong contender",
  "Needs research",
  "Scheduled tour",
  "Applied",
  "Rejected",
  "Archived",
];

export type SourceType =
  | "official"
  | "listing"
  | "review"
  | "news"
  | "map"
  | "other";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Source {
  id: string;
  url: string;
  type: SourceType;
  dateAccessed: string;
  notes: string;
  confidence: ConfidenceLevel;
}

export interface Comment {
  id: string;
  category: "general" | "tour" | "question" | "concern" | "decision" | "followup";
  body: string;
  createdAt: string;
}

export interface Fees {
  application: number | null;
  admin: number | null;
  deposit: number | null;
  parking: number | null;
  petDeposit: number | null;
  petFee: number | null;
  petRent: number | null;
  other: string[];
}

export interface Utilities {
  included: string[];
  tenantPaid: string[];
  estimatedMonthly: number | null;
}

export interface Parking {
  available: boolean;
  covered: boolean;
  cost: number | null;
  notes: string;
}

export interface PetPolicy {
  allowed: boolean;
  speciesAllowed: string;
  maxPets: number | null;
  weightLimit: number | null;
  breedRestrictions: string;
  petAmenities: string[];
  notes: string;
}

export interface Scores {
  value: number | null;
  location: number | null;
  unitQuality: number | null;
  amenities: number | null;
  commute: number | null;
  fees: number | null;
  risk: number | null;
  personalPreference: number | null;
}

export interface TourInfo {
  scheduled: boolean;
  date: string;
  completed: boolean;
  notes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  applicationDeadline: string;
  requiredDocuments: string;
}

export interface ReviewSummary {
  rating: number | null;
  reviewCount: number | null;
  source: string;
  commonPraise: string[];
  commonComplaints: string[];
}

export interface Apartment {
  id: string;
  rank: number;
  status: ApartmentStatus;
  name: string;
  address: string;
  neighborhood: string;
  website: string;
  rent: number | null;
  rentRangeLow: number | null;
  rentRangeHigh: number | null;
  unitType: string;
  squareFeet: number | null;
  availability: string;
  leaseTerms: string;
  fees: Fees;
  utilities: Utilities;
  parking: Parking;
  petPolicy: PetPolicy;
  amenities: string[];
  locationNotes: string;
  pros: string[];
  cons: string[];
  redFlags: string[];
  unknowns: string[];
  dealbreakers: string[];
  niceToHaves: string[];
  followUpQuestions: string[];
  comments: Comment[];
  sources: Source[];
  scores: Scores;
  tour: TourInfo;
  reviewSummary: ReviewSummary;
  tags: string[];
  confidence: ConfidenceLevel;
  missingData: string[];
  updatedAt: string;
}

export type ScoreCategory = keyof Scores;

export interface ScoreWeights {
  value: number;
  location: number;
  unitQuality: number;
  amenities: number;
  commute: number;
  fees: number;
  risk: number;
  personalPreference: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  value: 25,
  location: 20,
  unitQuality: 15,
  amenities: 10,
  commute: 10,
  fees: 10,
  risk: 5,
  personalPreference: 5,
};

export const SCORE_CATEGORY_LABELS: Record<keyof ScoreWeights, string> = {
  value: "Rent / Value",
  location: "Location",
  unitQuality: "Unit Quality",
  amenities: "Amenities",
  commute: "Commute",
  fees: "Fees / Total Cost",
  risk: "Reviews / Risk",
  personalPreference: "Personal Preference",
};

export interface AppState {
  apartments: Apartment[];
  weights: ScoreWeights;
  version: number;
}

export function emptyApartment(): Apartment {
  return {
    id: "",
    rank: 999,
    status: "Interested",
    name: "",
    address: "",
    neighborhood: "",
    website: "",
    rent: null,
    rentRangeLow: null,
    rentRangeHigh: null,
    unitType: "",
    squareFeet: null,
    availability: "",
    leaseTerms: "",
    fees: {
      application: null,
      admin: null,
      deposit: null,
      parking: null,
      petDeposit: null,
      petFee: null,
      petRent: null,
      other: [],
    },
    utilities: {
      included: [],
      tenantPaid: [],
      estimatedMonthly: null,
    },
    parking: {
      available: false,
      covered: false,
      cost: null,
      notes: "",
    },
    petPolicy: {
      allowed: false,
      speciesAllowed: "",
      maxPets: null,
      weightLimit: null,
      breedRestrictions: "",
      petAmenities: [],
      notes: "",
    },
    amenities: [],
    locationNotes: "",
    pros: [],
    cons: [],
    redFlags: [],
    unknowns: [],
    dealbreakers: [],
    niceToHaves: [],
    followUpQuestions: [],
    comments: [],
    sources: [],
    scores: {
      value: null,
      location: null,
      unitQuality: null,
      amenities: null,
      commute: null,
      fees: null,
      risk: null,
      personalPreference: null,
    },
    tour: {
      scheduled: false,
      date: "",
      completed: false,
      notes: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      applicationDeadline: "",
      requiredDocuments: "",
    },
    reviewSummary: {
      rating: null,
      reviewCount: null,
      source: "",
      commonPraise: [],
      commonComplaints: [],
    },
    tags: [],
    confidence: "medium",
    missingData: [],
    updatedAt: new Date().toISOString(),
  };
}
