import { allowedHosts, config } from "@config";
import { generateInstance } from "@utils";

const { DISCORD_API_KEY } = config;
const baseURL = allowedHosts.DISCORD_API_HOST;

export const discordAPI = generateInstance({
  baseURL,
  header: "x-api-key",
  token: DISCORD_API_KEY,
});
