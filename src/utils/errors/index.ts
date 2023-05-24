import { SQSServiceException } from "@aws-sdk/client-sqs";
import { AxiosError } from "axios";

interface BaseError {
  error: Error | { message: string };
  name: string;
  status?: number;
}

interface JobError extends BaseError {
  error: Error | AxiosError;
}

interface SQSError extends SQSServiceException {
  message: string;
}

class BaseError extends Error implements BaseError {
  constructor(name: string, error: Error | { message: string }) {
    super(name);
    this.error = error;
  }
}

class JobError extends BaseError implements JobError {
  constructor(error: Error | AxiosError | SQSError | { message: string }) {
    const name =
      error instanceof AxiosError ? "Pipedrive Error" : "Lambda Error";
    super(name, error);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.error =
      error instanceof AxiosError
        ? error.response?.data
        : (error as Error & { error: Error })?.error || error;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const checkAndHandleErrors = ({ name, error, stack }: JobError) =>
  console.error(`[${name}]`, "\n\n", stack, "\n\n", error?.message || error);

export { JobError };
