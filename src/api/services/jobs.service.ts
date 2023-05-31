import { Method } from "axios";
import { StrictUnion } from "@types";
import { Job, AxiosJob, SQSJob } from "@utils";
import { ServiceError } from "@helpers";

export class JobService {
  public static listRunningJobs() {
    const jobs = Job.listRunningJobs();
    const axiosJobs = AxiosJob.listRunningJobs();
    const sqsJobs = SQSJob.listRunningJobs();

    return [...jobs, ...axiosJobs, ...sqsJobs].map((job) => job.toJSON());
  }

  public static getJob(name: string) {
    const job =
      Job.getJobByName(name) ||
      AxiosJob.getJobByName(name) ||
      SQSJob.getJobByName(name);

    if (!job) throw new ServiceError("not_found", "Job not found");

    return job.toJSON();
  }

  public static findSimilarJobs({
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
  }: {
    name?: string;
    description?: string;
    cron?: string;
    repetitions?: number;
    nextRunDate?: string;
    createdAt?: string;
    updatedAt?: string;
    url?: string;
    method?: Method;
    queueUrl?: string;
    queueType?: "fifo" | "standard";
    messageGroupId?: string;
    messageDeduplicationId?: string;
  }) {
    const jobs = Job.findSimilarJobs({
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      createdAt,
      updatedAt,
    });
    const axiosJobs = AxiosJob.findSimilarJobs({
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      createdAt,
      updatedAt,
      url,
      method,
    });
    const sqsJobs = SQSJob.findSimilarJobs({
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      createdAt,
      updatedAt,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    });

    return [...jobs, ...axiosJobs, ...sqsJobs].map((job) => job.toJSON());
  }

  public static createJob({
    name,
    description,
    cron,
    repetitions,
    timer,
    url,
    method,
    body,
    headers,
    queueUrl,
    queueType,
    messageGroupId,
    messageDeduplicationId,
  }: StrictUnion<
    | Omit<
        ConstructorParameters<typeof AxiosJob>[0],
        "instance" | "onStart" | "onStop"
      >
    | Omit<ConstructorParameters<typeof SQSJob>[0], "onStart" | "onStop">
  >) {
    if (cron) {
      if (url && method) {
        const job = new AxiosJob({
          name,
          description,
          cron,
          repetitions,
          url,
          method,
          body,
          headers,
        });
        job.start();
        return job.toJSON();
      }

      if (queueType === "fifo" && messageDeduplicationId && messageGroupId) {
        const job = new SQSJob({
          name,
          description,
          cron,
          repetitions,
          queueUrl,
          queueType,
          messageGroupId,
          messageDeduplicationId,
          body,
        });
        job.start();
        return job.toJSON();
      }

      if (queueType === "standard") {
        const job = new SQSJob({
          name,
          description,
          cron,
          repetitions,
          queueUrl,
          queueType,
          body,
        });
        job.start();
        return job.toJSON();
      }
    }

    if (timer) {
      if (url && method) {
        const job = new AxiosJob({
          name,
          description,
          timer,
          url,
          method,
          body,
          headers,
        });
        job.start();
        return job.toJSON();
      }

      if (queueType === "fifo" && messageDeduplicationId && messageGroupId) {
        const job = new SQSJob({
          name,
          description,
          timer,
          queueUrl,
          queueType,
          messageGroupId,
          messageDeduplicationId,
          body,
        });
        job.start();
        return job.toJSON();
      }

      if (queueType === "standard") {
        const job = new SQSJob({
          name,
          description,
          timer,
          queueUrl,
          queueType,
          body,
        });
        job.start();
        return job.toJSON();
      }
    }
  }

  public static editJob({
    name,
    description,
    cron,
    repetitions,
    timer,
    url,
    query,
    method,
    body,
    instance,
    queueUrl,
    queueType,
    messageGroupId,
    messageDeduplicationId,
  }: { name: string } & Parameters<InstanceType<typeof AxiosJob>["edit"]>[0] &
    Parameters<InstanceType<typeof SQSJob>["edit"]>[0]) {
    const job =
      Job.getJobByName(name) ||
      AxiosJob.getJobByName(name) ||
      SQSJob.getJobByName(name);

    if (!job) throw new ServiceError("not_found", "Job not found");

    if (job instanceof AxiosJob) {
      if (timer) {
        return job
          .edit({
            name,
            description,
            repetitions,
            timer,
            url,
            query,
            method,
            body,
            instance,
          })
          .toJSON();
      }

      if (cron) {
        return job
          .edit({
            name,
            description,
            cron,
            repetitions,
            url,
            query,
            method,
            body,
            instance,
          })
          .toJSON();
      }
    }

    if (job instanceof SQSJob) {
      if (queueType === "fifo") {
        if (timer) {
          return job
            .edit({
              name,
              description,
              repetitions,
              timer,
              queueUrl,
              queueType,
              messageGroupId,
              messageDeduplicationId,
            })
            .toJSON();
        }

        if (cron) {
          return job
            .edit({
              name,
              description,
              cron,
              repetitions,
              queueUrl,
              queueType,
              messageGroupId,
              messageDeduplicationId,
            })
            .toJSON();
        }
      }

      if (queueType === "standard") {
        if (timer) {
          return job
            .edit({
              name,
              description,
              repetitions,
              timer,
              queueUrl,
              queueType,
            })
            .toJSON();
        }

        if (cron) {
          return job
            .edit({
              name,
              description,
              cron,
              repetitions,
              queueUrl,
              queueType,
            })
            .toJSON();
        }
      }
    }
  }

  public static deleteJob({ name }: { name: string }) {
    const job =
      Job.getJobByName(name) ||
      AxiosJob.getJobByName(name) ||
      SQSJob.getJobByName(name);

    if (!job) throw new ServiceError("not_found", "Job not found");

    job.stop();
  }
}
