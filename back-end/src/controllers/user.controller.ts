import type { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User.js";
import {
  listJobseekersQuerySchema,
  updateJobseekerSchema,
} from "../validators/user.schemas.js";

const isEmployer = (req: Request) => (req as any).user?.role === "employer";

// PUBLIC: list jobseekers (filters, sorting, pagination) + isSaved flag for authenticated employers
export const listJobseekers = async (req: Request, res: Response) => {
  const parsed = listJobseekersQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Invalid query", errors: parsed.error.flatten() });

  const {
    q,
    openToWork = true,
    employmentTypes,
    workModes,
    skills,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    limit = 20,
    page = 1,
    sortBy = "newest",
    sortDir,
  } = parsed.data;

  const filter: any = { role: "jobseeker" };
  if (openToWork !== undefined)
    filter["jobseekerProfile.openToWork"] = openToWork;
  if (employmentTypes?.length)
    filter["jobseekerProfile.preferences.employmentTypes"] = {
      $in: employmentTypes,
    };
  if (workModes?.length)
    filter["jobseekerProfile.preferences.workModes"] = { $in: workModes };
  if (skills?.length)
    filter["jobseekerProfile.stack"] = {
      $all: skills.map((s) => new RegExp(`^${s}$`, "i")),
    };
  if (q) {
    filter.$or = [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  // Date range filters
  if (createdAfter || createdBefore) {
    filter.createdAt = {};
    if (createdAfter) filter.createdAt.$gte = createdAfter;
    if (createdBefore) filter.createdAt.$lte = createdBefore;
  }
  if (updatedAfter || updatedBefore) {
    filter.updatedAt = {};
    if (updatedAfter) filter.updatedAt.$gte = updatedAfter;
    if (updatedBefore) filter.updatedAt.$lte = updatedBefore;
  }

  const sortDirVal =
    (sortDir ?? (sortBy === "oldest" ? "asc" : "desc")) === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> =
    sortBy === "firstName"
      ? { firstName: sortDirVal }
      : sortBy === "lastName"
        ? { lastName: sortDirVal }
        : sortBy === "dateOfBirth"
          ? { dateOfBirth: sortDirVal }
          : sortBy === "createdAt"
            ? { createdAt: sortDirVal }
            : sortBy === "updatedAt"
              ? { updatedAt: sortDirVal }
              : sortBy === "oldest" || sortBy === "newest"
                ? { updatedAt: sortDirVal }
                : { updatedAt: -1 };

  const cursor = User.find(filter)
    .select(
      "firstName lastName imageUrl role jobseekerProfile description contacts dateOfBirth updatedAt"
    )
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const [itemsRaw, total] = await Promise.all([
    cursor.lean(),
    User.countDocuments(filter),
  ]);

  let items = itemsRaw as any[];
  if (isEmployer(req)) {
    const employerId = (req as any).user.sub as string;
    const emp = await User.findById(employerId)
      .select("savedJobseekers")
      .lean();
    const savedSet = new Set(
      (emp?.savedJobseekers ?? []).map((id: any) => String(id))
    );
    items = itemsRaw.map((it) => ({
      ...it,
      isSaved: savedSet.has(String(it._id)),
    }));
  }

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

// PUBLIC: single jobseeker details + isSaved flag for authenticated employers
export const getJobseekerPublic = async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: req.params.id, role: "jobseeker" })
    .select(
      "-passwordHash -resetPasswordTokenHash -resetPasswordExpiresAt -__v"
    )
    .lean();
  if (!user) return res.status(404).json({ message: "Not found" });
  
  let result = user as any;
  if (isEmployer(req)) {
    const employerId = (req as any).user.sub as string;
    const emp = await User.findById(employerId)
      .select("savedJobseekers")
      .lean();
    const savedSet = new Set(
      (emp?.savedJobseekers ?? []).map((id: any) => String(id))
    );
    result.isSaved = savedSet.has(String(user._id));
  }
  
  res.json(result);
};

// AUTH (self): update own profile (supports image/cv uploads)
export const updateOwnProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub as string;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "Not found" });

  const parsed = updateJobseekerSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });
  const data = parsed.data;

  // Contacts (set only provided keys)
  const contactsUpdate: { email?: string; phone?: string } = {};
  if (data["contacts.email"] !== undefined)
    contactsUpdate.email = data["contacts.email"];
  if (data["contacts.phone"] !== undefined)
    contactsUpdate.phone = data["contacts.phone"];
  if (data.contacts) {
    if (data.contacts.email !== undefined)
      contactsUpdate.email = data.contacts.email;
    if (data.contacts.phone !== undefined)
      contactsUpdate.phone = data.contacts.phone;
  }
  if (Object.keys(contactsUpdate).length > 0) {
    user.contacts = { ...(user.contacts ?? {}), ...contactsUpdate };
  }

  if (typeof data.description === "string") user.description = data.description;

  if (user.role === "jobseeker") {
    user.jobseekerProfile ??= {
      stack: [],
      portfolioUrls: [],
      cvUrls: [],
      openToWork: false,
      preferences: { employmentTypes: [], workModes: [] },
      studies: [],
    };

    if (data.stack)
      user.jobseekerProfile.stack = Array.isArray(data.stack)
        ? data.stack
        : user.jobseekerProfile.stack;
    if (data.portfolioUrls)
      user.jobseekerProfile.portfolioUrls = Array.isArray(data.portfolioUrls)
        ? data.portfolioUrls
        : user.jobseekerProfile.portfolioUrls;

    if (typeof data.openToWork === "boolean")
      user.jobseekerProfile.openToWork = data.openToWork;

    if (data.preferences) {
      if (data.preferences.employmentTypes)
        user.jobseekerProfile.preferences.employmentTypes =
          data.preferences.employmentTypes;
      if (data.preferences.workModes)
        user.jobseekerProfile.preferences.workModes =
          data.preferences.workModes;
    }

    if (data.studies) user.jobseekerProfile.studies = data.studies;
  }

  // Files from upload middleware (Cloudinary)
  if ((req as any).uploadedImageUrl)
    user.imageUrl = (req as any).uploadedImageUrl as string;
  const uploadedCvUrls = (req as any).uploadedCvUrls as string[] | undefined;
  if (uploadedCvUrls?.length) {
    user.jobseekerProfile ??= {
      stack: [],
      portfolioUrls: [],
      cvUrls: [],
      openToWork: false,
      preferences: { employmentTypes: [], workModes: [] },
      studies: [],
    };
    user.jobseekerProfile.cvUrls!.push(...uploadedCvUrls);
  }

  await user.save();
  res.json(user.toJSON());
};

