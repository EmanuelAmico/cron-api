import { AxiosError } from "axios";
import { externalErrors } from "@helpers";

class BaseError extends Error {
  message: string;
  status: number;

  constructor(
    errorName: string,
    externalError: Error | AxiosError | { status: number; message: string }
  ) {
    super(errorName);
    Object.setPrototypeOf(this, new.target.prototype);

    if (externalError instanceof AxiosError) {
      this.status = externalError.response?.data.status;
      this.message = externalError.response?.data.message;
    } else if (externalError instanceof Error) {
      this.status = 500;
      this.message = externalError.message;
    } else {
      this.status = externalError.status;
      this.message = externalError.message;
    }
  }
}

class ExternalError extends BaseError {
  constructor(
    errorName: string,
    externalError: Error | AxiosError | { status: number; message: string }
  ) {
    super(errorName, externalError);
    const thirdPartyName = externalErrors[errorName];

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = thirdPartyName || "External error";
    Error.captureStackTrace(this, this.constructor);
  }
}

export { ExternalError };
