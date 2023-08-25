import { PredefinedJobs } from "@types";

import githubJobs from "./github.jobs";

const jobs: PredefinedJobs = [...githubJobs];

jobs.forEach((job) => job.start());

if (jobs.length)
  // eslint-disable-next-line no-console
  console.log(
    "Successfully started the following predefined jobs. \n",
    jobs.map(({ name, cron, timer }) =>
      cron ? { name, cron } : { name, timer }
    ),
    "\n"
  );
else console.warn("No predefined jobs found. \n");
