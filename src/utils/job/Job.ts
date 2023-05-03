import { CronJob, CronTime } from "cron";
import { IJob, JobData } from "../../types";
import { formattedNowDate } from "../date";

class Job implements IJob {
  public name: string;
  public cron?: string;
  private cronJob?: CronJob;
  public timer?: number;
  private timeout?: NodeJS.Timeout;
  protected callback: () => void;
  protected onStart?: () => void;
  protected onStop?: () => void;
  private static runningJobs: Job[] = [];

  constructor({ name, cron, timer, callback, onStart, onStop }: JobData) {
    if (Job.runningJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists.");

    this.name = name;
    this.callback = async () => {
      try {
        console.log(`\nRunning job '${this.name}' - ${formattedNowDate()}`);
        const result = await callback();
        if (result) console.log(result);
      } catch (error) {
        console.error(`Error executing job '${this.name}'`, error);
      }
    };

    if (!cron && !timer)
      throw new Error("Invalid job, must have cron or timer.");

    if (cron) this.cron = cron;
    if (timer) this.timer = timer;
    if (onStart) this.onStart = onStart;
    if (onStop) this.onStop = onStop;
  }

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
        this.callback();
        this.stop();
      }, this.timer);
    }

    Job.runningJobs.push(this);
    if (this.onStart) this.onStart();
  }

  public stop() {
    if (this.cron && this.cronJob) {
      this.cronJob.stop();
    }

    if (this.timer && this.timeout) {
      clearTimeout(this.timeout);
    }

    Job.runningJobs = Job.runningJobs.filter((job) => job.name !== this.name);
    if (this.onStop) this.onStop();
  }

  public edit({
    name,
    cron,
    timer,
    callback,
  }: Partial<Pick<JobData, "callback">> & Omit<JobData, "callback">) {
    if (this.cron && this.cronJob) {
      if (!cron) throw new Error("No cron provided");
      this.name = name;
      this.cronJob.setTime(new CronTime(cron));
      this.cron = cron;
      if (callback) this.callback = callback;
    }

    if (this.timer && this.timeout) {
      if (!timer) throw new Error("No timer provided");
      this.name = name;
      this.timer = timer;
      if (callback) this.callback = callback;
    }

    return this;
  }
}

export { Job };
