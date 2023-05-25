/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatusCodes from "./httpCodes";

interface BaseError {
  message: string;
  status: number;
  name: string;
  error?: any;
}

export interface IBaseError extends Error {
  message: string;
  status: number;
  name: string;
  internalError?: number;
  error?: any;
}

class BaseError extends Error {
  constructor(message: string, status: number, name: string, error: any) {
    super(name);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.message = message;
    this.status = status || 500;
    this.error = error || {};
  }
}

export class Api400Error extends BaseError {
  constructor(message: string, error?: any) {
    super(message, httpStatusCodes.BAD_REQUEST, "Bad Request", error);
  }
}

export class Api401Error extends BaseError {
  constructor(message: string, error?: any) {
    super(message, httpStatusCodes.UNAUTHORIZED, "Unauthorized", error);
  }
}

export class Api403Error extends BaseError {
  constructor(message: string, error?: any) {
    super(message, httpStatusCodes.FORBIDDEN, "Forbidden", error);
  }
}

export class Api404Error extends BaseError {
  constructor(message: string, error?: any) {
    super(message, httpStatusCodes.NOT_FOUND, "Not found", error);
  }
}

export class Api409Error extends BaseError {
  constructor(message: string, error?: any) {
    super(message, httpStatusCodes.CONFLICT, "Conflict", error);
  }
}

export class Api500Error extends BaseError {
  constructor(message: string, error?: any) {
    super(
      message,
      httpStatusCodes.INTERNAL_SERVER,
      "Internal Server Error",
      error
    );
  }
}

export default BaseError;
