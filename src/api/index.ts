import express, { NextFunction, Request, Response } from "express";
import serverConfig from "./config/server";
import routes from "./routes";
import morganBody from "morgan-body";
import { config } from "./config/env";
import { ApiErrors } from "./helpers/errorHandlers/HTTP/httpErrors";
import { formattedNowDate } from "../utils";
import { ExternalError, IErrorResponse, ServiceError } from "./helpers";

const { NODE_ENV, PORT } = config;

const app = express();

// Development logger
if (NODE_ENV === "local" || NODE_ENV === "development") {
  morganBody(app, {
    timezone: "America/Argentina/Buenos_Aires",
    theme: "dimmed",
  });
}

// Configurations and middlewares
app.use(serverConfig);

// Routes
app.use("/", routes);

// Error handler
app.use(
  (
    error: Error | ExternalError | ServiceError | ApiErrors,
    _req: Request<unknown, IErrorResponse, unknown, unknown>,
    res: Response<IErrorResponse>,
    _next: NextFunction
  ) => {
    const status =
      error.constructor === Error
        ? 500
        : (error as ExternalError | ServiceError | ApiErrors).status || 500;

    const errorInfo = {
      error: error.name,
      message: error.message,
      status,
    };

    console.error(`[API ERROR - ${formattedNowDate()}]`, {
      name: error.name,
      message: error.message,
      status,
    });
    console.error(error.stack);

    res.status(status).send(errorInfo);
  }
);

// Server start-up
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`REST API Server running on port ${PORT}`));
