import { allowedHosts, config } from "@config";
import { generateInstance } from "@utils";

const baseURLApi = allowedHosts.INSCRIPTIONS_API_HOST + "/v1";
const baseURLBff = allowedHosts.INSCRIPTIONS_BFF_HOST + "/v1";

const token = config.CROSS_API_TOKEN;

export const inscriptionsAPI = generateInstance({ baseURL: baseURLApi, token });
export const inscriptionsBFF = generateInstance({ baseURL: baseURLBff, token });
