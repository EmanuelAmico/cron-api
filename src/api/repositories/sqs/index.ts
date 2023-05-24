import { SQS } from "@aws-sdk/client-sqs";
import SQSEmailRepository from "./email/email.repository";
import PipedriveRepository from "./pipedrive/pipedrive.repository";
import { config } from "../../config/env";

// Instantiate SQS
export const sqs = new SQS({
  region: "sa-east-1",
  credentials: {
    accessKeyId: config.SQS_ACCESS_KEY,
    secretAccessKey: config.SQS_SECRET_KEY,
  },
});

export { SQSEmailRepository, PipedriveRepository };
