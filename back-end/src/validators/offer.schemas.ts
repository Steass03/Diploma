import { z } from "zod";

export const createInternalOfferSchema = z.object({
  title: z.string().min(2),
  descriptionText: z.string().optional(),
  descriptionHtml: z.string().optional(),
  companyName: z.string().min(2),
  companyWebsite: z.string().url().optional(),
  companyIndustry: z.string().optional(),
  companyLogo: z.string().url().optional(),
  location: z
    .object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      formatted: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  workMode: z
    .enum(["remote", "in-office", "hybrid", "unspecified"])
    .default("unspecified"),
  employmentType: z
    .enum(["fulltime", "part-time", "contract", "internship", "unspecified"])
    .default("unspecified"),
  postedAt: z.coerce.date().optional(),
  validThrough: z.coerce.date().optional(),
  salary: z
    .object({
      currency: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      unit: z.string().optional(),
      rawText: z.string().optional(),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateOfferSchema = createInternalOfferSchema.partial().extend({
  isActive: z.coerce.boolean().optional(),
});

const splitIfString = (v: unknown) =>
  typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : v;

const skillsCoerced = z.preprocess(
  splitIfString,
  z.array(z.string()).default([])
);

export const listOffersQuerySchema = z.object({
  q: z.string().optional(),
  source: z.enum(["internal", "linkedin_api", "internships_api"]).optional(),
  workMode: z.enum(["remote", "in-office", "hybrid", "unspecified"]).optional(),
  employmentType: z
    .enum(["fulltime", "part-time", "contract", "internship", "unspecified"])
    .optional(),
  isActive: z.coerce.boolean().optional(),
  // Location filters
  locationCity: z.string().optional(),
  locationCountry: z.string().optional(),
  // Salary filters
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  // Skills filter
  skills: skillsCoerced.optional(),
  // Company filter
  companyName: z.string().optional(),
  // Date range filters
  postedAfter: z.coerce.date().optional(),
  postedBefore: z.coerce.date().optional(),
  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  // Sorting
  sortBy: z
    .enum([
      "postedAt",
      "scrapedAt",
      "companyName",
      "title",
      "createdAt",
      "salary",
    ])
    .default("postedAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
