import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword); // expects ?email=...
router.post("/change-password", requireAuth, changePassword);

export default router;
