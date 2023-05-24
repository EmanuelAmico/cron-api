import { CronJob, CronTime } from "cron";
import { IJob, StrictUnion } from "../../types";
import {
  formattedDate,
  formattedNowDate,
  timeDifferenceInMs,
  timeRemaining,
} from "../date";
import { filterSimilar, findMostSimilar, pick } from "../helpers";

class Job implements IJob {
  #name: string;
  #description: string;
  #cron?: string;
  #cronJob?: CronJob;
  #timer?: number;
  #timeout?: NodeJS.Timeout;
  #nextRunDate?: string;
  #nextRunTimeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  #repetitions?: number;
  #remainingRepetitions?: number;
  #executionTimes: number;
  #createdAt: string;
  #updatedAt: string;
  #calculateNextRunTimeRemainingInterval?: NodeJS.Timer;
  #callback: () => void;
  #onStart?: () => void;
  #onStop?: () => void;
  public get name() {
    return this.#name;
  }
  private set name(name: string) {
    this.#name = name;
  }
  public get description() {
    return this.#description;
  }
  private set description(description: string) {
    this.#description = description;
  }
  public get cron() {
    return this.#cron;
  }
  private set cron(cron: string | undefined) {
    this.#cron = cron;
  }
  private get cronJob() {
    return this.#cronJob;
  }
  private set cronJob(cronJob: CronJob | undefined) {
    this.#cronJob = cronJob;
  }
  public get timer() {
    return this.#timer;
  }
  private set timer(timer: number | undefined) {
    this.#timer = timer;
  }
  private get timeout() {
    return this.#timeout;
  }
  private set timeout(timeout: NodeJS.Timeout | undefined) {
    this.#timeout = timeout;
  }
  public get nextRunDate() {
    return this.#nextRunDate;
  }
  private set nextRunDate(nextRunDate: string | undefined) {
    this.#nextRunDate = nextRunDate;
  }
  public get nextRunTimeRemaining() {
    return this.#nextRunTimeRemaining;
  }
  private set nextRunTimeRemaining(
    nextRunTimeRemaining:
      | {
          days: number;
          hours: number;
          minutes: number;
          seconds: number;
        }
      | undefined
  ) {
    this.#nextRunTimeRemaining = nextRunTimeRemaining;
  }
  public get repetitions() {
    return this.#repetitions;
  }
  private set repetitions(repetitions: number | undefined) {
    this.#repetitions = repetitions;
  }
  public get remainingRepetitions() {
    return this.#remainingRepetitions;
  }
  private set remainingRepetitions(remainingRepetitions: number | undefined) {
    this.#remainingRepetitions = remainingRepetitions;
  }
  public get executionTimes() {
    return this.#executionTimes;
  }
  private set executionTimes(executionTimes: number) {
    this.#executionTimes = executionTimes;
  }
  public get createdAt() {
    return this.#createdAt;
  }
  private set createdAt(createdAt: string) {
    this.#createdAt = createdAt;
  }
  public get updatedAt() {
    return this.#updatedAt;
  }
  private set updatedAt(updatedAt: string) {
    this.#updatedAt = updatedAt;
  }
  private get calculateNextRunTimeRemainingInterval() {
    return this.#calculateNextRunTimeRemainingInterval;
  }
  private set calculateNextRunTimeRemainingInterval(
    calculateNextRunTimeRemainingInterval: NodeJS.Timer | undefined
  ) {
    this.#calculateNextRunTimeRemainingInterval =
      calculateNextRunTimeRemainingInterval;
  }
  public get callback() {
    return this.#callback;
  }
  private set callback(callback: () => void) {
    this.#callback = callback;
  }
  private get onStart() {
    return this.#onStart;
  }
  private set onStart(onStart: (() => void) | undefined) {
    this.#onStart = onStart;
  }
  private get onStop() {
    return this.#onStop;
  }
  private set onStop(onStop: (() => void) | undefined) {
    this.#onStop = onStop;
  }
  static #runningJobs: Job[] = [];
  static #createdJobs: Job[] = [];
  protected static get runningJobs() {
    return this.#runningJobs;
  }
  private static set runningJobs(runningJobs: Job[]) {
    this.#runningJobs = runningJobs;
  }
  protected static get createdJobs() {
    return this.#createdJobs;
  }
  private static set createdJobs(createdJobs: Job[]) {
    this.#createdJobs = createdJobs;
  }

  constructor({
    name,
    description,
    cron,
    timer,
    repetitions,
    callback,
    onStart,
    onStop,
  }: {
    name: string;
    description: string;
    callback: () => unknown;
    onStart?: () => void;
    onStop?: () => void;
  } & StrictUnion<
    { cron: string; repetitions?: number } | { timer: Date | string | number }
  >) {
    if (Job.createdJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists.");

    if (!cron && !timer)
      throw new Error("Invalid job, must have cron or timer.");

    if (timer && repetitions)
      throw new Error("Invalid job, timer jobs can't have repetitions.");

    if (cron && repetitions && repetitions < 1)
      throw new Error("Invalid job, repetitions must be greater than 0.");

    this.#name = name;
    this.#description = description;
    this.#executionTimes = 0;
    this.#callback = async () => {
      try {
        console.log(`\nRunning job '${this.name}' - ${formattedNowDate()}`);
        const result = await callback();
        if (result) console.log(result);
      } catch (error) {
        console.error(`Error executing job '${this.name}'`, error);
      }
    };
    this.#createdAt = formattedNowDate();
    this.#updatedAt = formattedNowDate();

    if (cron) this.cron = cron;
    if (repetitions) {
      this.repetitions = repetitions;
      this.remainingRepetitions = repetitions;
    }
    if (timer)
      this.timer =
        typeof timer === "number" ? timer : timeDifferenceInMs(new Date(timer));
    if (onStart) this.onStart = onStart;
    if (onStop) this.onStop = onStop;
    Job.createdJobs.push(this);
  }

