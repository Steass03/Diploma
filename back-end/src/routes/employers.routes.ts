import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  listSavedJobseekers,
  saveJobseeker,
  unsaveJobseeker,
} from "../controllers/user.controller.js";
import { listMyOffers } from "../controllers/offers.controller.js";

const router = Router();

// employer-only
router.use(requireAuth, requireRole("employer"));

router.get("/saved", listSavedJobseekers);
router.post("/saved/:jobseekerId", saveJobseeker);
router.delete("/saved/:jobseekerId", unsaveJobseeker);

// convenience: list my offers
router.get("/me/offers", listMyOffers);

export default router;
