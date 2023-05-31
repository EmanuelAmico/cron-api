import { Router } from "express";
import { jobRoutes } from "@routes/jobs.routes.js";

const router = Router();

router.use("/jobs", jobRoutes);

export { router as allRoutes };
