import { Router } from "express";
import { JobsController } from "@controllers";
import { tryCatch } from "@helpers";

const router = Router();

router
  .route("/")
  .get(tryCatch(JobsController.listRunningJobs))
  .post(tryCatch(JobsController.createJob));
router.get("/search", tryCatch(JobsController.findSimilarJobs));
router
  .route("/:name")
  .get(tryCatch(JobsController.getJob))
  .put(tryCatch(JobsController.editJob))
  .delete(tryCatch(JobsController.deleteJob));

export { router as jobRoutes };
