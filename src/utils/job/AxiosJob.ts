import { AxiosError, Method } from "axios";
import {
  Job,
  generateInstance,
  filterSimilar,
  pick,
  formattedNowDate,
} from "@utils";
import { IAxiosJob, StrictUnion } from "@types";

class AxiosJob<BodyType = unknown, ResponseType = unknown>
  extends Job
  implements IAxiosJob
{
  #url?: URL;
  #path?: string;
  #method: Method;
  #headers?: Record<string, string>;
  #query?: Record<string, string>;
  #body?: BodyType;
  #lastResponse?: { runDate: string; body: ResponseType };
  static #runningJobs: AxiosJob[] = [];
  static #createdJobs: AxiosJob[] = [];
  public get url() {
    return this.#url as URL;
  }
  private set url(url: URL) {
    this.#url = url;
  }
  public get path(): string | undefined {
    return this.#path;
  }
  private set path(path: string | undefined) {
    this.#path = path;
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
  private set headers(headers: Record<string, string> | undefined) {
    this.#headers = headers;
  }
  public get query() {
    return this.#query;
  }
  private set query(query: Record<string, string> | undefined) {
    this.#query = query;
  }
  public get body() {
    return this.#body;
  }
  private set body(body: BodyType | undefined) {
    this.#body = body;
  }
  protected static get runningJobs() {
    return this.#runningJobs;
  }
  private static set runningJobs(runningJobs: AxiosJob[]) {
    this.#runningJobs = runningJobs;
  }
  protected static get createdJobs() {
    return this.#createdJobs;
  }
  private static set createdJobs(createdJobs: AxiosJob[]) {
    this.#createdJobs = createdJobs;
  }
  public get lastResponse() {
    return this.#lastResponse;
  }
  private set lastResponse(
    lastResponse: { runDate: string; body: ResponseType } | undefined
  ) {
    this.#lastResponse = lastResponse;
  }

  constructor({
    name,
    description,
    cron,
    repetitions,
    timer,
    url: urlString,
    path,
    method,
    headers,
    query,
    body,
    onStart,
    onStop,
    instance,
  }: Omit<ConstructorParameters<typeof Job>[0], "callback"> &
    StrictUnion<
      { cron: string; repetitions?: number } | { timer: Date | string | number }
    > & {
      query?: Record<string, string>;
      method: Method;
      body?: BodyType;
    } & StrictUnion<
      | { url: string; headers?: Record<string, string> }
      | { instance?: ReturnType<typeof generateInstance>; path: string }
    >) {
    const callback = async () => {
      try {
        if (instance) {
          this.lastResponse = {
            runDate: formattedNowDate(),
            body: await instance<ResponseType>({
              method: this.method,
              url: this.path || "/",
              body: this.body,
            }),
          };
        } else {
          this.lastResponse = {
            runDate: formattedNowDate(),
            body: await generateInstance({
              baseURL: urlString as string,
              customHeaders: headers,
            })<ResponseType>({
              method: this.method,
              url: this.url.href,
              body: this.body,
            }),
          };
        }

        return this.lastResponse?.body;
      } catch (err) {
        const error = err as AxiosError;

        if (error.response) {
          this.lastResponse = {
            runDate: formattedNowDate(),
            body: error.response.data as ResponseType,
          };
        }

        throw error;
      }
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

    if (urlString && !instance) {
      const url = new URL(urlString);

      if (query) {
        for (const key in query) {
          const value = query[key];
          url.searchParams.append(key, value);
        }
      }

      this.#url = url;

      const queryData: Record<string, string> = {};

      for (const [key, value] of url.searchParams.entries()) {
        queryData[key] = value;
      }

      if (Object.keys(queryData).length) this.query = queryData;
    }

    if (body) this.body = body;
    if (path) this.path = path;
    this.#method = method;
  }

  public static listCreatedJobs() {
    return super.listCreatedJobs() as AxiosJob[];
  }

  public static listRunningJobs() {
    return super.listRunningJobs() as AxiosJob[];
  }

  public static stopJobs() {
    super.stopJobs();
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
    createdAt,
    updatedAt,
    url,
    method,
  }: {
    name?: string;
    description?: string;
    cron?: string;
    repetitions?: number;
    nextRunDate?: string;
    createdAt?: string;
    updatedAt?: string;
    url?: string;
    method?: Method;
  }) {
    const similarJobs: AxiosJob[] = [];

    if (
      name ||
      description ||
      cron ||
      repetitions ||
      nextRunDate ||
      createdAt ||
      updatedAt
    ) {
      similarJobs.push(
        ...(super.findSimilarJobs({
          name,
          description,
          cron,
          repetitions,
          nextRunDate,
          createdAt,
          updatedAt,
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

    return [
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      url,
      method,
    ].filter((value) => value).length > 1
      ? []
      : similarJobs;
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
  }: Parameters<(typeof Job)["prototype"]["edit"]>[0] & {
    url?: string;
    query?: Record<string, string>;
    method?: Method;
    body?: BodyType;
    instance?: ReturnType<typeof generateInstance>;
  }) {
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

      for (const [key, value] of this.url.searchParams.entries()) {
        url.searchParams.append(key, value);
      }

      const queryData: Record<string, string> = {};

      for (const [key, value] of url.searchParams.entries()) {
        queryData[key] = value;
      }

      if (Object.keys(queryData).length) this.query = queryData;
    }

    if (query) {
      const url = new URL(this.url.origin);

      for (const key in query) {
        const value = query[key];
        url.searchParams.append(key, value);
      }

      this.url = url;
      this.query = query;
    }

    if (method) this.method = method;
    if (body) this.body = body;

    return this;
  }

  public stop() {
    super.stop();
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      ...pick(this, [
        "url",
        "method",
        "headers",
        "query",
        "body",
        "lastResponse",
      ]),
    };
  }
}

export { AxiosJob };
