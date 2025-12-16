import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

// Public analytics endpoint
router.get("/", getAnalytics);

export default router;


