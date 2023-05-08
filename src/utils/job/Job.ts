import { CronJob, CronTime } from "cron";
import { IJob, JobData } from "../../types";
import {
  formattedDate,
  formattedNowDate,
  timeDifferenceInMs,
  timeRemaining,
} from "../date";
import { pick } from "../helpers";

class Job implements IJob {
  private _name: string;
  private _description?: string;
  private _cron?: string;
  private cronJob?: CronJob;
  private _timer?: number;
  private timeout?: NodeJS.Timeout;
  private _nextRunDate?: string;
  private _nextRunTimeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  private _repetitions?: number;
  private _remainingRepetitions?: number;
  private _executionTimes: number;
  private calculateNextRunTimeRemainingInterval?: NodeJS.Timer;
  protected _callback: () => void;
  private onStart?: () => void;
  private onStop?: () => void;
  public get name() {
    return this._name;
  }
  public get description() {
    return this._description;
  }
  public get cron() {
    return this._cron;
  }
  public get timer() {
    return this._timer;
  }
  public get nextRunDate() {
    return this._nextRunDate;
  }
  public get nextRunTimeRemaining() {
    return this._nextRunTimeRemaining;
  }
  public get repetitions() {
    return this._repetitions;
  }
  public get remainingRepetitions() {
    return this._remainingRepetitions;
  }
  public get executionTimes() {
    return this._executionTimes;
  }
  public get callback() {
    return this._callback;
  }
  protected static runningJobs: Job[] = [];

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

    this._name = name;
    this._executionTimes = 0;
    this._callback = async () => {
      try {
        console.log(`\nRunning job '${this.name}' - ${formattedNowDate()}`);
        const result = await callback();
        if (result) console.log(result);
      } catch (error) {
        console.error(`Error executing job '${this.name}'`, error);
      }
    };
    if (description) this._description = description;
    if (cron) this._cron = cron;
    if (this.repetitions) this._repetitions = repetitions;
    if (timer)
      this._timer =
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
    return this.runningJobs.map((job) =>
      pick(job, [
        "name",
        "description",
        "cron",
        "timer",
        "nextRunDate",
        "nextRunTimeRemaining",
        "repetitions",
        "remainingRepetitions",
        "executionTimes",
      ])
    );
  }

  public static searchJob(name: string) {
    return this.runningJobs.find((job) => job.name === name);
  }

  public start() {
    if (this._cron) {
      this.cronJob = new CronJob(
        this._cron,
        this._callback,
        null,
        true,
        "America/Argentina/Buenos_Aires"
      );

      const nextRunDate = new Date(this.cronJob.nextDate().toJSDate());
      const nextRunTimeRemaining = timeRemaining(nextRunDate);
      this._nextRunDate = formattedDate(nextRunDate);
      this._nextRunTimeRemaining = nextRunTimeRemaining;

      this.cronJob.addCallback(() => {
        this._executionTimes++;
        if (this.cronJob) {
          const nextRunDate = this.cronJob.nextDate().toJSDate();
          this._nextRunDate = formattedDate(nextRunDate);
        }
        if (this._remainingRepetitions) this._remainingRepetitions--;
        if (this._remainingRepetitions === 0) this.stop();
      });

      this.calculateNextRunTimeRemainingInterval = setInterval(() => {
        if (!this.cronJob)
          return clearInterval(this.calculateNextRunTimeRemainingInterval);
        const nextRunDate = new Date(this.cronJob.nextDate().toJSDate());
        this._nextRunTimeRemaining = timeRemaining(nextRunDate);
      }, 1000);
    }

    if (this._timer) {
      this.timeout = setTimeout(() => {
        this._callback();
        this.stop();
      }, this.timer);
      const nextRunDate = new Date(Date.now() + this._timer);
      this._nextRunDate = formattedDate(nextRunDate);
      this._nextRunTimeRemaining = timeRemaining(nextRunDate);
    }

    if (this.constructor === Job) Job.runningJobs.push(this);
    if (this.onStart) this.onStart();
  }

  public stop() {
    if (this._cron && this.cronJob) {
      this.cronJob.stop();
      if (this.calculateNextRunTimeRemainingInterval)
        clearInterval(this.calculateNextRunTimeRemainingInterval);
    }

    if (this._timer && this.timeout) {
      clearTimeout(this.timeout);
    }

    Job.runningJobs = Job.runningJobs.filter((job) => job.name !== this.name);
    if (this.onStop) this.onStop();
  }

  public edit({
    name,
    description,
    cron,
    timer,
    repetitions,
    callback,
  }: Partial<Pick<JobData, "callback">> & Omit<JobData, "callback">) {
    if (this._cron && this.cronJob) {
      if (!cron) throw new Error("No cron provided");
      this._name = name;
      this.cronJob.setTime(new CronTime(cron));
      this._cron = cron;
      if (description) this._description = description;
      if (repetitions) {
        if (this._executionTimes > repetitions)
          throw new Error(
            "Invalid repetitions, can't be less than the execution times."
          );
        this._repetitions = repetitions;
        this._remainingRepetitions = repetitions - this._executionTimes;
      }
      if (callback) this._callback = callback;
    }

    if (this.timer && this.timeout) {
      if (!timer) throw new Error("No timer provided");
      this._name = name;
      this._timer =
        typeof timer === "number" ? timer : timeDifferenceInMs(new Date(timer));

      if (callback) this._callback = callback;
    }

    return this;
  }
}

export { Job };
