import { Schema, model, Types } from "mongoose";
export type Role = "employer" | "jobseeker";

const employerProfileSchema = new Schema(
  {
    companyName: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyDescription: { type: String, trim: true },
  },
  { _id: false }
);

const studySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    yearFrom: { type: Number },
    yearTo: { type: Number },
  },
  { _id: false }
);

const jobseekerProfileSchema = new Schema(
  {
    stack: { type: [String], default: [] },
    portfolioUrls: { type: [String], default: [] },
    cvUrls: { type: [String], default: [] },
    openToWork: { type: Boolean, default: false },
    preferences: {
      employmentTypes: {
        type: [String],
        enum: ["fulltime", "part-time", "contract", "internship"],
        default: [],
      },
      workModes: {
        type: [String],
        enum: ["remote", "in-office", "hybrid"],
        default: [],
      },
    },
    studies: { type: [studySchema], default: [] },
  },
  { _id: false }
);

const contactsSchema = new Schema(
  {
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    // auth
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: Date },

    // profile
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    description: { type: String, trim: true },
    role: {
      type: String,
      enum: ["employer", "jobseeker"],
      required: true,
      index: true,
    },
    imageUrl: { type: String },
    contacts: { type: contactsSchema, default: undefined },

    employerProfile: { type: employerProfileSchema, default: undefined },
    jobseekerProfile: { type: jobseekerProfileSchema, default: undefined },

    // employer-only favorites (per employer)
    savedJobseekers: [
      { type: Schema.Types.ObjectId, ref: "User", default: [] },
    ],

    // jobseeker-only favorites (per jobseeker)
    savedOffers: [{ type: Schema.Types.ObjectId, ref: "Offer", default: [] }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export type IUser = {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  description?: string;
  role: Role;
  imageUrl?: string;
  contacts?: { email?: string; phone?: string };
  employerProfile?: {
    companyName?: string;
    companyWebsite?: string;
    companyDescription?: string;
  };
  jobseekerProfile?: {
    stack: string[];
    portfolioUrls?: string[];
    cvUrls?: string[];
    openToWork: boolean;
    preferences: {
      employmentTypes: ("fulltime" | "part-time" | "contract" | "internship")[];
      workModes: ("remote" | "in-office" | "hybrid")[];
    };
    studies: {
      title: string;
      organization: string;
      yearFrom?: number;
      yearTo?: number;
    }[];
  };
  savedJobseekers?: Types.ObjectId[];
  savedOffers?: Types.ObjectId[];
};

export const User = model<IUser>("User", userSchema);
