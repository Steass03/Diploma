import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  createOffer,
  listOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  listMyOffers,
} from "../controllers/offers.controller.js";

const router = Router();

// Public (with optional auth for isSaved flag)
router.get("/", optionalAuth, listOffers);
router.get("/:id", optionalAuth, getOffer);

// Employer-only CRUD
router.post("/", requireAuth, requireRole("employer"), createOffer);
router.get("/me/owned", requireAuth, requireRole("employer"), listMyOffers);
router.patch("/:id", requireAuth, requireRole("employer"), updateOffer);
router.delete("/:id", requireAuth, requireRole("employer"), deleteOffer);

export default router;
