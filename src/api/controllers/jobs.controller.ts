/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { JobService } from "../services";
import { JobDescription } from "../../types/api";
import { validateParameters } from "../helpers/validateParameters";

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
      const { name, description, cron, repetitions, timer, url, method, body } =
        req.body;
      validateParameters(
        { name, description, cron, repetitions, timer, url, method, body },
        [
          {
            field: "name",
            type: "string",
          },
          {
            field: "description",
            type: "string",
            optional: true,
          },
          {
            field: "cron",
            type: "string",
            atLeastOne: true,
          },
          {
            field: "repetitions",
            type: "number",
            optional: true,
          },
          {
            field: "timer",
            type: "number",
            atLeastOne: true,
          },
          {
            field: "url",
            type: "string",
          },
          {
            field: "method",
            type: "string",
          },
          {
            field: "body",
            type: "object",
            optional: true,
          },
        ]
      );

      if (!cron && !timer) throw new Error("No cron or timer provided.");

      if (cron) {
        JobService.createJob({
          name,
          description,
          cron,
          repetitions,
          url,
          method,
          body,
        });
      }

      if (timer) {
        JobService.createJob({
          name,
          description,
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
      validateParameters({ name }, [
        {
          field: "name",
          type: "string",
        },
      ]);
      validateParameters({ cron, timer, url, method, body }, [
        {
          field: "cron",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "timer",
          type: "number",
          atLeastOne: true,
        },
        {
          field: "url",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "method",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "body",
          type: "object",
          optional: true,
        },
      ]);

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
      validateParameters({ name }, [
        {
          field: "name",
          type: "string",
        },
      ]);

      JobService.deleteJob({ name });

      res.sendStatus(204);
    } catch (err) {
      const error = err as Error;
      res.status(500).send({ message: error.message });
    }
  }
}

export { JobsController };
