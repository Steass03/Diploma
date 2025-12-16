import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import jobseekersRoutes from "./routes/jobseekers.routes.js";
import employersRoutes from "./routes/employers.routes.js";
import offersRoutes from "./routes/offers.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobseekers", jobseekersRoutes);
app.use("/api/employers", employersRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
