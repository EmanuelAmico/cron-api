import { JobError } from "@utils";

export interface IResponse<T = unknown> {
  message: string;
  status: number;
  data?: T;
}

export interface IErrorResponse<T = unknown> extends IResponse<T> {
  error: (JobError | Error)["name"];
}

type TResponseWithNoStatus<T> = Omit<IResponse<T>, "status">;
type TErrorResponseWithNoStatus<T> = Omit<IErrorResponse<T>, "status">;

export const ok = <T>({
  message,
  data,
}: TResponseWithNoStatus<T>): IResponse<T> => ({
  status: 200,
  message,
  data,
});

export const created = <T>({
  message,
  data,
}: TResponseWithNoStatus<T>): IResponse<T> => ({
  status: 201,
  message,
  data,
});

export const badRequest = <T>({
  message,
  data,
  error,
}: TErrorResponseWithNoStatus<T>): IErrorResponse<T> => ({
  status: 400,
  message,
  data,
  error,
});

export const unauthorized = <T>({
  message,
  data,
  error,
}: TErrorResponseWithNoStatus<T>): IErrorResponse<T> => ({
  status: 401,
  message,
  data,
  error,
});

export const forbidden = <T>({ message, data, error }: IErrorResponse<T>) => ({
  status: 403,
  message,
  data,
  error,
});

export const notFound = <T>({ message, data, error }: IErrorResponse<T>) => ({
  status: 404,
  message,
  data,
  error,
});

export const error = <T>({ message, data, error }: IErrorResponse<T>) => ({
  status: 500,
  message,
  data,
  error,
});
