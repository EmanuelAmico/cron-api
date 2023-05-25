import { PredefinedJobs } from "../types";
import { Job } from "../utils";

const jobs: PredefinedJobs = [
  new Job({
    name: "example-job",
    description: "This is an example job",
    cron: "* * * * *",
    repetitions: 5,
    callback: () => {
      //NOTE Every minute it will log current date
      return new Date();
    },
  }),
  new Job({
    name: "example-job2",
    description: "This is an example job",
    cron: "* * * * *",
    repetitions: 5,
    callback: () => {
      //NOTE Every minute it will log current date
      return new Date();
    },
  }),
  new Job({
    name: "example-job3",
    cron: "10 * * * *",
    description: "This is an example job",
    repetitions: 5,
    callback: () => {
      //NOTE Every minute it will log current date
      return new Date();
    },
  }),
  new Job({
    name: "example-job4",
    description: "This is an example job",
    cron: "10 * * * *",
    repetitions: 3,
    callback: () => {
      //NOTE Every minute it will log current date
      return new Date();
    },
  }),
];

jobs.forEach((job) => job.start());

// eslint-disable-next-line no-console
console.log(
  "Successfully started the following predefined jobs. \n",
  jobs.map(({ name, cron, timer }) =>
    cron ? { name, cron } : { name, timer }
  ),
  "\n"
);
