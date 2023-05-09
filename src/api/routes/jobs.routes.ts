import express from "express";
import { JobsController } from "../controllers";

const router = express.Router();

router.get("/", JobsController.listRunningJobs);
router.post("/", JobsController.createJob);
router
  .route("/:name")
  .get(JobsController.getJob)
  .put(JobsController.editJob)
  .delete(JobsController.deleteJob);
router.get("/search/:name", JobsController.searchJobs);

export default router;
