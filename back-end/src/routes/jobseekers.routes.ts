import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  listJobseekers,
  getJobseekerPublic,
  saveOffer,
  unsaveOffer,
  listSavedOffers,
} from "../controllers/user.controller.js";

const router = Router();
router.get("/", listJobseekers);
router.get("/:id", getJobseekerPublic);

// Jobseeker-only: save/unsave offers
router.post("/saved/:offerId", requireAuth, requireRole("jobseeker"), saveOffer);
router.delete("/saved/:offerId", requireAuth, requireRole("jobseeker"), unsaveOffer);
router.get("/saved/list", requireAuth, requireRole("jobseeker"), listSavedOffers);

export default router;
