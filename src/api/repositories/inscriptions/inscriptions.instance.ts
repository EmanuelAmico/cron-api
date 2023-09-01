import { allowedHosts, config } from "@config";
import { generateInstance } from "@utils";

const baseURL = allowedHosts.INSCRIPTIONS_API_HOST + "/v1";
const token = config.CROSS_API_TOKEN;

export const inscriptionsAPI = generateInstance({ baseURL, token });
