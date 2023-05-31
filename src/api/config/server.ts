import { Router, json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import morganJSON from "morgan-json";
import { config } from "@config";
import { MiddlewaresController } from "@middlewares";

const { authMiddleware } = MiddlewaresController;

// Router
const router = Router();

// Middlewares
router.use(helmet());
router.use(json());
router.use(authMiddleware);

// Production Logger
if (config.NODE_ENV === "production") {
  const format = morganJSON(
    ":url :method :status :response-time ms :remote-addr"
  );
  router.use(morgan(format));
}

export default router;
