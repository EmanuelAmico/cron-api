import { CronJob, CronTime } from "cron";
import { IJob, JobData } from "../../types";
import {
  formattedDate,
  formattedNowDate,
  timeDifferenceInMs,
  timeRemaining,
} from "../date";

class Job implements IJob {
  public name: string;
  public description?: string;
  public cron?: string;
  private cronJob?: CronJob;
  public timer?: number;
  private timeout?: NodeJS.Timeout;
  public nextRunDate?: string;
  public nextRunTimeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  public repetitions?: number;
  public remainingRepetitions?: number;
  private calculateNextRunTimeRemainingInterval?: NodeJS.Timer;
  protected callback: () => void;
  protected onStart?: () => void;
  protected onStop?: () => void;
  private static runningJobs: Job[] = [];

  constructor({
    name,
    description,
    cron,
    timer,
    repetitions,
    callback,
    onStart,
    onStop,
  }: JobData) {
    if (Job.runningJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists.");

    if (!cron && !timer)
      throw new Error("Invalid job, must have cron or timer.");

    if (timer && repetitions)
      throw new Error("Invalid job, timer jobs can't have repetitions.");

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
    if (description) this.description = description;
    if (cron) this.cron = cron;
    if (this.repetitions) this.repetitions = repetitions;
    if (timer)
      this.timer =
        typeof timer === "number" ? timer : timeDifferenceInMs(new Date(timer));
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
      description: job.description,
      cron: job.cron,
      repetitions: job.repetitions,
      remainingRepetitions: job.remainingRepetitions,
      timer: job.timer,
      nextRunDate: job.nextRunDate,
      nextRunTimeRemaining: job.nextRunTimeRemaining,
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

      const nextRunDate = new Date(this.cronJob.nextDate().toJSDate());
      const nextRunTimeRemaining = timeRemaining(nextRunDate);
      this.nextRunDate = formattedDate(nextRunDate);
      this.nextRunTimeRemaining = nextRunTimeRemaining;

      this.cronJob.addCallback(() => {
        if (this.cronJob) {
          const nextRunDate = this.cronJob.nextDate().toJSDate();
          this.nextRunDate = formattedDate(nextRunDate);
        }
        if (this.remainingRepetitions) this.remainingRepetitions--;
        if (this.remainingRepetitions === 0) this.stop();
      });
      this.calculateNextRunTimeRemainingInterval = setInterval(() => {
        if (!this.cronJob)
          return clearInterval(this.calculateNextRunTimeRemainingInterval);
        const nextRunDate = new Date(this.cronJob.nextDate().toJSDate());
        this.nextRunTimeRemaining = timeRemaining(nextRunDate);
      }, 1000);

      // this.calculateNextRunInterval = setInterval(() => {
      //   if (!this.cronJob) return clearInterval(this.calculateNextRunInterval);
      //   const nextRunDate = new Date(this.cronJob.nextDate().toJSDate());
      //   this.nextRunDate = formattedDate(nextRunDate);
      //   this.nextRunTimeRemaining = timeRemaining(nextRunDate);
      // }, timeDifferenceInMs(nextRunDate) + 1000);
    }

    if (this.timer) {
      this.timeout = setTimeout(() => {
        this.callback();
        this.stop();
      }, this.timer);
      const nextRunDate = new Date(Date.now() + this.timer);
      this.nextRunDate = formattedDate(nextRunDate);
      this.nextRunTimeRemaining = timeRemaining(nextRunDate);
    }

    if (this.constructor === Job) Job.runningJobs.push(this);
    if (this.onStart) this.onStart();
  }

  public stop() {
    if (this.cron && this.cronJob) {
      this.cronJob.stop();
      if (this.calculateNextRunTimeRemainingInterval)
        clearInterval(this.calculateNextRunTimeRemainingInterval);
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
      this.timer =
        typeof timer === "number" ? timer : timeDifferenceInMs(new Date(timer));
      if (callback) this.callback = callback;
    }

    return this;
  }
}

export { Job };
