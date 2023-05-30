import { NextFunction } from "express";
import ExternalError from "./External/externalErrors";
import handleServiceErrors from "./handleServiceErrors";
import BaseError from "./HTTP/httpErrors";
import ServiceError from "./Services/serviceErrors";
import { JobError } from "../../../utils/errors";

const checkAndHandleErrors = (
  error: ServiceError | JobError | Error | unknown,
  next: NextFunction
) => {
  if (error instanceof ServiceError) handleServiceErrors(error);
  next(error);
};

export { checkAndHandleErrors, ExternalError, ServiceError, BaseError };
