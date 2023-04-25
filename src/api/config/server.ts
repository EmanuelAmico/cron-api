import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import morganJSON from "morgan-json";
import { config } from "./env";

// Router
const router = express.Router();

// Middlewares
router.use(helmet());
router.use(express.json());

// Production Logger
if (config.env === "production") {
  const format = morganJSON(
    ":url :method :status :response-time ms :remote-addr"
  );
  router.use(morgan(format));
}

export default router;
