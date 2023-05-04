import { generateInstance } from "../axios";
import { Method } from "axios";
import { JobData, StrictUnion } from "../../types";
import { Job } from ".";

class AxiosJob<BodyType, ResponseType> extends Job {
  public url: URL;
  public method: Method;
  public headers?: { [key: string]: string };
  public query?: { [key: string]: string };
  public body?: BodyType;
  private static runningAxiosJobs: AxiosJob<unknown, unknown>[] = [];

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
    if (AxiosJob.runningAxiosJobs.find((job) => job.name === name))
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
          })<ResponseType>({
            method: this.method,
            url: this.url.href,
            body: this.body,
          });

    if (!cron && !timer)
      throw new Error("Invalid job, must have cron or timer.");

    const onStart = () => {
      AxiosJob.runningAxiosJobs.push(this);
      if (handleStart) handleStart();
    };

    const onStop = () => {
      AxiosJob.runningAxiosJobs = AxiosJob.runningAxiosJobs.filter(
        (job) => job !== this
      );
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
      this.query = query;
    }

    if (body) this.body = body;
    this.url = url;
    this.method = method;
  }

  public static listRunningJobs() {
    return AxiosJob.runningAxiosJobs.map((job) => ({
      name: job.name,
      description: job.description,
      cron: job.cron,
      timer: job.timer,
      url: job.url.href,
      query: job.query,
      method: job.method,
      body: job.body,
    }));
  }

  public static searchJob(name: string) {
    return AxiosJob.runningAxiosJobs.find((job) => job.name === name);
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
      : this.callback;

    if (cron) {
      super.edit({ name, cron, callback });
    }

    if (timer) {
      super.edit({ name, timer, callback });
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
}

export { AxiosJob };
