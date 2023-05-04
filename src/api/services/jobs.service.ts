import { Job, AxiosJob } from "../../utils";

class JobService {
  public static listRunningJobs() {
    const axiosJobs = AxiosJob.listRunningJobs();
    const jobs = Job.listRunningJobs();

    return [...jobs, ...axiosJobs];
  }

  public static createJob<BodyType, ResponseType>({
    name,
    cron,
    timer,
    url,
    method,
    body,
    headers,
  }: Omit<
    ConstructorParameters<typeof AxiosJob<BodyType, ResponseType>>[0],
    "instance" | "onStart" | "onStop"
  >) {
    if (cron) {
      const job = new AxiosJob<BodyType, ResponseType>({
        name,
        cron,
        url,
        method,
        body,
        headers,
      });

      job.start();
    }

    if (timer) {
      const job = new AxiosJob<BodyType, ResponseType>({
        name,
        timer,
        url,
        method,
        body,
        headers,
      });

      job.start();
    }
  }

  public static editJob<BodyType, ResponseType>({
    name,
    description,
    cron,
    timer,
    url,
    query,
    method,
    body,
    instance,
  }: Parameters<
    InstanceType<typeof AxiosJob<BodyType, ResponseType>>["edit"]
  >[0]) {
    const job = AxiosJob.searchJob(name);

    if (!job) throw new Error("AxiosJob not found");

    job.edit({
      name,
      description,
      cron,
      timer,
      url,
      query,
      method,
      body,
      instance,
    });
  }

  public static deleteJob({ name }: { name: string }) {
    const job = AxiosJob.searchJob(name);

    if (!job) throw new Error("AxiosJob not found");

    job.stop();
  }
}

export { JobService };
