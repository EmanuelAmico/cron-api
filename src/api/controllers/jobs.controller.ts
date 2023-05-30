import { Request, Response } from "express";
import { JobService } from "../services";
import { JobDescription } from "../../types";
import { checkProperties, created, IResponse, ok } from "../helpers";
import { Method } from "axios";

class JobsController {
  public static listRunningJobs(
    req: Request<
      Record<string, never>,
      IResponse<ReturnType<typeof JobService.listRunningJobs>>,
      void,
      Record<string, never>
    >,
    res: Response<IResponse<ReturnType<typeof JobService.listRunningJobs>>>
  ) {
    const jobs = JobService.listRunningJobs();

    res.status(200).send(ok({ message: "Running jobs", data: jobs }));
  }

  public static getJob(
    req: Request<
      { name: string },
      IResponse<ReturnType<typeof JobService.getJob>>,
      void,
      Record<string, never>
    >,
    res: Response<IResponse<ReturnType<typeof JobService.getJob>>>
  ) {
    const { name } = req.params;
    const job = JobService.getJob(name);

    res.status(200).send(ok({ message: "Job found", data: job }));
  }

  public static findSimilarJobs(
    req: Request<
      Record<string, never>,
      IResponse<ReturnType<typeof JobService.findSimilarJobs>>,
      void,
      {
        name?: string;
        description?: string;
        cron?: string;
        repetitions?: string;
        nextRunDate?: string;
        createdAt?: string;
        updatedAt?: string;
        url?: string;
        method?: Method;
        queueUrl?: string;
        queueType?: "fifo" | "standard";
        messageGroupId?: string;
        messageDeduplicationId?: string;
      }
    >,
    res: Response<IResponse<ReturnType<typeof JobService.findSimilarJobs>>>
  ) {
    checkProperties(req.query, "req.query", [
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
        type: "string",
        atLeastOne: true,
      },
      {
        field: "nextRunDate",
        type: "string",
        atLeastOne: true,
      },
      {
        field: "createdAt",
        type: "string",
        atLeastOne: true,
      },
      {
        field: "updatedAt",
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

    const {
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      createdAt,
      updatedAt,
      url,
      method,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    } = req.query;

    const jobs = JobService.findSimilarJobs({
      name,
      description,
      cron,
      repetitions: repetitions ? parseInt(repetitions) : undefined,
      nextRunDate,
      createdAt,
      updatedAt,
      url,
      method,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    });

    res.status(200).send(ok({ message: "Similar jobs", data: jobs }));
  }

  public static createJob(
    req: Request<
      Record<string, never>,
      IResponse<ReturnType<typeof JobService.createJob>>,
      JobDescription,
      Record<string, never>
    >,
    res: Response<IResponse<ReturnType<typeof JobService.createJob>>>
  ) {
    const {
      name,
      description,
      cron,
      repetitions,
      timer,
      url,
      method,
      body,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    } = req.body;

    checkProperties(
      { name, description, cron, repetitions, timer },
      "req.body",
      [
        {
          field: "name",
          type: "string",
        },
        {
          field: "description",
          type: "string",
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
      ]
    );

    let job: ReturnType<typeof JobService.createJob>;

    if (url || method || body) {
      checkProperties({ url, method, body }, "req.body", [
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
      ]);

      job = JobService.createJob({
        name,
        description,
        cron,
        timer,
        repetitions,
        url,
        method,
        body,
      });
    }

    if (queueUrl || queueType || messageGroupId || messageDeduplicationId) {
      checkProperties({ queueUrl, queueType }, "req.body", [
        {
          field: "queueUrl",
          type: "string",
        },
        {
          field: "queueType",
          type: "string",
        },
      ]);

      if (queueType === "fifo") {
        checkProperties(
          { messageGroupId, messageDeduplicationId },
          "req.body",
          [
            {
              field: "messageGroupId",
              type: "string",
            },
            {
              field: "messageDeduplicationId",
              type: "string",
            },
          ]
        );

        job = JobService.createJob({
          name,
          description,
          cron,
          timer,
          repetitions,
          body,
          queueUrl,
          queueType,
          messageGroupId,
          messageDeduplicationId,
        });
      }

      if (queueType === "standard") {
        job = JobService.createJob({
          name,
          description,
          cron,
          timer,
          repetitions,
          body,
          queueUrl,
          queueType,
        });
      }
    }

    res.status(200).send(created({ message: "Job created", data: job }));
  }

  public static editJob(
    req: Request<
      { name: string },
      IResponse<ReturnType<typeof JobService.editJob>>,
      Omit<JobDescription, "name">,
      Record<string, never>
    >,
    res: Response<IResponse<ReturnType<typeof JobService.editJob>>>
  ) {
    const { name } = req.params;
    const { cron, timer, url, method, body } = req.body;
    checkProperties({ name }, "req.params", [
      {
        field: "name",
        type: "string",
      },
    ]);
    checkProperties({ cron, timer, url, method, body }, "req.body", [
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

    let job: ReturnType<typeof JobService.editJob>;

    if (cron) {
      job = JobService.editJob({
        name,
        cron,
        url,
        method,
        body,
      });
    }

    if (timer) {
      job = JobService.editJob({
        name,
        timer,
        url,
        method,
        body,
      });
    }

    res.status(200).send(ok({ message: "Job edited", data: job }));
  }

  public static deleteJob(
    req: Request<
      { name: string },
      void,
      { cron: string },
      Record<string, never>
    >,
    res: Response<never>
  ) {
    const { name } = req.params;
    checkProperties({ name }, "req.params", [
      {
        field: "name",
        type: "string",
      },
    ]);

    JobService.deleteJob({ name });

    res.sendStatus(204);
  }
}

export { JobsController };