// OPTIONAL basic user list/read
export const listUsers = async (_req: Request, res: Response) => {
  const users = await User.find().limit(100).lean();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select(
      "-passwordHash -resetPasswordTokenHash -resetPasswordExpiresAt -__v"
    )
    .lean();
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
};

// EMPLOYER: save candidate
export const saveJobseeker = async (req: Request, res: Response) => {
  const employerId = (req as any).user.sub as string;
  const jobseekerId = req.params.jobseekerId;

  if (!Types.ObjectId.isValid(jobseekerId))
    return res.status(400).json({ message: "Invalid jobseeker id" });

  const candidate = await User.findOne({
    _id: jobseekerId,
    role: "jobseeker",
  }).select("_id");
  if (!candidate)
    return res.status(404).json({ message: "Jobseeker not found" });

  const employer = await User.findById(employerId);
  if (!employer) return res.status(404).json({ message: "Employer not found" });

  employer.savedJobseekers ??= [];
  const exists = employer.savedJobseekers.some(
    (id) => String(id) === jobseekerId
  );
  if (!exists) employer.savedJobseekers.push(new Types.ObjectId(jobseekerId));
  await employer.save();

  res.json({ ok: true });
};

// EMPLOYER: unsave candidate
export const unsaveJobseeker = async (req: Request, res: Response) => {
  const employerId = (req as any).user.sub as string;
  const jobseekerId = req.params.jobseekerId;

  const employer = await User.findById(employerId);
  if (!employer) return res.status(404).json({ message: "Employer not found" });

  employer.savedJobseekers = (employer.savedJobseekers ?? []).filter(
    (id) => String(id) !== jobseekerId
  );
  await employer.save();

  res.json({ ok: true });
};

// EMPLOYER: list saved candidates
export const listSavedJobseekers = async (req: Request, res: Response) => {
  const employerId = (req as any).user.sub as string;
  const employer = await User.findById(employerId)
    .select("savedJobseekers")
    .lean();
  const ids = (employer?.savedJobseekers ?? []).map(
    (id) => new Types.ObjectId(id)
  );
  if (!ids.length) return res.json({ items: [] });

  const items = await User.find({ _id: { $in: ids }, role: "jobseeker" })
    .select(
      "firstName lastName imageUrl jobseekerProfile description contacts updatedAt"
    )
    .lean();

  res.json({ items });
};

// JOBSEEKER: save offer
export const saveOffer = async (req: Request, res: Response) => {
  const jobseekerId = (req as any).user.sub as string;
  const offerId = req.params.offerId;

  if (!Types.ObjectId.isValid(offerId))
    return res.status(400).json({ message: "Invalid offer id" });

  const { Offer } = await import("../models/Offer.js");
  const offer = await Offer.findById(offerId).select("_id");
  if (!offer) return res.status(404).json({ message: "Offer not found" });

  const jobseeker = await User.findById(jobseekerId);
  if (!jobseeker) return res.status(404).json({ message: "Jobseeker not found" });

  jobseeker.savedOffers ??= [];
  const exists = jobseeker.savedOffers.some(
    (id) => String(id) === offerId
  );
  if (!exists) jobseeker.savedOffers.push(new Types.ObjectId(offerId));
  await jobseeker.save();

  res.json({ ok: true });
};

// JOBSEEKER: unsave offer
export const unsaveOffer = async (req: Request, res: Response) => {
  const jobseekerId = (req as any).user.sub as string;
  const offerId = req.params.offerId;

  const jobseeker = await User.findById(jobseekerId);
  if (!jobseeker) return res.status(404).json({ message: "Jobseeker not found" });

  jobseeker.savedOffers = (jobseeker.savedOffers ?? []).filter(
    (id) => String(id) !== offerId
  );
  await jobseeker.save();

  res.json({ ok: true });
};

// JOBSEEKER: list saved offers
export const listSavedOffers = async (req: Request, res: Response) => {
  const jobseekerId = (req as any).user.sub as string;
  const jobseeker = await User.findById(jobseekerId)
    .select("savedOffers")
    .lean();
  const ids = (jobseeker?.savedOffers ?? []).map(
    (id) => new Types.ObjectId(id)
  );
  if (!ids.length) return res.json({ items: [] });

  const { Offer } = await import("../models/Offer.js");
  const items = await Offer.find({ _id: { $in: ids } })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ items });
};