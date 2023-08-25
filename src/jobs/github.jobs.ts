import { AxiosJob } from "@utils";
import { allowedHosts } from "@config";

export default [
  new AxiosJob({
    name: "prep-invitation",
    description:
      "Periodically send an event to check which bootcamp courses start and send the prep repository",
    cron: "0 0 * * *",
    url: `${allowedHosts.INSCRIPTIONS_BFF_HOST}/cohorts/invite/prep`,
    method: "POST",
  }),
];
