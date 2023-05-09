import { Method } from "axios";
import { Job, AxiosJob } from "../../utils";

class JobService {
  public static listRunningJobs() {
    const jobs = Job.listRunningJobs();
    const axiosJobs = AxiosJob.listRunningJobs();

    return [...jobs, ...axiosJobs].map((job) => job.toJSON());
  }

  public static getJob(name: string) {
    const job = Job.getJobByName(name);
    const axiosJob = AxiosJob.getJobByName(name);

    return axiosJob?.toJSON() || job?.toJSON();
  }

  public static findSimilarJobs({
    name,
    description,
    cron,
    repetitions,
    nextRunDate,
    url,
    method,
  }: {
    name?: string;
    description?: string;
    cron?: string;
    repetitions?: number;
    nextRunDate?: string;
    url?: string;
    method?: Method;
  }) {
    const jobs = Job.findSimilarJobs({
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
    });
    const axiosJobs = AxiosJob.findSimilarJobs({
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      url,
      method,
    });

    return [...jobs, ...axiosJobs].map((job) => job.toJSON());
  }

  public static createJob({
    name,
    description,
    cron,
    repetitions,
    timer,
    url,
    method,
    body,
    headers,
  }: Omit<
    ConstructorParameters<typeof AxiosJob>[0],
    "instance" | "onStart" | "onStop"
  >) {
    if (cron) {
      const job = new AxiosJob({
        name,
        description,
        cron,
        repetitions,
        url,
        method,
        body,
        headers,
      });

      job.start();
    }

    if (timer) {
      const job = new AxiosJob({
        name,
        description,
        timer,
        url,
        method,
        body,
        headers,
      });

      job.start();
    }
  }

  public static editJob({
    name,
    description,
    cron,
    repetitions,
    timer,
    url,
    query,
    method,
    body,
    instance,
  }: Parameters<InstanceType<typeof AxiosJob>["edit"]>[0]) {
    const job = AxiosJob.getJobByName(name);

    if (!job) throw new Error("AxiosJob not found");

    job.edit({
      name,
      description,
      cron,
      repetitions,
      timer,
      url,
      query,
      method,
      body,
      instance,
    });
  }

  public static deleteJob({ name }: { name: string }) {
    const job = AxiosJob.getJobByName(name);

    if (!job) throw new Error("AxiosJob not found");

    job.stop();
  }
}

export { JobService };
