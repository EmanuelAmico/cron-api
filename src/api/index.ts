import express, { NextFunction, Request, Response } from "express";
import serverConfig from "./config/server";
import routes from "./routes";
import morganBody from "morgan-body";
import { config } from "./config/env";
import BaseError from "./helpers/errorHandlers/HTTP/httpErrors";

const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

// Development logger
if (config.env === "local" || config.env === "development") {
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
app.use((err: BaseError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;

  res.status(status).json({
    status,
    err: err.name,
    message: err.message,
  });
});

// Server start-up
app.listen(config.port, () =>
  console.log(`REST API Server running on port ${config.port}`)
);
