import { StrictUnion } from "@types";

export type JobDescription = {
  name: string;
  description: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string>;
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

export type EditJob = {
  name?: string;
  description: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string>;
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
    { cron?: string; repetitions?: number } | { timer?: string | number }
  >;
