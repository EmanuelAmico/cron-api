import { CronJob, CronTime } from "cron";
import { IJob, JobData } from "../../types";
import { formattedNowDate } from "../date";

class Job implements IJob {
  public name: string;
  public cron?: string;
  private cronJob?: CronJob;
  public timer?: number;
  private timeout?: NodeJS.Timeout;
  private callback: () => void;

  constructor({ name, cron, timer, callback }: JobData) {
    if (Job.runningJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists.");

    this.name = name;
    this.callback = async () => {
      console.log(`\nRunning job '${this.name}' - ${formattedNowDate()}`);
      const result = await callback();
      if (result) console.log(result);
    };

    if (!cron && !timer) throw new Error("Invalid job, missing cron or timer.");

    if (cron) {
      this.cron = cron;
    }

    if (timer) {
      this.timer = timer;
    }
  }

  private static runningJobs: Job[] = [];

  public static startJobs() {
    this.runningJobs.forEach((job) => job.start());
  }

  public static stopJobs() {
    this.runningJobs.forEach((job) => job.stop());
  }

  public static listRunningJobs() {
    return this.runningJobs.map((job) => ({
      name: job.name,
      cron: job.cron,
      timer: job.timer,
    }));
  }

  public static searchJob(name: string) {
    return this.runningJobs.find((job) => job.name === name);
  }

  public start() {
    if (this.cron) {
      this.cronJob = new CronJob(
        this.cron,
        this.callback,
        null,
        true,
        "America/Argentina/Buenos_Aires"
      );
    }

    if (this.timer) {
      this.timeout = setTimeout(() => {
        Job.runningJobs = Job.runningJobs.filter(
          (job) => job.name !== this.name
        );
        this.callback();
      }, this.timer);
    }

    Job.runningJobs.push(this);
  }

  public stop() {
    if (this.cron && this.cronJob) {
      this.cronJob.stop();
    }

    if (this.timer && this.timeout) {
      clearTimeout(this.timeout);
    }

    Job.runningJobs = Job.runningJobs.filter((job) => job.name !== this.name);
  }

  public edit({ name, cron, timer, callback }: JobData) {
    if (this.cron && this.cronJob) {
      if (!cron) throw new Error("No cron provided");
      this.name = name;
      this.cronJob.setTime(new CronTime(cron));
      if (callback) this.callback = callback;
    }

    if (this.timer && this.timeout) {
      if (!timer) throw new Error("No timer provided");
      this.name = name;
      this.timer = timer;
      if (callback) this.callback = callback;
    }
  }

  public erase() {
    if (this.cron && this.cronJob) {
      this.cronJob.stop();
    }

    if (this.timer && this.timeout) {
      clearTimeout(this.timeout);
    }

    Job.runningJobs = Job.runningJobs.filter((job) => job.name !== this.name);
  }
}

export { Job };
