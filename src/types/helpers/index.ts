/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";

type UnionKeys<T> = T extends T ? keyof T : never;

type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
  : never;

export type StrictUnion<T> = StrictUnionHelper<T, T>;

export type Query = Record<string, string | number | boolean | undefined>;
export interface BODY_RESPONSE<T> extends Response {
  error: unknown;
  message: string;
  data: T;
}

export type INSCRIPTION_RESPONSE<T> = Exclude<BODY_RESPONSE<T>, "data"> & {
  content: T;
};

export interface IParameter {
  field: string;
  type: "number" | "string" | "boolean" | "array" | "object";
  optional?: boolean;
  atLeastOne?: boolean;
}

export type CourseTag =
  | "INTRO_JAVASCRIPT"
  | "INTRO_JAVASCRIPT_ATR"
  | "BC_JAVASCRIPT"
  | "BC_SALESFORCE";

export interface IPaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface IPaginationRequest {
  page: number;
  size: number;
}
