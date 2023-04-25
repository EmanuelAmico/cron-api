import { NextFunction } from "express";
import { handleExternalErrors } from "./handleExternalErrors";
import handleServiceErrors from "./handleServiceErrors";
import ServiceError from "./Services/serviceErrors";

export const checkAndHandleErrors = (err: any, next: NextFunction) => {
  switch (true) {
    case err instanceof handleExternalErrors:
      handleExternalErrors(err);
      break;
    case err instanceof ServiceError:
      handleServiceErrors(err);
      break;
  }
  next(err);
};
