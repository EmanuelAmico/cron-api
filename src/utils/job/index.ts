import { CronJob, CronTime } from "cron";
import { StrictUnion } from "../../types";

interface Job {
  name: string;
  cron?: string;
  cronJob?: CronJob;
  timer?: number;
  timeout?: NodeJS.Timeout;
  callback: () => void;
  stop: () => void;
  start: () => void;
  edit: (
    job: { name: string; callback?: () => void } & StrictUnion<
      { timer: number } | { cron: string }
    >
  ) => void;
  erase: () => void;
}

class Job {
  constructor({
    name,
    cron,
    timer,
    callback,
  }: { name: string; callback: () => void } & StrictUnion<
    { timer: number } | { cron: string }
  >) {
    if (Job.runningJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists");

    this.name = name;
    this.callback = callback;

    if (!cron && !timer) throw new Error("Invalid job");

    if (cron) {
      const cronJob = new CronJob(
        cron,
        callback,
        null,
        true,
        "America/Argentina/Buenos_Aires"
      );

      this.cron = cron;

      this.start = () => {
        cronJob.start();
        Job.runningJobs.push(this);
      };

      this.stop = () => {
        cronJob.stop();
        Job.runningJobs = Job.runningJobs.filter(
          (job) => job.name !== this.name
        );
      };

      this.edit = ({ name, callback, cron }) => {
        if (!cron) throw new Error("No cron provided");
        this.name = name;
        this.cronJob?.setTime(new CronTime(cron));
        if (callback) this.callback = callback;
      };

      this.erase = () => {
        this.cronJob?.stop();
        Job.runningJobs = Job.runningJobs.filter(
          (job) => job.name !== this.name
        );
      };
    }

    if (timer) {
      this.timer = timer;

      this.start = () => {
        this.timeout = setTimeout(() => {
          Job.runningJobs = Job.runningJobs.filter(
            (job) => job.name !== this.name
          );
          this.callback();
        }, timer);
        Job.runningJobs.push(this);
      };

      this.stop = () => {
        if (this.timeout) clearTimeout(this.timeout);
        Job.runningJobs = Job.runningJobs.filter(
          (job) => job.name !== this.name
        );
      };

      this.edit = ({ name, callback, timer }) => {
        if (!timer) throw new Error("No timer provided");
        this.name = name;
        this.timer = timer;
        if (callback) this.callback = callback;
      };

      this.erase = () => {
        if (this.timeout) clearTimeout(this.timeout);
        Job.runningJobs = Job.runningJobs.filter(
          (job) => job.name !== this.name
        );
      };
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
}

export { Job };
