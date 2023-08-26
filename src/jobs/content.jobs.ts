import { AxiosJob } from "@utils";
import { allowedHosts } from "@config";

export default [
  new AxiosJob({
    name: "content-roles",
    description:
      "Periodically send an event to check which bootcamp starts and assign the corresponding content roles",
    cron: "0 0 * * *",
    url: `${allowedHosts.INSCRIPTIONS_BFF_HOST}/cohorts/roles`,
    method: "PUT",
  }),
];
