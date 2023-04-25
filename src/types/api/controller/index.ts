import { StrictUnion } from "../../helpers";

export type JobDescription = {
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
} & StrictUnion<{ cron: string } | { timer: number }>;
