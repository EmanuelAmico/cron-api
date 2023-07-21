import { AxiosError } from "axios";
import { SQSServiceException } from "@aws-sdk/client-sqs";
import { AxiosJob, Job, SQSJob } from "@utils";

type TJobError = Error | AxiosError | SQSServiceException;

interface IJobError {
  name: string;
  message: string;
  stack: string;
  status: number;
}

export class JobError implements IJobError {
  declare ["constructor"]: typeof JobError;
  #name: string;
  #message: string;
  #stack: string;
  #status: number;
  #job?: Job | AxiosJob | SQSJob;
  public get name() {
    return this.#name;
  }
  private set name(name: string) {
    this.#name = name;
  }
  public get message() {
    return this.#message;
  }
  private set message(message: string) {
    this.#message = message;
  }
  public get status() {
    return this.#status;
  }
  private set status(status: number) {
    this.#status = status;
  }
  public get stack() {
    return this.#stack;
  }
  private set stack(stack: string) {
    this.#stack = stack;
  }
  public get job() {
    return this.#job;
  }
  private set job(job: Job | AxiosJob | SQSJob | undefined) {
    this.#job = job;
  }

  constructor(error: TJobError | string, job?: Job | AxiosJob | SQSJob) {
    let _name = "";
    let _message = "";
    let _status = 500;

    switch (true) {
      case typeof error === "string":
        _name = "Error";
        _message = error as string;
        _status = 500;
        break;
      case error.constructor === Error:
        _name = "Error";
        _message = (error as Error).message;
        _status = 500;
        break;
      case error.constructor === AxiosError:
        _name = "Axios Error";
        _message =
          (error as AxiosError).response?.statusText || "No message provided";
        _status = (error as AxiosError).response?.status || 500;
        break;
      case error.constructor === SQSServiceException:
        _name = "SQS Service Exception";
        _message = (error as SQSServiceException).message;
        _status =
          (error as SQSServiceException).$metadata.httpStatusCode || 500;
        break;
      default:
        if (typeof error !== "string") {
          _name = error.name;
          _message = error.message;
          _status = 500;
        }
        break;
    }

    const stackTrace: { stack?: string } = {};
    Error.captureStackTrace(stackTrace, this.constructor);
    this.#name = _name;
    this.#message = _message;
    this.#status = _status;
    this.#stack = stackTrace.stack as string;
    if (job) this.job = job;
  }
}

export const handleJobError = (error: JobError | AxiosError) => {
  console.error(
    `[${error.name}]`,
    "\n\n",
    `[Status: ${
      error instanceof AxiosError ? error.response?.status : error.status
    }]`,
    "\n\n",
    `[Message: ${error.message}]`,
    "\n\n",
    `[Stack: ${error.stack}]`,
    "\n\n",
    `[Data: ${
      error instanceof AxiosError
        ? JSON.stringify(error.response?.data, null, 4)
        : ""
    }]`
  );
};
