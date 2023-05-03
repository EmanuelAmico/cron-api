/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { JobService } from "../services";
import { JobDescription } from "../../types/api";

class JobsController {
  public static listRunningJobs(
    req: Request<void, void, void, void>,
    res: Response
  ) {
    try {
      const jobs = JobService.listRunningJobs();

      res.status(200).send({ jobs });
    } catch (err) {
      const error = err as Error;
      res.status(500).send({ message: error.message });
    }
  }

  public static createJob(
    req: Request<void, void, JobDescription, void>,
    res: Response
  ) {
    try {
      const { name, cron, timer, url, method, body } = req.body;

      if (!cron && !timer) throw new Error("No cron or timer provided.");

      if (cron) {
        JobService.createJob({
          name,
          cron,
          url,
          method,
          body,
        });
      }

      if (timer) {
        JobService.createJob({
          name,
          timer,
          url,
          method,
          body,
        });
      }

      res.status(200).send({ message: "Job created." });
    } catch (err) {
      const error = err as Error;
      res.status(500).send({ message: error.message });
    }
  }

  public static editJob(
    req: Request<{ name: string }, void, Omit<JobDescription, "name">, void>,
    res: Response
  ) {
    try {
      const { name } = req.params;
      const { cron, timer, url, method, body } = req.body;

      if (!cron && !timer) throw new Error("No cron or timer provided.");

      if (cron) {
        JobService.editJob({
          name,
          cron,
          url,
          method,
          body,
        });
      }

      if (timer) {
        JobService.editJob({
          name,
          timer,
          url,
          method,
          body,
        });
      }

      res.status(200).send({ message: "Job edited." });
    } catch (err) {
      const error = err as Error;
      res.status(500).send({ message: error.message });
    }
  }

  public static deleteJob(
    req: Request<{ name: string }, void, { cron: string }, void>,
    res: Response
  ) {
    try {
      const { name } = req.params;

      JobService.deleteJob({ name });

      res.sendStatus(204);
    } catch (err) {
      const error = err as Error;
      res.status(500).send({ message: error.message });
    }
  }
}

export { JobsController };
