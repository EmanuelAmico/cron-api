import { allowedHosts, config } from "../../config/env";
import { generateInstance } from "../../../utils";

const { DISCORD_API_KEY } = config;
const baseURL = allowedHosts.DISCORD_API_HOST;

export default generateInstance({
  baseURL,
  header: "x-api-key",
  token: DISCORD_API_KEY,
});
