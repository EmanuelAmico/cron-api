import express from "express";
import jobRoutes from "./jobs.routes";

const router = express.Router();

router.use("/jobs", jobRoutes);

export default router;
