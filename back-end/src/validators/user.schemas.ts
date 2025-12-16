import { z } from "zod";

const splitIfString = (v: unknown) =>
  typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : v;

const Employment = z.enum(["fulltime", "part-time", "contract", "internship"]);
const WorkMode = z.enum(["remote", "in-office", "hybrid"]);

const employmentTypesCoerced = z.preprocess(
  splitIfString,
  z.array(Employment).default([])
);
const workModesCoerced = z.preprocess(
  splitIfString,
  z.array(WorkMode).default([])
);

export const jobseekerPreferencesSchema = z.object({
  employmentTypes: employmentTypesCoerced.optional(),
  workModes: workModesCoerced.optional(),
});

export const studyItemSchema = z.object({
  title: z.string().min(1),
  organization: z.string().min(1),
  yearFrom: z.coerce.number().int().min(1900).max(3000).optional(),
  yearTo: z.coerce.number().int().min(1900).max(3000).optional(),
});

const commaList = z.string().transform((s) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
);

export const updateJobseekerSchema = z.object({
  description: z.string().max(4000).optional(),

  contacts: z
    .union([
      z.string().transform((s) => JSON.parse(s)),
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }),
    ])
    .optional(),
  "contacts.email": z.string().email().optional(),
  "contacts.phone": z.string().optional(),

  stack: z.union([commaList, z.array(z.string())]).optional(),
  portfolioUrls: z.union([commaList, z.array(z.string().url())]).optional(),

  openToWork: z.coerce.boolean().optional(),
  preferences: jobseekerPreferencesSchema.optional(),
  studies: z
    .union([
      z.string().transform((s) => JSON.parse(s)),
      z.array(studyItemSchema),
    ])
    .optional(),
});

export const listJobseekersQuerySchema = z.object({
  q: z.string().optional(),
  openToWork: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  employmentTypes: employmentTypesCoerced.optional(),
  workModes: workModesCoerced.optional(),
  skills: z.union([commaList, z.array(z.string())]).optional(),

  // Date range filters
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
  updatedAfter: z.coerce.date().optional(),
  updatedBefore: z.coerce.date().optional(),

  sortBy: z
    .enum([
      "newest",
      "oldest",
      "firstName",
      "lastName",
      "dateOfBirth",
      "createdAt",
      "updatedAt",
    ])
    .optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),

  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});
