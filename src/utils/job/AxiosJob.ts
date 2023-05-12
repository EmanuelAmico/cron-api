import { generateInstance } from "../axios";
import { Method } from "axios";
import { JobData, StrictUnion } from "../../types";
import { Job } from ".";
import { filterSimilar, pick } from "../helpers";

class AxiosJob<BodyType = unknown, ResponseType = unknown> extends Job {
  #url: URL;
  #method: Method;
  #headers?: { [key: string]: string };
  #query?: { [key: string]: string };
  #body?: BodyType;
  public get url() {
    return this.#url;
  }
  private set url(url: URL) {
    this.#url = url;
  }
  public get method() {
    return this.#method;
  }
  private set method(method: Method) {
    this.#method = method;
  }
  public get headers() {
    return this.#headers;
  }
  private set headers(headers: { [key: string]: string } | undefined) {
    this.#headers = headers;
  }
  public get query() {
    return this.#query;
  }
  private set query(query: { [key: string]: string } | undefined) {
    this.#query = query;
  }
  public get body() {
    return this.#body;
  }
  private set body(body: BodyType | undefined) {
    this.#body = body;
  }
  static #runningJobs: AxiosJob[] = [];
  protected static get runningJobs() {
    return this.#runningJobs;
  }
  private static set runningJobs(jobs: AxiosJob[]) {
    this.#runningJobs = jobs;
  }

  constructor({
    name,
    description,
    cron,
    repetitions,
    timer,
    url: urlString,
    method,
    headers,
    query,
    body,
    onStart: handleStart,
    onStop: handleStop,
    instance,
  }: Omit<ConstructorParameters<typeof Job>[0], "callback"> &
    StrictUnion<
      { cron: string; repetitions?: number } | { timer: Date | string | number }
    > & {
      url: string;
      query?: { [key: string]: string };
      method: Method;
      body?: BodyType;
    } & StrictUnion<
      | { headers?: { [key: string]: string } }
      | { instance?: ReturnType<typeof generateInstance> }
    >) {
    if (AxiosJob.runningJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists.");

    const callback = async () =>
      instance
        ? await instance<ResponseType>({
            method: this.method,
            url: this.url.href,
            body: this.body,
          })
        : await generateInstance({
            baseURL: urlString,
            customHeaders: headers,
          })<ResponseType extends undefined ? unknown : ResponseType>({
            method: this.method,
            url: this.url.href,
            body: this.body,
          });

    const onStart = () => {
      AxiosJob.runningJobs.push(this);
      if (handleStart) handleStart();
    };

    const onStop = () => {
      AxiosJob.runningJobs = AxiosJob.runningJobs.filter((job) => job !== this);
      if (handleStop) handleStop();
    };

    super(
      cron
        ? {
            name,
            description,
            cron,
            repetitions,
            callback,
            onStart,
            onStop,
          }
        : {
            name,
            description,
            timer: timer as Date | string | number,
            callback,
            onStart,
            onStop,
          }
    );

    const url = new URL(urlString);

    if (query) {
      for (const key in query) {
        const value = query[key];
        url.searchParams.append(key, value);
      }
      this.query = query;
    }

    if (body) this.body = body;
    this.#url = url;
    this.#method = method;
  }

  public static listRunningJobs() {
    return super.listRunningJobs() as AxiosJob[];
  }

  public static getJobByName<BodyType = unknown, ResponseType = unknown>(
    name: string
  ) {
    return super.getJobByName(name) as
      | AxiosJob<BodyType, ResponseType>
      | undefined;
  }

  public static findSimilarJob<BodyType = unknown, ResponseType = unknown>(
    name: string
  ) {
    return super.findSimilarJob(name) as
      | AxiosJob<BodyType, ResponseType>
      | undefined;
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
    const similarJobs: AxiosJob[] = [];

    if (name || description || cron || repetitions || nextRunDate) {
      similarJobs.push(
        ...(super.findSimilarJobs({
          name,
          description,
          cron,
          repetitions,
          nextRunDate,
        }) as AxiosJob[])
      );
    }

    if (url) {
      const similarJobNames = filterSimilar(
        url,
        this.runningJobs.map((job) => job.url.href)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobNames.includes(job.url.href)
        )
      );
    }

    if (method) {
      similarJobs.push(
        ...this.runningJobs.filter((job) => job.method === method)
      );
    }

    // Remove duplicates
    return similarJobs.filter(
      (job, index, jobs) => jobs.findIndex((j) => j.name === job.name) === index
    );
  }

  public edit({
    name,
    description,
    cron,
    repetitions,
    timer,
    url: urlString,
    query,
    method,
    body,
    instance,
  }: {
    url?: string;
    query?: { [key: string]: string };
    method: Method;
    body?: BodyType;
    instance?: ReturnType<typeof generateInstance>;
  } & Pick<JobData, "name"> &
    Partial<Omit<JobData, "name" | "callback">>) {
    const callback = instance
      ? async () =>
          await instance<ResponseType>({
            method: this.method,
            url: this.url.href,
            body: this.body,
          })
      : undefined;

    if (cron) {
      super.edit({ name, description, cron, repetitions, callback });
    }

    if (timer) {
      super.edit({ name, description, timer, callback });
    }

    if (urlString) {
      const url = new URL(urlString);

      if (query) {
        this.query = query;
        for (const key in query) {
          const value = query[key];
          url.searchParams.append(key, value);
        }
      }
    }

    if (method) this.method = method;
    if (body) this.body = body;

    return this;
  }

  public stop() {
    super.stop();
    if (this.constructor === AxiosJob)
      AxiosJob.runningJobs = AxiosJob.runningJobs.filter(
        (job) => job.name !== this.name
      );
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      ...pick(this, ["url", "method", "headers", "query", "body"]),
    };
  }
}

export { AxiosJob };
