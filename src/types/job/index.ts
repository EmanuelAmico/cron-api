import { AxiosJob, Job } from "../../utils";
import { SQSJob } from "../../utils/job/SQSJob";
import { StrictUnion } from "../helpers";

export interface IJob {
  readonly name: string;
  readonly cron?: string;
  readonly timer?: number;
  start(): void;
  stop(): void;
  edit(job: JobData): void;
}

export type JobData = {
  name: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: () => any;
  onStart?: () => void;
  onStop?: () => void;
} & StrictUnion<
  { cron: string; repetitions?: number } | { timer: Date | string | number }
>;

export type PredefinedJobs = (Job | AxiosJob | SQSJob)[];
