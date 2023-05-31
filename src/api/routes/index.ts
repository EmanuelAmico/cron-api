import { Router } from "express";
import { jobRoutes } from "@routes/jobs.routes";

const router = Router();

router.use("/jobs", jobRoutes);

export { router as allRoutes };
