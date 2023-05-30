import { verify } from "jsonwebtoken";
import { config } from "../../config";
import { ServiceError } from "../errorHandlers";

const { API_SECRET } = config;

export const validateAndDecodeAPIToken = (token: string) => {
  try {
    return verify(token, API_SECRET);
  } catch (error) {
    throw new ServiceError("invalid_token", "Invalid token");
  }
};
