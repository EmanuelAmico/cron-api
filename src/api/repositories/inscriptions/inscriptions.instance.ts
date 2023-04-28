import { allowedHosts } from "../../config/env";
import { generateInstance } from "../../../utils";

const baseURL = allowedHosts.INSCRIPTIONS_API_HOST + "/v1";

export default generateInstance({ baseURL });
