import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IFetchAPI, IAxiosInstance } from "@types";

const generateInstance = ({
  baseURL,
  header = "Authorization",
  customHeaders,
  token = null,
}: IAxiosInstance) => {
  const newInstance: AxiosInstance = axios.create({
    baseURL,
    headers: customHeaders,
  });

  const API = async <T>({
    method,
    url,
    body,
    extraHeaders,
    overrideToken,
  }: IFetchAPI): Promise<AxiosResponse<T>["data"]> => {
    newInstance.defaults.headers["Content-Type"] = "application/json";
    const tokenAuth = axios.defaults.headers.common["Authorization"];
    newInstance.defaults.headers.common[header] = overrideToken
      ? `${header === "Authorization" ? "Bearer" : ""} ${overrideToken}`
      : token
      ? `${header === "Authorization" ? "Bearer" : ""} ${token}`
      : tokenAuth;

    if (extraHeaders)
      Object.entries(extraHeaders).forEach(([extraHeader, content]) => {
        newInstance.defaults.headers.common[extraHeader] = content;
      });

    const res = await newInstance({
      method,
      url,
      data: body,
    });

    return res.data;
  };

  return API;
};

export { generateInstance };
