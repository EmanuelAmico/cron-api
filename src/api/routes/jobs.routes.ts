import express from "express";
import { JobsController } from "../controllers";

const router = express.Router();

router
  .route("/")
  .get(JobsController.listRunningJobs)
  .post(JobsController.createJob);
router.get("/search", JobsController.findSimilarJobs);
router
  .route("/:name")
  .get(JobsController.getJob)
  .put(JobsController.editJob)
  .delete(JobsController.deleteJob);

export default router;