  public static stopJobs() {
    this.runningJobs.forEach((job) => job.stop());
  }

  public static listRunningJobs() {
    return this.runningJobs;
  }

  public static getJobByName(name: string) {
    return this.runningJobs.find((job) => job.name === name);
  }

  public static findSimilarJob(name: string) {
    const mostSimilarJobName = findMostSimilar(
      name,
      this.runningJobs.map((job) => job.name)
    );

    return this.getJobByName(mostSimilarJobName);
  }

  public static findSimilarJobs({
    name,
    description,
    cron,
    repetitions,
    nextRunDate,
    createdAt,
    updatedAt,
  }: {
    name?: string;
    description?: string;
    cron?: string;
    repetitions?: number;
    nextRunDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }) {
    const similarJobs: Job[] = [];

    if (name) {
      const similarJobNames = filterSimilar(
        name,
        this.runningJobs.map((job) => job.name)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) => similarJobNames.includes(job.name))
      );
    }

    if (description) {
      const similarJobDescriptions = filterSimilar(
        description,
        this.runningJobs.map((job) => job.description)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobDescriptions.includes(job.description || "")
        )
      );
    }

    if (cron) {
      const similarJobCrons = filterSimilar(
        cron,
        this.runningJobs.map((job) => job.cron)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobCrons.includes(job.cron || "")
        )
      );
    }

    if (repetitions) {
      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          job.repetitions ? job.repetitions === repetitions : false
        )
      );
    }

    if (nextRunDate) {
      const similarJobNextRunDates = filterSimilar(
        nextRunDate,
        this.runningJobs.map((job) => job.nextRunDate)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobNextRunDates.includes(job.nextRunDate || "")
        )
      );
    }

    if (createdAt) {
      const similarJobCreatedAts = filterSimilar(
        createdAt,
        this.runningJobs.map((job) => job.createdAt)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobCreatedAts.includes(job.createdAt || "")
        )
      );
    }

    if (updatedAt) {
      const similarJobUpdatedAts = filterSimilar(
        updatedAt,
        this.runningJobs.map((job) => job.updatedAt)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobUpdatedAts.includes(job.updatedAt || "")
        )
      );
    }

    const hasDuplicates = similarJobs.some(
      (job, index, self) => self.findIndex((j) => j.name === job.name) !== index
    );

    if (hasDuplicates)
      return similarJobs
        .filter(
          (job, _, self) => self.filter((j) => j.name === job.name).length > 1
        )
        .filter(
          (job, index, self) =>
            self.findIndex((j) => job && j && j.name === job.name) === index
        );

    return [name, description, cron, repetitions, nextRunDate].filter(
      (value) => value
    ).length > 1
      ? []
      : similarJobs;
  }

  public start() {
    if (
      this.constructor === Job &&
      Job.#runningJobs.some((job) => job.name === this.name)
    ) {
      throw new Error(
        `There is a Job with name '${this.name}' that is already running. Job names must be unique. Please, edit the name of the job.`
      );
    }

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
        this.executionTimes++;
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

    if (this.constructor === Job)
      Job.runningJobs = Job.runningJobs.filter((job) => job.name !== this.name);
    if (this.onStop) this.onStop();
  }

  public edit({
    name,
    description,
    cron,
    repetitions,
    timer,
    callback,
    onStart,
    onStop,
  }: {
    name?: string;
    description?: string;
    callback?: () => void;
    onStart?: () => void;
    onStop?: () => void;
  } & StrictUnion<
    { cron: string; repetitions?: number } | { timer: Date | string | number }
  >) {
    if (Job.createdJobs.some((job) => job.name === name)) {
      throw new Error(
        `A job with name ${name} already exists. Job names must be unique. Please, use another name.`
      );
    }

    if (this.cron) {
      if (cron && this.cronJob) {
        this.cron = cron;
        this.cronJob.setTime(new CronTime(cron));
      }
      if (repetitions) {
        if (repetitions <= this.executionTimes)
          throw new Error(
            "Invalid job, repetitions must be greater than execution times."
          );
        this.repetitions = repetitions;
        this.remainingRepetitions = repetitions - this.executionTimes;
        if (this.remainingRepetitions === 0) this.stop();
      }
      if (name) this.name = name;
      if (description) this.description = description;
      if (callback) this.callback = callback;
      if (onStart) this.onStart = onStart;
      if (onStop) this.onStop = onStop;
      this.updatedAt = formattedNowDate();
    }

    if (this.timer) {
      if (timer) {
        this.timer =
          typeof timer === "number"
            ? timer
            : timeDifferenceInMs(new Date(timer));
      }
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.callback();
          this.stop();
        }, this.timer);
      }
      if (name) this.name = name;
      if (description) this.description = description;
      if (callback) this.callback = callback;
      if (onStart) this.onStart = onStart;
      if (onStop) this.onStop = onStop;
      this.updatedAt = formattedNowDate();
    }

    return this;
  }

  public toJSON() {
    return pick(this, [
      "name",
      "description",
      "cron",
      "timer",
      "repetitions",
      "remainingRepetitions",
      "executionTimes",
      "nextRunDate",
      "nextRunTimeRemaining",
      "createdAt",
      "updatedAt",
    ]);
  }
}

export { Job };
