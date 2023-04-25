import internalErrors from "./internalErrors";

interface BaseError {
  error: string;
  message: string;
  internalError: number;
  status?: number;
}

class BaseError extends Error {
  constructor(message: string, error: string) {
    super(error);

    Object.setPrototypeOf(this, new.target.prototype);
    this.message = message || error;
    this.error = error;
  }
}

class ServiceError extends BaseError {
  constructor(error: string, message: string) {
    super(error, message);
    const { code, name } = internalErrors[error];

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name || "Generic service error";
    this.message = message;
    this.internalError = code || 0;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ServiceError;
