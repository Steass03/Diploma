import { Schema, model, Types } from "mongoose";

export type WorkMode = "remote" | "in-office" | "hybrid" | "unspecified";
export type EmploymentType =
  | "fulltime"
  | "part-time"
  | "contract"
  | "internship"
  | "unspecified";
export type OfferSource = "internal" | "linkedin_api" | "internships_api";

const locationSchema = new Schema(
  {
    city: String,
    region: String,
    country: String,
    formatted: String,
    lat: Number,
    lng: Number,
    timezone: String,
  },
  { _id: false }
);

const salarySchema = new Schema(
  {
    currency: String,
    min: Number,
    max: Number,
    unit: String, // HOUR/YEAR/MONTH
    rawText: String,
  },
  { _id: false }
);

const offerSchema = new Schema(
  {
    // NEW: owner (employer who created this offer)
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },

    source: {
      type: String,
      enum: ["internal", "linkedin_api", "internships_api"],
      required: true,
      index: true,
    },
    sourceId: { type: String, index: true },
    sourceUrl: String,
    applyUrl: String,

    title: { type: String, required: true, index: true },
    descriptionText: String,
    descriptionHtml: String,

    companyName: { type: String, index: true },
    companyWebsite: String,
    companyIndustry: String,
    companyLogo: String,

    location: locationSchema,
    workMode: {
      type: String,
      enum: ["remote", "in-office", "hybrid", "unspecified"],
      default: "unspecified",
      index: true,
    },
    employmentType: {
      type: String,
      enum: ["fulltime", "part-time", "contract", "internship", "unspecified"],
      default: "unspecified",
      index: true,
    },

    postedAt: { type: Date, index: true },
    validThrough: Date,

    salary: salarySchema,
    skills: { type: [String], default: [] },
    tags: { type: [String], default: [] },

    // lifecycle
    isActive: { type: Boolean, default: true, index: true },
    scrapedAt: Date,
    lastSeenAt: Date,
    dedupeHash: { type: String, index: true },

    raw: Schema.Types.Mixed,
  },
  { timestamps: true }
);

offerSchema.index({
  title: "text",
  descriptionText: "text",
  companyName: "text",
});

export type IOffer = {
  _id: Types.ObjectId;
  createdBy?: Types.ObjectId;

  source: OfferSource;
  sourceId?: string;
  sourceUrl?: string;
  applyUrl?: string;

  title: string;
  descriptionText?: string;
  descriptionHtml?: string;

  companyName?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companyLogo?: string;

  location?: {
    city?: string;
    region?: string;
    country?: string;
    formatted?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
  };
  workMode: WorkMode;
  employmentType: EmploymentType;

  postedAt?: Date;
  validThrough?: Date;

  salary?: {
    currency?: string;
    min?: number;
    max?: number;
    unit?: string;
    rawText?: string;
  };

  skills?: string[];
  tags?: string[];

  isActive: boolean;
};

export const Offer = model<IOffer>("Offer", offerSchema);
