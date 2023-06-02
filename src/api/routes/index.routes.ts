import { Router } from "express";
import { jobRoutes } from "@routes";

const router = Router();

router.use("/jobs", jobRoutes);

export { router as allRoutes };
