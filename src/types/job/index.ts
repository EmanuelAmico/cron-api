import { CronJob } from "cron";

export type PredefinedJobNames = "exampleJob";

export type PredefinedJobs = {
  [key in PredefinedJobNames]: CronJob;
};
