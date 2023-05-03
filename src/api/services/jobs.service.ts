import axios from "axios";
import { AxiosJob } from "../../utils/axios/AxiosJob";

class JobService {
  public static listRunningJobs() {
    return AxiosJob.listRunningJobs();
  }

  public static async createJob<BodyType, ResponseType>({
    name,
    cron,
    timer,
    url,
    method,
    body,
    instance,
  }: ConstructorParameters<typeof AxiosJob<BodyType, ResponseType>>[0]) {
    if (cron) {
      const job = new AxiosJob({
        name,
        cron,
        url,
        method,
        body,
        instance,
      });

      job.start();
    }

    if (timer) {
      const job = new AxiosJob({
        name,
        timer,
        url,
        method,
        body,
        instance,
      });

      job.start();
    }
  }

  public static async editJob<BodyType, ResponseType>({
    name,
    cron,
    timer,
    url,
    method,
    body,
  }: ConstructorParameters<typeof AxiosJob<BodyType, ResponseType>>[0]) {
    const job = AxiosJob.searchJob(name);

    if (!job) throw new Error("AxiosJob not found");

    const callback = async () => {
      console.log(`AxiosJob with name: ${name} ran`);
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
      if (!job.cron) throw new Error("AxiosJob is not a cron job");

      job.edit({ name, cron, callback });
    }

    if (timer) {
      if (!job.timer) throw new Error("AxiosJob is not a timer job");

      job.edit({ name, timer, callback });
    }
  }

  public static deleteJob({ name }: { name: string }) {
    const job = AxiosJob.searchJob(name);

    if (!job) throw new Error("AxiosJob not found");

    job.erase();
  }
}

export { JobService };
