import { generateInstance } from "../axios";
import { Method } from "axios";
import { JobData, StrictUnion } from "../../types";
import { Job } from ".";
import { pick } from "../helpers";

class AxiosJob<BodyType = unknown, ResponseType = unknown> extends Job {
  private _url: URL;
  private _method: Method;
  private _headers?: { [key: string]: string };
  private _query?: { [key: string]: string };
  private _body?: BodyType;
  public get url() {
    return this._url;
  }
  public get method() {
    return this._method;
  }
  public get headers() {
    return this._headers;
  }
  public get query() {
    return this._query;
  }
  public get body() {
    return this._body as BodyType extends undefined ? undefined : BodyType;
  }
  public get callback() {
    return this._callback as () => Promise<
      ResponseType extends undefined ? unknown : ResponseType
    >;
  }
  protected static runningJobs: AxiosJob[] = [];

  constructor({
    name,
    cron,
    timer,
    url: urlString,
    method,
    headers,
    query,
    body,
    onStart: handleStart,
    onStop: handleStop,
    instance,
  }: {
    url: string;
    query?: { [key: string]: string };
    method: Method;
    body?: BodyType;
  } & StrictUnion<
    | { headers?: { [key: string]: string } }
    | { instance?: ReturnType<typeof generateInstance> }
  > &
    Omit<JobData, "callback">) {
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

    if (!cron && !timer)
      throw new Error("Invalid job, must have cron or timer.");

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
        ? { name, cron, callback, onStart, onStop }
        : { name, timer: timer as number, callback, onStart, onStop }
    );

    const url = new URL(urlString);

    if (query) {
      for (const key in query) {
        const value = query[key];
        url.searchParams.append(key, value);
      }
      this._query = query;
    }

    if (body) this._body = body;
    this._url = url;
    this._method = method;
  }

  public static listRunningJobs() {
    const jobsWithSuperProperties = super.listRunningJobs() as Pick<
      AxiosJob,
      | "cron"
      | "repetitions"
      | "timer"
      | "name"
      | "description"
      | "nextRunDate"
      | "nextRunTimeRemaining"
      | "remainingRepetitions"
      | "executionTimes"
    >[];
    const jobsWithThisProperties = this.runningJobs.map((job) =>
      pick(job, ["url", "method", "headers", "query", "body"])
    );

    return jobsWithSuperProperties.map((job, index) => ({
      ...job,
      ...jobsWithThisProperties[index],
    }));
  }

  public static searchJob<BodyType = unknown, ResponseType = unknown>(
    name: string
  ) {
    return super.searchJob(name) as AxiosJob<BodyType, ResponseType>;
  }

  public edit({
    name,
    cron,
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
      super.edit({ name, cron, callback });
    }

    if (timer) {
      super.edit({ name, timer, callback });
    }

    if (urlString) {
      const url = new URL(urlString);

      if (query) {
        this._query = query;
        for (const key in query) {
          const value = query[key];
          url.searchParams.append(key, value);
        }
      }
    }

    if (method) this._method = method;
    if (body) this._body = body;

    return this;
  }
}

export { AxiosJob };
