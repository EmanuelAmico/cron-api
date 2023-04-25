import express from "express";
import { JobsController } from "../controllers";

const router = express.Router();

router.get("/", JobsController.listRunningJobs);
router.post("/", JobsController.createJob);
router
  .route("/:name")
  .put(JobsController.editJob)
  .delete(JobsController.deleteJob);

export default router;
