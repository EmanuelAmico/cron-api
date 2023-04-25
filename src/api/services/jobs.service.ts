import axios from "axios";
import { Job } from "../helpers";
import { StrictUnion } from "../../types";

class JobService {
  public static listRunningJobs() {
    return Job.listRunningJobs();
  }

  public static async createJob({
    name,
    cron,
    timer,
    url,
    method,
    body,
  }: {
    name: string;
    url: string;
    method: string;
    body?: unknown;
  } & StrictUnion<{ cron: string } | { timer: number }>) {
    const callback = async () => {
      console.log(`Job with name: ${name} ran`);
      if (url && method) {
        const { data } = await axios({
          method,
          url,
          data: body,
        });
        console.log(
          `Result for job ${name} with url ${url} and method ${method}`,
          data
        );
      }
    };

    if (cron) {
      const job = new Job({ name, cron, callback });
      job.start();
    }

    if (timer) {
      const job = new Job({ name, timer, callback });
      job.start();
    }
  }

  public static async editJob({
    name,
    cron,
    timer,
    url,
    method,
    body,
  }: {
    name: string;
    url: string;
    method: string;
    body?: unknown;
  } & StrictUnion<{ cron: string } | { timer: number }>) {
    const job = Job.searchJob(name);

    if (!job) throw new Error("Job not found");

    const callback = async () => {
      console.log(`Job with name: ${name} ran`);
      if (url && method) {
        const { data } = await axios({
          method,
          url,
          data: body,
        });
        console.log(
          `Result for job ${name} with url ${url} and method ${method}`,
          data
        );
      }
    };

    if (cron) {
      if (!job.cron) throw new Error("Job is not a cron job");

      job.edit({ name, cron, callback });
    }

    if (timer) {
      if (!job.timer) throw new Error("Job is not a timer job");

      job.edit({ name, timer, callback });
    }
  }

  public static deleteJob({ name }: { name: string }) {
    const job = Job.searchJob(name);

    if (!job) throw new Error("Job not found");

    job.erase();
  }
}

export { JobService };
