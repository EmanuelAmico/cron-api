import { CronJob } from "cron";
import { PredefinedJobs } from "../types";

const jobs: PredefinedJobs = {
  exampleJob: new CronJob(
    "* * * * *",
    () => {
      //NOTE Every minute it will log current date
      console.log(new Date());
    },
    null,
    true,
    "America/Argentina/Buenos_Aires"
  ),
};

Object.values(jobs).forEach((job) => job.start());
console.log(
  "Successfully started the following predefined jobs. \n",
  Object.keys(jobs)
);
