import externalErrors from "./externalErrorsEnum";

interface BaseError {
  error: Error | { status: number; message: string };
  thirdParty: string;
  status?: number;
}

class BaseError extends Error {
  constructor(
    errorName: string,
    externalInfo: Error | { status: number; message: string }
  ) {
    super(errorName);
    console.error(`[${errorName}]`, externalInfo);
    Object.setPrototypeOf(this, new.target.prototype);
    this.error = externalInfo;
  }
}

class ExternalError extends BaseError {
  constructor(
    errorName: string,
    externalInfo: Error | { status: number; message: string }
  ) {
    super(errorName, externalInfo);
    const thirdPartyName = externalErrors[errorName];

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = thirdPartyName || "External error";
    this.error = externalInfo;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ExternalError;
