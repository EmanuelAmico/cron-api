import { allowedHosts } from "@config";
import { generateInstance } from "@utils";

const baseURL = allowedHosts.INSCRIPTIONS_API_HOST + "/v1";

export const inscriptionsAPI = generateInstance({ baseURL });
