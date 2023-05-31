import { NextFunction, Request, Response } from "express";
import { validateAndDecodeAPIToken, Api401Error, Api403Error } from "@helpers";

export class MiddlewaresController {
  public static async authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.headers.authorization)
        throw new Api401Error("Authorization header missing");

      const token = req.headers.authorization.split(" ")[1];

      if (!token || token.length < 3)
        throw new Api401Error("Authorization token missing");

      const decodedToken = validateAndDecodeAPIToken(token);

      if (typeof decodedToken === "string")
        throw new Api401Error("Invalid token");

      if (!decodedToken.service)
        throw new Api403Error("Not allowed to access resource");

      switch (decodedToken.service) {
        case "discord-bot":
          req.role = "bot";
          break;
        case "backoffice-bff":
          req.role = "backoffice";
          break;
        case "landing-bff":
          req.role = "landing";
          break;
        case "pledu-bff":
          req.role = "pledu";
          break;
        default:
          throw new Api403Error("Not allowed to access resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
