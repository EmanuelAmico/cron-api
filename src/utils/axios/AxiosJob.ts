import { generateInstance } from ".";
import { Method } from "axios";
import { JobData } from "../../types";
import { Job } from "../job";

class AxiosJob<BodyType, ResponseType> extends Job {
  public readonly method: Method;
  public readonly url: URL;
  public readonly query?: { [key: string]: string };
  public readonly body?: BodyType;

  constructor({
    name,
    cron,
    timer,
    url: urlString,
    query,
    method,
    body,
    instance,
  }: {
    url: string;
    query?: { [key: string]: string };
    method: Method;
    body?: BodyType;
    instance: ReturnType<typeof generateInstance>;
  } & Omit<JobData, "callback">) {
    const callback = async () =>
      await instance<ResponseType>({
        method: this.method,
        url: this.url.href,
        body: this.body,
      });

    if (!cron && !timer) throw new Error("Invalid job, missing cron or timer.");

    super(
      cron
        ? { name, cron, callback }
        : ({ name, timer, callback } as {
            name: string;
            timer: number;
            callback: () => void;
          })
    );

    const url = new URL(urlString);

    if (query) {
      for (const key in query) {
        const value = query[key];
        url.searchParams.append(key, value);
      }
    }

    if (body) this.body = body;
    this.url = url;
    this.method = method;
  }
}

export { AxiosJob };
