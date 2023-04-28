import { Job } from "../../utils";
import { StrictUnion } from "../helpers";

export interface IJob {
  readonly name: string;
  readonly cron?: string;
  readonly timer?: number;
  stop(): void;
  start(): void;
  edit(job: JobData): void;
  erase(): void;
}

export type JobData = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: () => any;
} & StrictUnion<{ timer: number } | { cron: string }>;

export type PredefinedJobs = Job[];
