import { StrictUnion } from "../../helpers";

export type JobDescription = {
  name: string;
  description: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
} & StrictUnion<
  | {
      queueUrl: string;
      queueType: "fifo";
      messageGroupId: string;
      messageDeduplicationId: string;
    }
  | { queueUrl: string; queueType: "standard" }
> &
  StrictUnion<
    { cron: string; repetitions?: number } | { timer: string | number }
  >;
