import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Offer } from "../models/Offer.js";
import {
  createInternalOfferSchema,
  listOffersQuerySchema,
  updateOfferSchema,
} from "../validators/offer.schemas.js";

// POST /api/offers (employer only)
export const createOffer = async (req: Request, res: Response) => {
  const parsed = createInternalOfferSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });
  }
  const data = parsed.data;

  const me = (req as any).user as {
    sub: string;
    role: "employer" | "jobseeker";
  };
  if (!me || me.role !== "employer") {
    return res.status(403).json({ message: "Employer role required" });
  }

  const doc = await Offer.create({
    ...data,
    source: "internal",
    createdBy: new Types.ObjectId(me.sub),
    isActive: true,
    scrapedAt: new Date(),
    lastSeenAt: new Date(),
  });

  res.status(201).json(doc.toJSON());
};

// GET /api/offers (public) + isSaved flag for authenticated jobseekers
export const listOffers = async (req: Request, res: Response) => {
  const parsed = listOffersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid query", errors: parsed.error.flatten() });
  }
  const {
    q,
    source,
    workMode,
    employmentType,
    isActive = true,
    locationCity,
    locationCountry,
    salaryMin,
    salaryMax,
    skills,
    companyName,
    postedAfter,
    postedBefore,
    page,
    limit,
    sortBy,
    sortDir,
  } = parsed.data;

  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (source) filter.source = source;
  if (workMode) filter.workMode = workMode;
  if (employmentType) filter.employmentType = employmentType;
  if (typeof isActive === "boolean") filter.isActive = isActive;

  // Location filters
  if (locationCity) filter["location.city"] = { $regex: locationCity, $options: "i" };
  if (locationCountry) filter["location.country"] = { $regex: locationCountry, $options: "i" };

  // Salary filters - match if salary range overlaps with filter range
  if (salaryMin !== undefined || salaryMax !== undefined) {
    const salaryFilter: any = {};
    if (salaryMin !== undefined) {
      // Job salary max should be >= filter min, or job salary min should be >= filter min
      salaryFilter.$or = [
        { "salary.max": { $gte: salaryMin } },
        { "salary.min": { $gte: salaryMin } },
      ];
    }
    if (salaryMax !== undefined) {
      // Job salary min should be <= filter max, or job salary max should be <= filter max
      if (salaryFilter.$or) {
        salaryFilter.$and = [
          { $or: salaryFilter.$or },
          {
            $or: [
              { "salary.min": { $lte: salaryMax } },
              { "salary.max": { $lte: salaryMax } },
            ],
          },
        ];
        delete salaryFilter.$or;
      } else {
        salaryFilter.$or = [
          { "salary.min": { $lte: salaryMax } },
          { "salary.max": { $lte: salaryMax } },
        ];
      }
    }
    // Combine with existing filter using $and
    if (Object.keys(salaryFilter).length > 0) {
      if (filter.$and) {
        filter.$and.push(salaryFilter);
      } else {
        const existingFilter = { ...filter };
        filter.$and = [existingFilter, salaryFilter];
        Object.keys(existingFilter).forEach((key) => {
          if (key !== "$and") delete filter[key];
        });
      }
    }
  }

  // Skills filter
  if (skills && skills.length > 0) {
    filter.skills = { $in: skills.map((s) => new RegExp(`^${s}$`, "i")) };
  }

  // Company filter
  if (companyName) {
    filter.companyName = { $regex: companyName, $options: "i" };
  }

  // Date range filters
  if (postedAfter || postedBefore) {
    filter.postedAt = {};
    if (postedAfter) filter.postedAt.$gte = postedAfter;
    if (postedBefore) filter.postedAt.$lte = postedBefore;
  }

  // Handle $text search with $and properly
  if (filter.$text && filter.$and) {
    const textFilter = filter.$text;
    const andFilters = filter.$and;
    delete filter.$text;
    delete filter.$and;
    filter.$and = [{ $text: textFilter }, ...andFilters];
  }

  // Sorting
  let sort: any = {};
  if (sortBy === "salary") {
    // Sort by average salary (min + max) / 2
    sort = { "salary.min": sortDir === "asc" ? 1 : -1, scrapedAt: -1 };
  } else {
    sort = { [sortBy]: sortDir === "asc" ? 1 : -1, scrapedAt: -1 };
  }

  const [itemsRaw, total] = await Promise.all([
    Offer.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Offer.countDocuments(filter),
  ]);

  let items = itemsRaw as any[];
  const me = (req as any).user;
  if (me && me.role === "jobseeker") {
    const { User } = await import("../models/User.js");
    const jobseeker = await User.findById(me.sub)
      .select("savedOffers")
      .lean();
    const savedSet = new Set(
      (jobseeker?.savedOffers ?? []).map((id: any) => String(id))
    );
    items = itemsRaw.map((it) => ({
      ...it,
      isSaved: savedSet.has(String(it._id)),
    }));
  }

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

// GET /api/offers/:id (public) + ?includeOwner=true + isSaved flag for authenticated jobseekers
export const getOffer = async (req: Request, res: Response) => {
  const includeOwner =
    (req.query.includeOwner as string | undefined) === "true";
  const q = Offer.findById(req.params.id);
  if (includeOwner) {
    q.populate({
      path: "createdBy",
      select:
        "_id firstName lastName email role employerProfile.companyName employerProfile.companyWebsite imageUrl",
    } as any);
  }
  const doc = await q.lean();
  if (!doc) return res.status(404).json({ message: "Not found" });
  
  const me = (req as any).user;
  if (me && me.role === "jobseeker") {
    const { User } = await import("../models/User.js");
    const jobseeker = await User.findById(me.sub)
      .select("savedOffers")
      .lean();
    // Convert all saved offer IDs to strings for comparison
    const savedSet = new Set(
      (jobseeker?.savedOffers ?? []).map((id: any) => {
        // Handle both ObjectId and string formats
        return id?.toString ? id.toString() : String(id);
      })
    );
    // Convert document ID to string for comparison
    const docIdString = (doc._id as any)?.toString ? (doc._id as any).toString() : String(doc._id);
    // Explicitly set isSaved to true or false
    (doc as any).isSaved = savedSet.has(docIdString);
  } else {
    // For non-jobseekers or unauthenticated users, explicitly set to false
    (doc as any).isSaved = false;
  }
  
  res.json(doc);
};

// PATCH /api/offers/:id (owner only)
export const updateOffer = async (req: Request, res: Response) => {
  const parsed = updateOfferSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  const me = (req as any).user as { sub: string; role: string };
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: "Not found" });

  if (!offer.createdBy || String(offer.createdBy) !== me.sub) {
    return res.status(403).json({ message: "Forbidden" });
  }

  offer.set({ ...parsed.data, lastSeenAt: new Date() });
  await offer.save();
  res.json(offer.toJSON());
};

// DELETE /api/offers/:id (owner only)
export const deleteOffer = async (req: Request, res: Response) => {
  const me = (req as any).user as { sub: string; role: string };
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: "Not found" });

  if (!offer.createdBy || String(offer.createdBy) !== me.sub) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await offer.deleteOne();
  res.json({ ok: true });
};

// GET /api/offers/me/owned (employer only)
export const listMyOffers = async (req: Request, res: Response) => {
  const me = (req as any).user as { sub: string; role: string };
  if (me.role !== "employer")
    return res.status(403).json({ message: "Employer role required" });

  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));

  const filter = { createdBy: new Types.ObjectId(me.sub) };

  const [items, total] = await Promise.all([
    Offer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Offer.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};
