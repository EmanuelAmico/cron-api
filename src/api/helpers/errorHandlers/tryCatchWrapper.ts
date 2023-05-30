import { NextFunction, Request, Response } from "express";
import { checkAndHandleErrors } from "../errorHandlers";

export const tryCatch =
  <
    Params extends Request["params"],
    ResBody,
    ReqBody,
    ReqQuery extends Request["query"],
    ReturnType
  >(
    fn: (
      req: Request<Params, ResBody, ReqBody, ReqQuery>,
      res: Response<ResBody>,
      next: NextFunction
    ) => ReturnType
  ) =>
  async (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      checkAndHandleErrors(error, next);
    }
  };
