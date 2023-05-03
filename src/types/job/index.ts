import { Job } from "../../utils";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: () => any;
  onStart?: () => void;
  onStop?: () => void;
} & StrictUnion<{ timer: number } | { cron: string }>;

export type PredefinedJobs = Job[];
