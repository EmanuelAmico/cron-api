import { SQS } from "@aws-sdk/client-sqs";
import { config } from "@config";

// Instantiate SQS
export const sqs = new SQS({
  region: "sa-east-1",
  credentials: {
    accessKeyId: config.SQS_ACCESS_KEY,
    secretAccessKey: config.SQS_SECRET_KEY,
  },
});
