import { Request, Response } from "express";
import { Method } from "axios";
import { JobService } from "@services";
import { EditJob, JobDescription } from "@types";
import { checkProperties, created, IResponse, ok } from "@helpers";

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
      query,
      method,
      body,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    } = req.body;

    checkProperties({ name, description, cron, timer }, "req.body", [
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
        field: "timer",
        type: ["number", "string"],
        atLeastOne: true,
      },
    ]);

    if (cron) {
      checkProperties({ cron, repetitions }, "req.body", [
        {
          field: "cron",
          type: "string",
        },
        {
          field: "repetitions",
          type: "number",
          optional: true,
        },
      ]);
    }

    if (timer) {
      checkProperties({ timer }, "req.body", [
        {
          field: "timer",
          type: ["number", "string"],
        },
      ]);
    }

    let job: ReturnType<typeof JobService.createJob>;

    if (url || method || body || query) {
      checkProperties({ url, method, body, query }, "req.body", [
        {
          field: "url",
          type: "string",
        },
        {
          field: "query",
          type: "object",
          optional: true,
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
        query,
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
      EditJob,
      Record<string, never>
    >,
    res: Response<IResponse<ReturnType<typeof JobService.editJob>>>
  ) {
    const { name } = req.params;
    const {
      name: newName,
      description,
      cron,
      repetitions,
      timer,
      url,
      query,
      method,
      body,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    } = req.body;
    checkProperties({ name }, "req.params", [
      {
        field: "name",
        type: "string",
      },
    ]);
    checkProperties(
      {
        name: newName,
        description,
        cron,
        repetitions,
        timer,
        url,
        query,
        method,
        body,
        queueUrl,
        queueType,
        messageGroupId,
        messageDeduplicationId,
      },
      "req.body",
      [
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
          field: "timer",
          type: ["number", "string"],
          atLeastOne: true,
        },
        {
          field: "url",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "query",
          type: "object",
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
          atLeastOne: true,
        },
        {
          field: "queueUrl",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "queueType",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "messageGroupId",
          type: "string",
          atLeastOne: true,
        },
        {
          field: "messageDeduplicationId",
          type: "string",
          atLeastOne: true,
        },
      ]
    );

    let job: ReturnType<typeof JobService.editJob>;

    if (cron) {
      if (url || method || body || query) {
        job = JobService.editJob({
          name,
          newName,
          description,
          cron,
          repetitions,
          url,
          query,
          method,
          body,
        });
      }

      if (queueUrl || queueType || messageGroupId || messageDeduplicationId) {
        if (queueType === "fifo") {
          job = JobService.editJob({
            name,
            newName,
            description,
            cron,
            repetitions,
            body,
            queueUrl,
            queueType,
            messageGroupId,
            messageDeduplicationId,
          });
        }

        if (queueType === "standard") {
          job = JobService.editJob({
            name,
            newName,
            description,
            cron,
            repetitions,
            body,
            queueUrl,
            queueType,
          });
        }
      }
    }

    if (timer) {
      if (url || method || body || query) {
        job = JobService.editJob({
          name,
          newName,
          description,
          repetitions,
          timer,
          url,
          query,
          method,
          body,
        });
      }

      if (queueUrl || queueType || messageGroupId || messageDeduplicationId) {
        if (queueType === "fifo") {
          job = JobService.editJob({
            name,
            newName,
            description,
            timer,
            body,
            queueUrl,
            queueType,
            messageGroupId,
            messageDeduplicationId,
          });
        }

        if (queueType === "standard") {
          job = JobService.editJob({
            name,
            newName,
            description,
            timer,
            body,
            queueUrl,
            queueType,
          });
        }
      }
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
