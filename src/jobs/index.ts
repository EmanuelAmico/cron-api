import { PredefinedJobs } from "../types";
import { Job } from "../utils";

const jobs: PredefinedJobs = [
  new Job({
    name: "example-job",
    cron: "* * * * *",
    callback: () => {
      //NOTE Every minute it will log current date
      return new Date();
    },
  }),
];

jobs.forEach((job) => job.start());

console.log(
  "Successfully started the following predefined jobs. \n",
  jobs.map(({ name, cron, timer }) =>
    cron ? { name, cron } : { name, timer }
  ),
  "\n"
);
