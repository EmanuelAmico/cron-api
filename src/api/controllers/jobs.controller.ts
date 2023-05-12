import { Request, Response } from "express";
import { JobService } from "../services";
import { JobDescription } from "../../types/api";
import { validateParameters } from "../helpers/validateParameters";
import { Method } from "axios";

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

  public static getJob(
    req: Request<{ name: string }, void, void, void>,
    res: Response
  ) {
    try {
      const { name } = req.params;
      const job = JobService.getJob(name);

      res.status(200).send({ job });
    } catch (err) {
      const error = err as Error;
      res.status(500).send({ message: error.message });
    }
  }

  public static findSimilarJobs(
    req: Request<
      void,
      void,
      void,
      {
        name: string;
        description: string;
        cron: string;
        repetitions: number;
        nextRunDate: string;
        url: string;
        method: Method;
      }
    >,
    res: Response
  ) {
    try {
      validateParameters(req.query, [
        {
          field: "name",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "description",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "cron",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "repetitions",
          type: "number",
          atLeastOne: true,
        },
        {
          field: "nextRunDate",
          type: "string",
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
      ]);

      const { name, description, cron, repetitions, nextRunDate, url, method } =
        req.query;

      const jobs = JobService.findSimilarJobs({
        name,
        description,
        cron,
        repetitions,
        nextRunDate,
        url,
        method,
      });

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

      JobService.createJob({
        name,
        description,
        cron,
        timer,
        repetitions,
        url,
        method,
        body,
      });

      res.status(200).send({ message: "Job was created successfully." });
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

      res.status(200).send({ message: "Job was edited successfully." });
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
