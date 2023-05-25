import { Router } from "express";
import jobRoutes from "./jobs.routes";

const router = Router();

router.use("/jobs", jobRoutes);

export default router;
