import { Method } from "axios";
import { StrictUnion } from "../";

export interface IFetchAPI {
  url: string;
  method: Method;
  body?: unknown;
  query?: string;
  extraHeaders?: Record<string, string>;
  overrideToken?: string;
}

export interface SimpleAxiosInstance {
  baseURL: string;
}

export interface AdvancedAxiosInstance extends SimpleAxiosInstance {
  header?: string;
  token?: string | null;
  customHeaders?: Record<string, string>;
}

export type IAxiosInstance = StrictUnion<
  SimpleAxiosInstance | AdvancedAxiosInstance
>;
