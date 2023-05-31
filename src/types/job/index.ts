import { Job, AxiosJob, SQSJob } from "@utils";

// The minimum and necessary data to create a Job | AxiosJob | SQSJob
export interface IJob {
  readonly name: string;
  readonly description: string;
  readonly cron?: string;
  readonly timer?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IAxiosJob extends IJob {
  readonly url: URL;
  readonly method: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
}

export interface ISQSJob extends IJob {
  readonly queueUrl: URL;
  readonly queueType: "fifo" | "standard";
  readonly messageGroupId?: string;
  readonly messageDeduplicationId?: string;
  readonly body: unknown;
}

export type PredefinedJobs = (Job | AxiosJob | SQSJob)[];
