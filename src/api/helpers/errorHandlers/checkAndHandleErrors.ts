import { NextFunction } from "express";
import { handleServiceErrors, ServiceError } from "@helpers";
import { JobError } from "@utils";

export const checkAndHandleErrors = (
  error: ServiceError | JobError | Error | unknown,
  next: NextFunction
) => {
  if (error instanceof ServiceError) handleServiceErrors(error);
  next(error);
};
