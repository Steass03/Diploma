import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireSelf } from "../middleware/roles.js";
import { uploadUserAssets } from "../middleware/upload.js";
import {
  listUsers,
  getUserById,
  updateOwnProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", listUsers); // optional public
router.get("/:id", getUserById); // public profile

// self-edit (form-data)
router.patch(
  "/:id",
  requireAuth,
  requireSelf,
  uploadUserAssets,
  updateOwnProfile
);

export default router;
