import { SQSServiceException } from "@aws-sdk/client-sqs";
import { AxiosError } from "axios";

type TJobError = Error | AxiosError | SQSServiceException;

interface IJobError {
  name: string;
  message: string;
  stack?: string;
  status?: number;
}

export class JobError implements IJobError {
  declare ["constructor"]: typeof JobError;
  #name: string;
  #message: string;
  #stack?: string;
  #status?: number;
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
  private set status(status: number | undefined) {
    this.#status = status;
  }
  public get stack() {
    return this.#stack;
  }
  private set stack(stack: string | undefined) {
    this.#stack = stack;
  }

  constructor(error: TJobError) {
    let _name = "";
    let _message = "";
    let _status: number;

    switch (true) {
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
        _name = error.name;
        _message = error.message;
        _status = 500;
        break;
    }

    const stackTrace: { stack?: string } = {};
    Error.captureStackTrace(stackTrace, this.constructor);
    this.#name = _name;
    this.#message = _message;
    this.#status = _status;
    this.#stack = stackTrace.stack;
  }
}

export const checkAndHandleErrors = ({
  name,
  message,
  status,
  stack,
}: JobError) =>
  console.error(
    `[${name}]`,
    "\n\n",
    `[Status: ${status}]`,
    "\n\n",
    `[Message: ${message}]`,
    "\n\n",
    `[Stack: ${stack}]`
  );
